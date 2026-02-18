import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '15')
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || ''

        const where: any = {}
        const fileId = searchParams.get('fileId') || ''
        if (fileId) where.fileId = fileId
        if (search) {
            where.OR = [
                { slug: { contains: search } },
                { name: { contains: search } },
                { file: { originalName: { contains: search } } },
            ]
        }
        if (status === 'banned') where.isBanned = true
        if (status === 'active') where.isBanned = false
        if (status === 'expired') where.expiresAt = { lt: new Date() }

        const [links, total] = await Promise.all([
            prisma.link.findMany({
                where,
                include: {
                    file: { select: { originalName: true, user: { select: { email: true, name: true } } } },
                    _count: { select: { visits: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.link.count({ where }),
        ])

        return NextResponse.json({ links, total })
    } catch (error) {
        console.error('Admin links API error:', error)
        return NextResponse.json({ error: '获取链接列表失败' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const { id, isBanned, banReason } = await request.json()
        if (!id) return NextResponse.json({ error: '缺少链接ID' }, { status: 400 })

        const updateData: any = { isBanned: !!isBanned, banReason: isBanned ? (banReason || null) : null }
        const link = await prisma.link.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(link)
    } catch (error) {
        console.error('Admin link PATCH error:', error)
        return NextResponse.json({ error: '操作失败' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: '缺少ID' }, { status: 400 })

        await prisma.link.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin link DELETE error:', error)
        return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }
}
