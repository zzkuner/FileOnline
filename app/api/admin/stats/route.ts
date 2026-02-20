import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const [userCount, fileCount, linkCount, visitCount] = await Promise.all([
            prisma.user.count(),
            prisma.file.count(),
            prisma.link.count(),
            prisma.visit.count()
        ])

        const tierBreakdown = {
            FREE: await prisma.user.count({ where: { tier: 'FREE' } }),
            PRO: await prisma.user.count({ where: { tier: 'PRO' } }),
            MAX: await prisma.user.count({ where: { tier: 'MAX' } }),
        }

        const recentFiles = await prisma.file.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        })

        const files = await prisma.file.findMany({ select: { fileSize: true } })
        const totalStorage = files.reduce((acc: number, file) => acc + file.fileSize, 0)

        return NextResponse.json({
            stats: {
                users: userCount,
                files: fileCount,
                links: linkCount,
                visits: visitCount,
                storage: totalStorage
            },
            tierBreakdown,
            recentFiles
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 })
    }
}
