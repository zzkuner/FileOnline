'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Link2, Copy, QrCode, Settings, Plus, FileText, Video, Image as ImageIcon, Trash2, ExternalLink, Eye, Edit2, Power, X, Download, UserCheck, AlertTriangle, MessageSquare, Mail, Globe, RefreshCw, Upload, Phone, MessageCircle, Hash, Github, Twitter, Linkedin, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSiteConfig } from '@/hooks/use-site-config'
import MarkdownEditor from '@/components/MarkdownEditor'

interface FileDetail {
    id: string
    originalName: string
    fileType: string
    fileSize: number
    status: string
    createdAt: string
    url?: string
    hlsUrl?: string
    isBanned: boolean
    banReason?: string | null
    userId: string
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
    maxVisits: number | null
    createdAt: string
    _count: {
        visits: number
    }
    visits: number
    uploaderProfile?: string | null
    isBanned: boolean
    banReason: string | null
    hideBranding: boolean
}

interface UploaderProfileData {
    name: string
    title: string
    company: string
    avatar: string
    bio: string
    // Control flags
    showBio?: boolean
    showSocials?: boolean
    // Socials
    website?: string
    socialLinks?: {
        mobile?: string
        wechat?: string
        qq?: string
        weibo?: string
        email?: string
        github?: string
        x?: string
        linkedin?: string
        [key: string]: string | undefined
    }
}

export default function FileDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const fileId = params.id as string
    const { contactSupport } = useSiteConfig()

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
    const [showUploaderProfile, setShowUploaderProfile] = useState(false)
    const [uploaderProfile, setUploaderProfile] = useState<UploaderProfileData>({
        name: '', title: '', company: '', avatar: '', bio: '',
        website: '', socialLinks: {}, showBio: true, showSocials: true
    })
    const [defaultProfile, setDefaultProfile] = useState<UploaderProfileData | null>(null)
    const [userTier, setUserTier] = useState<string>('FREE')
    const [enableHideBranding, setEnableHideBranding] = useState(false) // Toggle state

    // Toggles for optional fields
    const [enablePassword, setEnablePassword] = useState(false)
    const [enableExpiry, setEnableExpiry] = useState(false)
    const [enableLimit, setEnableLimit] = useState(false)

    const [creating, setCreating] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showQrModal, setShowQrModal] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [currentLinkName, setCurrentLinkName] = useState('')
    const [currentSlug, setCurrentSlug] = useState('')
    const [deleting, setDeleting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Rename & Replace
    const [showRenameModal, setShowRenameModal] = useState(false)
    const [renaming, setRenaming] = useState(false)
    const [renameValue, setRenameValue] = useState('')

    const [showReplaceModal, setShowReplaceModal] = useState(false)
    const [replacing, setReplacing] = useState(false)
    const [replaceFile, setReplaceFile] = useState<File | null>(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    // Avatar Upload Handler
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('请上传图片文件')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('图片大小不能超过 2MB')
            return
        }

        setUploadingAvatar(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || '上传失败')

            setUploaderProfile(prev => ({ ...prev, avatar: data.url }))
            toast.success('头像上传成功')
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || '上传失败')
        } finally {
            setUploadingAvatar(false)
            // Reset input value to allow selecting same file again
            e.target.value = ''
        }
    }

    useEffect(() => {
        if (fileId) {
            loadFileAndLinks()
            loadUserProfile()
        }
    }, [fileId])

    const loadUserProfile = async () => {
        try {
            const res = await fetch('/api/user/profile')
            if (res.ok) {
                const data = await res.json()
                const { user } = data
                let socialLinks = {}
                try {
                    socialLinks = user.socialLinks ? JSON.parse(user.socialLinks) : {}
                } catch (e) { }
                setUserTier(user.tier || 'FREE')

                const profile: UploaderProfileData = {
                    name: user.name || '',
                    title: user.title || '',
                    company: user.company || '',
                    avatar: user.avatar || '',
                    bio: user.bio || '',
                    website: user.website || '',
                    socialLinks: socialLinks,
                    showBio: true,
                    showSocials: true
                }
                setDefaultProfile(profile)
            }
        } catch (error) {
            console.error('Failed to load user profile:', error)
        }
    }

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
        setShowUploaderProfile(false)
        setUploaderProfile({
            name: '', title: '', company: '', avatar: '', bio: '',
            website: '', socialLinks: {}, showBio: true, showSocials: true
        })
        setEnablePassword(false)
        setEnableExpiry(false)
        setEnableLimit(false)
        setEnableHideBranding(false)
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
                    password: enablePassword ? newLinkPassword : null,
                    expiresAt: enableExpiry ? newLinkExpiry : null,
                    maxVisits: enableLimit ? newLinkMaxVisits : null,
                    uploaderProfile: showUploaderProfile ? JSON.stringify(uploaderProfile) : null
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
                    password: enablePassword ? newLinkPassword : null,
                    expiresAt: enableExpiry ? newLinkExpiry : null,
                    maxVisits: enableLimit ? newLinkMaxVisits : null,
                    uploaderProfile: showUploaderProfile ? JSON.stringify(uploaderProfile) : null
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
        if (link.uploaderProfile) {
            const parsed = JSON.parse(link.uploaderProfile)
            setShowUploaderProfile(true)
            setUploaderProfile(parsed)
        } else {
            setShowUploaderProfile(false)
            setUploaderProfile({
                name: '', title: '', company: '', avatar: '', bio: '',
                website: '', socialLinks: {}, showBio: true, showSocials: true
            })
        }

        setEnablePassword(!!link.password)
        setEnableExpiry(!!link.expiresAt)
        setEnableLimit(!!link.maxVisits)
        setEnableHideBranding(link.hideBranding || false)

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

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!renameValue.trim()) return

        setRenaming(true)
        try {
            const res = await fetch(`/api/files/${fileId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: renameValue })
            })

            if (res.ok) {
                toast.success('重命名成功')
                setShowRenameModal(false)
                loadFileAndLinks()
            } else {
                toast.error('重命名失败')
            }
        } catch (error) {
            toast.error('网络错误')
        } finally {
            setRenaming(false)
        }
    }

    const handleReplace = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replaceFile) return

        setReplacing(true)
        try {
            const formData = new FormData()
            formData.append('file', replaceFile)
            formData.append('userId', file!.userId)
            formData.append('replaceFileId', file!.id)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                toast.success('文件替换成功')
                setShowReplaceModal(false)
                setReplaceFile(null)
                loadFileAndLinks()
            } else {
                const data = await res.json()
                toast.error(data.error || '替换失败')
            }
        } catch (error) {
            console.error('Failed to replace file:', error)
            toast.error('网络错误')
        } finally {
            setReplacing(false)
        }
    }

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'VIDEO':
                return (
                    <div className="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Video className="w-10 h-10" />
                    </div>
                )
            case 'IMAGE':
                return (
                    <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <ImageIcon className="w-10 h-10" />
                    </div>
                )
            case 'PDF':
                return (
                    <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                        <FileText className="w-10 h-10" />
                    </div>
                )
            default:
                return (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <FileText className="w-10 h-10" />
                    </div>
                )
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
            <div className="container mx-auto px-4 py-4 lg:py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        返回控制台
                    </Link>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 lg:p-8 shadow-sm">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
                            <div className="flex flex-col items-center lg:items-start gap-4 w-full">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 shrink-0">
                                    {getFileIcon(file.fileType)}
                                </div>
                                <div className="flex lg:hidden items-center gap-3 w-full justify-center">
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="预览原文件"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </a>
                                    <a
                                        href={file.url}
                                        download
                                        className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="下载文件"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                    <button
                                        onClick={() => {
                                            setRenameValue(file.originalName)
                                            setShowRenameModal(true)
                                        }}
                                        className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="重命名"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setShowReplaceModal(true)}
                                        className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="替换文件"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                        title="删除文件"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="text-center lg:text-left w-full">
                                    <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-2 break-all">{file.originalName}</h1>
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-70 text-xs">类型</span>
                                            <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{file.fileType}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-70 text-xs">大小</span>
                                            <span className="font-medium">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-70 text-xs">状态</span>
                                            <span>{file.isBanned ? (
                                                <span className="text-red-500 font-bold text-xs bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">已封禁</span>
                                            ) : (
                                                file.status === 'READY' ? (
                                                    <span className="text-green-600 dark:text-green-400 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">就绪</span>
                                                ) : (
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-medium text-xs bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded">处理中</span>
                                                )
                                            )}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center gap-2">
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
                                    onClick={() => {
                                        setRenameValue(file.originalName)
                                        setShowRenameModal(true)
                                    }}
                                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="重命名"
                                >
                                    <Edit2 className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setShowReplaceModal(true)}
                                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="替换文件"
                                >
                                    <RefreshCw className="w-6 h-6" />
                                </button>
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

                {file.isBanned && (
                    <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-4">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">此文件已被封禁</h3>
                            <p className="text-red-600 dark:text-red-300 mb-2">
                                原因: {file.banReason || '违反平台规则'}
                            </p>
                            {contactSupport && (
                                <div className="text-sm text-red-500/80 mt-2 pt-2 border-t border-red-200 dark:border-red-800/50">
                                    如有疑问，请联系客服: <span className="font-medium select-all">{contactSupport}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Links Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 lg:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">追踪链接</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 lg:gap-3 px-4 py-2 lg:px-8 lg:py-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold text-sm lg:text-lg shadow-lg hover:shadow-xl"
                        >
                            <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
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
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{link.name}</h3>
                                                {file.isBanned ? (
                                                    <div className="group relative">
                                                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 cursor-help">
                                                            文件被封
                                                        </span>
                                                        <div className="absolute left-0 bottom-full mb-2 w-max max-w-[200px] p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                            文件封禁原因: {file.banReason}
                                                        </div>
                                                    </div>
                                                ) : link.isBanned ? (
                                                    <div className="group relative">
                                                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 cursor-help">
                                                            已封禁
                                                        </span>
                                                        {link.banReason && (
                                                            <div className="absolute left-0 bottom-full mb-2 w-max max-w-[200px] p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                                封禁原因: {link.banReason}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${link.isActive
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                        {link.isActive ? '启用' : '禁用'}
                                                    </span>
                                                )}
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
                                        <div className="mt-2 lg:mt-0 w-full lg:w-auto flex justify-end gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
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
            </div >

            {/* Create Link Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl max-h-[92vh] flex flex-col">
                            <div className="flex-shrink-0 p-4 lg:p-6 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold">创建追踪链接</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                                <form onSubmit={handleCreateLink} className="space-y-6" id="create-link-form">
                                    {/* 1. 展示模式 */}
                                    <div>
                                        <label className="block text-sm font-bold mb-3">展示模式</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('MINIMAL')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'MINIMAL' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 ring-1 ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                <div className="font-bold mb-1 text-sm">纯净模式</div>
                                                <div className="text-xs text-muted-foreground">仅展示文件内容，无多余信息</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('DEFAULT')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'DEFAULT' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 ring-1 ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                <div className="font-bold mb-1 text-sm">标准模式</div>
                                                <div className="text-xs text-muted-foreground">包含描述、文件信息和个人简介</div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. 基础信息 */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">链接名称（内部管理）</label>
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
                                            <label className="block text-sm font-medium mb-1">
                                                访问者标题
                                            </label>
                                            <input
                                                type="text"
                                                value={newLinkDisplayTitle}
                                                onChange={e => setNewLinkDisplayTitle(e.target.value)}
                                                placeholder="访问者看到的页面标题（可选）"
                                                className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* 3. 详细内容 (标准/卡片) */}
                                    {(newLinkMode === 'DEFAULT' || newLinkMode === 'CARD') && (
                                        <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">描述（支持 Markdown）</label>
                                                <MarkdownEditor
                                                    value={newLinkDesc}
                                                    onChange={(value) => setNewLinkDesc(value || '')}
                                                    height={200}
                                                />
                                            </div>

                                            {newLinkMode === 'DEFAULT' && (
                                                <div className="flex gap-6">
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
                                                    <label className="block text-sm font-medium mb-1">封面图链接</label>
                                                    <input
                                                        type="url"
                                                        value={newLinkCoverImage}
                                                        onChange={e => setNewLinkCoverImage(e.target.value)}
                                                        placeholder="https://example.com/cover.jpg"
                                                        className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 4. 个人资料 (标准/卡片) */}
                                    {(newLinkMode === 'DEFAULT' || newLinkMode === 'CARD') && (
                                        <div className="border rounded-xl p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="w-5 h-5 text-indigo-500" />
                                                    <span className="font-bold text-sm">在此链接中展示个人资料</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={showUploaderProfile}
                                                        onChange={e => {
                                                            setShowUploaderProfile(e.target.checked)
                                                            if (e.target.checked && defaultProfile) {
                                                                setUploaderProfile({ ...defaultProfile })
                                                            }
                                                        }}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>

                                            {showUploaderProfile && (
                                                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-xs text-muted-foreground">开启后自动填充您的资料，修改仅对当前链接生效。</div>
                                                        <button
                                                            type="button"
                                                            onClick={() => defaultProfile && setUploaderProfile({ ...defaultProfile })}
                                                            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                                                        >
                                                            从个人资料导入
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-xs font-medium mb-1">姓名</label>
                                                            <input type="text" value={uploaderProfile.name} onChange={e => setUploaderProfile({ ...uploaderProfile, name: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary" />
                                                        </div>
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-xs font-medium mb-1">头像链接</label>
                                                            <div className="flex gap-2">
                                                                <input type="url" value={uploaderProfile.avatar} onChange={e => setUploaderProfile({ ...uploaderProfile, avatar: e.target.value })} placeholder="https://" className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary" />
                                                                {uploaderProfile.avatar && <img src={uploaderProfile.avatar} alt="Preview" className="w-8 h-8 rounded-full border object-cover" />}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-xs font-medium mb-1">头衔</label>
                                                            <input type="text" value={uploaderProfile.title} onChange={e => setUploaderProfile({ ...uploaderProfile, title: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary" />
                                                        </div>
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-xs font-medium mb-1">公司/组织</label>
                                                            <input type="text" value={uploaderProfile.company} onChange={e => setUploaderProfile({ ...uploaderProfile, company: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary" />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="block text-xs font-medium mb-1">个人简介</label>
                                                            <textarea value={uploaderProfile.bio} onChange={e => setUploaderProfile({ ...uploaderProfile, bio: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary h-16 resize-none" />
                                                        </div>
                                                    </div>

                                                    {/* Social & Contact */}
                                                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">联系方式 & 社交账号</span>
                                                            <label className="flex items-center gap-1 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={uploaderProfile.showSocials !== false}
                                                                    onChange={e => setUploaderProfile({ ...uploaderProfile, showSocials: e.target.checked })}
                                                                    className="w-3 h-3 rounded text-primary focus:ring-primary border-gray-300"
                                                                />
                                                                <span className="text-[10px] text-slate-500">显示</span>
                                                            </label>
                                                        </div>

                                                        {uploaderProfile.showSocials !== false && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="col-span-2">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">个人网站</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Globe className="w-4 h-4 text-slate-400" />
                                                                        <input
                                                                            type="url"
                                                                            value={uploaderProfile.website || ''}
                                                                            onChange={e => setUploaderProfile({ ...uploaderProfile, website: e.target.value })}
                                                                            placeholder="https://"
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">手机号</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Phone className="w-4 h-4 text-slate-500" />
                                                                        <input
                                                                            type="tel"
                                                                            value={uploaderProfile.socialLinks?.mobile || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, mobile: e.target.value }
                                                                            })}
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">微信号</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <MessageSquare className="w-4 h-4 text-green-500" />
                                                                        <input
                                                                            type="text"
                                                                            value={uploaderProfile.socialLinks?.wechat || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, wechat: e.target.value }
                                                                            })}
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">QQ</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <MessageCircle className="w-4 h-4 text-blue-400" />
                                                                        <input
                                                                            type="text"
                                                                            value={uploaderProfile.socialLinks?.qq || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, qq: e.target.value }
                                                                            })}
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">微博</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Hash className="w-4 h-4 text-red-500" />
                                                                        <input
                                                                            type="text"
                                                                            value={uploaderProfile.socialLinks?.weibo || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, weibo: e.target.value }
                                                                            })}
                                                                            placeholder="https://weibo.com/..."
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">公开邮箱</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Mail className="w-4 h-4 text-blue-500" />
                                                                        <input
                                                                            type="email"
                                                                            value={uploaderProfile.socialLinks?.email || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, email: e.target.value }
                                                                            })}
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">GitHub</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                                                        <input
                                                                            type="url"
                                                                            value={uploaderProfile.socialLinks?.github || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, github: e.target.value }
                                                                            })}
                                                                            placeholder="https://github.com/..."
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">X / Twitter</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Twitter className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                                                        <input
                                                                            type="url"
                                                                            value={uploaderProfile.socialLinks?.x || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, x: e.target.value }
                                                                            })}
                                                                            placeholder="https://x.com/..."
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">LinkedIn</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Linkedin className="w-4 h-4 text-blue-700" />
                                                                        <input
                                                                            type="url"
                                                                            value={uploaderProfile.socialLinks?.linkedin || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, linkedin: e.target.value }
                                                                            })}
                                                                            placeholder="https://linkedin.com/in/..."
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}


                                    {/* Brand Customization */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-bold text-sm text-muted-foreground">品牌定制</h4>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <label className="text-sm font-medium">移除品牌标识</label>
                                                        <p className="text-xs text-muted-foreground mt-0.5">隐藏页面底部的品牌标识</p>
                                                    </div>
                                                    <label className={`relative inline-flex items-center cursor-pointer ${userTier === 'FREE' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={enableHideBranding}
                                                            onChange={e => {
                                                                if (userTier === 'FREE') return;
                                                                setEnableHideBranding(e.target.checked)
                                                            }}
                                                            disabled={userTier === 'FREE'}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                                {userTier === 'FREE' && (
                                                    <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 p-3 text-xs flex items-center gap-2">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span>此功能仅限 Pro 及以上用户使用。</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 5. 访问控制 */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-bold text-sm text-muted-foreground">访问控制</h4>

                                        {/* Password */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm font-medium">密码保护</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={enablePassword} onChange={e => setEnablePassword(e.target.checked)} className="sr-only peer" />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                                {enablePassword && (
                                                    <div className="relative animate-in fade-in slide-in-from-top-1">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={newLinkPassword}
                                                            onChange={e => setNewLinkPassword(e.target.value)}
                                                            placeholder="设置访问密码"
                                                            className="w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-1 focus:ring-primary pr-9"
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expiry */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm font-medium">过期时间</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={enableExpiry} onChange={e => setEnableExpiry(e.target.checked)} className="sr-only peer" />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                                {enableExpiry && (
                                                    <input
                                                        type="datetime-local"
                                                        value={newLinkExpiry}
                                                        onChange={e => setNewLinkExpiry(e.target.value)}
                                                        className="w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-1 focus:ring-primary animate-in fade-in slide-in-from-top-1"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Limit */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm font-medium">访问次数限制</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={enableLimit} onChange={e => setEnableLimit(e.target.checked)} className="sr-only peer" />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                                {enableLimit && (
                                                    <input
                                                        type="number"
                                                        value={newLinkMaxVisits}
                                                        onChange={e => setNewLinkMaxVisits(e.target.value)}
                                                        placeholder="最大访问次数"
                                                        min="1"
                                                        className="w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-1 focus:ring-primary animate-in fade-in slide-in-from-top-1"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="flex-shrink-0 p-4 lg:p-6 pt-4 border-t">
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
                            <div className="flex-shrink-0 p-4 lg:p-6 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold">编辑链接</h3>
                                    <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                                <form onSubmit={handleEditLink} className="space-y-6" id="edit-link-form">
                                    {/* 1. 展示模式 */}
                                    <div>
                                        <label className="block text-sm font-bold mb-3">展示模式</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('MINIMAL')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'MINIMAL' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 ring-1 ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                <div className="font-bold mb-1 text-sm">纯净模式</div>
                                                <div className="text-xs text-muted-foreground">仅展示文件内容，无多余信息</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewLinkMode('DEFAULT')}
                                                className={`p-3 rounded-xl border text-left transition-all ${newLinkMode === 'DEFAULT' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 ring-1 ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                <div className="font-bold mb-1 text-sm">标准模式</div>
                                                <div className="text-xs text-muted-foreground">包含描述、文件信息和个人简介</div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. 基础信息 */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">链接名称（内部管理）</label>
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
                                            <label className="block text-sm font-medium mb-1">
                                                访问者标题
                                            </label>
                                            <input
                                                type="text"
                                                value={newLinkDisplayTitle}
                                                onChange={e => setNewLinkDisplayTitle(e.target.value)}
                                                placeholder="访问者看到的页面标题（可选）"
                                                className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* 3. 详细内容 (标准/卡片) */}
                                    {(newLinkMode === 'DEFAULT') && (
                                        <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">描述（支持 Markdown）</label>
                                                <MarkdownEditor
                                                    value={newLinkDesc}
                                                    onChange={(value) => setNewLinkDesc(value || '')}
                                                    height={200}
                                                />
                                            </div>

                                            {newLinkMode === 'DEFAULT' && (
                                                <div className="flex gap-6">
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


                                        </div>
                                    )}

                                    {/* 4. 个人资料 (标准/卡片) */}
                                    {(newLinkMode === 'DEFAULT') && (
                                        <div className="border rounded-xl p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="w-5 h-5 text-indigo-500" />
                                                    <span className="font-bold text-sm">在此链接中展示个人资料</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={showUploaderProfile}
                                                        onChange={e => {
                                                            setShowUploaderProfile(e.target.checked)
                                                            if (e.target.checked && defaultProfile) {
                                                                setUploaderProfile({ ...defaultProfile })
                                                            }
                                                        }}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                                                </label>
                                            </div>



                                            {showUploaderProfile && (
                                                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-xs text-muted-foreground">开启后自动填充您的资料，修改仅对当前链接生效。</div>
                                                        <button
                                                            type="button"
                                                            onClick={() => defaultProfile && setUploaderProfile({ ...defaultProfile })}
                                                            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                                                        >
                                                            从个人资料导入
                                                        </button>
                                                    </div>

                                                    {/* Basic Info */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-xs font-medium mb-1">姓名</label>
                                                            <input type="text" value={uploaderProfile.name} onChange={e => setUploaderProfile({ ...uploaderProfile, name: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary" />
                                                        </div>
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-xs font-medium mb-1">头像</label>
                                                            <div className="flex gap-2 items-center">
                                                                <div className="relative flex-1">
                                                                    <input
                                                                        type="url"
                                                                        value={uploaderProfile.avatar}
                                                                        onChange={e => setUploaderProfile({ ...uploaderProfile, avatar: e.target.value })}
                                                                        placeholder="https://"
                                                                        className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary pr-20 transition-all"
                                                                    />
                                                                    <label className={`absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md text-xs cursor-pointer transition-colors text-slate-600 dark:text-slate-300 ${uploadingAvatar ? 'opacity-70 cursor-wait' : ''}`}>
                                                                        {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                                        <span className="ml-1.5 font-medium">上传</span>
                                                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                                                                    </label>
                                                                </div>
                                                                {uploaderProfile.avatar && (
                                                                    <div className="relative group shrink-0">
                                                                        <img src={uploaderProfile.avatar} alt="Preview" className="w-9 h-9 rounded-full border object-cover bg-slate-100 shadow-sm" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setUploaderProfile({ ...uploaderProfile, avatar: '' })}
                                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            title="移除头像"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-xs font-medium mb-1">头衔</label>
                                                            <input type="text" value={uploaderProfile.title} onChange={e => setUploaderProfile({ ...uploaderProfile, title: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary" />
                                                        </div>
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-xs font-medium mb-1">公司/组织</label>
                                                            <input type="text" value={uploaderProfile.company} onChange={e => setUploaderProfile({ ...uploaderProfile, company: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary" />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="block text-xs font-medium">个人简介</label>
                                                                <label className="flex items-center gap-1 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={uploaderProfile.showBio !== false}
                                                                        onChange={e => setUploaderProfile({ ...uploaderProfile, showBio: e.target.checked })}
                                                                        className="w-3 h-3 rounded text-primary focus:ring-primary border-gray-300"
                                                                    />
                                                                    <span className="text-[10px] text-slate-500">显示</span>
                                                                </label>
                                                            </div>
                                                            <textarea value={uploaderProfile.bio} onChange={e => setUploaderProfile({ ...uploaderProfile, bio: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary h-16 resize-none" />
                                                        </div>
                                                    </div>

                                                    {/* Social & Contact */}
                                                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">联系方式 & 社交账号</span>
                                                            <label className="flex items-center gap-1 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={uploaderProfile.showSocials !== false}
                                                                    onChange={e => setUploaderProfile({ ...uploaderProfile, showSocials: e.target.checked })}
                                                                    className="w-3 h-3 rounded text-primary focus:ring-primary border-gray-300"
                                                                />
                                                                <span className="text-[10px] text-slate-500">显示</span>
                                                            </label>
                                                        </div>

                                                        {uploaderProfile.showSocials !== false && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="col-span-2">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">个人网站</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Globe className="w-4 h-4 text-slate-400" />
                                                                        <input
                                                                            type="url"
                                                                            value={uploaderProfile.website || ''}
                                                                            onChange={e => setUploaderProfile({ ...uploaderProfile, website: e.target.value })}
                                                                            placeholder="https://"
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">手机号</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Phone className="w-4 h-4 text-slate-500" />
                                                                        <input
                                                                            type="tel"
                                                                            value={uploaderProfile.socialLinks?.mobile || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, mobile: e.target.value }
                                                                            })}
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">微信号</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <MessageSquare className="w-4 h-4 text-green-500" />
                                                                        <input
                                                                            type="text"
                                                                            value={uploaderProfile.socialLinks?.wechat || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, wechat: e.target.value }
                                                                            })}
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">QQ</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <MessageCircle className="w-4 h-4 text-blue-400" />
                                                                        <input
                                                                            type="text"
                                                                            value={uploaderProfile.socialLinks?.qq || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, qq: e.target.value }
                                                                            })}
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">微博</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Hash className="w-4 h-4 text-red-500" />
                                                                        <input
                                                                            type="text"
                                                                            value={uploaderProfile.socialLinks?.weibo || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, weibo: e.target.value }
                                                                            })}
                                                                            placeholder="https://weibo.com/..."
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">公开邮箱</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Mail className="w-4 h-4 text-blue-500" />
                                                                        <input
                                                                            type="email"
                                                                            value={uploaderProfile.socialLinks?.email || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, email: e.target.value }
                                                                            })}
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">GitHub</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                                                        <input
                                                                            type="url"
                                                                            value={uploaderProfile.socialLinks?.github || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, github: e.target.value }
                                                                            })}
                                                                            placeholder="https://github.com/..."
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">X / Twitter</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Twitter className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                                                        <input
                                                                            type="url"
                                                                            value={uploaderProfile.socialLinks?.x || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, x: e.target.value }
                                                                            })}
                                                                            placeholder="https://x.com/..."
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2 sm:col-span-1">
                                                                    <label className="block text-[10px] text-slate-500 mb-1">LinkedIn</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Linkedin className="w-4 h-4 text-blue-700" />
                                                                        <input
                                                                            type="url"
                                                                            value={uploaderProfile.socialLinks?.linkedin || ''}
                                                                            onChange={e => setUploaderProfile({
                                                                                ...uploaderProfile,
                                                                                socialLinks: { ...uploaderProfile.socialLinks, linkedin: e.target.value }
                                                                            })}
                                                                            placeholder="https://linkedin.com/in/..."
                                                                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    )}


                                    {/* Brand Customization */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-bold text-sm text-muted-foreground">品牌定制</h4>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <label className="text-sm font-medium">移除品牌标识</label>
                                                        <p className="text-xs text-muted-foreground mt-0.5">隐藏页面底部的品牌标识</p>
                                                    </div>
                                                    <label className={`relative inline-flex items-center cursor-pointer ${userTier === 'FREE' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={enableHideBranding}
                                                            onChange={e => {
                                                                if (userTier === 'FREE') return;
                                                                setEnableHideBranding(e.target.checked)
                                                            }}
                                                            disabled={userTier === 'FREE'}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                                    </label>
                                                </div>
                                                {userTier === 'FREE' && (
                                                    <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 p-3 text-xs flex items-center gap-2">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span>此功能仅限 Pro 及以上用户使用。</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 5. 访问控制 */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-bold text-sm text-muted-foreground">访问控制</h4>

                                        {/* Password */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm font-medium">密码保护</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={enablePassword} onChange={e => setEnablePassword(e.target.checked)} className="sr-only peer" />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                                    </label>
                                                </div>
                                                {enablePassword && (
                                                    <div className="relative animate-in fade-in slide-in-from-top-1">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={newLinkPassword}
                                                            onChange={e => setNewLinkPassword(e.target.value)}
                                                            placeholder={editingLink?.password ? "留空保持不变" : "设置新密码"}
                                                            className="w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-1 focus:ring-primary pr-9"
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expiry */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm font-medium">过期时间</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={enableExpiry} onChange={e => setEnableExpiry(e.target.checked)} className="sr-only peer" />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                                    </label>
                                                </div>
                                                {enableExpiry && (
                                                    <input
                                                        type="datetime-local"
                                                        value={newLinkExpiry}
                                                        onChange={e => setNewLinkExpiry(e.target.value)}
                                                        className="w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-1 focus:ring-primary animate-in fade-in slide-in-from-top-1"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Limit */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm font-medium">访问次数限制</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={enableLimit} onChange={e => setEnableLimit(e.target.checked)} className="sr-only peer" />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                                    </label>
                                                </div>
                                                {enableLimit && (
                                                    <input
                                                        type="number"
                                                        value={newLinkMaxVisits}
                                                        onChange={e => setNewLinkMaxVisits(e.target.value)}
                                                        placeholder="最大访问次数"
                                                        min="1"
                                                        className="w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-1 focus:ring-primary animate-in fade-in slide-in-from-top-1"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="flex-shrink-0 p-4 lg:p-6 pt-4 border-t">
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
                        </div >
                    </div >
                )
            }


            {/* QR Code Modal - Beautified & Compact */}
            {
                showQrModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowQrModal(false)}>
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl transition-all scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                            <div className="text-center mb-6 relative">
                                <button onClick={() => setShowQrModal(false)} className="absolute right-0 top-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-3">
                                    <QrCode className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{currentLinkName}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">扫码即可访问文件</p>
                            </div>

                            <div className="flex justify-center mb-6 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-slate-900/5">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                    ) : (
                                        <div className="w-48 h-48 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-5 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                                <p className="text-[10px] items-center justify-center font-medium text-slate-400 uppercase tracking-widest mb-0.5 flex gap-1">
                                    <Globe className="w-3 h-3" /> 链接地址
                                </p>
                                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate px-2 select-all">
                                    {window.location.origin}/v/{currentSlug}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => copyToClipboard(currentSlug)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                                >
                                    <Copy className="w-4 h-4" />
                                    复制链接
                                </button>
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a')
                                        link.href = qrCodeUrl
                                        link.download = `qrcode-${currentSlug}.png`
                                        link.click()
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white transition-colors font-medium flex items-center justify-center gap-2 text-sm shadow-md shadow-slate-900/10"
                                >
                                    <Download className="w-4 h-4" />
                                    保存图片
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

            {/* Rename Modal */}
            {
                showRenameModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6">重命名文件</h3>
                            <form onSubmit={handleRename}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">文件名称</label>
                                    <input
                                        type="text"
                                        value={renameValue}
                                        onChange={e => setRenameValue(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="输入新的文件名"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRenameModal(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={renaming || !renameValue.trim()}
                                        className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                                    >
                                        {renaming ? '保存中...' : '保存'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Replace Modal */}
            {
                showReplaceModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-2xl font-bold mb-2">替换文件</h3>
                            <p className="text-muted-foreground mb-6 text-sm">
                                上传新文件替换当前文件，追踪链接将保持不变。
                            </p>
                            <form onSubmit={handleReplace}>
                                <div className="mb-6">
                                    <label className="block w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={e => e.target.files && setReplaceFile(e.target.files[0])}
                                        />
                                        {replaceFile ? (
                                            <>
                                                <FileText className="w-8 h-8 text-primary" />
                                                <span className="text-sm font-medium text-foreground">{replaceFile.name}</span>
                                                <span className="text-xs text-muted-foreground">{(replaceFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                                                </div>
                                                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">点击选择新文件</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReplaceModal(false)
                                            setReplaceFile(null)
                                        }}
                                        className="flex-1 px-6 py-3 rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={replacing || !replaceFile}
                                        className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                                    >
                                        {replacing ? '上传中...' : '确认替换'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
