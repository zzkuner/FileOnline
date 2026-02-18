import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { deleteFileFromStorage } from '@/lib/storage'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const search = searchParams.get('search') || ''
        const userId = searchParams.get('userId') || ''

        const where: any = {}
        if (search) {
            where.originalName = { contains: search, mode: 'insensitive' }
        }
        if (userId) where.userId = userId

        const [files, total] = await Promise.all([
            prisma.file.findMany({
                where,
                include: {
                    user: { select: { name: true, email: true } },
                    _count: { select: { links: true } }
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.file.count({ where })
        ])

        return NextResponse.json({ files, total, page, pageSize })
    } catch (error) {
        console.error('Admin files error:', error)
        return NextResponse.json({ error: '获取文件列表失败' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const { id, isBanned, banReason } = await request.json()
        if (!id) return NextResponse.json({ error: '缺少文件ID' }, { status: 400 })

        const file = await prisma.file.update({
            where: { id },
            data: { isBanned: !!isBanned, banReason: isBanned ? (banReason || null) : null },
            select: { id: true, originalName: true, userId: true, isBanned: true }
        })

        // 封禁时同步封禁所有链接
        if (isBanned) {
            await prisma.link.updateMany({
                where: { fileId: id },
                data: { isBanned: true, banReason: banReason || '关联文件被封禁' }
            })
            // 异步通知文件所有者
            import('@/lib/mailer').then(({ sendNotification }) => {
                sendNotification(file.userId, 'file_banned', {
                    fileName: file.originalName,
                    reason: banReason || '违反平台规则'
                })
            }).catch(console.error)
        } else {
            await prisma.link.updateMany({
                where: { fileId: id },
                data: { isBanned: false, banReason: null }
            })
        }

        return NextResponse.json({ success: true, file })
    } catch (error) {
        console.error('Admin ban file error:', error)
        return NextResponse.json({ error: '操作失败' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: '缺少文件ID' }, { status: 400 })

        const file = await prisma.file.findUnique({ where: { id }, select: { fileSize: true, userId: true, storagePath: true, processedPath: true } })
        if (file) {
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
                // 继续删除数据库记录
            }

            await prisma.user.update({
                where: { id: file.userId },
                data: { storageUsed: { decrement: file.fileSize } }
            })
        }

        await prisma.file.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin delete file error:', error)
        return NextResponse.json({ error: '删除文件失败' }, { status: 500 })
    }
}
