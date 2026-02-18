import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, code, newPassword } = body

        if (!email || !code || !newPassword) {
            return NextResponse.json({ error: '请填写所有字段' }, { status: 400 })
        }

        // 验证是否有效用户
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 })
        }

        // 验证验证码
        const validCode = await prisma.verificationCode.findFirst({
            where: {
                email,
                code,
                type: 'RESET_PASSWORD',
                expiresAt: { gt: new Date() }
            }
        })

        if (!validCode) {
            return NextResponse.json({ error: '验证码无效或已过期' }, { status: 400 })
        }

        // 更新密码
        const passwordHash = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash }
        })

        // 删除验证码
        await prisma.verificationCode.delete({ where: { id: validCode.id } })

        return NextResponse.json({ success: true, message: '密码重置成功' })

    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ error: '重置失败，请稍后重试' }, { status: 500 })
    }
}
