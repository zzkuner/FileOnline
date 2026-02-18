'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Crown, Zap, Save, Loader2 } from 'lucide-react'

interface Plan {
    id: string
    tier: string
    name: string
    durationDays: number
    price: number
    originalPrice: number | null
    description: string | null
    isActive: boolean
    sortOrder: number
}

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Partial<Plan> | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => { loadPlans() }, [])

    const loadPlans = async () => {
        try {
            const res = await fetch('/api/admin/plans')
            if (res.ok) setPlans(await res.json())
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const savePlan = async () => {
        if (!editing) return
        setSaving(true)
        try {
            const method = editing.id ? 'PUT' : 'POST'
            const res = await fetch('/api/admin/plans', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editing)
            })
            if (res.ok) {
                toast.success(editing.id ? '方案已更新' : '方案已创建')
                setEditing(null)
                loadPlans()
            } else toast.error('保存失败')
        } catch (e) { toast.error('操作失败') }
        finally { setSaving(false) }
    }

    const deletePlan = async (id: string) => {
        if (!confirm('确定删除此方案？')) return
        try {
            const res = await fetch(`/api/admin/plans?id=${id}`, { method: 'DELETE' })
            if (res.ok) { toast.success('已删除'); loadPlans() }
            else toast.error('删除失败')
        } catch (e) { toast.error('操作失败') }
    }

    const durationLabel = (days: number) => {
        if (days === -1) return '永久'
        if (days === 30) return '月卡'
        if (days === 90) return '季卡'
        if (days === 365) return '年卡'
        return `${days}天`
    }

    const tierColor = (tier: string) => tier === 'MAX' ? 'text-amber-500' : 'text-blue-500'

    if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">定价方案</h1>
                <button onClick={() => setEditing({ tier: 'PRO', name: '', durationDays: 30, price: 0, originalPrice: null, description: '', isActive: true, sortOrder: 0 })}
                    className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> 新增方案
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map(plan => (
                    <div key={plan.id} className={`border rounded-2xl p-5 space-y-3 ${!plan.isActive ? 'opacity-50' : ''} ${plan.tier === 'MAX' ? 'border-amber-400/40' : 'border-blue-400/40'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {plan.tier === 'MAX' ? <Zap className="w-5 h-5 text-amber-500" /> : <Crown className="w-5 h-5 text-blue-500" />}
                                <span className={`font-bold ${tierColor(plan.tier)}`}>{plan.tier}</span>
                                <span className="text-sm text-muted-foreground">· {plan.name || durationLabel(plan.durationDays)}</span>
                            </div>
                            {!plan.isActive && <span className="text-xs text-muted-foreground px-2 py-0.5 border rounded">停用</span>}
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">¥{plan.price}</span>
                            {plan.originalPrice && <span className="text-sm text-muted-foreground line-through">¥{plan.originalPrice}</span>}
                            <span className="text-sm text-muted-foreground ml-1">/ {durationLabel(plan.durationDays)}</span>
                        </div>
                        {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setEditing({ ...plan })}
                                className="flex-1 px-3 py-1.5 text-xs border rounded-lg hover:bg-accent flex items-center justify-center gap-1">
                                <Edit2 className="w-3 h-3" /> 编辑
                            </button>
                            <button onClick={() => deletePlan(plan.id)}
                                className="px-3 py-1.5 text-xs border rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                        <p>暂无定价方案，点击右上角「新增方案」创建</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold">{editing.id ? '编辑方案' : '新增定价方案'}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">等级</label>
                                <select value={editing.tier || 'PRO'} onChange={e => setEditing(p => ({ ...p, tier: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-xl border bg-background text-sm">
                                    <option value="PRO">PRO</option>
                                    <option value="MAX">MAX</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">方案名称</label>
                                <input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                                    placeholder="月卡 / 季卡 / 年卡..."
                                    className="w-full px-4 py-2 rounded-xl border bg-background text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">时长（天）</label>
                                <select value={editing.durationDays ?? 30} onChange={e => setEditing(p => ({ ...p, durationDays: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2 rounded-xl border bg-background text-sm">
                                    <option value="30">30天（月卡）</option>
                                    <option value="90">90天（季卡）</option>
                                    <option value="365">365天（年卡）</option>
                                    <option value="-1">永久</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">价格（元）</label>
                                <input type="number" step="0.01" value={editing.price ?? ''} onChange={e => setEditing(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2 rounded-xl border bg-background text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">原价（划线价，可选）</label>
                                <input type="number" step="0.01" value={editing.originalPrice ?? ''} onChange={e => setEditing(p => ({ ...p, originalPrice: parseFloat(e.target.value) || null }))}
                                    placeholder="留空不显示"
                                    className="w-full px-4 py-2 rounded-xl border bg-background text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">排序</label>
                                <input type="number" value={editing.sortOrder ?? 0} onChange={e => setEditing(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2 rounded-xl border bg-background text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">描述</label>
                            <input value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                                placeholder="方案描述..."
                                className="w-full px-4 py-2 rounded-xl border bg-background text-sm" />
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setEditing(p => ({ ...p, isActive: !p?.isActive }))}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${editing.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${editing.isActive ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} style={{ marginTop: '2px' }} />
                            </button>
                            <span className="text-sm">{editing.isActive ? '启用中' : '已停用'}</span>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border hover:bg-accent text-sm">取消</button>
                            <button onClick={savePlan} disabled={saving}
                                className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium flex items-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
