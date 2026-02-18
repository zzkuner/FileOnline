import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getFileUrl, deleteFileFromStorage } from '@/lib/storage'

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

        // Generate URL for the file
        let url = ''
        let hlsUrl = ''

        try {
            // 设置过期时间：正常文件24小时，封禁文件10分钟 (600秒)
            // @ts-ignore - isBanned might be missing in older client
            const expiresIn = file.isBanned ? 600 : 24 * 60 * 60

            if (file.storagePath) {
                url = await getFileUrl(file.storagePath, expiresIn)
            }

            if (file.processedPath) {
                hlsUrl = await getFileUrl(file.processedPath, expiresIn)
            }
        } catch (err) {
            console.error('Failed to generate file URL:', err)
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
            select: { id: true, storagePath: true, processedPath: true, fileSize: true, userId: true }
        })

        if (!file) {
            return NextResponse.json(
                { error: '文件不存在' },
                { status: 404 }
            )
        }

        // 从存储中删除文件
        try {
            if (file.storagePath) {
                await deleteFileFromStorage(file.storagePath)
            }
            if (file.processedPath) {
                await deleteFileFromStorage(file.processedPath)
            }
        } catch (storageError) {
            console.error('Storage deletion error:', storageError)
            // 继续删除数据库记录，即使存储删除失败
        }

        // 更新用户存储用量
        await prisma.user.update({
            where: { id: file.userId },
            // @ts-ignore - Prisma Client outdated
            data: { storageUsed: { decrement: file.fileSize } }
        })

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

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: fileId } = await context.params
        const body = await request.json()
        const { name } = body

        if (!name) {
            return NextResponse.json(
                { error: '文件名不能为空' },
                { status: 400 }
            )
        }

        const file = await prisma.file.update({
            where: { id: fileId },
            data: { originalName: name }
        })

        return NextResponse.json({ file })
    } catch (error) {
        console.error('Update file error:', error)
        return NextResponse.json(
            { error: '更新文件名失败' },
            { status: 500 }
        )
    }
}
