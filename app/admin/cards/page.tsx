'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Copy, ChevronLeft, ChevronRight, Check } from 'lucide-react'

export default function AdminCardsPage() {
    const [cards, setCards] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [showGenerate, setShowGenerate] = useState(false)
    const [genCount, setGenCount] = useState(10)
    const [genTier, setGenTier] = useState('PRO')
    const [genDays, setGenDays] = useState(30)
    const [generating, setGenerating] = useState(false)
    const [copiedId, setCopiedId] = useState('')
    const pageSize = 20

    useEffect(() => { loadCards() }, [page, statusFilter])

    const loadCards = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
            if (statusFilter) params.set('status', statusFilter)
            const res = await fetch(`/api/admin/cards?${params}`)
            if (res.ok) {
                const data = await res.json()
                setCards(data.cards)
                setTotal(data.total)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const generateCards = async () => {
        setGenerating(true)
        try {
            const res = await fetch('/api/admin/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: genCount, tier: genTier, durationDays: genDays })
            })
            if (res.ok) {
                const data = await res.json()
                toast.success(`成功生成 ${data.cards.length} 张卡密`)
                setShowGenerate(false)
                loadCards()
            } else {
                const err = await res.json()
                toast.error(err.error || '生成失败')
            }
        } catch (e) { toast.error('操作失败') }
        finally { setGenerating(false) }
    }

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        setTimeout(() => setCopiedId(''), 2000)
    }

    const copyAll = () => {
        const unused = cards.filter(c => !c.isUsed).map(c => c.code).join('\n')
        if (!unused) { toast.error('没有未使用的卡密'); return }
        navigator.clipboard.writeText(unused)
        toast.success(`已复制 ${cards.filter(c => !c.isUsed).length} 个未使用卡密`)
    }

    const totalPages = Math.ceil(total / pageSize)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">卡密管理</h1>
                <div className="flex gap-2">
                    <button onClick={copyAll} className="px-4 py-2 border rounded-xl text-sm hover:bg-accent flex items-center gap-1.5">
                        <Copy className="w-4 h-4" />复制未使用
                    </button>
                    <button onClick={() => setShowGenerate(true)} className="px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-1.5">
                        <Plus className="w-4 h-4" />生成卡密
                    </button>
                </div>
            </div>

            <div className="flex gap-3">
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                    className="px-4 py-2 rounded-xl border bg-background text-sm">
                    <option value="">全部状态</option>
                    <option value="unused">未使用</option>
                    <option value="used">已使用</option>
                </select>
            </div>

            <div className="border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground border-b bg-muted/30">
                                <th className="px-4 py-3 font-medium">卡密码</th>
                                <th className="px-4 py-3 font-medium">等级</th>
                                <th className="px-4 py-3 font-medium">有效天数</th>
                                <th className="px-4 py-3 font-medium">状态</th>
                                <th className="px-4 py-3 font-medium">使用者</th>
                                <th className="px-4 py-3 font-medium">使用时间</th>
                                <th className="px-4 py-3 font-medium">创建时间</th>
                                <th className="px-4 py-3 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map(c => (
                                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                                    <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.tier === 'PRO' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
                                            {c.tier}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{c.durationDays}天</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs ${c.isUsed ? 'bg-muted text-muted-foreground' : 'bg-green-500/15 text-green-600 dark:text-green-400'}`}>
                                            {c.isUsed ? '已使用' : '可用'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.usedBy?.email || '-'}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.usedAt ? new Date(c.usedAt).toLocaleString() : '-'}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => copyCode(c.code, c.id)} className="p-1.5 rounded-lg hover:bg-accent">
                                            {copiedId === c.id ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <span className="text-sm text-muted-foreground">共 {total} 张卡密</span>
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

            {/* Generate Modal */}
            {showGenerate && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGenerate(false)}>
                    <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold">批量生成卡密</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">生成数量</label>
                            <input type="number" min={1} max={100} value={genCount} onChange={e => setGenCount(parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-2 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">等级</label>
                            <select value={genTier} onChange={e => setGenTier(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border bg-background text-sm">
                                <option value="PRO">PRO</option>
                                <option value="MAX">MAX</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">有效天数</label>
                            <input type="number" min={1} value={genDays} onChange={e => setGenDays(parseInt(e.target.value) || 30)}
                                className="w-full px-4 py-2 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowGenerate(false)} className="px-4 py-2 rounded-xl border hover:bg-accent text-sm">取消</button>
                            <button onClick={generateCards} disabled={generating}
                                className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium disabled:opacity-50">
                                {generating ? '生成中...' : '生成'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
