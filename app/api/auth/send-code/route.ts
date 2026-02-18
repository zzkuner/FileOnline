import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getConfigBool } from '@/lib/config'

// 生成6位数字验证码
function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, type } = body // type: 'REGISTER' | 'RESET_PASSWORD'

        if (!email || !type) {
            return NextResponse.json({ error: '邮箱和类型不能为空' }, { status: 400 })
        }

        // 检查用户是否存在
        const user = await prisma.user.findUnique({ where: { email } })

        if (type === 'REGISTER') {
            // 注册时，邮箱不能已存在
            if (user) {
                return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 })
            }
            // 检查注册开关
            if (!(await getConfigBool('REGISTRATION_ENABLED', true))) {
                return NextResponse.json({ error: '注册功能已关闭' }, { status: 403 })
            }
        } else if (type === 'RESET_PASSWORD') {
            // 重置密码时，邮箱必须存在
            if (!user) {
                return NextResponse.json({ error: '该邮箱未注册' }, { status: 404 })
            }
        } else {
            return NextResponse.json({ error: '无效的验证类型' }, { status: 400 })
        }

        // 检查发送频率（1分钟内只能发一次）
        const lastCode = await prisma.verificationCode.findFirst({
            where: { email, type },
            orderBy: { createdAt: 'desc' }
        })

        if (lastCode && Date.now() - lastCode.createdAt.getTime() < 60 * 1000) {
            return NextResponse.json({ error: '发送太频繁，请稍后再试' }, { status: 429 })
        }

        // 生成验证码
        const code = generateCode()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟有效

        // 保存验证码
        await prisma.verificationCode.create({
            data: {
                email,
                code,
                type,
                expiresAt
            }
        })

        // 发送邮件
        const subject = type === 'REGISTER' ? '注册验证码' : '重置密码验证码'
        const text = `您的验证码是：${code}，有效期10分钟。如非本人操作，请忽略此邮件。`

        const result = await sendEmail({ to: email, subject, text })

        if (result.success) {
            return NextResponse.json({ success: true, message: '验证码已发送' })
        } else {
            return NextResponse.json({ error: `邮件发送失败: ${result.error || '请检查邮箱地址或稍后重试'}` }, { status: 500 })
        }

    } catch (error) {
        console.error('Send code error:', error)
        return NextResponse.json({ error: '服务器错误' }, { status: 500 })
    }
}
