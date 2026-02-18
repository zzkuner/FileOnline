'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react'

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [levelFilter, setLevelFilter] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const pageSize = 30

    useEffect(() => { loadLogs() }, [page, levelFilter])

    const loadLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
            if (levelFilter) params.set('level', levelFilter)
            if (actionFilter) params.set('action', actionFilter)
            const res = await fetch(`/api/admin/logs?${params}`)
            if (res.ok) {
                const data = await res.json()
                setLogs(data.logs)
                setTotal(data.total)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleSearch = () => { setPage(1); loadLogs() }

    const levelBadge = (level: string) => {
        const styles: Record<string, string> = {
            INFO: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
            WARN: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
            ERROR: 'bg-red-500/15 text-red-600 dark:text-red-400',
        }
        return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[level] || 'bg-muted text-muted-foreground'}`}>{level}</span>
    }

    const totalPages = Math.ceil(total / pageSize)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">系统日志</h1>
                <button onClick={() => { setPage(1); loadLogs() }} className="p-2 rounded-xl hover:bg-accent border">
                    <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex gap-3 flex-wrap">
                <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setPage(1) }}
                    className="px-4 py-2 rounded-xl border bg-background text-sm">
                    <option value="">全部级别</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                </select>
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={actionFilter} onChange={e => setActionFilter(e.target.value)} placeholder="搜索操作类型..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <button onClick={handleSearch} className="px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90">筛选</button>
            </div>

            <div className="border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground border-b bg-muted/30">
                                <th className="px-4 py-3 font-medium w-20">级别</th>
                                <th className="px-4 py-3 font-medium">操作</th>
                                <th className="px-4 py-3 font-medium">详情</th>
                                <th className="px-4 py-3 font-medium">IP</th>
                                <th className="px-4 py-3 font-medium">时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(l => (
                                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/20">
                                    <td className="px-4 py-3">{levelBadge(l.level)}</td>
                                    <td className="px-4 py-3 font-medium font-mono text-xs">{l.action}</td>
                                    <td className="px-4 py-3 text-muted-foreground max-w-[400px] truncate text-xs">{l.detail || '-'}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{l.ip || '-'}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">暂无日志</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <span className="text-sm text-muted-foreground">共 {total} 条</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-1 rounded hover:bg-accent disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
                            <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-1 rounded hover:bg-accent disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
