import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getFileUrl } from '@/lib/storage'
import { getGeoLocation } from '@/lib/geolocation'
import { parseUserAgent } from '@/lib/userAgent'
import bcrypt from 'bcryptjs'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const { searchParams } = new URL(request.url)
        const password = searchParams.get('password')

        // 查找链接
        const link = await prisma.link.findUnique({
            where: { slug },
            include: {
                file: true,
                _count: {
                    select: { visits: true }
                }
            }
        })

        if (!link) {
            return NextResponse.json(
                { error: '链接不存在' },
                { status: 404 }
            )
        }

        if (!link.isActive) {
            return NextResponse.json(
                { error: '链接已失效' },
                { status: 410 }
            )
        }

        if (link.expiresAt && new Date() > link.expiresAt) {
            return NextResponse.json(
                { error: '链接已过期' },
                { status: 410 }
            )
        }

        if (link.maxVisits && link._count.visits >= link.maxVisits) {
            return NextResponse.json(
                { error: '链接访问次数已达上限' },
                { status: 410 }
            )
        }

        // 验证密码
        if (link.password) {
            if (!password) {
                return NextResponse.json(
                    { error: '需要密码', needPassword: true },
                    { status: 401 }
                )
            }
            const isValid = await bcrypt.compare(password, link.password)
            if (!isValid) {
                return NextResponse.json(
                    { error: '密码错误' },
                    { status: 403 }
                )
            }
        }

        // 获取访问者信息
        const forwardedFor = request.headers.get('x-forwarded-for')
        const realIp = request.headers.get('x-real-ip')
        const visitorIp = forwardedFor?.split(',')[0] || realIp || request.headers.get('cf-connecting-ip') || '::1'
        const userAgent = request.headers.get('user-agent') || ''

        console.log('📍 访客信息:', { visitorIp, userAgent: userAgent.slice(0, 60) })

        // 解析UserAgent获取详细设备信息
        const deviceInfo = parseUserAgent(userAgent)

        // 异步获取地理位置（不阻塞响应）
        let location: string | null = null
        try {
            location = await getGeoLocation(visitorIp)
            console.log('🌍 地理位置:', location)
        } catch (error) {
            console.warn('地理位置解析失败:', error)
        }

        // 创建访问记录
        const visit = await prisma.visit.create({
            data: {
                linkId: link.id,
                visitorIp,
                userAgent,
                location: location || null,
                deviceType: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                os: deviceInfo.os
            }
        })

        console.log('✅ 访问记录已创建:', {
            id: visit.id,
            device: `${deviceInfo.deviceName} (${deviceInfo.os})`,
            browser: deviceInfo.browser,
            location: location || '未知'
        })

        // 获取文件 URL
        const url = await getFileUrl(link.file.storagePath)

        // 如果是视频文件且有HLS版本，也获取HLS URL
        let hlsUrl = null
        if (link.file.fileType === 'VIDEO' && link.file.processedPath) {
            hlsUrl = await getFileUrl(link.file.processedPath)
        }

        return NextResponse.json({
            visitId: visit.id,
            file: {
                name: link.file.originalName,
                type: link.file.fileType,
                size: link.file.fileSize,
                url,
                hlsUrl
            },
            link: {
                name: link.name,
                description: link.description,
                displayTitle: link.displayTitle,
                displayMode: link.displayMode,
                showFilename: link.showFilename,
                showFilesize: link.showFilesize,
                coverImage: link.coverImage
            }
        })

    } catch (error) {
        console.error('❌ Viewer API error:', error)
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        )
    }
}
