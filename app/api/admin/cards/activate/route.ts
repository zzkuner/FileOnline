import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { logAction } from '@/lib/logger'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: '未登录' }, { status: 401 })
        }

        const { code } = await request.json()
        if (!code) {
            return NextResponse.json({ error: '请输入卡密' }, { status: 400 })
        }

        const card = await prisma.cardKey.findUnique({ where: { code: code.trim().toUpperCase() } })
        if (!card) {
            return NextResponse.json({ error: '卡密不存在' }, { status: 404 })
        }
        if (card.isUsed) {
            return NextResponse.json({ error: '该卡密已被使用' }, { status: 400 })
        }

        const now = new Date()
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { tier: true, tierExpiresAt: true }
        })

        // 计算新的到期时间
        let baseDate = now
        if (user?.tier === card.tier && user?.tierExpiresAt && user.tierExpiresAt > now) {
            // 同等级：在现有到期时间基础上续期
            baseDate = user.tierExpiresAt
        }
        const newExpiry = new Date(baseDate.getTime() + card.durationDays * 24 * 60 * 60 * 1000)

        // 更新卡密状态
        await prisma.cardKey.update({
            where: { id: card.id },
            data: { isUsed: true, usedById: session.user.id, usedAt: now }
        })

        // 更新用户等级
        await prisma.user.update({
            where: { id: session.user.id },
            data: { tier: card.tier, tierExpiresAt: newExpiry }
        })

        // 记录支付
        await prisma.paymentRecord.create({
            data: {
                userId: session.user.id,
                type: 'CARD_KEY',
                amount: 0,
                tier: card.tier,
                durationDays: card.durationDays,
                status: 'SUCCESS',
                detail: JSON.stringify({ cardCode: card.code, batchId: card.batchId })
            }
        })

        await logAction('CARD_ACTIVATE', `用户激活卡密 ${card.code}，升级为 ${card.tier}，有效至 ${newExpiry.toISOString()}`, {
            userId: session.user.id
        })

        return NextResponse.json({
            success: true,
            tier: card.tier,
            expiresAt: newExpiry
        })
    } catch (error) {
        console.error('Card activate error:', error)
        return NextResponse.json({ error: '激活失败' }, { status: 500 })
    }
}
