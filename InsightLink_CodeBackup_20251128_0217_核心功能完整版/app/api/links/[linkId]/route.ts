import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ linkId: string }> }
) {
    try {
        const { linkId } = await params
        const body = await request.json()
        const { name, description, displayTitle, displayMode, showFilename, showFilesize, coverImage, password, expiresAt, isActive } = body

        const updateData: any = {}

        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description || null
        if (displayTitle !== undefined) updateData.displayTitle = displayTitle || null
        if (displayMode !== undefined) updateData.displayMode = displayMode
        if (showFilename !== undefined) updateData.showFilename = showFilename
        if (showFilesize !== undefined) updateData.showFilesize = showFilesize
        if (coverImage !== undefined) updateData.coverImage = coverImage || null
        if (password !== undefined) {
            // 如果密码为空字符串，删除密码；否则哈希新密码
            updateData.password = password ? await bcrypt.hash(password, 10) : null
        }
        if (expiresAt !== undefined) {
            updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
        }
        if (isActive !== undefined) updateData.isActive = isActive

        const link = await prisma.link.update({
            where: { id: linkId },
            data: updateData,
            include: {
                file: {
                    select: {
                        originalName: true,
                        fileType: true
                    }
                },
                _count: {
                    select: {
                        visits: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            link
        })
    } catch (error) {
        console.error('Update link error:', error)
        return NextResponse.json(
            { error: '更新链接失败' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ linkId: string }> }
) {
    try {
        const { linkId } = await params

        await prisma.link.delete({
            where: { id: linkId }
        })

        return NextResponse.json({
            success: true
        })
    } catch (error) {
        console.error('Delete link error:', error)
        return NextResponse.json(
            { error: '删除链接失败' },
            { status: 500 }
        )
    }
}
