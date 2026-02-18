'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Key, Sparkles, Crown, Zap, CheckCircle, Package } from 'lucide-react'
import { formatStorageSize, formatLimit } from '@/lib/tier-config'

interface TierLimit {
    label: string
    maxFiles: number
    maxLinksPerFile: number
    maxStorageBytes: number
    maxFileSize: number
    features: {
        analytics: boolean
        hideBranding: boolean
        customDomain: boolean
        customTheme: boolean
    }
}

interface MembershipPlan {
    id: string
    tier: string
    name: string
    price: number
    originalPrice?: number
    description?: string
    durationDays: number
}

export default function ActivatePage() {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [result, setResult] = useState<{ tier: string; expiresAt: string } | null>(null)
    const [tierLimits, setTierLimits] = useState<Record<string, TierLimit> | null>(null)
    const [plans, setPlans] = useState<MembershipPlan[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/plans')
            if (res.ok) {
                const data = await res.json()
                setTierLimits(data.tierLimits)
                setPlans(data.plans || [])
            }
        } catch (error) {
            console.error('Failed to load plans:', error)
            toast.error('加载套餐失败')
        } finally {
            setPageLoading(false)
        }
    }

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) { toast.error('请输入卡密'); return }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/cards/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() })
            })
            const data = await res.json()
            if (res.ok) {
                setResult({ tier: data.tier, expiresAt: data.expiresAt })
                toast.success('激活成功！')
                setCode('')
            } else {
                toast.error(data.error || '激活失败')
            }
        } catch (e) { toast.error('网络错误') }
        finally { setLoading(false) }
    }

    if (pageLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const renderTierCard = (tier: string, icon: React.ReactNode, colorClass: string, bgClass: string) => {
        const limit = tierLimits?.[tier]
        if (!limit) return null

        const tierPlans = plans.filter(p => p.tier === tier)

        return (
            <div className={`border rounded-xl p-6 text-center space-y-4 flex flex-col h-full ${bgClass} ${colorClass}`}>
                <div className="flex items-center justify-center gap-2 font-bold text-lg">
                    {icon} {limit.label}
                </div>

                <div className="flex-1 space-y-3 text-sm text-muted-foreground">
                    <div className="flex justify-between border-b pb-2 border-black/5 dark:border-white/5">
                        <span>文件数量</span>
                        <span className="font-medium text-foreground">{formatLimit(limit.maxFiles)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 border-black/5 dark:border-white/5">
                        <span>链接数量</span>
                        <span className="font-medium text-foreground">{formatLimit(limit.maxLinksPerFile)}/文件</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 border-black/5 dark:border-white/5">
                        <span>存储空间</span>
                        <span className="font-medium text-foreground">{formatStorageSize(limit.maxStorageBytes)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 border-black/5 dark:border-white/5">
                        <span>单文件限制</span>
                        <span className="font-medium text-foreground">{formatStorageSize(limit.maxFileSize)}</span>
                    </div>
                    <div className="text-xs pt-2 space-y-1">
                        {limit.features.analytics && <div className="text-green-600 dark:text-green-400">✓ 高级数据统计</div>}
                        {limit.features.hideBranding && <div className="text-green-600 dark:text-green-400">✓ 移除官方广告</div>}
                        {limit.features.customDomain && <div className="text-green-600 dark:text-green-400">✓ 自定义域名</div>}
                    </div>
                </div>

                {tier !== 'FREE' && (
                    <div className="pt-4 mt-auto space-y-2">
                        {tierPlans.length > 0 ? (
                            tierPlans.map(plan => (
                                <button
                                    key={plan.id}
                                    className="w-full py-2 px-4 rounded-lg bg-white dark:bg-black/20 hover:bg-white/80 transition-colors text-sm font-medium border border-black/5 shadow-sm flex items-center justify-between"
                                    onClick={() => toast.info('在线支付功能开发中，请使用卡密激活')}
                                >
                                    <span>{plan.name}</span>
                                    <span className="text-primary font-bold">¥{plan.price}</span>
                                </button>
                            ))
                        ) : (
                            <div className="text-xs text-muted-foreground bg-black/5 dark:bg-white/5 rounded py-2">
                                暂无在售方案
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-12 px-4">
            <div className="text-center space-y-4">
                <Sparkles className="w-16 h-16 mx-auto text-amber-500" />
                <h1 className="text-3xl font-bold">升级会员等级</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    解锁更多高级功能，享受更大的存储空间
                </p>
            </div>

            {/* Tier Comparison Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {renderTierCard('FREE', <Package className="w-5 h-5" />, 'border-slate-200', 'bg-slate-50 dark:bg-slate-900/50')}
                {renderTierCard('PRO', <Crown className="w-5 h-5 text-blue-500" />, 'border-blue-200 dark:border-blue-800', 'bg-blue-50 dark:bg-blue-900/20')}
                {renderTierCard('MAX', <Zap className="w-5 h-5 text-amber-500" />, 'border-amber-200 dark:border-amber-800', 'bg-amber-50 dark:bg-amber-900/20')}
            </div>

            {/* Activation Form Section */}
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border">
                <h2 className="text-xl font-bold mb-6 text-center">使用卡密激活</h2>

                <form onSubmit={handleActivate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">输入卡密码</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 font-mono tracking-wider text-center focus:ring-2 focus:ring-primary outline-none uppercase transition-all"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading || !code.trim()}
                        className="w-full py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                        {loading ? '激活中...' : '立即激活'}
                    </button>
                </form>

                {result && (
                    <div className="mt-6 bg-green-50 dark:bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                        <h3 className="font-bold text-green-700 dark:text-green-400">激活成功！</h3>
                        <p className="text-sm">
                            已升级为 <span className="font-bold">{result.tier}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            有效期至 {new Date(result.expiresAt).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
                遇到问题？<a href="#" className="text-primary hover:underline">联系客服</a>
            </div>
        </div>
    )
}
