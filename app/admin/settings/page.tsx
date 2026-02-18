'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Mail, Database, Shield, Globe, CreditCard, Save, Loader2, Layers, Send, Plug, CheckCircle2, XCircle, Bell } from 'lucide-react'

type TabId = 'email' | 'storage' | 'payment' | 'security' | 'notifications' | 'tiers' | 'global'

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>('email')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState<Record<string, string>>({})
    const [testingEmail, setTestingEmail] = useState(false)
    const [testingStorage, setTestingStorage] = useState(false)
    const [testEmailTo, setTestEmailTo] = useState('')

    const tabs = [
        { id: 'email' as TabId, label: '邮件服务', icon: Mail },
        { id: 'storage' as TabId, label: '对象存储', icon: Database },
        { id: 'payment' as TabId, label: '支付配置', icon: CreditCard },
        { id: 'security' as TabId, label: '安全设置', icon: Shield },
        { id: 'notifications' as TabId, label: '通知配置', icon: Bell },
        { id: 'tiers' as TabId, label: '等级权限', icon: Layers },
        { id: 'global' as TabId, label: '全局配置', icon: Globe },
    ]

    useEffect(() => { loadConfig() }, [])

    const loadConfig = async () => {
        try {
            const res = await fetch('/api/admin/config')
            if (res.ok) setConfig(await res.json())
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const updateConfig = useCallback((key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }))
    }, [])

    const saveConfig = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })
            if (res.ok) toast.success('设置已保存')
            else toast.error('保存失败')
        } catch (e) { toast.error('保存失败') }
        finally { setSaving(false) }
    }

    const testEmail = async () => {
        setTestingEmail(true)
        try {
            const res = await fetch('/api/admin/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: testEmailTo || '' })
            })
            const data = await res.json()
            if (res.ok) toast.success(data.message || '测试邮件已发送')
            else toast.error(data.error || '发送失败')
        } catch (e) { toast.error('测试失败') }
        finally { setTestingEmail(false) }
    }

    const testStorage = async () => {
        setTestingStorage(true)
        try {
            const res = await fetch('/api/admin/test-storage', { method: 'POST' })
            const data = await res.json()
            if (res.ok) toast.success(data.message || '存储连接成功')
            else toast.error(data.error || '连接失败')
        } catch (e) { toast.error('测试失败') }
        finally { setTestingStorage(false) }
    }

    // 使用本地 state 的 Field，只在 blur 时更新全局 config，避免输入卡顿
    const Field = ({ label, configKey, type = 'text', placeholder = '' }: { label: string; configKey: string; type?: string; placeholder?: string }) => {
        const [localValue, setLocalValue] = useState(config[configKey] || '')

        useEffect(() => {
            setLocalValue(config[configKey] || '')
        }, [configKey, config[configKey]])

        return (
            <div>
                {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
                <input
                    type={type}
                    value={localValue}
                    onChange={e => setLocalValue(e.target.value)}
                    onBlur={() => updateConfig(configKey, localValue)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
        )
    }

    // Toggle 组件 — 开启绿色、关闭灰色
    const Toggle = ({ label, configKey, description }: { label: string; configKey: string; description?: string }) => {
        const checked = config[configKey] === 'true'
        return (
            <div className="flex items-center justify-between p-4 rounded-xl border">
                <div>
                    <div className="font-medium text-sm">{label}</div>
                    {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
                </div>
                <button
                    onClick={() => updateConfig(configKey, checked ? 'false' : 'true')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} style={{ marginTop: '2px' }} />
                </button>
            </div>
        )
    }

    if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>

    const storageType = config['STORAGE_TYPE'] || 'local'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">系统设置</h1>
                <button onClick={saveConfig} disabled={saving}
                    className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? '保存中...' : '保存设置'}
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'gradient-primary text-white shadow-md'
                            : 'border hover:bg-accent text-muted-foreground hover:text-foreground'
                            }`}>
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="border rounded-2xl p-6">
                {activeTab === 'email' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold">SMTP 邮件服务</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="SMTP 服务器" configKey="SMTP_HOST" placeholder="smtp.qq.com" />
                            <Field label="SMTP 端口" configKey="SMTP_PORT" placeholder="465" />
                            <Field label="用户名" configKey="SMTP_USER" placeholder="your@email.com" />
                            <Field label="密码/授权码" configKey="SMTP_PASS" type="password" placeholder="授权码" />
                            <Field label="发件人邮箱" configKey="SMTP_FROM" placeholder="noreply@example.com" />
                            <Field label="发件人名称" configKey="SMTP_FROM_NAME" placeholder="InsightLink" />
                        </div>
                        <Toggle label="启用 SSL/TLS" configKey="SMTP_SECURE" description="端口 465 通常需要开启" />

                        {/* Test Email Section */}
                        <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
                            <h3 className="text-sm font-medium">发送测试邮件</h3>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={testEmailTo}
                                    onChange={e => setTestEmailTo(e.target.value)}
                                    placeholder="收件地址（留空则使用管理员邮箱）"
                                    className="flex-1 px-4 py-2 rounded-xl border bg-white dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button onClick={testEmail} disabled={testingEmail}
                                    className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50 whitespace-nowrap">
                                    {testingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {testingEmail ? '发送中...' : '发送'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'storage' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">存储配置</h2>
                            {storageType !== 'local' && (
                                <button onClick={testStorage} disabled={testingStorage}
                                    className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-accent flex items-center gap-2 disabled:opacity-50">
                                    {testingStorage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
                                    {testingStorage ? '测试中...' : '测试连接'}
                                </button>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">存储方式</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { key: 'local', label: '本地存储', desc: '存储到服务器本地磁盘' },
                                    { key: 'minio', label: 'S3 / MinIO / B2', desc: '兼容 S3 协议的对象存储' },
                                    { key: 'r2', label: 'Cloudflare R2', desc: 'Cloudflare R2 对象存储' },
                                ].map(opt => (
                                    <button key={opt.key}
                                        onClick={() => updateConfig('STORAGE_TYPE', opt.key)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${storageType === opt.key
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50'}`}
                                    >
                                        <div className="font-medium text-sm">{opt.label}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {storageType === 'local' && (
                            <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/30">
                                <p className="text-sm text-muted-foreground">本地存储将文件保存至服务器 <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs">./uploads</code> 目录，无需额外配置。</p>
                            </div>
                        )}

                        {(storageType === 'minio' || storageType === 'r2') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Endpoint" configKey="S3_ENDPOINT" placeholder={storageType === 'r2' ? 'https://<account_id>.r2.cloudflarestorage.com' : 'https://s3.us-west-004.backblazeb2.com'} />
                                <Field label="区域 (Region)" configKey="S3_REGION" placeholder={storageType === 'r2' ? 'auto' : 'us-west-004'} />
                                <Field label="Access Key" configKey="S3_ACCESS_KEY" placeholder="Access Key ID" />
                                <Field label="Secret Key" configKey="S3_SECRET_KEY" type="password" placeholder="Secret Access Key" />
                                <Field label="Bucket 名称" configKey="S3_BUCKET" placeholder="my-bucket" />
                                <div className="md:col-span-2">
                                    <Field label="自定义域名 (可选)" configKey="S3_PUBLIC_DOMAIN" placeholder="https://cdn.example.com" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold mb-4">支付配置</h2>
                        <div className="space-y-6">
                            <div className="border rounded-xl p-4 space-y-4">
                                <h3 className="font-medium text-green-600 dark:text-green-400">微信支付</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="App ID" configKey="WECHAT_APP_ID" placeholder="wx..." />
                                    <Field label="商户号" configKey="WECHAT_MCH_ID" placeholder="商户号" />
                                    <Field label="API Key" configKey="WECHAT_API_KEY" type="password" placeholder="API密钥" />
                                    <Field label="回调地址" configKey="WECHAT_NOTIFY_URL" placeholder="https://..." />
                                </div>
                            </div>
                            <div className="border rounded-xl p-4 space-y-4">
                                <h3 className="font-medium text-blue-600 dark:text-blue-400">支付宝</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="App ID" configKey="ALIPAY_APP_ID" placeholder="App ID" />
                                    <Field label="私钥" configKey="ALIPAY_PRIVATE_KEY" type="password" placeholder="私钥" />
                                    <Field label="支付宝公钥" configKey="ALIPAY_PUBLIC_KEY" type="password" placeholder="公钥" />
                                    <Field label="回调地址" configKey="ALIPAY_NOTIFY_URL" placeholder="https://..." />
                                </div>
                            </div>
                            <div className="border rounded-xl p-4 space-y-4">
                                <h3 className="font-medium text-indigo-600 dark:text-indigo-400">Stripe</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Publishable Key" configKey="STRIPE_PK" placeholder="pk_..." />
                                    <Field label="Secret Key" configKey="STRIPE_SK" type="password" placeholder="sk_..." />
                                    <Field label="Webhook Secret" configKey="STRIPE_WEBHOOK_SECRET" type="password" placeholder="whsec_..." />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold mb-4">安全设置</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="JWT 密钥" configKey="JWT_SECRET" type="password" placeholder="留空使用默认" />
                            <Field label="会话有效期（秒）" configKey="SESSION_MAX_AGE" placeholder="86400" />
                            <Field label="最大登录尝试次数" configKey="MAX_LOGIN_ATTEMPTS" placeholder="5" />
                            <Field label="锁定时间（分钟）" configKey="LOCKOUT_DURATION" placeholder="15" />
                        </div>
                        <Toggle label="开放注册" configKey="REGISTRATION_ENABLED" description="关闭后新用户将无法注册，仅管理员可手动创建" />
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Existing security settings ... */}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold mb-4">管理员通知</h2>
                        <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/30 mb-6">
                            <p className="text-sm text-muted-foreground">配置是否接收系统重要事件的邮件通知。请确保 SMTP 服务已正确配置。</p>
                        </div>

                        <Field label="管理员接收邮箱" configKey="ADMIN_NOTIFY_EMAIL" placeholder="留空则不发送" />

                        <div className="space-y-4">
                            <Toggle
                                label="新用户注册通知"
                                configKey="NOTIFY_ADMIN_ON_REGISTER"
                                description="当有新用户注册成功时发送邮件通知"
                            />

                            <div className="border rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="font-medium text-sm">定期总结报告</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">每周发送由于包含统计信息的摘要邮件</div>
                                    </div>
                                    <Toggle label="" configKey="NOTIFY_ADMIN_WEEKLY_DIGEST" />
                                </div>

                                {config['NOTIFY_ADMIN_WEEKLY_DIGEST'] === 'true' && (
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">发送间隔 (天)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={config['NOTIFY_ADMIN_SUMMARY_INTERVAL_DAYS'] || '7'}
                                                onChange={e => updateConfig('NOTIFY_ADMIN_SUMMARY_INTERVAL_DAYS', e.target.value)}
                                                onBlur={e => {
                                                    let val = parseInt(e.target.value)
                                                    if (isNaN(val) || val < 1) val = 1
                                                    updateConfig('NOTIFY_ADMIN_SUMMARY_INTERVAL_DAYS', val.toString())
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">发送时间 (点)</label>
                                            <select
                                                value={config['NOTIFY_ADMIN_WEEKLY_HOUR'] || '9'}
                                                onChange={e => updateConfig('NOTIFY_ADMIN_WEEKLY_HOUR', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <option key={i} value={i}>{i}:00</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg text-xs text-blue-800 dark:text-blue-200">
                                    <p>系统内置了定时任务，服务运行时每隔 1 小时会自动检查并发送总结报告。无需配置外部 Cron。</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={async () => {
                                            const toastId = toast.loading('正在发送测试摘要...')
                                            try {
                                                const res = await fetch('/api/admin/summary?test=true', { method: 'POST' });
                                                const data = await res.json();
                                                if (res.ok) {
                                                    toast.success('测试摘要已发送', { id: toastId });
                                                } else {
                                                    toast.error(`发送失败: ${data.error || '未知错误'}`, { id: toastId });
                                                }
                                            } catch (e) {
                                                toast.error('请求失败', { id: toastId });
                                            }
                                        }}
                                        className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        发送测试摘要
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tiers' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold mb-4">等级权限配置</h2>
                        <p className="text-sm text-muted-foreground mb-4">配置每个等级的资源限额。设为 -1 表示不限制。</p>

                        {['FREE', 'PRO', 'MAX'].map(tier => {
                            const tierLabels: Record<string, string> = { FREE: '免费版', PRO: 'Pro 会员', MAX: 'Max 会员' }
                            const tierColors: Record<string, string> = { FREE: 'border-slate-300 dark:border-slate-600', PRO: 'border-blue-400', MAX: 'border-amber-400' }
                            return (
                                <div key={tier} className={`border-2 ${tierColors[tier]} rounded-xl p-5 space-y-4`}>
                                    <h3 className="font-bold text-base">{tierLabels[tier]} ({tier})</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        <Field label="最大文件数" configKey={`TIER_${tier}_MAX_FILES`} placeholder={tier === 'FREE' ? '2' : tier === 'PRO' ? '50' : '-1'} />
                                        <Field label="每文件最大链接数" configKey={`TIER_${tier}_MAX_LINKS`} placeholder={tier === 'FREE' ? '3' : '-1'} />
                                        <Field label="最大存储 (MB)" configKey={`TIER_${tier}_MAX_STORAGE_MB`} placeholder={tier === 'FREE' ? '20' : tier === 'PRO' ? '1024' : '-1'} />
                                        <Field label="单文件最大 (MB)" configKey={`TIER_${tier}_MAX_FILE_SIZE_MB`} placeholder={tier === 'FREE' ? '100' : tier === 'PRO' ? '1024' : '-1'} />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <Toggle label="数据分析" configKey={`TIER_${tier}_ANALYTICS`} />
                                        <Toggle label="去品牌" configKey={`TIER_${tier}_HIDE_BRANDING`} />
                                        <Toggle label="自定义域名" configKey={`TIER_${tier}_CUSTOM_DOMAIN`} />
                                        <Toggle label="自定义主题" configKey={`TIER_${tier}_CUSTOM_THEME`} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {activeTab === 'global' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold mb-4">全局配置</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="网站名称" configKey="SITE_NAME" placeholder="InsightLink" />
                            <Field label="网站地址" configKey="SITE_URL" placeholder="https://example.com" />
                            <div className="md:col-span-2">
                                <Field label="网站标语" configKey="SITE_SLOGAN" placeholder="让本地文件拥有&quot;在线生命&quot;" />
                            </div>
                            <div className="md:col-span-2">
                                <Field label="网站描述" configKey="SITE_DESCRIPTION" placeholder="简单拖拽，本地文件秒变在线直链。实时追踪访客行为，让每一次分享都心中有数。" />
                            </div>
                            <Field label="页脚文字" configKey="FOOTER_TEXT" placeholder="© 2026 InsightLink Inc." />

                            {/* ICP Config with better layout */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between h-[21px]"> {/* Fixed height to match label of sibling fields */}
                                    <label className="text-sm font-medium">ICP 备案号</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">显示</span>
                                        <button
                                            onClick={() => updateConfig('ICP_NUMBER_ENABLED', config['ICP_NUMBER_ENABLED'] === 'false' ? 'true' : 'false')}
                                            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${config['ICP_NUMBER_ENABLED'] !== 'false' ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <span
                                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-[3px] ${config['ICP_NUMBER_ENABLED'] !== 'false' ? 'translate-x-[18px]' : 'translate-x-[4px]'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                                <Field label="" configKey="ICP_NUMBER" placeholder="京ICP备12345678号" />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-base font-bold">客户反馈设置</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div className="space-y-2 border rounded-xl p-4 bg-slate-50 dark:bg-slate-800/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-indigo-500" />
                                            <span className="font-bold">邮箱</span>
                                        </div>
                                        <Toggle label="" configKey="CONTACT_EMAIL_ENABLED" />
                                    </div>
                                    <Field label="联系邮箱" configKey="CONTACT_EMAIL" placeholder="support@example.com" />
                                </div>

                                {/* WeChat */}
                                <div className="space-y-2 border rounded-xl p-4 bg-slate-50 dark:bg-slate-800/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">微</div>
                                            <span className="font-bold">微信</span>
                                        </div>
                                        <Toggle label="" configKey="CONTACT_WECHAT_ENABLED" />
                                    </div>
                                    <Field label="微信号/公众号" configKey="CONTACT_WECHAT" placeholder="WeChat ID" />
                                </div>

                                {/* QQ */}
                                <div className="space-y-2 border rounded-xl p-4 bg-slate-50 dark:bg-slate-800/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">Q</div>
                                            <span className="font-bold">QQ</span>
                                        </div>
                                        <Toggle label="" configKey="CONTACT_QQ_ENABLED" />
                                    </div>
                                    <Field label="QQ 号/群号" configKey="CONTACT_QQ" placeholder="QQ Number" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
