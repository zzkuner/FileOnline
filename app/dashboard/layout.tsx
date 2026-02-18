'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Link2, FileText, User, LogOut, Menu, X, ChevronRight, BarChart3, Star, Bell, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSiteConfig } from '@/hooks/use-site-config'
import { FeedbackModal } from '@/components/FeedbackModal'

const navItems = [
    { href: '/dashboard', label: '文件管理', icon: FileText, exact: true },
    { href: '/dashboard/usage', label: '用量统计', icon: BarChart3 },
    { href: '/dashboard/activate', label: '升级会员', icon: Star },
    { href: '/dashboard/notifications', label: '通知设置', icon: Bell },
    { href: '/dashboard/profile', label: '个人资料', icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const { siteName, contactEmailEnabled, contactWechatEnabled, contactQQEnabled } = useSiteConfig()

    // Check if any contact method is enabled
    const hasContact = contactEmailEnabled || contactWechatEnabled || contactQQEnabled

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href
        return pathname.startsWith(href)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
            {/* Header */}
            <header className="glass border-b sticky top-0 z-50">
                <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                                <Link2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent hidden sm:inline">
                                {siteName}
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-sm text-right hidden sm:block">
                            <div className="font-medium flex items-center gap-2 justify-end">
                                {session?.user?.name || '用户'}
                                {(session?.user as any)?.tier === 'MAX' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                        MAX
                                    </span>
                                )}
                                {(session?.user as any)?.tier === 'PRO' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                        PRO
                                    </span>
                                )}
                                {(!(session?.user as any)?.tier || (session?.user as any)?.tier === 'FREE') && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        FREE
                                    </span>
                                )}
                            </div>
                            <div className="text-muted-foreground text-xs">{session?.user?.email}</div>
                        </div>
                        {session?.user?.role === 'ADMIN' && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200 transition-colors"
                            >
                                管理
                            </button>
                        )}
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                            title="退出登录"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-[57px] left-0 z-40 h-[calc(100vh-57px)] h-[calc(100dvh-57px)]
                    w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
                    border-r border-slate-200 dark:border-slate-800
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col
                `}>
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.href, item.exact)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                        ${active
                                            ? 'bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                                    <span className="flex-1">{item.label}</span>
                                    {active && <ChevronRight className="w-4 h-4 opacity-50" />}
                                </Link>
                            )
                        })}

                        {/* 反馈按钮 */}
                        {hasContact && (
                            <button
                                onClick={() => setShowFeedback(true)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-left"
                            >
                                <Mail className="w-5 h-5 flex-shrink-0" />
                                <span className="flex-1">反馈建议</span>
                            </button>
                        )}
                    </nav>

                    {/* Sidebar footer */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href="/"
                            className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center block hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="返回首页"
                        >
                            {siteName}
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-h-[calc(100vh-57px)] min-h-[calc(100dvh-57px)] overflow-x-hidden">
                    {children}
                </main>

                <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
            </div>
        </div>
    )
}
