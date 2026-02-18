import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ visitId: string }> }
) {
    try {
        const { visitId } = await params
        const body = await request.json()
        const { duration } = body

        console.log('📊 Updating visit duration:', { visitId, duration })

        // 更新访问记录
        const visit = await prisma.visit.update({
            where: { id: visitId },
            data: {
                endedAt: new Date(),
                duration: duration ? parseInt(duration) : null
            }
        })

        console.log('✅ Visit updated successfully:', visit)

        return NextResponse.json({ success: true, visit })
    } catch (error) {
        console.error('❌ Update visit error:', error)
        return NextResponse.json(
            { error: '更新访问记录失败' },
            { status: 500 }
        )
    }
}
