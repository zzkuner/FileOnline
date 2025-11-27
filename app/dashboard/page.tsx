'use client'

import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Upload, FileText, Video, Image as ImageIcon, Link2, Plus, LogOut } from 'lucide-react'

interface FileItem {
    id: string
    originalName: string
    fileType: string
    fileSize: number
    status: string
    createdAt: string
    _count?: {
        links: number
    }
}

export default function DashboardPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [files, setFiles] = useState<FileItem[]>([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
            return
        }

        if (status === 'authenticated' && session?.user?.id) {
            loadFiles(session.user.id)
        }
    }, [status, session, router])

    const loadFiles = async (userId: string) => {
        try {
            const res = await fetch(`/api/files?userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                setFiles(data.files || [])
            }
        } catch (error) {
            console.error('Failed to load files:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        if (!session?.user?.id) return

        setUploading(true)
        try {
            const file = e.target.files[0]
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', session.user.id)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                throw new Error('Upload failed')
            }

            await loadFiles(session.user.id)
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('上传失败，请重试')
        } finally {
            setUploading(false)
        }
    }

    const handleLogout = () => {
        signOut({ callbackUrl: '/' })
    }

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'PDF':
                return <FileText className="w-8 h-8 text-red-500" />
            case 'VIDEO':
                return <Video className="w-8 h-8 text-purple-500" />
            case 'IMAGE':
                return <ImageIcon className="w-8 h-8 text-blue-500" />
            default:
                return <FileText className="w-8 h-8 text-gray-500" />
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
                <div className="text-lg">加载中...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
            <header className="glass border-b sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <Link2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                            InsightLink
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <div className="font-medium">{session?.user?.name || '用户'}</div>
                            <div className="text-muted-foreground text-xs">{session?.user?.email}</div>
                        </div>
                        {session?.user?.role === 'ADMIN' && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition-colors"
                            >
                                管理后台
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                            title="退出登录"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="mb-12">
                    <div className="glass rounded-3xl p-12 text-center border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all">
                        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                            <Upload className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3">上传文件</h2>
                        <p className="text-muted-foreground mb-6">支持 PDF、视频、图片等多种格式</p>

                        <label className="inline-block">
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                                accept=".pdf,.mp4,.mov,.jpg,.jpeg,.png,.ppt,.pptx"
                            />
                            <span className="px-8 py-4 rounded-full gradient-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2">
                                {uploading ? '上传中...' : '选择文件'}
                                {!uploading && <Plus className="w-5 h-5" />}
                            </span>
                        </label>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold mb-6">我的文件</h3>

                    {files.length === 0 ? (
                        <div className="glass rounded-2xl p-12 text-center">
                            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">还没有上传任何文件</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="glass rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group"
                                    onClick={() => router.push(`/dashboard/file/${file.id}`)}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="flex-shrink-0">
                                            {getFileIcon(file.fileType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                                                {file.originalName}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {formatFileSize(file.fileSize)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Link2 className="w-4 h-4" />
                                            <span>{file._count?.links || 0} 个链接</span>
                                        </div>
                                        <div className={`text-xs px-3 py-1 rounded-full ${file.status === 'READY'
                                            ? 'bg-green-500/10 text-green-600'
                                            : 'bg-yellow-500/10 text-yellow-600'
                                            }`}>
                                            {file.status === 'READY' ? '就绪' : '处理中'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
