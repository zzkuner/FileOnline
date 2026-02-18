import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

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
        const tier = searchParams.get('tier') || ''

        const where: any = {}
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } }
            ]
        }
        if (tier) where.tier = tier

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true, email: true, name: true, role: true,
                    tier: true, tierExpiresAt: true, storageUsed: true,
                    isBlocked: true, createdAt: true,
                    _count: { select: { files: true } }
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ])

        return NextResponse.json({ users, total, page, pageSize })
    } catch (error) {
        console.error('Admin users error:', error)
        return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
    }
}
