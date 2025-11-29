'use client'

import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Upload, FileText, Video, Image as ImageIcon, Link2, Plus, LogOut, Shield, Zap } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { motion, AnimatePresence } from 'framer-motion'

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
    const [isDragging, setIsDragging] = useState(false)

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

            toast.success('文件上传成功！')
            await loadFiles(session.user.id)
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('上传失败，请重试')
        } finally {
            setUploading(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (!session?.user?.id) return

        const droppedFiles = e.dataTransfer.files
        if (droppedFiles.length === 0) return

        setUploading(true)
        try {
            const file = droppedFiles[0]
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

            toast.success('文件上传成功！')
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
                <div className="mb-8">
                    <div
                        className={`glass rounded-2xl p-8 text-center border-2 border-dashed transition-all duration-200 ${isDragging
                                ? 'border-indigo-500 bg-indigo-50/80 shadow-lg'
                                : 'border-indigo-200 hover:border-indigo-400 hover:bg-white/60 hover:shadow-md'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className={`w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 transition-transform duration-300 shadow-md ${isDragging ? 'rotate-12' : 'group-hover:scale-105'
                            }`}>
                            <Upload className={`w-8 h-8 text-white ${isDragging ? 'animate-bounce' : ''}`} />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-slate-800">
                            {uploading ? '上传中...' : isDragging ? '松开上传文件' : '上传文件'}
                        </h2>
                        <p className="text-slate-500 mb-6 text-sm">
                            {isDragging ? '释放鼠标以上传' : '支持 PDF、视频、图片等多种格式'}
                        </p>

                        <label className="inline-block group">
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                                accept=".pdf,.mp4,.mov,.jpg,.jpeg,.png,.ppt,.pptx"
                            />
                            <span className="px-8 py-3 rounded-full gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2 shadow-md group-hover:shadow-indigo-500/30 group-hover:-translate-y-0.5">
                                {uploading ? '上传中...' : '选择文件'}
                                {!uploading && <Plus className="w-4 h-4" />}
                            </span>
                        </label>

                        {!uploading && !isDragging && (
                            <div className="flex justify-center items-center gap-6 mt-6 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> 安全加密
                                </span>
                                <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> 极速转码
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold mb-6">我的文件</h3>

                    {files.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="还没有上传任何文件"
                            description="上传的文件将在这里显示，您可以创建追踪链接并查看访问数据。"
                            action={{
                                label: "立即上传",
                                onClick: () => document.getElementById('dashboard-file-input')?.click()
                            }}
                        />
                    ) : (
                        <motion.div
                            layout
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {files.map((file) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
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

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Link2 className="w-4 h-4" />
                                                <span>{file._count?.links || 0} 个链接</span>
                                            </div>
                                            <div className={`text-xs px-3 py-1 rounded-full ${file.status === 'READY'
                                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                                : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                                }`}>
                                                {file.status === 'READY' ? '就绪' : '处理中'}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    )
}
