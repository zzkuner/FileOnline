import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // 验证输入
        if (!email || !password) {
            return NextResponse.json(
                { error: '邮箱和密码不能为空' },
                { status: 400 }
            )
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json(
                { error: '邮箱或密码错误' },
                { status: 401 }
            )
        }

        // 验证密码
        const isValid = await verifyPassword(password, user.passwordHash)
        if (!isValid) {
            return NextResponse.json(
                { error: '邮箱或密码错误' },
                { status: 401 }
            )
        }

        // 返回用户信息（在生产环境中应该设置 session cookie）
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: '登录失败，请稍后重试' },
            { status: 500 }
        )
    }
}
