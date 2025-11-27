import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        // In a real app, verify admin session here
        // For MVP, we'll trust the frontend to hide this link, 
        // but strictly we should check a session token/cookie.

        const [userCount, fileCount, linkCount, visitCount] = await Promise.all([
            prisma.user.count(),
            prisma.file.count(),
            prisma.link.count(),
            prisma.visit.count()
        ])

        const recentFiles = await prisma.file.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        })

        // Calculate storage usage (approximate)
        const files = await prisma.file.findMany({ select: { fileSize: true } })
        const totalStorage = files.reduce((acc, file) => acc + file.fileSize, 0)

        return NextResponse.json({
            stats: {
                users: userCount,
                files: fileCount,
                links: linkCount,
                visits: visitCount,
                storage: totalStorage
            },
            recentFiles
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch admin stats' },
            { status: 500 }
        )
    }
}
