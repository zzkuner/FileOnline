'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminPaymentsPage() {
    const [records, setRecords] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [typeFilter, setTypeFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const pageSize = 20

    useEffect(() => { loadRecords() }, [page, typeFilter, statusFilter])

    const loadRecords = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
            if (typeFilter) params.set('type', typeFilter)
            if (statusFilter) params.set('status', statusFilter)
            const res = await fetch(`/api/admin/payments?${params}`)
            if (res.ok) {
                const data = await res.json()
                setRecords(data.records)
                setTotal(data.total)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const typeBadge = (type: string) => {
        const styles: Record<string, string> = {
            CARD_KEY: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
            WECHAT: 'bg-green-500/15 text-green-600 dark:text-green-400',
            ALIPAY: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
            STRIPE: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
        }
        const labels: Record<string, string> = { CARD_KEY: '卡密', WECHAT: '微信', ALIPAY: '支付宝', STRIPE: 'Stripe' }
        return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type] || 'bg-muted text-muted-foreground'}`}>{labels[type] || type}</span>
    }

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            SUCCESS: 'bg-green-500/15 text-green-600 dark:text-green-400',
            PENDING: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
            FAILED: 'bg-red-500/15 text-red-600 dark:text-red-400',
            REFUNDED: 'bg-muted text-muted-foreground',
        }
        const labels: Record<string, string> = { SUCCESS: '成功', PENDING: '处理中', FAILED: '失败', REFUNDED: '已退款' }
        return <span className={`px-2 py-0.5 rounded text-xs ${styles[status] || 'bg-muted text-muted-foreground'}`}>{labels[status] || status}</span>
    }

    const totalPages = Math.ceil(total / pageSize)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">支付记录</h1>

            <div className="flex gap-3">
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
                    className="px-4 py-2 rounded-xl border bg-background text-sm">
                    <option value="">全部类型</option>
                    <option value="CARD_KEY">卡密</option>
                    <option value="WECHAT">微信支付</option>
                    <option value="ALIPAY">支付宝</option>
                    <option value="STRIPE">Stripe</option>
                </select>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                    className="px-4 py-2 rounded-xl border bg-background text-sm">
                    <option value="">全部状态</option>
                    <option value="SUCCESS">成功</option>
                    <option value="PENDING">处理中</option>
                    <option value="FAILED">失败</option>
                </select>
            </div>

            <div className="border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground border-b bg-muted/30">
                                <th className="px-4 py-3 font-medium">用户</th>
                                <th className="px-4 py-3 font-medium">类型</th>
                                <th className="px-4 py-3 font-medium">等级</th>
                                <th className="px-4 py-3 font-medium">天数</th>
                                <th className="px-4 py-3 font-medium">金额</th>
                                <th className="px-4 py-3 font-medium">状态</th>
                                <th className="px-4 py-3 font-medium">订单号</th>
                                <th className="px-4 py-3 font-medium">时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                                    <td className="px-4 py-3">
                                        <div>{r.user?.name || '-'}</div>
                                        <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3">{typeBadge(r.type)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.tier === 'PRO' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
                                            {r.tier}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{r.durationDays}天</td>
                                    <td className="px-4 py-3">{r.amount > 0 ? `¥${r.amount}` : '-'}</td>
                                    <td className="px-4 py-3">{statusBadge(r.status)}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{r.orderId || '-'}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">暂无支付记录</td></tr>
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
