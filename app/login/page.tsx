'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Link2, Mail, Lock, ArrowRight } from 'lucide-react'
import { useSiteConfig } from '@/hooks/use-site-config'

export default function LoginPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { siteName, siteSlogan } = useSiteConfig()
    const [error, setError] = useState('')

    // 如果已登录，自动跳转到Dashboard
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard')
        }
    }, [status, router])

    // 如果正在检查登录状态，显示加载中
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
                <div className="text-lg">检查登录状态...</div>
            </div>
        )
    }

    // 如果已登录，不显示登录表单（虽然会立即跳转）
    if (status === 'authenticated') {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                setError('邮箱或密码错误')
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('登录失败，请重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {siteName}
                    </h1>
                    <p className="text-muted-foreground">{siteSlogan}</p>
                </div>

                <div className="glass rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6">登录</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">邮箱</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium">密码</label>
                                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                    忘记密码？
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                        >
                            {loading ? '登录中...' : '登录'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        还没有账号？
                        <Link href="/register" className="text-primary font-medium hover:underline ml-1">
                            立即注册
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
