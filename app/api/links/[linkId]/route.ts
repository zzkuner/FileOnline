import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { deleteFileFromStorage } from '@/lib/storage'

function extractKeyFromUrl(url: string): string | null {
    if (!url) return null
    try {
        const u = new URL(url, 'http://dummy.com')
        if (u.pathname.includes('/api/uploads/')) {
            return u.pathname.split('/api/uploads/')[1]
        }
        // Assume key starts with 'avatars/'
        if (u.pathname.includes('/avatars/')) {
            return u.pathname.substring(u.pathname.indexOf('avatars/'))
        }
    } catch (e) { }
    return null
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ linkId: string }> }
) {
    try {
        const { linkId } = await params
        const body = await request.json()
        const { name, description, displayTitle, displayMode, showFilename, showFilesize, coverImage, password, expiresAt, maxVisits, isActive, uploaderProfile } = body

        const updateData: any = {}

        // ... existing fields ...
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description || null
        if (displayTitle !== undefined) updateData.displayTitle = displayTitle || null
        if (displayMode !== undefined) updateData.displayMode = displayMode
        if (showFilename !== undefined) updateData.showFilename = showFilename
        if (showFilesize !== undefined) updateData.showFilesize = showFilesize
        if (coverImage !== undefined) updateData.coverImage = coverImage || null
        if (password !== undefined) {
            updateData.password = password ? await bcrypt.hash(password, 10) : null
        }
        if (expiresAt !== undefined) {
            updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
        }
        if (maxVisits !== undefined) {
            updateData.maxVisits = maxVisits ? parseInt(maxVisits) : null
        }
        if (isActive !== undefined) updateData.isActive = isActive

        // Handle Avatar Cleanup on Update
        if (uploaderProfile !== undefined) {
            updateData.uploaderProfile = uploaderProfile || null

            // Check if we need to delete old avatar
            try {
                const oldLink = await prisma.link.findUnique({ where: { id: linkId }, select: { uploaderProfile: true } })
                if (oldLink?.uploaderProfile) {
                    const oldProfile = JSON.parse(oldLink.uploaderProfile)
                    const newProfile = uploaderProfile ? JSON.parse(uploaderProfile) : null

                    if (oldProfile?.avatar && (!newProfile || oldProfile.avatar !== newProfile.avatar)) {
                        const key = extractKeyFromUrl(oldProfile.avatar)
                        if (key) {
                            console.log('Cleaning up old avatar:', key)
                            await deleteFileFromStorage(key).catch(console.error)
                        }
                    }
                }
            } catch (e) {
                console.error('Avatar cleanup check failed:', e)
            }
        }

        if (body.hideBranding !== undefined) {
            const { checkBrandingPrivilege } = await import('@/lib/tier-guard')
            const link = await prisma.link.findUnique({ where: { id: linkId }, include: { file: true } })
            if (link) {
                const canHide = await checkBrandingPrivilege(link.file.userId)
                if (canHide) {
                    updateData.hideBranding = body.hideBranding
                }
            }
        }

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

        // Find link to clean up avatar
        const link = await prisma.link.findUnique({ where: { id: linkId } })

        if (link?.uploaderProfile) {
            try {
                const profile = JSON.parse(link.uploaderProfile)
                if (profile.avatar) {
                    const key = extractKeyFromUrl(profile.avatar)
                    if (key) {
                        console.log('Cleaning up avatar for deleted link:', key)
                        await deleteFileFromStorage(key).catch(console.error)
                    }
                }
            } catch (e) { }
        }

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
