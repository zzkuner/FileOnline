import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: '未登录' }, { status: 401 })

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                tier: true,
                tierExpiresAt: true,
                storageUsed: true,
                _count: { select: { files: true } }
            }
        })

        if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

        // Count total links across all files
        const linkCount = await prisma.link.count({
            where: { file: { userId: session.user.id } }
        })

        return NextResponse.json({
            tier: user.tier,
            tierExpiresAt: user.tierExpiresAt,
            storageUsed: user.storageUsed,
            fileCount: user._count.files,
            linkCount
        })
    } catch (error) {
        console.error('Usage API error:', error)
        return NextResponse.json({ error: '获取用量失败' }, { status: 500 })
    }
}
