'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, Link2, Eye, HardDrive, TrendingUp, Crown, Zap } from 'lucide-react'

interface AdminStats {
    users: number
    files: number
    links: number
    visits: number
    storage: number
    tierBreakdown: { FREE: number; PRO: number; MAX: number }
    recentFiles: any[]
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadStats() }, [])

    const loadStats = async () => {
        try {
            const res = await fetch('/api/admin/stats')
            if (res.ok) {
                const json = await res.json()
                setData(json.stats ? { ...json.stats, recentFiles: json.recentFiles, tierBreakdown: json.tierBreakdown } : json)
            }
        } catch (error) {
            console.error('Failed to load admin stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
    }

    if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>

    const stats = data as any
    const statCards = [
        { label: '总用户', value: stats?.users ?? stats?.stats?.users ?? 0, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
        { label: '总文件', value: stats?.files ?? stats?.stats?.files ?? 0, icon: FileText, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
        { label: '追踪链接', value: stats?.links ?? stats?.stats?.links ?? 0, icon: Link2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
        { label: '总访问', value: stats?.visits ?? stats?.stats?.visits ?? 0, icon: Eye, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
        { label: '存储占用', value: formatSize(stats?.storage ?? stats?.stats?.storage ?? 0), icon: HardDrive, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10' },
    ]

    const tierData = stats?.tierBreakdown || { FREE: 0, PRO: 0, MAX: 0 }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">系统概览</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map(card => (
                    <div key={card.label} className="border rounded-2xl p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                        <div className={`flex items-center gap-2 mb-3 ${card.color}`}>
                            <div className={`p-2 rounded-xl ${card.bg}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">{card.label}</span>
                        </div>
                        <div className="text-2xl font-bold">{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Tier Breakdown */}
            <div className="border rounded-2xl p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    用户等级分布
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-800/50">
                        <Users className="w-6 h-6 mx-auto mb-2 text-slate-500 dark:text-slate-400" />
                        <div className="text-2xl font-bold">{tierData.FREE}</div>
                        <div className="text-sm text-muted-foreground">免费用户</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 text-center">
                        <Crown className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tierData.PRO}</div>
                        <div className="text-sm text-blue-600/70 dark:text-blue-300">Pro 用户</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 text-center">
                        <Zap className="w-6 h-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{tierData.MAX}</div>
                        <div className="text-sm text-amber-600/70 dark:text-amber-300">Max 用户</div>
                    </div>
                </div>
            </div>

            {/* Recent Files */}
            <div className="border rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <div className="p-6 pb-0">
                    <h2 className="text-lg font-bold mb-4">最新上传文件</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground border-b bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="px-6 py-3 font-medium">文件名</th>
                                <th className="px-6 py-3 font-medium">上传者</th>
                                <th className="px-6 py-3 font-medium">大小</th>
                                <th className="px-6 py-3 font-medium">类型</th>
                                <th className="px-6 py-3 font-medium">状态</th>
                                <th className="px-6 py-3 font-medium">时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats?.recentFiles || []).map((file: any) => (
                                <tr key={file.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="px-6 py-3 font-medium max-w-[200px] truncate">{file.originalName}</td>
                                    <td className="px-6 py-3">
                                        <div>{file.user?.name || '-'}</div>
                                        <div className="text-xs text-muted-foreground">{file.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-3 text-muted-foreground">{formatSize(file.fileSize)}</td>
                                    <td className="px-6 py-3 text-muted-foreground">{file.fileType}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${file.status === 'READY' ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'}`}>
                                            {file.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-muted-foreground text-xs">{new Date(file.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
