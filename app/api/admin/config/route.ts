import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const configs = await prisma.systemConfig.findMany()
        const result: Record<string, string> = {}
        configs.forEach(c => { result[c.key] = c.value })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Admin config GET error:', error)
        return NextResponse.json({ error: '获取配置失败' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const body = await request.json()

        // Upsert each key-value pair
        const promises = Object.entries(body).map(([key, value]) =>
            prisma.systemConfig.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            })
        )
        await Promise.all(promises)

        // Also update process.env for immediate effect
        Object.entries(body).forEach(([key, value]) => {
            if (value) process.env[key] = String(value)
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin config POST error:', error)
        return NextResponse.json({ error: '保存配置失败' }, { status: 500 })
    }
}
