'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Link2, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react'
import { useSiteConfig } from '@/hooks/use-site-config'
import { toast } from 'sonner'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: '',
        code: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { siteName } = useSiteConfig()

    // 验证码倒计时
    const [timer, setTimer] = useState(0)
    const [sendingCode, setSendingCode] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    const handleSendCode = async () => {
        if (!formData.email) {
            setError('请先输入邮箱')
            return
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('请输入有效的邮箱地址')
            return
        }

        setError('')
        setSendingCode(true)

        try {
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    type: 'REGISTER'
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '验证码发送失败')
            }

            toast.success('验证码已发送，请查收邮件')
            setTimer(60) // 60秒冷却
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSendingCode(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致')
            return
        }

        if (formData.password.length < 6) {
            setError('密码长度至少为 6 位')
            return
        }

        if (!formData.code) {
            setError('请输入验证码')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    code: formData.code
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '注册失败')
            }

            toast.success('注册成功，正在跳转登录...')
            setTimeout(() => {
                router.push('/login?registered=true')
            }, 1500)
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Link2 className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                        {siteName}
                    </span>
                </Link>

                {/* Form Card */}
                <div className="glass rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">创建账户</h1>
                        <p className="text-muted-foreground">开始追踪你的文件分享</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">用户名</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="请输入用户名"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">邮箱</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">验证码</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="6位验证码"
                                        maxLength={6}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={timer > 0 || sendingCode}
                                    className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[100px]"
                                >
                                    {sendingCode ? '发送中...' : timer > 0 ? `${timer}s` : '获取验证码'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">密码</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="至少 6 位密码"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">确认密码</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="再次输入密码"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? '注册中...' : '注册账户'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        已有账户?{' '}
                        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                            立即登录
                        </Link>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                    注册即表示你同意我们的服务条款和隐私政策
                </div>
            </div>
        </div>
    )
}
