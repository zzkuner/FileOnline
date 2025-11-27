'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Users, FileText, Link2, Eye, HardDrive, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
    stats: {
        users: number
        files: number
        links: number
        visits: number
        storage: number
    }
    recentFiles: any[]
}

export default function AdminPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [data, setData] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
            return
        }

        if (status === 'authenticated') {
            if (session?.user?.role !== 'ADMIN') {
                router.push('/dashboard')
                return
            }
            loadStats()
        }
    }, [status, session, router])

    const loadStats = async () => {
        try {
            const res = await fetch('/api/admin/stats')
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (error) {
            console.error('Failed to load admin stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>
    if (!data) return <div className="min-h-screen flex items-center justify-center">暂无数据</div>

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-3xl font-bold">系统管理后台</h1>
                    </div>
                    <Link
                        href="/admin/settings"
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        系统设置
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-blue-600">
                            <Users className="w-5 h-5" />
                            <span className="font-medium">总用户</span>
                        </div>
                        <div className="text-3xl font-bold">{data.stats.users}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-purple-600">
                            <FileText className="w-5 h-5" />
                            <span className="font-medium">总文件</span>
                        </div>
                        <div className="text-3xl font-bold">{data.stats.files}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-green-600">
                            <Link2 className="w-5 h-5" />
                            <span className="font-medium">追踪链接</span>
                        </div>
                        <div className="text-3xl font-bold">{data.stats.links}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-orange-600">
                            <Eye className="w-5 h-5" />
                            <span className="font-medium">总访问</span>
                        </div>
                        <div className="text-3xl font-bold">{data.stats.visits}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-slate-600">
                            <HardDrive className="w-5 h-5" />
                            <span className="font-medium">存储占用</span>
                        </div>
                        <div className="text-3xl font-bold">{formatSize(data.stats.storage)}</div>
                    </div>
                </div>

                {/* Recent Files Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-6">最新上传文件</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-muted-foreground border-b">
                                    <th className="pb-4 font-medium">文件名</th>
                                    <th className="pb-4 font-medium">上传者</th>
                                    <th className="pb-4 font-medium">大小</th>
                                    <th className="pb-4 font-medium">类型</th>
                                    <th className="pb-4 font-medium">状态</th>
                                    <th className="pb-4 font-medium">上传时间</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {data.recentFiles.map((file) => (
                                    <tr key={file.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 font-medium">{file.originalName}</td>
                                        <td className="py-4">
                                            <div>{file.user.name}</div>
                                            <div className="text-xs text-muted-foreground">{file.user.email}</div>
                                        </td>
                                        <td className="py-4">{formatSize(file.fileSize)}</td>
                                        <td className="py-4">{file.fileType}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${file.status === 'READY' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {file.status}
                                            </span>
                                        </td>
                                        <td className="py-4">{new Date(file.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
