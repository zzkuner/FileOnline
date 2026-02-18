'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Search, Trash2, ShieldOff, ShieldBan, ChevronLeft, ChevronRight, Eye, X, Link2, ExternalLink, Copy, Check } from 'lucide-react'

export default function AdminFilesPage() {
    const [files, setFiles] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [banTarget, setBanTarget] = useState<any>(null)
    const [banReason, setBanReason] = useState('')
    const [detailFile, setDetailFile] = useState<any>(null)
    const [fileLinks, setFileLinks] = useState<any[]>([])
    const [loadingLinks, setLoadingLinks] = useState(false)
    const [copiedId, setCopiedId] = useState('')
    const pageSize = 15

    useEffect(() => { loadFiles() }, [page])

    const loadFiles = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
            if (search) params.set('search', search)
            const res = await fetch(`/api/admin/files?${params}`)
            if (res.ok) {
                const data = await res.json()
                setFiles(data.files)
                setTotal(data.total)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); loadFiles() }

    const deleteFile = async (id: string, name: string) => {
        if (!confirm(`确定删除文件 "${name}"？此操作不可撤销。`)) return
        try {
            const res = await fetch(`/api/admin/files?id=${id}`, { method: 'DELETE' })
            if (res.ok) { toast.success('已删除'); loadFiles(); if (detailFile?.id === id) setDetailFile(null) }
            else toast.error('删除失败')
        } catch (e) { toast.error('操作失败') }
    }

    const banFile = async (id: string, banned: boolean, reason?: string) => {
        try {
            const res = await fetch('/api/admin/files', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isBanned: banned, banReason: reason || null })
            })
            if (res.ok) {
                toast.success(banned ? '文件已封禁' : '文件已解封')
                setBanTarget(null)
                loadFiles()
            } else toast.error('操作失败')
        } catch (e) { toast.error('操作失败') }
    }

    const openDetail = async (file: any) => {
        setDetailFile(file)
        setLoadingLinks(true)
        try {
            const res = await fetch(`/api/admin/links?fileId=${file.id}&pageSize=100`)
            if (res.ok) {
                const data = await res.json()
                setFileLinks(data.links)
            }
        } catch (e) { console.error(e) }
        finally { setLoadingLinks(false) }
    }

    const copyLink = (slug: string, id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/v/${slug}`)
        setCopiedId(id)
        setTimeout(() => setCopiedId(''), 2000)
    }

    const formatSize = (b: number) => {
        if (b < 1024) return b + ' B'
        if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
        if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB'
        return (b / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
    }

    const statusBadge = (file: any) => {
        if (file.isBanned) return <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 text-xs" title={file.banReason || ''}>已封禁</span>
        if (file.status === 'READY') return <span className="px-2 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 text-xs">正常</span>
        return <span className="px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 text-xs">{file.status}</span>
    }

    const totalPages = Math.ceil(total / pageSize)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">文件管理</h1>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索文件名..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border bg-white dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <button type="submit" className="px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90">搜索</button>
            </form>

            <div className="border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground border-b bg-muted/30">
                                <th className="px-4 py-3 font-medium">文件名</th>
                                <th className="px-4 py-3 font-medium">上传者</th>
                                <th className="px-4 py-3 font-medium">类型</th>
                                <th className="px-4 py-3 font-medium">大小</th>
                                <th className="px-4 py-3 font-medium">链接数</th>
                                <th className="px-4 py-3 font-medium">状态</th>
                                <th className="px-4 py-3 font-medium">上传时间</th>
                                <th className="px-4 py-3 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(f => (
                                <tr key={f.id} className={`border-b last:border-0 hover:bg-muted/20 cursor-pointer ${f.isBanned ? 'opacity-60' : ''}`}
                                    onClick={() => openDetail(f)}>
                                    <td className="px-4 py-3 font-medium max-w-[250px] truncate">{f.originalName}</td>
                                    <td className="px-4 py-3">
                                        <div>{f.user?.name || '-'}</div>
                                        <div className="text-xs text-muted-foreground">{f.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3">{f.fileType}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{formatSize(f.fileSize)}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-medium">
                                            {f._count?.links ?? 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{statusBadge(f)}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(f.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        <div className="flex gap-1">
                                            <button onClick={() => openDetail(f)}
                                                className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-600 dark:text-blue-400" title="查看详情">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {f.isBanned ? (
                                                <button onClick={() => banFile(f.id, false)}
                                                    className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-600 dark:text-green-400" title="解封">
                                                    <ShieldOff className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button onClick={() => { setBanTarget(f); setBanReason('') }}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400" title="封禁">
                                                    <ShieldBan className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => deleteFile(f.id, f.originalName)}
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
                        <span className="text-sm text-muted-foreground">共 {total} 文件</span>
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

            {/* File Detail + Links Panel */}
            {detailFile && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailFile(null)}>
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
                            <div>
                                <h3 className="text-lg font-bold truncate max-w-[500px]">{detailFile.originalName}</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {detailFile.fileType} · {formatSize(detailFile.fileSize)} · 上传者: {detailFile.user?.name || detailFile.user?.email || '-'}
                                </p>
                            </div>
                            <button onClick={() => setDetailFile(null)} className="p-2 rounded-xl hover:bg-accent">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* File Info */}
                        <div className="p-6 border-b">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground text-xs mb-1">文件ID</div>
                                    <div className="font-mono text-xs truncate" title={detailFile.id}>{detailFile.id}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-xs mb-1">状态</div>
                                    <div>{statusBadge(detailFile)}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-xs mb-1">MIME 类型</div>
                                    <div className="text-xs">{detailFile.mimeType}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-xs mb-1">上传时间</div>
                                    <div className="text-xs">{new Date(detailFile.createdAt).toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Preview button */}
                            {detailFile.id && (
                                <div className="mt-4">
                                    <a href={`/dashboard/file/${detailFile.id}/preview`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90">
                                        <Eye className="w-4 h-4" /> 预览文件
                                    </a>
                                </div>
                            )}

                            {detailFile.isBanned && detailFile.banReason && (
                                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">封禁原因</div>
                                    <div className="text-sm">{detailFile.banReason}</div>
                                </div>
                            )}
                        </div>

                        {/* Associated Links */}
                        <div className="p-6">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                关联链接 ({fileLinks.length})
                            </h4>
                            {loadingLinks ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">加载中...</div>
                            ) : fileLinks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm border rounded-xl">此文件暂无关联链接</div>
                            ) : (
                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-muted-foreground border-b bg-muted/30 text-xs">
                                                <th className="px-3 py-2 font-medium">Slug</th>
                                                <th className="px-3 py-2 font-medium">名称</th>
                                                <th className="px-3 py-2 font-medium">访问量</th>
                                                <th className="px-3 py-2 font-medium">状态</th>
                                                <th className="px-3 py-2 font-medium">创建时间</th>
                                                <th className="px-3 py-2 font-medium">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fileLinks.map(l => (
                                                <tr key={l.id} className={`border-b last:border-0 hover:bg-muted/20 ${l.isBanned ? 'opacity-60' : ''}`}>
                                                    <td className="px-3 py-2 font-mono text-xs">/v/{l.slug}</td>
                                                    <td className="px-3 py-2 max-w-[150px] truncate">{l.name || '-'}</td>
                                                    <td className="px-3 py-2">{l._count?.visits ?? 0}</td>
                                                    <td className="px-3 py-2">
                                                        {l.isBanned
                                                            ? <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 text-xs">封禁</span>
                                                            : l.expiresAt && new Date(l.expiresAt) < new Date()
                                                                ? <span className="px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 text-xs">过期</span>
                                                                : <span className="px-1.5 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 text-xs">正常</span>
                                                        }
                                                    </td>
                                                    <td className="px-3 py-2 text-muted-foreground text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex gap-1">
                                                            <button onClick={() => copyLink(l.slug, l.id)} className="p-1 rounded hover:bg-accent" title="复制链接">
                                                                {copiedId === l.id ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                                            </button>
                                                            <a href={`/v/${l.slug}`} target="_blank" rel="noopener noreferrer"
                                                                className="p-1 rounded hover:bg-accent text-muted-foreground" title="打开">
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Ban Modal */}
            {banTarget && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBanTarget(null)}>
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-red-600">封禁文件</h3>
                        <p className="text-sm text-muted-foreground">文件 <strong>{banTarget.originalName}</strong> 将被标记为不合规，所有分享链接将禁止访问。</p>
                        <div>
                            <label className="block text-sm font-medium mb-1">封禁原因</label>
                            <textarea value={banReason} onChange={e => setBanReason(e.target.value)}
                                placeholder="请输入封禁原因，用户端将可见..."
                                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-slate-800/50 text-sm min-h-[80px] resize-none" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setBanTarget(null)} className="px-4 py-2 rounded-xl border hover:bg-accent text-sm">取消</button>
                            <button onClick={() => banFile(banTarget.id, true, banReason || '违反平台规则')}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">确认封禁</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
