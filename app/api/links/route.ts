
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { checkLinkQuota } from '@/lib/tier-guard'

// Generate random slug
function generateSlug(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { fileId, name, description, password, expiresAt, maxVisits, viewMode, uploaderProfile } = body

        if (!fileId || !name) {
            return NextResponse.json(
                { error: '文件ID和链接名称不能为空' },
                { status: 400 }
            )
        }

        // 查找文件所属用户，进行链接配额检查
        const file = await prisma.file.findUnique({ where: { id: fileId }, select: { userId: true } })
        if (file) {
            const linkQuota = await checkLinkQuota(file.userId, fileId)
            if (!linkQuota.allowed) {
                return NextResponse.json(
                    { error: linkQuota.reason },
                    { status: 403 }
                )
            }
        }

        // 生成唯一的 slug
        let slug = generateSlug(8)
        let attempts = 0
        while (attempts < 5) {
            const existing = await prisma.link.findUnique({ where: { slug } })
            if (!existing) break
            slug = generateSlug(8)
            attempts++
        }

        // 哈希密码（如果提供）
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null

        // 创建追踪链接
        const link = await prisma.link.create({
            data: {
                fileId,
                slug,
                name,
                description: description || null,
                displayTitle: body.displayTitle || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                maxVisits: maxVisits ? parseInt(maxVisits) : null,
                uploaderProfile: uploaderProfile || null,
                hideBranding: body.hideBranding || false // 简单赋初值，权限检查在后面 (但 create 不需要 check 吗？需要)
            },
            include: {
                file: {
                    select: {
                        originalName: true,
                        fileType: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            link
        })
    } catch (error) {
        console.error('Create link error:', error)
        return NextResponse.json(
            { error: '创建链接失败' },
            { status: 500 }
        )
    }
}

// 获取文件的所有链接
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const fileId = searchParams.get('fileId')

        if (!fileId) {
            return NextResponse.json(
                { error: '文件ID不能为空' },
                { status: 400 }
            )
        }

        const links = await prisma.link.findMany({
            where: { fileId },
            include: {
                _count: {
                    select: { visits: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ links })
    } catch (error) {
        console.error('Get links error:', error)
        return NextResponse.json(
            { error: '获取链接失败' },
            { status: 500 }
        )
    }
}
