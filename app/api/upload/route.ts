import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getFileType } from '@/lib/file-storage'
import { uploadFileToStorage, deleteFileFromStorage } from '@/lib/storage'
import { nanoid } from 'nanoid'
import path from 'path'
import { checkFileUploadQuota, checkStorageQuota } from '@/lib/tier-guard'

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

        const replaceFileId = formData.get('replaceFileId') as string
        let oldFile = null

        if (replaceFileId) {
            oldFile = await prisma.file.findFirst({
                where: {
                    id: replaceFileId,
                    userId: userId
                }
            })

            if (!oldFile) {
                return NextResponse.json(
                    { error: '要替换的文件不存在或无权操作' },
                    { status: 403 }
                )
            }
        }

        // 等级配额检查：文件数量 (仅当不是替换文件时检查)
        if (!replaceFileId) {
            const fileQuota = await checkFileUploadQuota(userId)
            if (!fileQuota.allowed) {
                return NextResponse.json(
                    { error: fileQuota.reason },
                    { status: 403 }
                )
            }
        }

        // 等级配额检查：存储空间
        // 如果是替换，需要减去旧文件大小进行计算
        const sizeAdjustment = oldFile ? -oldFile.fileSize : 0
        const storageQuota = await checkStorageQuota(userId, file.size + sizeAdjustment)
        if (!storageQuota.allowed) {
            return NextResponse.json(
                { error: storageQuota.reason },
                { status: 403 }
            )
        }

        // 等级配额检查：单文件大小限制
        const { checkFileSizeLimit } = await import('@/lib/tier-guard')
        const sizeQuota = await checkFileSizeLimit(userId, file.size)
        if (!sizeQuota.allowed) {
            return NextResponse.json(
                { error: sizeQuota.reason },
                { status: 403 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = path.extname(file.name)
        const key = `uploads/${userId}/${nanoid()}-${Date.now()}${ext}`

        // Upload to MinIO/S3
        const storagePath = await uploadFileToStorage(buffer, key, file.type)
        const fileType = getFileType(file.type)

        let fileRecord

        if (replaceFileId && oldFile) {
            // 替换逻辑
            // 1. 删除旧文件
            try {
                if (oldFile.storagePath) await deleteFileFromStorage(oldFile.storagePath)
                if (oldFile.processedPath) await deleteFileFromStorage(oldFile.processedPath)
            } catch (e) {
                console.error('Failed to cleanup old files:', e)
            }

            // 2. 更新数据库记录
            fileRecord = await prisma.file.update({
                where: { id: replaceFileId },
                data: {
                    originalName: file.name,
                    storagePath,
                    fileType,
                    mimeType: file.type,
                    fileSize: buffer.length,
                    status: fileType === 'VIDEO' ? 'PROCESSING' : 'READY',
                    processedPath: null, // 重置处理路径
                    metadata: JSON.stringify({
                        uploadedAt: new Date().toISOString(),
                        replacedAt: new Date().toISOString()
                    })
                }
            })

            // 3. 更新配额 (增量更新)
            await prisma.user.update({
                where: { id: userId },
                // @ts-ignore
                data: { storageUsed: { increment: buffer.length - oldFile.fileSize } }
            })

        } else {
            // 创建新文件记录
            fileRecord = await prisma.file.create({
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

            // 更新用户存储用量
            await prisma.user.update({
                where: { id: userId },
                // @ts-ignore
                data: { storageUsed: { increment: buffer.length } }
            })
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
