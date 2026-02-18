import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// 获取所有定价方案
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const plans = await prisma.membershipPlan.findMany({
            orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }]
        })
        return NextResponse.json(plans)
    } catch (error) {
        console.error('Admin plans GET error:', error)
        return NextResponse.json({ error: '获取失败' }, { status: 500 })
    }
}

// 创建定价方案
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const body = await request.json()
        const plan = await prisma.membershipPlan.create({
            data: {
                tier: body.tier,
                name: body.name,
                durationDays: body.durationDays,
                price: body.price,
                originalPrice: body.originalPrice || null,
                description: body.description || null,
                isActive: body.isActive ?? true,
                sortOrder: body.sortOrder || 0,
            }
        })
        return NextResponse.json(plan)
    } catch (error) {
        console.error('Admin plans POST error:', error)
        return NextResponse.json({ error: '创建失败' }, { status: 500 })
    }
}

// 更新定价方案
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const body = await request.json()
        if (!body.id) return NextResponse.json({ error: '缺少ID' }, { status: 400 })

        const plan = await prisma.membershipPlan.update({
            where: { id: body.id },
            data: {
                tier: body.tier,
                name: body.name,
                durationDays: body.durationDays,
                price: body.price,
                originalPrice: body.originalPrice || null,
                description: body.description || null,
                isActive: body.isActive ?? true,
                sortOrder: body.sortOrder || 0,
            }
        })
        return NextResponse.json(plan)
    } catch (error) {
        console.error('Admin plans PUT error:', error)
        return NextResponse.json({ error: '更新失败' }, { status: 500 })
    }
}

// 删除定价方案
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: '缺少ID' }, { status: 400 })

        await prisma.membershipPlan.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin plans DELETE error:', error)
        return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }
}
