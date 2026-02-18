import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST() {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        // 读取存储配置
        const configs = await (prisma as any).systemConfig.findMany({
            where: {
                key: {
                    in: ['STORAGE_TYPE', 'S3_ENDPOINT', 'S3_REGION', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET']
                }
            }
        })
        const cfg: Record<string, string> = {}
        configs.forEach((c: any) => { cfg[c.key] = c.value })

        const storageType = cfg.STORAGE_TYPE || 'local'

        if (storageType === 'local') {
            // 本地存储：检查 uploads 目录
            const fs = await import('fs')
            const path = await import('path')
            const uploadDir = path.join(process.cwd(), 'uploads')

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }

            // 测试写入和读取
            const testFile = path.join(uploadDir, '.storage-test')
            fs.writeFileSync(testFile, 'test')
            fs.readFileSync(testFile)
            fs.unlinkSync(testFile)

            return NextResponse.json({ message: '本地存储正常，uploads 目录可读写' })
        }

        // S3 兼容存储
        if (!cfg.S3_ENDPOINT || !cfg.S3_ACCESS_KEY || !cfg.S3_SECRET_KEY || !cfg.S3_BUCKET) {
            return NextResponse.json({ error: '存储配置不完整，请填写 Endpoint、Access Key、Secret Key 和 Bucket' }, { status: 400 })
        }

        // 使用 AWS SDK 测试连接
        const { S3Client, HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3')

        const s3 = new S3Client({
            endpoint: cfg.S3_ENDPOINT,
            region: cfg.S3_REGION || 'auto',
            credentials: {
                accessKeyId: cfg.S3_ACCESS_KEY,
                secretAccessKey: cfg.S3_SECRET_KEY,
            },
            forcePathStyle: true,
        })

        // 检查 bucket 是否存在
        try {
            await s3.send(new HeadBucketCommand({ Bucket: cfg.S3_BUCKET }))
        } catch (e: any) {
            if (e?.name === 'NotFound' || e?.$metadata?.httpStatusCode === 404) {
                return NextResponse.json({ error: `Bucket "${cfg.S3_BUCKET}" 不存在` }, { status: 400 })
            }
            if (e?.$metadata?.httpStatusCode === 403) {
                return NextResponse.json({ error: `无权限访问 Bucket "${cfg.S3_BUCKET}"，请检查 Access Key` }, { status: 400 })
            }
            throw e
        }

        // 测试写入和删除
        const testKey = `.insightlink-test-${Date.now()}`
        await s3.send(new PutObjectCommand({
            Bucket: cfg.S3_BUCKET,
            Key: testKey,
            Body: 'connection-test',
            ContentType: 'text/plain',
        }))

        await s3.send(new DeleteObjectCommand({
            Bucket: cfg.S3_BUCKET,
            Key: testKey,
        }))

        return NextResponse.json({ message: `${storageType.toUpperCase()} 存储连接成功！Bucket "${cfg.S3_BUCKET}" 可读写` })
    } catch (error: any) {
        console.error('存储测试失败:', error)
        const msg = error?.message || '未知错误'
        if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND')) {
            return NextResponse.json({ error: '无法连接到存储服务器，请检查 Endpoint 地址' }, { status: 500 })
        }
        if (msg.includes('InvalidAccessKeyId') || msg.includes('SignatureDoesNotMatch')) {
            return NextResponse.json({ error: '认证失败，请检查 Access Key 和 Secret Key' }, { status: 500 })
        }
        return NextResponse.json({ error: `存储测试失败: ${msg}` }, { status: 500 })
    }
}
