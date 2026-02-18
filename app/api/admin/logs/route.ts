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
        const pageSize = parseInt(searchParams.get('pageSize') || '50')
        const level = searchParams.get('level') || ''
        const action = searchParams.get('action') || ''

        const where: any = {}
        if (level) where.level = level
        if (action) where.action = { contains: action, mode: 'insensitive' }

        const [logs, total] = await Promise.all([
            prisma.systemLog.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.systemLog.count({ where })
        ])

        return NextResponse.json({ logs, total, page, pageSize })
    } catch (error) {
        console.error('Admin logs error:', error)
        return NextResponse.json({ error: '获取日志失败' }, { status: 500 })
    }
}
