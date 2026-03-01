import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import crypto from 'crypto';
import { getStorageConfig } from '@/lib/storage-config';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const LOCAL_SECRET = process.env.NEXTAUTH_SECRET || 'local-storage-secret-key';

export { getStorageConfig };

// ─── S3 Client Factory ───────────────────────────────────────────────

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

// ─── Get URL (always same-origin proxy to avoid browser CORS) ───────
export async function getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
    const baseUrl = `/api/uploads/${key}`;
    const signString = `${baseUrl}:${expiresAt}`;
    const signature = crypto
        .createHmac('sha256', LOCAL_SECRET)
        .update(signString)
        .digest('hex');
    return `${baseUrl}?token=${signature}&expires=${expiresAt}`;
}

// ─── Get S3 Presigned URL (server-side only, used by proxy route) ────
export async function getS3PresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const cfg = await getStorageConfig();
    const s3 = createS3Client(cfg);
    const command = new GetObjectCommand({ Bucket: cfg.bucket, Key: key });
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
