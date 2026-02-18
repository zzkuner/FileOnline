'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Bell, Mail, Clock, BarChart3, Save, Loader2, AtSign, UserPlus, Crown, AlertTriangle, ShieldAlert } from 'lucide-react'

export default function NotificationsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        notifyEmail: '',
        emailOnView: false,
        emailOnExpire: true,
        emailDigest: false,
        emailOnRegister: true,
        emailOnTierChange: true,
        emailOnTierExpire: true,
        emailOnFileBanned: true,
    })

    useEffect(() => { loadSettings() }, [])

    const loadSettings = async () => {
        try {
            const res = await fetch('/api/user/notifications')
            if (res.ok) {
                const data = await res.json()
                if (data) setSettings(prev => ({ ...prev, ...data }))
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const saveSettings = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/user/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            if (res.ok) toast.success('通知设置已保存')
            else toast.error('保存失败')
        } catch (e) { toast.error('保存失败') }
        finally { setSaving(false) }
    }

    const Toggle = ({ label, description, icon: Icon, checked, onChange }: {
        label: string; description: string; icon: any; checked: boolean; onChange: (v: boolean) => void
    }) => (
        <div className="flex items-center justify-between p-4 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-muted-foreground">{description}</div>
                </div>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                    style={{ marginTop: '2px' }}
                />
            </button>
        </div>
    )

    if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">通知设置</h1>
                    <p className="text-muted-foreground text-sm mt-1">管理您接收通知的方式</p>
                </div>
                <button onClick={saveSettings} disabled={saving}
                    className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? '保存中...' : '保存'}
                </button>
            </div>

            {/* 接收邮箱 */}
            <div className="border rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                        <AtSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="font-medium">接收通知邮箱</div>
                        <div className="text-sm text-muted-foreground">留空则使用注册邮箱接收通知</div>
                    </div>
                </div>
                <input
                    type="email"
                    value={settings.notifyEmail || ''}
                    onChange={e => setSettings(s => ({ ...s, notifyEmail: e.target.value }))}
                    placeholder="example@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* 账号与会员 */}
            <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">账号与会员</h2>
                <div className="border rounded-2xl overflow-hidden divide-y">
                    <Toggle
                        label="注册成功通知"
                        description="注册账号后发送欢迎邮件"
                        icon={UserPlus}
                        checked={settings.emailOnRegister}
                        onChange={v => setSettings(s => ({ ...s, emailOnRegister: v }))}
                    />
                    <Toggle
                        label="会员变更通知"
                        description="会员等级变更时发送邮件通知"
                        icon={Crown}
                        checked={settings.emailOnTierChange}
                        onChange={v => setSettings(s => ({ ...s, emailOnTierChange: v }))}
                    />
                    <Toggle
                        label="会员到期提醒"
                        description="会员即将到期时发送续费提醒"
                        icon={AlertTriangle}
                        checked={settings.emailOnTierExpire}
                        onChange={v => setSettings(s => ({ ...s, emailOnTierExpire: v }))}
                    />
                </div>
            </div>

            {/* 文件与链接 */}
            <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">文件与链接</h2>
                <div className="border rounded-2xl overflow-hidden divide-y">
                    <Toggle
                        label="新访客通知"
                        description="当有人查看您分享的文件时，发送邮件通知"
                        icon={Mail}
                        checked={settings.emailOnView}
                        onChange={v => setSettings(s => ({ ...s, emailOnView: v }))}
                    />
                    <Toggle
                        label="链接过期提醒"
                        description="在链接即将过期前发送提醒邮件"
                        icon={Clock}
                        checked={settings.emailOnExpire}
                        onChange={v => setSettings(s => ({ ...s, emailOnExpire: v }))}
                    />
                    <Toggle
                        label="文件违规通知"
                        description="文件被管理员标记为不合规时发送通知"
                        icon={ShieldAlert}
                        checked={settings.emailOnFileBanned}
                        onChange={v => setSettings(s => ({ ...s, emailOnFileBanned: v }))}
                    />
                    <Toggle
                        label="每周摘要"
                        description="每周发送一封包含访问统计摘要的邮件"
                        icon={BarChart3}
                        checked={settings.emailDigest}
                        onChange={v => setSettings(s => ({ ...s, emailDigest: v }))}
                    />
                </div>
            </div>
        </div>
    )
}
