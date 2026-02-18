import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: '未登录' }, { status: 401 })

        const setting = await prisma.notificationSetting.findUnique({
            where: { userId: session.user.id }
        })

        return NextResponse.json(setting || {
            emailOnView: false,
            emailOnExpire: true,
            emailDigest: false,
            emailOnRegister: true,
            emailOnTierChange: true,
            emailOnTierExpire: true,
            emailOnFileBanned: true,
        })
    } catch (error) {
        console.error('Notification settings GET error:', error)
        return NextResponse.json({ error: '获取失败' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: '未登录' }, { status: 401 })

        const {
            notifyEmail, emailOnView, emailOnExpire, emailDigest,
            emailOnRegister, emailOnTierChange, emailOnTierExpire, emailOnFileBanned
        } = await request.json()

        const data = {
            notifyEmail: notifyEmail || null,
            emailOnView: !!emailOnView,
            emailOnExpire: emailOnExpire !== false,
            emailDigest: !!emailDigest,
            emailOnRegister: emailOnRegister !== false,
            emailOnTierChange: emailOnTierChange !== false,
            emailOnTierExpire: emailOnTierExpire !== false,
            emailOnFileBanned: emailOnFileBanned !== false,
        }

        await prisma.notificationSetting.upsert({
            where: { userId: session.user.id },
            update: data,
            create: { userId: session.user.id, ...data }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Notification settings POST error:', error)
        return NextResponse.json({ error: '保存失败' }, { status: 500 })
    }
}
