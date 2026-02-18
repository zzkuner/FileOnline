import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取用户的所有文件
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: '用户ID不能为空' },
                { status: 400 }
            )
        }

        const files = await prisma.file.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { links: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ files })
    } catch (error) {
        console.error('Get files error:', error)
        return NextResponse.json(
            { error: '获取文件列表失败' },
            { status: 500 }
        )
    }
}
