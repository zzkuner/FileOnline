import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { logAction } from '@/lib/logger'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const { tier, isBlocked, role, tierExpiresAt, blockReason } = body

        const updateData: any = {}
        if (tier !== undefined) updateData.tier = tier
        if (isBlocked !== undefined) updateData.isBlocked = isBlocked
        if (role !== undefined) updateData.role = role
        if (blockReason !== undefined) updateData.blockReason = blockReason
        if (tierExpiresAt !== undefined) {
            updateData.tierExpiresAt = tierExpiresAt ? new Date(tierExpiresAt) : null
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true, email: true, name: true, role: true,
                tier: true, tierExpiresAt: true, isBlocked: true
            }
        })

        await logAction('ADMIN_USER_UPDATE', `管理员修改用户 ${user.email}: ${JSON.stringify(body)}`, {
            userId: session.user.id,
            level: 'INFO'
        })

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Admin update user error:', error)
        return NextResponse.json({ error: '更新用户失败' }, { status: 500 })
    }
}
