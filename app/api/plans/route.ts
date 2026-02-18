import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTierLimits } from '@/lib/tier-config'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 1. 获取所有激活的会员方案
        const plans = await prisma.membershipPlan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        })

        // 2. 获取各等级的限制配置
        const freeLimits = await getTierLimits('FREE')
        const proLimits = await getTierLimits('PRO')
        const maxLimits = await getTierLimits('MAX')

        return NextResponse.json({
            plans,
            tierLimits: {
                FREE: freeLimits,
                PRO: proLimits,
                MAX: maxLimits
            }
        })
    } catch (error) {
        console.error('Failed to fetch plans:', error)
        return NextResponse.json(
            { error: 'Failed to fetch plans' },
            { status: 500 }
        )
    }
}
