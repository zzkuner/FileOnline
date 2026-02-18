import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getClientIP, parseUserAgent, getLocationFromIP } from '@/lib/tracking'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { slug, eventType, payload } = body

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            )
        }

        // 查找链接
        const link = await prisma.link.findUnique({
            where: { slug }
        })

        if (!link) {
            return NextResponse.json(
                { error: 'Link not found' },
                { status: 404 }
            )
        }

        // 获取访客信息
        const userAgent = request.headers.get('user-agent') || ''
        const ip = getClientIP(request)
        const { browser, os, deviceType } = parseUserAgent(userAgent)
        const locationData = await getLocationFromIP(ip)
        const location = locationData.location

        // 查找或创建访问记录
        let visit = await prisma.visit.findFirst({
            where: {
                linkId: link.id,
                visitorIp: ip,
                endedAt: null
            },
            orderBy: { startedAt: 'desc' }
        })

        if (!visit) {
            visit = await prisma.visit.create({
                data: {
                    linkId: link.id,
                    visitorIp: ip,
                    userAgent,
                    deviceType,
                    browser,
                    os,
                    location,
                    referrer: request.headers.get('referer') || null
                }
            })
        }

        // 记录事件
        if (eventType) {
            await prisma.event.create({
                data: {
                    visitId: visit.id,
                    eventType,
                    payload: JSON.stringify(payload || {})
                }
            })
        }

        // 如果是结束事件，更新访问记录
        if (eventType === 'SESSION_END') {
            const duration = Math.floor(
                (new Date().getTime() - new Date(visit.startedAt).getTime()) / 1000
            )
            await prisma.visit.update({
                where: { id: visit.id },
                data: {
                    endedAt: new Date(),
                    duration
                }
            })
        }

        // 如果是新访问，发送通知
        if (!visit && eventType === 'SESSION_START') {
            // 获取文件所有者信息
            const fileOwner = await prisma.file.findUnique({
                where: { id: link.fileId },
                include: { user: true }
            })

            if (fileOwner?.user?.email) {
                const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
                if (fileOwner?.user?.email) {
                    const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })

                    // 异步发送邮件，不阻塞响应
                    import('@/lib/email').then(({ sendVisitNotification }) => {
                        sendVisitNotification({
                            to: fileOwner.user.email!,
                            linkName: link.name,
                            fileName: fileOwner.originalName,
                            time,
                            location: locationData.location,
                            ip: ip || 'Unknown',
                            device: `${deviceType} / ${os} / ${browser}`,
                            linkId: link.id,
                            lat: locationData.lat,
                            lon: locationData.lon,
                            isp: locationData.isp,
                            referrer: request.headers.get('referer') || undefined
                        })
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            visitId: visit.id
        })
    } catch (error) {
        console.error('Track error:', error)
        return NextResponse.json(
            { error: 'Tracking failed' },
            { status: 500 }
        )
    }
}
