'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Link2, Copy, QrCode, Settings, Plus, FileText, Video, Image as ImageIcon, Trash2, ExternalLink, Eye, Edit2, Power, X, Download } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface FileDetail {
    id: string
    originalName: string
    fileType: string
    fileSize: number
    status: string
    createdAt: string
    url?: string
    hlsUrl?: string
}

interface TrackingLink {
    id: string
    slug: string
    name: string
    description: string | null
    displayTitle: string | null
    displayMode: string
    showFilename: boolean
    showFilesize: boolean
    coverImage: string | null
    isActive: boolean
    password: string | null
    expiresAt: string | null
    createdAt: string
    _count: {
        visits: number
    }
}

export default function FileDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const fileId = params.id as string

    const [file, setFile] = useState<FileDetail | null>(null)
    const [links, setLinks] = useState<TrackingLink[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingLink, setEditingLink] = useState<TrackingLink | null>(null)

    // Form fields
    const [newLinkName, setNewLinkName] = useState('')
    const [newLinkDesc, setNewLinkDesc] = useState('')
    const [newLinkDisplayTitle, setNewLinkDisplayTitle] = useState('')
    const [newLinkMode, setNewLinkMode] = useState('DEFAULT')
    const [newLinkShowFilename, setNewLinkShowFilename] = useState(false)
    const [newLinkShowFilesize, setNewLinkShowFilesize] = useState(false)
    const [newLinkCoverImage, setNewLinkCoverImage] = useState('')
    const [newLinkPassword, setNewLinkPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [newLinkExpiry, setNewLinkExpiry] = useState('')
    const [newLinkMaxVisits, setNewLinkMaxVisits] = useState('')

    const [creating, setCreating] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showQrModal, setShowQrModal] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [currentLinkName, setCurrentLinkName] = useState('')
    const [currentSlug, setCurrentSlug] = useState('')
    const [deleting, setDeleting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        if (fileId) {
            loadFileAndLinks()
        }
    }, [fileId])

    const loadFileAndLinks = async () => {
        try {
            const fileRes = await fetch(`/api/files/${fileId}`)
            if (fileRes.ok) {
                const data = await fileRes.json()
                setFile(data.file)
            }

            const linksRes = await fetch(`/api/links?fileId=${fileId}`)
            if (linksRes.ok) {
                const data = await linksRes.json()
                setLinks(data.links)
            }
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setNewLinkName('')
        setNewLinkDesc('')
        setNewLinkDisplayTitle('')
        setNewLinkMode('DEFAULT')
        setNewLinkShowFilename(false)
        setNewLinkShowFilesize(false)
        setNewLinkCoverImage('')
        setNewLinkPassword('')
        setShowPassword(false)
        setNewLinkExpiry('')
        setNewLinkMaxVisits('')
    }

    const handleCreateLink = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newLinkName) return

        setCreating(true)
        try {
            const res = await fetch('/api/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileId,
                    name: newLinkName,
                    description: newLinkDesc,
                    displayTitle: newLinkDisplayTitle || null,
                    displayMode: newLinkMode,
                    showFilename: newLinkShowFilename,
                    showFilesize: newLinkShowFilesize,
                    coverImage: newLinkCoverImage || null,
                    password: newLinkPassword || null,
                    expiresAt: newLinkExpiry || null,
                    maxVisits: newLinkMaxVisits || null
                })
            })

            if (res.ok) {
                setShowCreateModal(false)
                resetForm()
                loadFileAndLinks()
                toast.success('链接创建成功！')
            } else {
                const data = await res.json()
                toast.error(data.error || '创建失败，请重试')
            }
        } catch (error) {
            console.error('Failed to create link:', error)
            toast.error('网络错误，请重试')
        } finally {
            setCreating(false)
        }
    }

    const handleEditLink = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingLink) return

        setSaving(true)
        try {
            const res = await fetch(`/api/links/${editingLink.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newLinkName,
                    description: newLinkDesc,
                    displayTitle: newLinkDisplayTitle || null,
                    displayMode: newLinkMode,
                    showFilename: newLinkShowFilename,
                    showFilesize: newLinkShowFilesize,
                    coverImage: newLinkCoverImage || null,
                    password: newLinkPassword || null,
                    expiresAt: newLinkExpiry || null,
                    maxVisits: newLinkMaxVisits || null
                })
            })

            if (res.ok) {
                setShowEditModal(false)
                setEditingLink(null)
                resetForm()
                loadFileAndLinks()
                toast.success('链接已更新！')
            } else {
                const data = await res.json()
                toast.error(data.error || '更新失败')
            }
        } catch (error) {
            console.error('Failed to update link:', error)
            toast.error('网络错误')
        } finally {
            setSaving(false)
        }
    }

    const openEditModal = (link: TrackingLink) => {
        setEditingLink(link)
        setNewLinkName(link.name)
        setNewLinkDesc(link.description || '')
        setNewLinkDisplayTitle(link.displayTitle || '')
        setNewLinkMode(link.displayMode || 'DEFAULT')
        setNewLinkShowFilename(link.showFilename || false)
        setNewLinkShowFilesize(link.showFilesize || false)
        setNewLinkCoverImage(link.coverImage || '')
        setNewLinkPassword('')
        setShowPassword(false)
        setNewLinkExpiry(link.expiresAt ? link.expiresAt.slice(0, 16) : '')
        setNewLinkMaxVisits(link.maxVisits ? link.maxVisits.toString() : '')
        setShowEditModal(true)
    }

    const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/links/${linkId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isActive: !currentStatus
                })
            })

            if (res.ok) {
                loadFileAndLinks()
                toast.success(currentStatus ? '链接已禁用' : '链接已启用')
            } else {
                toast.error('操作失败')
            }
        } catch (error) {
            console.error('Failed to toggle link:', error)
            toast.error('网络错误')
        }
    }

    const deleteLink = async (linkId: string) => {
        try {
            const res = await fetch(`/api/links/${linkId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                loadFileAndLinks()
                toast.success('链接已删除')
            } else {
                toast.error('删除失败')
            }
        } catch (error) {
            console.error('Failed to delete link:', error)
            toast.error('网络错误')
        }
    }

    const copyToClipboard = (slug: string) => {
        const url = `${window.location.origin}/v/${slug}`
        navigator.clipboard.writeText(url)
        toast.success('链接已复制到剪贴板')
    }

    const showQrCode = async (slug: string, name: string) => {
        setCurrentSlug(slug)
        setCurrentLinkName(name)
        const url = `${window.location.origin}/v/${slug}`

        try {
            const res = await fetch(`/api/qrcode?url=${encodeURIComponent(url)}`)
            if (res.ok) {
                const data = await res.json()
                setQrCodeUrl(data.qrCode)
                setShowQrModal(true)
            } else {
                toast.error('二维码生成失败')
            }
        } catch (error) {
            console.error('Failed to generate QR code:', error)
            toast.error('二维码生成失败')
        }
    }

    const confirmDeleteFile = async () => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/files/${fileId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast.success('文件已删除')
                router.push('/dashboard')
            } else {
                toast.error('删除失败')
            }
        } catch (error) {
            console.error('Failed to delete file:', error)
            toast.error('网络错误')
        } finally {
            setDeleting(false)
            setShowDeleteModal(false)
        }
    }

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'VIDEO':
                return <Video className="w-20 h-20 text-purple-500" />
            case 'IMAGE':
                return <ImageIcon className="w-20 h-20 text-blue-500" />
            case 'PDF':
                return <FileText className="w-20 h-20 text-red-500" />
            default:
                return <FileText className="w-20 h-20 text-gray-500" />
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!file) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">文件不存在</h2>
                    <Link href="/dashboard" className="text-primary hover:underline">返回控制台</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        返回控制台
                    </Link>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-6">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                                    {getFileIcon(file.fileType)}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{file.originalName}</h1>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>类型: {file.fileType}</span>
                                        <span>•</span>
                                        <span>大小: {(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                        <span>•</span>
                                        <span>状态: {file.status === 'READY' ? '就绪' : '处理中'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="预览原文件"
                                >
                                    <Eye className="w-6 h-6" />
                                </a>
                                <a
                                    href={file.url}
                                    download
                                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="下载文件"
                                >
                                    <Download className="w-6 h-6" />
                                </a>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                    title="删除文件"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Links Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">追踪链接</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
                        >
                            <Plus className="w-6 h-6" />
                            创建链接
                        </button>
                    </div>

                    {links.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Link2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>还没有创建追踪链接</p>
                            <p className="text-sm">点击上方按钮创建第一个链接</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {links.map((link) => (
                                <div
                                    key={link.id}
                                    className="p-6 rounded-2xl border hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{link.name}</h3>
                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${link.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {link.isActive ? '启用' : '禁用'}
                                                </span>
                                                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {link.displayMode === 'MINIMAL' ? '纯净' : link.displayMode === 'CARD' ? '卡片' : '标准'}
                                                </span>
                                            </div>
                                            {link.description && (
                                                <p className="text-sm text-muted-foreground mb-3">{link.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>访问次数: {link._count.visits}</span>
                                                {link.expiresAt && (
                                                    <>
                                                        <span>•</span>
                                                        <span>过期: {new Date(link.expiresAt).toLocaleString()}</span>
                                                    </>
                                                )}
                                                {link.password && (
                                                    <>
                                                        <span>•</span>
                                                        <span>🔒 密码保护</span>
                                                    </>
                                                )}
                                                {link.maxVisits && (
                                                    <>
                                                        <span>•</span>
                                                        <span>限制: {link.maxVisits} 次</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => copyToClipboard(link.slug)}
                                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="复制链接"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => showQrCode(link.slug, link.name)}
                                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="二维码"
                                            >
                                                <QrCode className="w-5 h-5" />
                                            </button>
                                            <a
                                                href={`/v/${link.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="预览"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                            <Link
                                                href={`/dashboard/analytics/${link.id}`}
                                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="分析"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => openEditModal(link)}
                                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="编辑"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => toggleLinkStatus(link.id, link.isActive)}
                                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title={link.isActive ? '禁用' : '启用'}
                                            >
                                                <Power className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteLink(link.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                                title="删除"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Link Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl max-h-[92vh] flex flex-col">
                            <div className="flex-shrink-0 p-6 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold">创建追踪链接</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <form onSubmit={handleCreateLink} className="space-y-4" id="create-link-form">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">链接名称（内部管理用）</label>
                                        <input
                                            type="text"
                                            value={newLinkName}
                                            onChange={e => setNewLinkName(e.target.value)}
                                            placeholder="例如：投递腾讯简历"
                                            className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">描述（支持 Markdown）</label>
                                        <textarea
                                            value={newLinkDesc}
                                            onChange={e => setNewLinkDesc(e.target.value)}
                                            placeholder="支持 **粗体**、*斜体*、[链接](url)等格式..."
                                            className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">展示模式</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('MINIMAL')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'MINIMAL' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="font-medium mb-1 text-sm">纯净</div>
                                                <div className="text-xs text-muted-foreground">只有内容</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('DEFAULT')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'DEFAULT' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="font-medium mb-1 text-sm">标准</div>
                                                <div className="text-xs text-muted-foreground">带描述</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('CARD')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'CARD' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="font-medium mb-1 text-sm">卡片</div>
                                                <div className="text-xs text-muted-foreground">营销用</div>
                                            </button>
                                        </div>
                                    </div>

                                    {(newLinkMode === 'DEFAULT' || newLinkMode === 'CARD') && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                访问者标题 {newLinkMode === 'CARD' && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={newLinkDisplayTitle}
                                                onChange={e => setNewLinkDisplayTitle(e.target.value)}
                                                placeholder={newLinkMode === 'CARD' ? '吸引人的标题，如：免费领取学习资料' : '访问者看到的标题（可选）'}
                                                className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800focus:ring-2 focus:ring-primary outline-none"
                                                required={newLinkMode === 'CARD'}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {newLinkMode === 'CARD' ? '这是访问者首先看到的内容' : '不填则不显示标题'}
                                            </p>
                                        </div>
                                    )}

                                    {newLinkMode === 'DEFAULT' && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium mb-2">显示选项</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newLinkShowFilename}
                                                    onChange={e => setNewLinkShowFilename(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm">显示文件名</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newLinkShowFilesize}
                                                    onChange={e => setNewLinkShowFilesize(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm">显示文件大小</span>
                                            </label>
                                        </div>
                                    )}

                                    {newLinkMode === 'CARD' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">封面图链接（可选）</label>
                                            <input
                                                type="url"
                                                value={newLinkCoverImage}
                                                onChange={e => setNewLinkCoverImage(e.target.value)}
                                                placeholder="https://example.com/cover.jpg"
                                                className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-1">修改密码</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={newLinkPassword}
                                                onChange={e => setNewLinkPassword(e.target.value)}
                                                placeholder={editingLink?.password ? "留空保持不变" : "设置新密码"}
                                                className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                            >
                                                {showPassword ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {editingLink?.password ? '当前有密码保护，留空保持原密码' : '留空表示无密码'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">过期时间</label>
                                        <input
                                            type="datetime-local"
                                            value={newLinkExpiry}
                                            onChange={e => setNewLinkExpiry(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">最大访问次数（可选）</label>
                                        <input
                                            type="number"
                                            value={newLinkMaxVisits}
                                            onChange={e => setNewLinkMaxVisits(e.target.value)}
                                            placeholder="留空则不限制"
                                            min="1"
                                            className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="flex-shrink-0 p-6 pt-4 border-t">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border-2 hover:bg-slate-100 transition-colors font-semibold text-base"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        form="create-link-form"
                                        disabled={creating}
                                        className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 text-base"
                                    >
                                        {creating ? '创建中...' : '创建'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Link Modal */}
            {
                showEditModal && editingLink && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl max-h-[92vh] flex flex-col">
                            <div className="flex-shrink-0 p-6 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold">编辑链接</h3>
                                    <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <form onSubmit={handleEditLink} className="space-y-4" id="edit-link-form">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">链接名称（内部管理用）</label>
                                        <input
                                            type="text"
                                            value={newLinkName}
                                            onChange={e => setNewLinkName(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">描述（支持 Markdown）</label>
                                        <textarea
                                            value={newLinkDesc}
                                            onChange={e => setNewLinkDesc(e.target.value)}
                                            placeholder="支持 **粗体**、*斜体*、[链接](url)等格式..."
                                            className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">展示模式</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('MINIMAL')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'MINIMAL' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="font-medium mb-1 text-sm">纯净</div>
                                                <div className="text-xs text-muted-foreground">只有内容</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('DEFAULT')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'DEFAULT' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="font-medium mb-1 text-sm">标准</div>
                                                <div className="text-xs text-muted-foreground">带描述</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('CARD')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'CARD' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="font-medium mb-1 text-sm">卡片</div>
                                                <div className="text-xs text-muted-foreground">营销用</div>
                                            </button>
                                        </div>
                                    </div>

                                    {(newLinkMode === 'DEFAULT' || newLinkMode === 'CARD') && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                访问者标题 {newLinkMode === 'CARD' && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={newLinkDisplayTitle}
                                                onChange={e => setNewLinkDisplayTitle(e.target.value)}
                                                placeholder={newLinkMode === 'CARD' ? '吸引人的标题' : '访问者看到的标题（可选）'}
                                                className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                                required={newLinkMode === 'CARD'}
                                            />
                                        </div>
                                    )}

                                    {newLinkMode === 'DEFAULT' && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium mb-2">显示选项</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newLinkShowFilename}
                                                    onChange={e => setNewLinkShowFilename(e.target.checked)}
                                                    className="w-4 h-4 rounded"
                                                />
                                                <span className="text-sm">显示文件名</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newLinkShowFilesize}
                                                    onChange={e => setNewLinkShowFilesize(e.target.checked)}
                                                    className="w-4 h-4 rounded"
                                                />
                                                <span className="text-sm">显示文件大小</span>
                                            </label>
                                        </div>
                                    )}

                                    {newLinkMode === 'CARD' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">封面图链接（可选）</label>
                                            <input
                                                type="url"
                                                value={newLinkCoverImage}
                                                onChange={e => setNewLinkCoverImage(e.target.value)}
                                                placeholder="https://example.com/cover.jpg"
                                                className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">留空将使用渐变背景</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-1">修改密码</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={newLinkPassword}
                                                onChange={e => setNewLinkPassword(e.target.value)}
                                                placeholder={editingLink?.password ? "留空保持不变" : "设置新密码"}
                                                className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                            >
                                                {showPassword ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {editingLink?.password ? '当前有密码保护，留空保持原密码' : '留空表示无密码'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">过期时间</label>
                                        <input
                                            type="datetime-local"
                                            value={newLinkExpiry}
                                            onChange={e => setNewLinkExpiry(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">最大访问次数（可选）</label>
                                        <input
                                            type="number"
                                            value={newLinkMaxVisits}
                                            onChange={e => setNewLinkMaxVisits(e.target.value)}
                                            placeholder="留空则不限制"
                                            min="1"
                                            className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="flex-shrink-0 p-6 pt-4 border-t">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border-2 hover:bg-slate-100 transition-colors font-semibold text-base"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        form="edit-link-form"
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 text-base"
                                    >
                                        {saving ? '保存中...' : '保存'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* QR Code Modal - Beautified */}
            {
                showQrModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowQrModal(false)}>
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                                    <QrCode className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{currentLinkName}</h3>
                                <p className="text-sm text-muted-foreground">扫码即可访问文件</p>
                            </div>

                            <div className="flex justify-center mb-8 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-3xl shadow-inner">
                                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-slate-900/5">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="QR Code" className="w-56 h-56" />
                                    ) : (
                                        <div className="w-56 h-56 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">链接地址</p>
                                <p className="text-sm font-mono text-foreground break-all">{window.location.origin}/v/{currentSlug}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => copyToClipboard(currentSlug)}
                                    className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
                                >
                                    <Copy className="w-5 h-5" />
                                    复制
                                </button>
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a')
                                        link.href = qrCodeUrl
                                        link.download = `qrcode-${currentSlug}.png`
                                        link.click()
                                    }}
                                    className="px-4 py-3 rounded-xl bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
                                >
                                    <Download className="w-5 h-5" />
                                    下载
                                </button>
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold text-sm"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">确认删除文件？</h3>
                                <p className="text-muted-foreground">
                                    删除后将无法恢复，所有相关的追踪链接也会被删除。
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                    className="flex-1 px-6 py-3 rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold text-base"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmDeleteFile}
                                    disabled={deleting}
                                    className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold text-base shadow-lg"
                                >
                                    {deleting ? '删除中...' : '确认删除'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
