import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { logAction } from '@/lib/logger'
import crypto from 'crypto'

// 生成卡密码
function generateCardCode(): string {
    return crypto.randomBytes(12).toString('hex').toUpperCase().match(/.{4}/g)!.join('-')
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const status = searchParams.get('status') || '' // unused, used
        const batchId = searchParams.get('batchId') || ''

        const where: any = {}
        if (status === 'unused') where.isUsed = false
        if (status === 'used') where.isUsed = true
        if (batchId) where.batchId = batchId

        const [cards, total] = await Promise.all([
            prisma.cardKey.findMany({
                where,
                include: {
                    usedBy: { select: { email: true, name: true } }
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.cardKey.count({ where })
        ])

        return NextResponse.json({ cards, total, page, pageSize })
    } catch (error) {
        console.error('Admin cards error:', error)
        return NextResponse.json({ error: '获取卡密列表失败' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const body = await request.json()
        const { count, tier, durationDays } = body

        if (!count || !tier || !durationDays) {
            return NextResponse.json({ error: '参数不完整' }, { status: 400 })
        }

        if (count > 100) {
            return NextResponse.json({ error: '单次最多生成100个' }, { status: 400 })
        }

        const batchId = `BATCH-${Date.now()}`
        const cards = []

        for (let i = 0; i < count; i++) {
            cards.push({
                code: generateCardCode(),
                tier,
                durationDays: parseInt(durationDays),
                batchId
            })
        }

        await prisma.cardKey.createMany({ data: cards })

        await logAction('CARD_GENERATE', `生成 ${count} 张 ${tier} 卡密，有效期 ${durationDays} 天，批次 ${batchId}`, {
            userId: session.user.id
        })

        const created = await prisma.cardKey.findMany({
            where: { batchId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, cards: created, batchId })
    } catch (error) {
        console.error('Admin generate cards error:', error)
        return NextResponse.json({ error: '生成卡密失败' }, { status: 500 })
    }
}
