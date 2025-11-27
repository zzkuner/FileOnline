import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, name } = body

        // 验证输入
        if (!email || !password) {
            return NextResponse.json(
                { error: '邮箱和密码不能为空' },
                { status: 400 }
            )
        }

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
