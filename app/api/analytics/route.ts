import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const linkId = searchParams.get('linkId')

        if (!linkId) {
            return NextResponse.json(
                { error: '链接ID不能为空' },
                { status: 400 }
            )
        }

        // 获取链接信息
        const link = await prisma.link.findUnique({
            where: { id: linkId },
            include: { file: true }
        })

        if (!link) {
            return NextResponse.json(
                { error: '链接不存在' },
                { status: 404 }
            )
        }

        // 获取访问记录
        const visits = await prisma.visit.findMany({
            where: { linkId },
            include: {
                events: true,
                _count: {
                    select: { events: true }
                }
            },
            orderBy: { startedAt: 'desc' }
        })

        // 统计数据
        const totalVisits = visits.length
        const uniqueVisitors = new Set(visits.map(v => v.visitorIp)).size

        // 计算平均停留时间（只计算有效停留）
        const validDurations = visits
            .filter(v => v.duration && v.duration > 0)
            .map(v => v.duration as number)
        const avgDuration = validDurations.length > 0
            ? Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length)
            : 0

        // 重复访问统计
        const ipVisitCount: Record<string, number> = {}
        visits.forEach(v => {
            if (v.visitorIp) {
                ipVisitCount[v.visitorIp] = (ipVisitCount[v.visitorIp] || 0) + 1
            }
        })

        const repeatVisitors = Object.values(ipVisitCount).filter(count => count > 1).length
        const repeatVisitRate = uniqueVisitors > 0 ? Math.round((repeatVisitors / uniqueVisitors) * 100) : 0

        // 找出访问次数最多的访客
        let topReturningVisitor: { ip: string; count: number } | null = null
        let maxCount = 0
        for (const [ip, count] of Object.entries(ipVisitCount)) {
            if (count > maxCount && count > 1) {
                maxCount = count
                topReturningVisitor = { ip, count }
            }
        }

        // 地理位置分布
        const locations: Record<string, number> = {}
        visits.forEach(v => {
            const loc = v.location || (v.visitorIp === '::1' || v.visitorIp === '127.0.0.1' ? '本地访问' : '未知')
            locations[loc] = (locations[loc] || 0) + 1
        })

        // 设备分布
        const devices: Record<string, number> = {}
        visits.forEach(v => {
            const dev = v.deviceType || '未知'
            devices[dev] = (devices[dev] || 0) + 1
        })

        // 浏览器分布
        const browsers: Record<string, number> = {}
        visits.forEach(v => {
            const br = v.browser || '未知'
            browsers[br] = (browsers[br] || 0) + 1
        })

        // 时间轴数据 (最近7天)
        const timeline: Record<string, number> = {}
        const now = new Date()
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            const key = d.toISOString().split('T')[0]
            timeline[key] = 0
        }

        visits.forEach(v => {
            const key = v.startedAt.toISOString().split('T')[0]
            if (timeline[key] !== undefined) {
                timeline[key]++
            }
        })

        // 分析 PDF 页面查看数据
        const pdfPageViews: Record<number, { viewCount: number; totalDuration: number }> = {}
        const videoProgress = { 25: 0, 50: 0, 75: 0, 100: 0 }

        visits.forEach(v => {
            v.events.forEach(event => {
                try {
                    const payload = JSON.parse(event.payload)

                    // PDF 页面统计
                    if (event.eventType === 'PDF_PAGE_VIEW' && payload.page) {
                        const page = payload.page
                        if (!pdfPageViews[page]) {
                            pdfPageViews[page] = { viewCount: 0, totalDuration: 0 }
                        }
                        pdfPageViews[page].viewCount++
                        pdfPageViews[page].totalDuration += payload.duration || 0
                    }

                    // 视频进度统计
                    if (event.eventType === 'VIDEO_PROGRESS' && payload.percent) {
                        const percent = payload.percent as 25 | 50 | 75
                        if (percent === 25 || percent === 50 || percent === 75) {
                            videoProgress[percent]++
                        }
                    }

                    if (event.eventType === 'VIDEO_END') {
                        videoProgress[100]++
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            })
        })

        return NextResponse.json({
            link: {
                name: link.name,
                fileName: link.file.originalName,
                fileType: link.file.fileType,
                createdAt: link.createdAt
            },
            stats: {
                totalVisits,
                uniqueVisitors,
                avgDuration,
                repeatVisitRate,
                topReturningVisitor,
                locations,
                devices,
                browsers,
                timeline: Object.entries(timeline).map(([date, count]) => ({ date, count }))
            },
            pdfAnalytics: Object.keys(pdfPageViews).length > 0 ? {
                pages: Object.entries(pdfPageViews).map(([page, data]) => ({
                    page: parseInt(page),
                    viewCount: data.viewCount,
                    avgDuration: Math.round(data.totalDuration / data.viewCount)
                })).sort((a, b) => a.page - b.page)
            } : null,
            videoAnalytics: (videoProgress[25] > 0 || videoProgress[50] > 0) ? {
                milestones: videoProgress,
                completionRate: totalVisits > 0 ? Math.round((videoProgress[100] / totalVisits) * 100) : 0
            } : null,
            recentVisits: visits.slice(0, 20).map(v => ({
                id: v.id,
                visitorIp: v.visitorIp,
                userAgent: v.userAgent,
                deviceType: v.deviceType,
                browser: v.browser,
                os: v.os,
                location: v.location,
                referrer: v.referrer,
                startedAt: v.startedAt,
                endedAt: v.endedAt,
                duration: v.duration,
                _count: {
                    events: v.events.length
                }
            }))
        })

    } catch (error) {
        console.error('Analytics API error:', error)
        return NextResponse.json(
            { error: '获取分析数据失败' },
            { status: 500 }
        )
    }
}
