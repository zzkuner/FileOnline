'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSiteConfig } from '@/hooks/use-site-config'
import {
    BarChart3, Users, FileText, Link2, Key, CreditCard,
    ScrollText, Settings, ArrowLeft, Menu, X, Shield, Tag
} from 'lucide-react'

const adminNavItems = [
    { href: '/admin', label: '系统概览', icon: BarChart3, exact: true },
    { href: '/admin/users', label: '用户管理', icon: Users },
    { href: '/admin/files', label: '文件管理', icon: FileText },
    { href: '/admin/links', label: '链接管理', icon: Link2 },
    { href: '/admin/cards', label: '卡密管理', icon: Key },
    { href: '/admin/payments', label: '支付记录', icon: CreditCard },
    { href: '/admin/logs', label: '系统日志', icon: ScrollText },
    { href: '/admin/plans', label: '定价方案', icon: Tag },
    { href: '/admin/settings', label: '系统设置', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { siteName } = useSiteConfig()

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login')
        if (status === 'authenticated' && session?.user?.role !== 'ADMIN') router.push('/dashboard')
    }, [status, session, router])

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 text-foreground">加载中...</div>
    }

    if (session?.user?.role !== 'ADMIN') return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 text-foreground flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">{siteName}</h1>
                            <p className="text-xs text-muted-foreground">管理后台</p>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-1">
                    {adminNavItems.map(item => {
                        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary/10 text-primary border border-primary/30'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        返回仪表盘
                    </Link>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 glass border-b px-4 py-3 flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-accent rounded-lg">
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className="font-semibold">管理后台</h1>
                </header>

                <main className="p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
