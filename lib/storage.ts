import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const S3_ENDPOINT = process.env.MINIO_ENDPOINT ? `https://${process.env.MINIO_ENDPOINT}` : "http://localhost:9000";
const S3_REGION = process.env.MINIO_REGION || "us-west-004"; // Default to B2 region if not set
const S3_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "minioadmin";
const S3_SECRET_KEY = process.env.MINIO_SECRET_KEY || "minioadmin";
const S3_BUCKET = process.env.MINIO_BUCKET_NAME || "insightlink";

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload dir exists
if (STORAGE_TYPE === 'local') {
    fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);
}

export const s3Client = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT,
    credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
    },
    forcePathStyle: true,
});

export async function uploadFileToStorage(
    fileBuffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    console.log('=== UPLOAD DEBUG ===');
    console.log('STORAGE_TYPE:', STORAGE_TYPE);
    console.log('S3_BUCKET:', S3_BUCKET);
    console.log('S3_ENDPOINT:', S3_ENDPOINT);
    console.log('Key:', key);
    console.log('==================');

    if (STORAGE_TYPE === 'local') {
        console.log('📁 Using LOCAL storage');
        const filePath = path.join(UPLOAD_DIR, key);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, fileBuffer);
        return key;
    }

    console.log('☁️ Uploading to S3/B2...');
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    });

    const response = await s3Client.send(command);
    console.log('✅ Upload successful!', response);
    return key;
}

export async function getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    if (STORAGE_TYPE === 'local') {
        return `/api/uploads/${key}`;
    }

    const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function getFileStream(key: string) {
    if (STORAGE_TYPE === 'local') {
        const filePath = path.join(UPLOAD_DIR, key);
        return createReadStream(filePath);
    }

    const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    });
    const response = await s3Client.send(command);
    return response.Body;
}

export async function downloadFileFromStorage(key: string, localPath: string): Promise<void> {
    if (STORAGE_TYPE === 'local') {
        const filePath = path.join(UPLOAD_DIR, key);
        await fs.copyFile(filePath, localPath);
        return;
    }

    const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    });
    const response = await s3Client.send(command);

    if (!response.Body) {
        throw new Error('File not found');
    }

    // @ts-ignore - AWS SDK stream type mismatch with Node stream
    await pipeline(response.Body, createWriteStream(localPath));
}
