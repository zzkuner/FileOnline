'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Crown, Zap, FileText, Link2, HardDrive, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatStorageSize, formatLimit, getTierLimitsSync } from '@/lib/tier-config'

interface UsageData {
    tier: string
    tierExpiresAt: string | null
    storageUsed: number
    fileCount: number
    linkCount: number
}

export default function UsagePage() {
    const { data: session } = useSession()
    const [usage, setUsage] = useState<UsageData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadUsage() }, [])

    const loadUsage = async () => {
        try {
            const res = await fetch('/api/user/usage')
            if (res.ok) setUsage(await res.json())
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>
    if (!usage) return <div className="flex items-center justify-center h-64 text-muted-foreground">无法加载用量数据</div>

    const limits = getTierLimitsSync(usage.tier)
    const TierIcon = usage.tier === 'MAX' ? Zap : usage.tier === 'PRO' ? Crown : null
    const tierColor = usage.tier === 'MAX' ? 'text-amber-500' : usage.tier === 'PRO' ? 'text-blue-500' : 'text-slate-500'

    const ProgressBar = ({ current, max, label, icon: Icon }: { current: number; max: number; label: string; icon: any }) => {
        const pct = max === Infinity ? 0 : Math.min(100, (current / max) * 100)
        const isNearLimit = pct > 80
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                        <Icon className="w-4 h-4 text-muted-foreground" /> {label}
                    </span>
                    <span className="text-muted-foreground">
                        {current} / {max === Infinity ? '不限' : max}
                    </span>
                </div>
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: max === Infinity ? '2%' : `${Math.max(2, pct)}%` }}
                    />
                </div>
            </div>
        )
    }

    const StorageBar = () => {
        const maxBytes = limits.maxStorageBytes
        const pct = maxBytes === Infinity ? 0 : Math.min(100, (usage.storageUsed / maxBytes) * 100)
        const isNearLimit = pct > 80
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                        <HardDrive className="w-4 h-4 text-muted-foreground" /> 存储空间
                    </span>
                    <span className="text-muted-foreground">
                        {formatStorageSize(usage.storageUsed)} / {formatStorageSize(maxBytes)}
                    </span>
                </div>
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: maxBytes === Infinity ? '2%' : `${Math.max(2, pct)}%` }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
            <h1 className="text-2xl font-bold">用量统计</h1>

            {/* Current Tier */}
            <div className={`border rounded-2xl p-6 ${usage.tier === 'MAX' ? 'border-amber-500/30 bg-amber-50 dark:bg-amber-500/5' : usage.tier === 'PRO' ? 'border-blue-500/30 bg-blue-50 dark:bg-blue-500/5' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {TierIcon && <TierIcon className={`w-8 h-8 ${tierColor}`} />}
                        <div>
                            <h2 className="text-lg font-bold">
                                当前等级：<span className={tierColor}>{limits.label}</span>
                            </h2>
                            {usage.tierExpiresAt && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    到期时间：{new Date(usage.tierExpiresAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                    {usage.tier === 'FREE' && (
                        <Link href="/dashboard/activate"
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 flex items-center gap-1">
                            升级 <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Usage Bars */}
            <div className="border rounded-2xl p-6 space-y-5">
                <ProgressBar current={usage.fileCount} max={limits.maxFiles} label="文件数量" icon={FileText} />
                <ProgressBar current={usage.linkCount} max={limits.maxLinksPerFile * usage.fileCount || limits.maxLinksPerFile} label="链接总数" icon={Link2} />
                <StorageBar />
            </div>

            {/* Quick Upgrade */}
            {usage.tier !== 'MAX' && (
                <div className="text-center">
                    <Link href="/dashboard/activate" className="text-sm text-primary hover:underline">
                        使用卡密升级 →
                    </Link>
                </div>
            )}
        </div>
    )
}
