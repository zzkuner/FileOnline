import { prisma } from '@/lib/db'

export interface StorageConfig {
    storageType: string
    endpoint: string
    region: string
    accessKey: string
    secretKey: string
    bucket: string
    publicDomain: string
}

export async function getStorageConfig(): Promise<StorageConfig> {
    try {
        const configs = await (prisma as any).systemConfig.findMany({
            where: {
                key: {
                    in: [
                        'STORAGE_TYPE',
                        'S3_ENDPOINT', 'S3_REGION', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET', 'S3_PUBLIC_DOMAIN',
                    ]
                }
            }
        })
        const cfg: Record<string, string> = {}
        configs.forEach((c: any) => { cfg[c.key] = c.value })

        return {
            storageType: cfg.STORAGE_TYPE || process.env.STORAGE_TYPE || 'local',
            endpoint: cfg.S3_ENDPOINT || process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || '',
            region: cfg.S3_REGION || process.env.S3_REGION || 'us-east-1',
            accessKey: cfg.S3_ACCESS_KEY || process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || '',
            secretKey: cfg.S3_SECRET_KEY || process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || '',
            bucket: cfg.S3_BUCKET || process.env.S3_BUCKET || process.env.MINIO_BUCKET_NAME || '',
            publicDomain: cfg.S3_PUBLIC_DOMAIN || process.env.S3_PUBLIC_DOMAIN || '',
        }
    } catch {
        return {
            storageType: process.env.STORAGE_TYPE || 'local',
            endpoint: process.env.MINIO_ENDPOINT || '',
            region: process.env.S3_REGION || 'us-east-1',
            accessKey: process.env.MINIO_ACCESS_KEY || '',
            secretKey: process.env.MINIO_SECRET_KEY || '',
            bucket: process.env.MINIO_BUCKET_NAME || '',
            publicDomain: process.env.S3_PUBLIC_DOMAIN || '',
        }
    }
}
