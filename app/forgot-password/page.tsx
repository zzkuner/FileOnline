'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Link2, Mail, Lock, KeyRound, ShieldCheck, ArrowRight } from 'lucide-react'
import { useSiteConfig } from '@/hooks/use-site-config'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const { siteName } = useSiteConfig()

    // Steps: 1=Email, 2=Code+NewPass, 3=Success
    const [step, setStep] = useState(1)

    const [formData, setFormData] = useState({
        email: '',
        code: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [loading, setLoading] = useState(false)
    const [timer, setTimer] = useState(0)
    const [sendingCode, setSendingCode] = useState(false)
    const [error, setError] = useState('')

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
                    type: 'RESET_PASSWORD'
                })
            })

            const data = await res.json()

            if (!res.ok) {
                // If user not found, we might still want to show success to prevent enumeration
                // But for now let's be explicit
                throw new Error(data.error || '验证码发送失败')
            }

            toast.success('验证码已发送')
            setTimer(60)
            setStep(2) // Move to next step
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSendingCode(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.newPassword !== formData.confirmPassword) {
            setError('两次输入的密码不一致')
            return
        }

        if (formData.newPassword.length < 6) {
            setError('密码长度至少为 6 位')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    code: formData.code,
                    newPassword: formData.newPassword
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '重置失败')
            }

            setStep(3)
        } catch (err: any) {
            setError(err.message)
        } finally {
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
                        <h1 className="text-3xl font-bold mb-2">重置密码</h1>
                        <p className="text-muted-foreground">
                            {step === 1 && '输入注册邮箱以接收验证码'}
                            {step === 2 && '输入验证码并设置新密码'}
                            {step === 3 && '密码重置成功'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">注册邮箱</label>
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

                            <button
                                onClick={handleSendCode}
                                disabled={sendingCode || !formData.email}
                                className="w-full py-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sendingCode ? '发送中...' : '发送验证码'}
                                {!sendingCode && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">验证码</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="邮件中的6位验证码"
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">新密码</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="至少 6 位"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">确认新密码</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="再次输入"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? '提交中...' : '重置密码'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>

                            <div className="text-center">
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                                    返回上一步
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">重置成功!</h2>
                            <p className="text-muted-foreground mb-8">您的密码已成功更新</p>

                            <Link
                                href="/login"
                                className="block w-full py-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all hover:scale-[1.02]"
                            >
                                立即登录
                            </Link>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                            返回登录
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
