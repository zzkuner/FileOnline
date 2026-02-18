import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const LOCAL_SECRET = process.env.NEXTAUTH_SECRET || 'local-storage-secret-key'; // Use a consistent secret

// ─── Dynamic Config from SystemConfig DB ────────────────────────────
// 每次操作都从数据库读取最新配置，不缓存（admin 随时可能修改）
async function getStorageConfig() {
    try {
        const configs = await (prisma as any).systemConfig.findMany({
            where: {
                key: {
                    in: [
                        'STORAGE_TYPE',
                        'S3_ENDPOINT', 'S3_REGION', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET',
                    ]
                }
            }
        });
        const cfg: Record<string, string> = {};
        configs.forEach((c: any) => { cfg[c.key] = c.value });

        return {
            storageType: cfg.STORAGE_TYPE || process.env.STORAGE_TYPE || 'local',
            endpoint: cfg.S3_ENDPOINT || process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || '',
            region: cfg.S3_REGION || process.env.S3_REGION || 'us-east-1',
            accessKey: cfg.S3_ACCESS_KEY || process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || '',
            secretKey: cfg.S3_SECRET_KEY || process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || '',
            bucket: cfg.S3_BUCKET || process.env.S3_BUCKET || process.env.MINIO_BUCKET_NAME || '',
            publicDomain: cfg.S3_PUBLIC_DOMAIN || process.env.S3_PUBLIC_DOMAIN || '',
        };
    } catch (error) {
        console.warn('Failed to read SystemConfig, falling back to local:', error);
        return {
            storageType: 'local',
            endpoint: '',
            region: 'us-east-1',
            accessKey: '',
            secretKey: '',
            bucket: '',
        };
    }
}

function createS3Client(cfg: { endpoint: string; region: string; accessKey: string; secretKey: string }) {
    return new S3Client({
        region: cfg.region,
        endpoint: cfg.endpoint,
        credentials: {
            accessKeyId: cfg.accessKey,
            secretAccessKey: cfg.secretKey,
        },
        forcePathStyle: true,
    });
}

// ─── Upload ──────────────────────────────────────────────────────────
export async function uploadFileToStorage(
    fileBuffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    const cfg = await getStorageConfig();

    console.log('=== UPLOAD DEBUG ===');
    console.log('STORAGE_TYPE:', cfg.storageType);
    console.log('Key:', key);
    console.log('==================');

    if (cfg.storageType === 'local') {
        console.log('📁 Using LOCAL storage');
        const filePath = path.join(UPLOAD_DIR, key);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, fileBuffer);
        return key;
    }

    console.log('☁️ Uploading to S3/B2...');
    const s3 = createS3Client(cfg);
    const command = new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    });

    await s3.send(command);
    console.log('✅ Upload successful!');
    return key;
}

// ─── Get URL ─────────────────────────────────────────────────────────
export async function getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    const cfg = await getStorageConfig();

    if (cfg.storageType === 'local') {
        // Generate signed URL for local storage
        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
        const baseUrl = `/api/uploads/${key}`;

        // Create signature: HMAC-SHA256(path + expires, secret)
        const signString = `${baseUrl}:${expiresAt}`;
        const signature = crypto
            .createHmac('sha256', LOCAL_SECRET)
            .update(signString)
            .digest('hex');

        return `${baseUrl}?token=${signature}&expires=${expiresAt}`;
    }

    const s3 = createS3Client(cfg);

    // 如果配置了自定义域名，直接返回拼接的 URL (假设是公开访问)
    if (cfg.publicDomain) {
        // 移除末尾斜杠
        const domain = cfg.publicDomain.replace(/\/$/, '');
        // 确保 key 开头没有斜杠 (虽然 key 通常没有)
        const safeKey = key.replace(/^\//, '');
        return `${domain}/${safeKey}`;
    }

    const command = new GetObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn });
}

// ─── Get Stream ──────────────────────────────────────────────────────
export async function getFileStream(key: string) {
    const cfg = await getStorageConfig();

    if (cfg.storageType === 'local') {
        const filePath = path.join(UPLOAD_DIR, key);
        return createReadStream(filePath);
    }

    const s3 = createS3Client(cfg);
    const command = new GetObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
    });
    const response = await s3.send(command);
    return response.Body;
}

// ─── Download ────────────────────────────────────────────────────────
export async function downloadFileFromStorage(key: string, localPath: string): Promise<void> {
    const cfg = await getStorageConfig();

    if (cfg.storageType === 'local') {
        const filePath = path.join(UPLOAD_DIR, key);
        await fs.copyFile(filePath, localPath);
        return;
    }

    const s3 = createS3Client(cfg);
    const command = new GetObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
    });
    const response = await s3.send(command);

    if (!response.Body) {
        throw new Error('File not found');
    }

    // @ts-ignore - AWS SDK stream type mismatch with Node stream
    await pipeline(response.Body, createWriteStream(localPath));
}

// ─── Delete ──────────────────────────────────────────────────────────
export async function deleteFileFromStorage(key: string): Promise<void> {
    const cfg = await getStorageConfig();

    console.log('=== DELETE DEBUG ===');
    console.log('STORAGE_TYPE:', cfg.storageType);
    console.log('Key:', key);
    console.log('==================');

    if (cfg.storageType === 'local') {
        const filePath = path.join(UPLOAD_DIR, key);
        try {
            await fs.unlink(filePath);
            console.log('🗑️ Local file deleted:', filePath);
        } catch (err: any) {
            if (err.code !== 'ENOENT') throw err; // ignore if already gone
            console.log('⚠️ File already deleted:', filePath);
        }
        return;
    }

    const s3 = createS3Client(cfg);
    const command = new DeleteObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
    });
    await s3.send(command);
    console.log('🗑️ S3 file deleted:', key);
}
