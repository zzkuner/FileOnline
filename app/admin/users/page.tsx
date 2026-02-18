'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Search, Crown, Zap, Ban, ShieldCheck, ChevronLeft, ChevronRight, Shield } from 'lucide-react'

interface UserItem {
    id: string
    email: string
    name: string | null
    role: string
    tier: string
    tierExpiresAt: string | null
    storageUsed: number
    isBlocked: boolean
    blockReason: string | null
    createdAt: string
    _count: { files: number }
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [tierFilter, setTierFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [editingUser, setEditingUser] = useState<UserItem | null>(null)
    const [editTier, setEditTier] = useState('')
    const [editRole, setEditRole] = useState('')
    const [editExpiry, setEditExpiry] = useState('')
    const [blockUser, setBlockUser] = useState<UserItem | null>(null)
    const [blockReason, setBlockReason] = useState('')
    const pageSize = 15

    useEffect(() => { loadUsers() }, [page, tierFilter])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
            if (search) params.set('search', search)
            if (tierFilter) params.set('tier', tierFilter)
            const res = await fetch(`/api/admin/users?${params}`)
            if (res.ok) {
                const data = await res.json()
                setUsers(data.users)
                setTotal(data.total)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); loadUsers() }

    const updateUser = async (id: string, data: any) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                toast.success('更新成功')
                loadUsers()
                setEditingUser(null)
                setBlockUser(null)
            } else toast.error('更新失败')
        } catch (e) { toast.error('操作失败') }
    }

    const formatSize = (b: number) => {
        if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
        if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB'
        return (b / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
    }

    const tierBadge = (tier: string) => {
        const styles: Record<string, string> = {
            FREE: 'bg-muted text-muted-foreground',
            PRO: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
            MAX: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        }
        return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[tier] || styles.FREE}`}>{tier}</span>
    }

    const roleBadge = (role: string) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${role === 'ADMIN' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' : 'bg-muted text-muted-foreground'}`}>
            {role === 'ADMIN' ? '管理员' : '用户'}
        </span>
    )

    const totalPages = Math.ceil(total / pageSize)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">用户管理</h1>

            <div className="flex flex-wrap gap-3">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索邮箱或姓名..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <button type="submit" className="px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90">搜索</button>
                </form>
                <select value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1) }}
                    className="px-4 py-2 rounded-xl border bg-background text-sm">
                    <option value="">全部等级</option>
                    <option value="FREE">FREE</option>
                    <option value="PRO">PRO</option>
                    <option value="MAX">MAX</option>
                </select>
            </div>

            <div className="border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground border-b bg-muted/30">
                                <th className="px-4 py-3 font-medium">用户</th>
                                <th className="px-4 py-3 font-medium">角色</th>
                                <th className="px-4 py-3 font-medium">等级</th>
                                <th className="px-4 py-3 font-medium">到期时间</th>
                                <th className="px-4 py-3 font-medium">文件</th>
                                <th className="px-4 py-3 font-medium">存储</th>
                                <th className="px-4 py-3 font-medium">状态</th>
                                <th className="px-4 py-3 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{u.name || '-'}</div>
                                        <div className="text-xs text-muted-foreground">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3">{roleBadge(u.role)}</td>
                                    <td className="px-4 py-3">{tierBadge(u.tier)}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {u.tierExpiresAt ? new Date(u.tierExpiresAt).toLocaleDateString() : '永久'}
                                    </td>
                                    <td className="px-4 py-3">{u._count.files}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{formatSize(u.storageUsed)}</td>
                                    <td className="px-4 py-3">
                                        {u.isBlocked
                                            ? <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 text-xs" title={u.blockReason || ''}>已封禁</span>
                                            : <span className="px-2 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 text-xs">正常</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => { setEditingUser(u); setEditTier(u.tier); setEditRole(u.role); setEditExpiry(u.tierExpiresAt ? u.tierExpiresAt.split('T')[0] : '') }}
                                                className="px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20">编辑</button>
                                            {u.isBlocked ? (
                                                <button onClick={() => updateUser(u.id, { isBlocked: false, blockReason: null })}
                                                    className="px-2.5 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/20">解封</button>
                                            ) : (
                                                <button onClick={() => { setBlockUser(u); setBlockReason('') }}
                                                    className="px-2.5 py-1 text-xs bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20">封禁</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <span className="text-sm text-muted-foreground">共 {total} 用户</span>
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

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold">编辑用户 — {editingUser.email}</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">角色</label>
                            <select value={editRole} onChange={e => setEditRole(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border bg-background">
                                <option value="USER">USER — 普通用户</option>
                                <option value="ADMIN">ADMIN — 管理员</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">等级</label>
                            <select value={editTier} onChange={e => setEditTier(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border bg-background">
                                <option value="FREE">FREE — 免费</option>
                                <option value="PRO">PRO — 专业版</option>
                                <option value="MAX">MAX — 旗舰版</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">到期时间（留空=永久）</label>
                            <input type="date" value={editExpiry} onChange={e => setEditExpiry(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border bg-background" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl border hover:bg-accent text-sm">取消</button>
                            <button onClick={() => updateUser(editingUser.id, { role: editRole, tier: editTier, tierExpiresAt: editExpiry || null })}
                                className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium">保存</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Modal */}
            {blockUser && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBlockUser(null)}>
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-red-600">封禁用户 — {blockUser.email}</h3>
                        <p className="text-sm text-muted-foreground">封禁后该用户将无法登录和使用系统。</p>
                        <div>
                            <label className="block text-sm font-medium mb-1">封禁原因</label>
                            <textarea value={blockReason} onChange={e => setBlockReason(e.target.value)}
                                placeholder="请输入封禁原因..."
                                className="w-full px-4 py-2 rounded-xl border bg-background text-sm min-h-[80px] resize-none" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setBlockUser(null)} className="px-4 py-2 rounded-xl border hover:bg-accent text-sm">取消</button>
                            <button onClick={() => updateUser(blockUser.id, { isBlocked: true, blockReason: blockReason || '违反使用条款' })}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">确认封禁</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
