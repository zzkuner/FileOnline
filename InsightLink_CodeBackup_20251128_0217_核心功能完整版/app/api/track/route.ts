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
        const location = await getLocationFromIP(ip)

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
                const locationStr = await getLocationFromIP(ip)

                // 异步发送邮件，不阻塞响应
                import('@/lib/email').then(({ sendEmail }) => {
                    sendEmail({
                        to: fileOwner.user.email,
                        subject: `🔔 您的文件被查看了：${link.name}`,
                        text: `您的文件 "${fileOwner.originalName}" (链接: ${link.name}) 刚刚被访问。\n\n时间: ${time}\n位置: ${locationStr}\nIP: ${ip || 'Unknown'}\n设备: ${deviceType} / ${os} / ${browser}`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #2563eb;">🔔 文件访问提醒</h2>
                                <p>您的追踪链接 <strong>${link.name}</strong> 刚刚被点击访问。</p>
                                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p><strong>📄 文件：</strong>${fileOwner.originalName}</p>
                                    <p><strong>🌍 位置：</strong>${locationStr}</p>
                                    <p><strong>⏰ 时间：</strong>${time}</p>
                                    <p><strong>💻 设备：</strong>${deviceType} - ${os} (${browser})</p>
                                    <p><strong>🌐 IP：</strong>${ip || 'Unknown'}</p>
                                </div>
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/analytics/${link.id}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">查看详细分析</a>
                            </div>
                        `
                    })
                })
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
