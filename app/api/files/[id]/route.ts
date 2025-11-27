import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getMinioClient } from '@/lib/minio'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: fileId } = await context.params

        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        links: true
                    }
                }
            }
        })

        if (!file) {
            return NextResponse.json(
                { error: '文件不存在' },
                { status: 404 }
            )
        }

        // Generate presigned URL
        const minioClient = getMinioClient()
        const bucketName = process.env.MINIO_BUCKET_NAME || 'files'
        let url = ''
        let hlsUrl = ''

        try {
            if (file.storagePath) {
                url = await minioClient.presignedGetObject(bucketName, file.storagePath, 24 * 60 * 60) // 24 hours
            }

            if (file.processedPath) {
                // For HLS, we might need a different approach or just point to the master playlist
                // Assuming processedPath is the folder or master file
                // For now, let's just use presigned URL for the processed file if it's a single file, 
                // or if it's HLS, we might need a public bucket or a proxy.
                // Let's assume processedPath points to the .m3u8 file for now.
                hlsUrl = await minioClient.presignedGetObject(bucketName, file.processedPath, 24 * 60 * 60)
            }
        } catch (err) {
            console.error('Failed to generate presigned URL:', err)
        }

        return NextResponse.json({
            file: {
                ...file,
                url,
                hlsUrl
            }
        })
    } catch (error) {
        console.error('Get file error:', error)
        return NextResponse.json(
            { error: '获取文件信息失败' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: fileId } = await context.params

        // 查找文件
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: {
                links: {
                    include: {
                        visits: {
                            include: {
                                events: true
                            }
                        }
                    }
                }
            }
        })

        if (!file) {
            return NextResponse.json(
                { error: '文件不存在' },
                { status: 404 }
            )
        }

        // 删除 MinIO 中的文件
        try {
            const minioClient = getMinioClient()
            const bucketName = process.env.MINIO_BUCKET_NAME || 'files'

            // 删除原始文件
            if (file.storagePath) {
                await minioClient.removeObject(bucketName, file.storagePath)
            }

            // 删除缩略图（如果存在）
            if (file.thumbnailPath) {
                await minioClient.removeObject(bucketName, file.thumbnailPath)
            }
        } catch (minioError) {
            console.error('MinIO deletion error:', minioError)
            // 继续删除数据库记录，即使 MinIO 删除失败
        }

        // 删除数据库记录（级联删除会自动删除相关的 links, visits, events）
        await prisma.file.delete({
            where: { id: fileId }
        })

        return NextResponse.json({
            success: true,
            message: '文件已删除'
        })
    } catch (error) {
        console.error('Delete file error:', error)
        return NextResponse.json(
            { error: '删除文件失败' },
            { status: 500 }
        )
    }
}
