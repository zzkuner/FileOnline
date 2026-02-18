'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, Clock, MapPin, Monitor, Calendar, Download, FileText, Video, TrendingUp, Smartphone } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
    link: {
        name: string
        fileName: string
        fileType: string
        createdAt: string
    }
    stats: {
        totalVisits: number
        uniqueVisitors: number
        avgDuration: number
        repeatVisitRate: number
        topReturningVisitor: { ip: string; count: number } | null
        locations: Record<string, number>
        devices: Record<string, number>
        browsers: Record<string, number>
        timeline: { date: string; count: number }[]
    }
    pdfAnalytics?: {
        pages: { page: number; viewCount: number; avgDuration: number }[]
    } | null
    videoAnalytics?: {
        milestones: { 25: number; 50: number; 75: number; 100: number }
        completionRate: number
    } | null
    recentVisits: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function AnalyticsPage() {
    const params = useParams()
    const router = useRouter()
    const linkId = params.linkId as string

    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (linkId) {
            loadAnalytics()
        }
    }, [linkId])

    const loadAnalytics = async () => {
        try {
            const res = await fetch(`/api/analytics?linkId=${linkId}`)
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (error) {
            console.error('Failed to load analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDuration = (seconds: number | null | undefined) => {
        if (!seconds || seconds <= 0) return '0秒'
        if (seconds < 60) return `${seconds}秒`
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return secs > 0 ? `${mins}分${secs}秒` : `${mins}分`
    }

    const formatIP = (ip: string | null) => {
        if (!ip) return '未知'
        if (ip === '::1' || ip === '127.0.0.1') return '本地访问'
        return ip
    }

    const getDeviceIcon = (deviceType: string | null, os: string | null) => {
        if (!deviceType) return '💻'
        if (deviceType === 'Mobile') {
            if (os?.includes('iOS') || os?.includes('iPhone')) return '📱 iPhone'
            if (os?.includes('Android')) return '📱 Android'
            return '📱 手机'
        }
        if (deviceType === 'Tablet') {
            if (os?.includes('iPad')) return '📱 iPad'
            return '📱 平板'
        }
        if (os?.includes('Mac') || os?.includes('macOS')) return '🖥️ Mac'
        if (os?.includes('Windows')) return '💻 Windows'
        if (os?.includes('Linux')) return '💻 Linux'
        return '💻 桌面'
    }

    const exportCSV = () => {
        if (!data) return

        const headers = ['时间', 'IP地址', '地理位置', '设备', '操作系统', '浏览器', '停留时长(秒)', '交互次数']
        const rows = data.recentVisits.map(v => [
            new Date(v.startedAt).toLocaleString(),
            formatIP(v.visitorIp),
            v.location || '未知',
            v.deviceType || '未知',
            v.os || '未知',
            v.browser || '未知',
            v.duration || 0,
            v._count?.events || 0
        ])

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${data.link.name}-analytics.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>加载中...</p>
            </div>
        </div>
    }

    if (!data) {
        return <div className="min-h-screen flex items-center justify-center">无数据</div>
    }

    const deviceData = Object.entries(data.stats.devices).map(([name, value]) => ({ name, value }))
    const browserData = Object.entries(data.stats.browsers).map(([name, value]) => ({ name, value }))

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
            <header className="glass border-b sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                {data.link.name}
                                <span className="text-sm font-normal text-muted-foreground px-2 py-0.5 bg-slate-100 rounded-full">
                                    {data.link.fileName}
                                </span>
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        导出 CSV
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass p-6 rounded-2xl">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">总访问次数</div>
                                <div className="text-2xl font-bold">{data.stats.totalVisits}</div>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground pl-16">
                            {data.stats.uniqueVisitors} 位独立访客
                        </div>
                    </div>

                    <div className="glass p-6 rounded-2xl">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">平均停留时间</div>
                                <div className="text-2xl font-bold">{formatDuration(data.stats.avgDuration)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-2xl">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">重复访问率</div>
                                <div className="text-2xl font-bold">{data.stats.repeatVisitRate}%</div>
                            </div>
                        </div>
                        {data.stats.topReturningVisitor && (
                            <div className="text-xs text-muted-foreground pl-16">
                                Top: {formatIP(data.stats.topReturningVisitor.ip)} ({data.stats.topReturningVisitor.count}次)
                            </div>
                        )}
                    </div>

                    <div className="glass p-6 rounded-2xl">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">创建时间</div>
                                <div className="text-lg font-bold">
                                    {new Date(data.link.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Timeline */}
                    <div className="glass p-6 rounded-2xl lg:col-span-2">
                        <h3 className="text-lg font-bold mb-6">访问趋势 (近7天)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.stats.timeline}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(val) => val.slice(5)} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Devices */}
                    <div className="glass p-6 rounded-2xl">
                        <h3 className="text-lg font-bold mb-6">设备分布</h3>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deviceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            {deviceData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span>{entry.name}</span>
                                    </div>
                                    <span className="font-medium">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Browser Distribution */}
                {browserData.length > 0 && (
                    <div className="glass p-6 rounded-2xl mb-8">
                        <h3 className="text-lg font-bold mb-6">浏览器分布</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {browserData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                                        <Smartphone className="w-5 h-5" style={{ color: COLORS[index % COLORS.length] }} />
                                    </div>
                                    <div>
                                        <div className="font-medium">{entry.name}</div>
                                        <div className="text-sm text-muted-foreground">{entry.value} 次</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PDF Heatmap */}
                {data.pdfAnalytics && (
                    <div className="glass p-6 rounded-2xl mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="w-6 h-6 text-red-600" />
                            <h3 className="text-lg font-bold">PDF 阅读热力图</h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.pdfAnalytics.pages}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="page" label={{ value: '页码', position: 'insideBottom', offset: -5 }} />
                                    <YAxis label={{ value: '停留时间(秒)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value: any) => [`${value} 秒`, '平均停留']}
                                    />
                                    <Bar dataKey="avgDuration" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>💡 洞察：</strong>
                                最受关注的页面是第 <strong>{data.pdfAnalytics.pages.reduce((max, p) => p.avgDuration > max.avgDuration ? p : max).page}</strong> 页，
                                平均停留 <strong>{data.pdfAnalytics.pages.reduce((max, p) => p.avgDuration > max.avgDuration ? p : max).avgDuration}</strong> 秒
                            </p>
                        </div>
                    </div>
                )}

                {/* Video Progress */}
                {data.videoAnalytics && (
                    <div className="glass p-6 rounded-2xl mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Video className="w-6 h-6 text-purple-600" />
                            <h3 className="text-lg font-bold">视频观看分析</h3>
                        </div>
                        <div className="grid grid-cols-5 gap-4 mb-6">
                            {[
                                { label: '开始播放', value: data.stats.totalVisits, percent: 0 },
                                { label: '播放 25%', value: data.videoAnalytics.milestones[25], percent: 25 },
                                { label: '播放 50%', value: data.videoAnalytics.milestones[50], percent: 50 },
                                { label: '播放 75%', value: data.videoAnalytics.milestones[75], percent: 75 },
                                { label: '完整观看', value: data.videoAnalytics.milestones[100], percent: 100 }
                            ].map((stage, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">{stage.value}</div>
                                    <div className="text-sm text-muted-foreground">{stage.label}</div>
                                    {i > 0 && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Math.round((stage.value / data.stats.totalVisits) * 100)}%
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                                style={{ width: `${data.videoAnalytics.completionRate}%` }}
                            />
                        </div>
                        <div className="mt-2 text-center text-sm text-muted-foreground">
                            <strong className="text-purple-600">{data.videoAnalytics.completionRate}%</strong> 的观众完整观看了视频
                        </div>
                    </div>
                )}

                {/* Recent Visits Table */}
                <div className="glass p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-6">最近访问记录</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="pb-4 text-left font-medium">时间</th>
                                    <th className="pb-4 text-left font-medium">位置</th>
                                    <th className="pb-4 text-left font-medium">设备信息</th>
                                    <th className="pb-4 text-left font-medium">浏览器</th>
                                    <th className="pb-4 text-left font-medium">停留时长</th>
                                    <th className="pb-4 text-left font-medium">交互</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentVisits.map((visit) => {
                                    return (
                                        <tr key={visit.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="py-4 text-sm">
                                                {new Date(visit.startedAt).toLocaleString('zh-CN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="text-sm font-medium">{visit.location || formatIP(visit.visitorIp)}</div>
                                                        {visit.location && (
                                                            <div className="text-xs text-muted-foreground">{formatIP(visit.visitorIp)}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium">{getDeviceIcon(visit.deviceType, visit.os)}</div>
                                                    {visit.os && <div className="text-xs text-muted-foreground">{visit.os}</div>}
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm">{visit.browser || '—'}</td>
                                            <td className="py-4">
                                                <span className={visit.duration && visit.duration > 0 ? 'text-blue-600 font-medium text-sm' : 'text-gray-400 text-sm'}>
                                                    {visit.duration && visit.duration > 0 ? formatDuration(visit.duration) : '—'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm text-muted-foreground">
                                                {visit._count?.events || 0} 次
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
