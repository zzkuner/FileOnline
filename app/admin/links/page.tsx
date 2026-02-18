'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Search, Trash2, ShieldOff, ShieldBan, ChevronLeft, ChevronRight, ExternalLink, Copy, Check } from 'lucide-react'

export default function AdminLinksPage() {
    const [links, setLinks] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [banTarget, setBanTarget] = useState<any>(null)
    const [banReason, setBanReason] = useState('')
    const [copiedId, setCopiedId] = useState('')
    const pageSize = 15

    useEffect(() => { loadLinks() }, [page, statusFilter])

    const loadLinks = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
            if (search) params.set('search', search)
            if (statusFilter) params.set('status', statusFilter)
            const res = await fetch(`/api/admin/links?${params}`)
            if (res.ok) {
                const data = await res.json()
                setLinks(data.links)
                setTotal(data.total)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); loadLinks() }

    const deleteLink = async (id: string, slug: string) => {
        if (!confirm(`确定删除链接 "${slug}"？此操作不可撤销。`)) return
        try {
            const res = await fetch(`/api/admin/links?id=${id}`, { method: 'DELETE' })
            if (res.ok) { toast.success('已删除'); loadLinks() }
            else toast.error('删除失败')
        } catch (e) { toast.error('操作失败') }
    }

    const banLink = async (id: string, banned: boolean, reason?: string) => {
        try {
            const res = await fetch('/api/admin/links', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isBanned: banned, banReason: reason || null })
            })
            if (res.ok) {
                toast.success(banned ? '链接已封禁' : '链接已解封')
                setBanTarget(null)
                loadLinks()
            } else toast.error('操作失败')
        } catch (e) { toast.error('操作失败') }
    }

    const copySlug = (slug: string, id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/v/${slug}`)
        setCopiedId(id)
        setTimeout(() => setCopiedId(''), 2000)
    }

    const statusBadge = (link: any) => {
        if (link.isBanned) return <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 text-xs" title={link.banReason || ''}>已封禁</span>
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) return <span className="px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 text-xs">已过期</span>
        return <span className="px-2 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 text-xs">正常</span>
    }

    const totalPages = Math.ceil(total / pageSize)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">链接管理</h1>

            <div className="flex flex-wrap gap-3">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索 slug 或文件名..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-white dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <button type="submit" className="px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90">搜索</button>
                </form>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                    className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800/50 text-sm">
                    <option value="">全部状态</option>
                    <option value="active">正常</option>
                    <option value="banned">已封禁</option>
                    <option value="expired">已过期</option>
                </select>
            </div>

            <div className="border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground border-b bg-muted/30">
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium">关联文件</th>
                                <th className="px-4 py-3 font-medium">创建者</th>
                                <th className="px-4 py-3 font-medium">访问量</th>
                                <th className="px-4 py-3 font-medium">状态</th>
                                <th className="px-4 py-3 font-medium">创建时间</th>
                                <th className="px-4 py-3 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.map(l => (
                                <tr key={l.id} className={`border-b last:border-0 hover:bg-muted/20 ${l.isBanned ? 'opacity-60' : ''}`}>
                                    <td className="px-4 py-3 font-mono text-xs">
                                        <div className="flex items-center gap-1.5">
                                            /v/{l.slug}
                                            <button onClick={() => copySlug(l.slug, l.id)} className="p-0.5 rounded hover:bg-accent">
                                                {copiedId === l.id ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 max-w-[200px] truncate">{l.file?.originalName || '-'}</td>
                                    <td className="px-4 py-3">
                                        <div>{l.file?.user?.name || '-'}</div>
                                        <div className="text-xs text-muted-foreground">{l.file?.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3">{l._count?.visits ?? 0}</td>
                                    <td className="px-4 py-3">{statusBadge(l)}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <a href={`/v/${l.slug}`} target="_blank" rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground" title="预览">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            {l.isBanned ? (
                                                <button onClick={() => banLink(l.id, false)}
                                                    className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-600 dark:text-green-400" title="解封">
                                                    <ShieldOff className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button onClick={() => { setBanTarget(l); setBanReason('') }}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400" title="封禁">
                                                    <ShieldBan className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => deleteLink(l.id, l.slug)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400" title="删除">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <span className="text-sm text-muted-foreground">共 {total} 条链接</span>
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

            {/* Ban Modal */}
            {banTarget && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBanTarget(null)}>
                    <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-red-600">封禁链接</h3>
                        <p className="text-sm text-muted-foreground">链接 <strong>/v/{banTarget.slug}</strong> 将被禁止访问。</p>
                        <div>
                            <label className="block text-sm font-medium mb-1">封禁原因</label>
                            <textarea value={banReason} onChange={e => setBanReason(e.target.value)}
                                placeholder="请输入封禁原因..."
                                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-slate-800/50 text-sm min-h-[80px] resize-none" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setBanTarget(null)} className="px-4 py-2 rounded-xl border hover:bg-accent text-sm">取消</button>
                            <button onClick={() => banLink(banTarget.id, true, banReason || '违反平台规则')}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">确认封禁</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
