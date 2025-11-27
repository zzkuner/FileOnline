'use client'

import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Mail, Database } from 'lucide-react'

export default function AdminSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // SMTP Settings
    const [smtpHost, setSmtpHost] = useState('')
    const [smtpPort, setSmtpPort] = useState('587')
    const [smtpUser, setSmtpUser] = useState('')
    const [smtpPass, setSmtpPass] = useState('')
    const [smtpFrom, setSmtpFrom] = useState('')

    // S3 Settings
    const [s3Endpoint, setS3Endpoint] = useState('')
    const [s3Port, setS3Port] = useState('9000')
    const [s3AccessKey, setS3AccessKey] = useState('')
    const [s3SecretKey, setS3SecretKey] = useState('')
    const [s3Bucket, setS3Bucket] = useState('')

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            if (res.ok) {
                const data = await res.json()
                // SMTP
                setSmtpHost(data.SMTP_HOST || '')
                setSmtpPort(data.SMTP_PORT || '587')
                setSmtpUser(data.SMTP_USER || '')
                setSmtpFrom(data.SMTP_FROM || '')
                // S3
                setS3Endpoint(data.MINIO_ENDPOINT || '')
                setS3Port(data.MINIO_PORT || '9000')
                setS3AccessKey(data.MINIO_ACCESS_KEY || '')
                setS3Bucket(data.MINIO_BUCKET_NAME || '')
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    SMTP_HOST: smtpHost,
                    SMTP_PORT: smtpPort,
                    SMTP_USER: smtpUser,
                    SMTP_PASS: smtpPass,
                    SMTP_FROM: smtpFrom,
                    MINIO_ENDPOINT: s3Endpoint,
                    MINIO_PORT: s3Port,
                    MINIO_ACCESS_KEY: s3AccessKey,
                    MINIO_SECRET_KEY: s3SecretKey,
                    MINIO_BUCKET_NAME: s3Bucket
                })
            })

            if (res.ok) {
                toast.success('设置保存成功！')
            } else {
                toast.error('保存失败，请重试')
            }
        } catch (error) {
            console.error('Save error:', error)
            alert('保存失败')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
            <header className="glass border-b sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">系统设置</h1>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-4xl">
                <form onSubmit={saveSettings} className="space-y-8">
                    {/* SMTP Settings */}
                    <div className="glass p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Mail className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-bold">邮件服务 (SMTP)</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">SMTP 主机</label>
                                <input
                                    type="text"
                                    value={smtpHost}
                                    onChange={e => setSmtpHost(e.target.value)}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">端口</label>
                                <input
                                    type="text"
                                    value={smtpPort}
                                    onChange={e => setSmtpPort(e.target.value)}
                                    placeholder="587"
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">用户名</label>
                                <input
                                    type="text"
                                    value={smtpUser}
                                    onChange={e => setSmtpUser(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">密码</label>
                                <input
                                    type="password"
                                    value={smtpPass}
                                    onChange={e => setSmtpPass(e.target.value)}
                                    placeholder="留空保持不变"
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">发件人</label>
                                <input
                                    type="text"
                                    value={smtpFrom}
                                    onChange={e => setSmtpFrom(e.target.value)}
                                    placeholder='"InsightLink" <noreply@example.com>'
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* S3 Settings */}
                    <div className="glass p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-bold">对象存储 (S3/MinIO)</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Endpoint</label>
                                <input
                                    type="text"
                                    value={s3Endpoint}
                                    onChange={e => setS3Endpoint(e.target.value)}
                                    placeholder="localhost or minio"
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">端口</label>
                                <input
                                    type="text"
                                    value={s3Port}
                                    onChange={e => setS3Port(e.target.value)}
                                    placeholder="9000"
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Access Key</label>
                                <input
                                    type="text"
                                    value={s3AccessKey}
                                    onChange={e => setS3AccessKey(e.target.value)}
                                    placeholder="admin"
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Secret Key</label>
                                <input
                                    type="password"
                                    value={s3SecretKey}
                                    onChange={e => setS3SecretKey(e.target.value)}
                                    placeholder="留空保持不变"
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Bucket Name</label>
                                <input
                                    type="text"
                                    value={s3Bucket}
                                    onChange={e => setS3Bucket(e.target.value)}
                                    placeholder="files"
                                    className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? '保存中...' : '保存设置'}
                    </button>
                </form>
            </main>
        </div>
    )
}
