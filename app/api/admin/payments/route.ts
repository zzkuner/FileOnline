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
        const type = searchParams.get('type') || ''
        const status = searchParams.get('status') || ''

        const where: any = {}
        if (type) where.type = type
        if (status) where.status = status

        const [records, total] = await Promise.all([
            prisma.paymentRecord.findMany({
                where,
                include: {
                    user: { select: { email: true, name: true } }
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.paymentRecord.count({ where })
        ])

        return NextResponse.json({ records, total, page, pageSize })
    } catch (error) {
        console.error('Admin payments error:', error)
        return NextResponse.json({ error: '获取支付记录失败' }, { status: 500 })
    }
}
