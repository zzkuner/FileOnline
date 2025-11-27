import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getFileType } from '@/lib/file-storage'
import { uploadFileToStorage } from '@/lib/storage'
import { nanoid } from 'nanoid'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const userId = formData.get('userId') as string

        if (!file || !userId) {
            return NextResponse.json(
                { error: '文件和用户ID不能为空' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = path.extname(file.name)
        const key = `uploads/${userId}/${nanoid()}-${Date.now()}${ext}`

        // Upload to MinIO/S3
        const storagePath = await uploadFileToStorage(buffer, key, file.type)
        const fileType = getFileType(file.type)

        // 创建文件记录
        const fileRecord = await prisma.file.create({
            data: {
                userId,
                originalName: file.name,
                storagePath,
                fileType,
                mimeType: file.type,
                fileSize: buffer.length,
                status: fileType === 'VIDEO' ? 'PROCESSING' : 'READY', // 视频需要转码
                metadata: JSON.stringify({
                    uploadedAt: new Date().toISOString()
                })
            }
        })

        // 如果是视频，触发异步HLS转码
        if (fileType === 'VIDEO') {
            import('@/lib/queue').then(({ processVideo }) => {
                processVideo(fileRecord.id, storagePath).catch(err =>
                    console.error('Background processing failed:', err)
                );
            });
        }

        return NextResponse.json({
            success: true,
            file: fileRecord
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: '文件上传失败' },
            { status: 500 }
        )
    }
}
