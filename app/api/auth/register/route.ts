import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getConfig, getConfigBool } from '@/lib/config'

export async function POST(request: NextRequest) {
    try {
        // 检查是否开放注册
        const registrationEnabled = await getConfigBool('REGISTRATION_ENABLED', true)
        if (!registrationEnabled) {
            return NextResponse.json(
                { error: '注册功能已关闭，请联系管理员' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { email, password, name, code } = body

        // 验证输入
        if (!email || !password || !code) {
            return NextResponse.json(
                { error: '邮箱、密码和验证码不能为空' },
                { status: 400 }
            )
        }

        // 验证验证码
        const validCode = await prisma.verificationCode.findFirst({
            where: {
                email,
                code,
                type: 'REGISTER',
                expiresAt: { gt: new Date() }
            }
        })

        if (!validCode) {
            return NextResponse.json(
                { error: '验证码无效或已过期' },
                { status: 400 }
            )
        }

        // 验证码使用后删除（可选，或者保留直到过期）
        await prisma.verificationCode.delete({ where: { id: validCode.id } })

        // 检查用户是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: '该邮箱已被注册' },
                { status: 400 }
            )
        }

        // 检查用户名是否已存在 (如果有提供用户名)
        if (name) {
            const existingNameUser = await prisma.user.findFirst({
                where: { name }
            })
            if (existingNameUser) {
                return NextResponse.json(
                    { error: '该用户名已被使用，请换一个' },
                    { status: 400 }
                )
            }
        }

        // 创建用户
        const passwordHash = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name: name || null,
                role: 'USER'
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        })

        // 发送管理员通知（异步执行，不阻塞响应）
        try {
            const adminEmail = await getConfig('ADMIN_NOTIFY_EMAIL')
            const notifyEnabled = await getConfigBool('NOTIFY_ADMIN_ON_REGISTER', false)

            if (adminEmail && notifyEnabled) {
                // 不等待邮件发送结果，避免延长注册响应时间
                import('@/lib/email').then(({ sendAdminNewUserNotification }) => {
                    sendAdminNewUserNotification({
                        to: adminEmail,
                        userName: user.name || '未设置',
                        userEmail: user.email,
                        time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
                    }).catch(err => console.error('Failed to send admin notification:', err))
                })
            }
        } catch (e) {
            console.error('Admin notification check failed:', e)
        }

        return NextResponse.json({
            success: true,
            user
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: '注册失败，请稍后重试' },
            { status: 500 }
        )
    }
}
