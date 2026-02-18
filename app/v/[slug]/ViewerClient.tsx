'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Download, FileText, Clock, HardDrive, Shield, AlertTriangle, Eye, Globe, Lock, Info, XCircle, AlertCircle, Calendar, MessageSquare, Phone, MessageCircle, Hash, Github, Twitter, Linkedin, Mail, Menu, X } from 'lucide-react'
import { useSiteConfig } from '@/hooks/use-site-config'
import dynamic from 'next/dynamic'
import MarkdownViewer from '@/components/MarkdownViewer'
import CardModeView from '@/components/CardModeView'
import { toast } from 'sonner'

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false })
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false })

export default function ViewerClient() {
    const params = useParams()
    const slug = params.slug as string

    const [fileData, setFileData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [verifyingPwd, setVerifyingPwd] = useState(false)
    const { siteName } = useSiteConfig()
    const [password, setPassword] = useState('')
    const [visitId, setVisitId] = useState<string | null>(null)
    const [showingContent, setShowingContent] = useState(false)
    const [markdownContent, setMarkdownContent] = useState<string>('')
    const [showMobileSidebar, setShowMobileSidebar] = useState(false)

    const visitIdRef = useRef<string | null>(null)
    const visitStartTime = useRef<number>(Date.now())

    const displayMode = fileData?.link?.displayMode || 'DEFAULT'
    const fileType = fileData?.file?.type
    const isMinimal = displayMode === 'MINIMAL'


    // Update document title
    useEffect(() => {
        if (fileData?.link?.displayTitle && siteName) {
            document.title = `${siteName} - ${fileData.link.displayTitle}`
        }
    }, [fileData, siteName])

    // Fetch file data
    useEffect(() => {
        if (!slug) return

        const fetchData = async () => {
            try {
                const headers: HeadersInit = {}
                if (password) {
                    headers['x-link-password'] = password
                }

                const res = await fetch(`/api/viewer/${slug}`, { headers })

                if (res.status === 403) {
                    const data = await res.json()
                    if (data.requiresPassword) {
                        setError('PASSWORD_REQUIRED')
                    } else {
                        setError(data.error || 'Access denied')
                    }
                    setLoading(false)
                    return
                }

                if (!res.ok) {
                    const data = await res.json()
                    setError(data.error || 'Failed to load file')
                    setLoading(false)
                    return
                }

                const data = await res.json()
                setFileData(data)
                setError(null)

                // Load Markdown content if needed
                if (data.file.type === 'MARKDOWN' && data.file.url) {
                    fetch(data.file.url).then(r => r.text()).then(setMarkdownContent)
                }

                // Record visit
                if (!visitIdRef.current) {
                    try {
                        const visitRes = await fetch(`/api/tracking/${slug}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ eventType: 'VIEW' })
                        })
                        if (visitRes.ok) {
                            const visitData = await visitRes.json()
                            setVisitId(visitData.visitId)
                            visitIdRef.current = visitData.visitId
                        }
                    } catch (e) {
                        console.error('Failed to record visit:', e)
                    }
                }

                setLoading(false)
            } catch (err) {
                console.error(err)
                setError('Network error')
                setLoading(false)
            }
        }

        fetchData()
    }, [slug, password])

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Password state update triggers effect
    }

    const handleTrackingEvent = async (event: string, meta?: any) => {
        if (!visitIdRef.current) return
        try {
            await fetch(`/api/tracking/${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitId: visitIdRef.current,
                    eventType: event,
                    meta
                })
            })
        } catch (e) { console.error(e) }
    }

    // Render file content
    const renderFileContent = () => {
        switch (fileType) {
            case 'VIDEO':
                return (
                    <div className="flex items-center justify-center h-full p-2 lg:p-4">
                        <div className="w-full max-w-7xl">
                            <VideoPlayer
                                src={fileData.file.hlsUrl || fileData.file.url}
                                type={fileData.file.hlsUrl ? 'application/x-mpegURL' : 'video/mp4'}
                                onEvent={handleTrackingEvent}
                            />
                        </div>
                    </div>
                )

            case 'PDF':
                return (
                    <div className="w-full h-full min-h-[100dvh]">
                        <PDFViewer
                            src={fileData.file.url}
                            onEvent={handleTrackingEvent}
                        />
                    </div>
                )

            case 'MARKDOWN':
                return (
                    <div className="flex items-start justify-center h-full overflow-auto">
                        <div className="w-full max-w-4xl p-4 lg:p-8">
                            <MarkdownViewer content={markdownContent} />
                        </div>
                    </div>
                )

            case 'IMAGE':
                return (
                    <div className="flex items-center justify-center h-full p-4 lg:p-8">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-800 ring-1 ring-slate-900/5">
                            <img
                                src={fileData.file.url}
                                alt="文件预览"
                                className="max-w-full max-h-[80vh] object-contain"
                            />
                        </div>
                    </div>
                )

            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">不支持的文件类型</p>
                    </div>
                )
        }
    }

    // Right sidebar content
    const renderSidebar = () => {
        if (isMinimal) return null
        if (!fileData?.link) return null

        const hasInfo = fileData.link.displayTitle || fileData.link.description || fileData.link.showFilename || fileData.link.showFilesize

        if (!hasInfo) return null

        return (
            <>
                {/* Mobile Overlay Backdrop */}
                {showMobileSidebar && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setShowMobileSidebar(false)}
                    />
                )}

                <aside className={`
                    fixed lg:relative inset-y-0 right-0 z-50
                    w-[85vw] sm:w-[400px] lg:w-[480px] flex-shrink-0 
                    bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-purple-950/30
                    border-l border-blue-100 dark:border-slate-800
                    flex flex-col h-full lg:max-h-none overflow-hidden
                    transition-transform duration-300 ease-in-out
                    ${showMobileSidebar ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
                `}>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setShowMobileSidebar(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden z-10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {/* Scrollable content area with vertical centering */}
                    <div className="flex-1 overflow-y-auto flex flex-col px-6 lg:px-10 py-6 lg:py-10">
                        <div className="space-y-8 max-w-md mx-auto w-full my-auto">
                            {/* Title */}
                            {fileData.link.displayTitle && (
                                <div className="text-center animate-in fade-in duration-700">
                                    <h2 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 lg:mb-4 leading-tight">
                                        {fileData.link.displayTitle}
                                    </h2>
                                    <div className="w-16 lg:w-20 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full mx-auto shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"></div>
                                </div>
                            )}

                            {/* Description */}
                            {fileData.link.description && (
                                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100 dark:border-slate-700/50 hover:shadow-2xl transition-shadow duration-300">
                                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-wider flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></span>
                                        介绍
                                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></span>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-slate-700 [&_p]:dark:text-slate-300">
                                        <MarkdownViewer content={fileData.link.description} />
                                    </div>
                                </div>
                            )}

                            {/* File Metadata */}
                            {(fileData.link.showFilename || fileData.link.showFilesize || fileData.link.expiresAt) && (
                                <div className="space-y-4">
                                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-center flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></span>
                                        文件信息
                                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"></span>
                                    </div>
                                    <div className="space-y-3">
                                        {fileData.link.showFilename && (
                                            <div className="group flex items-start gap-3 p-4 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md hover:shadow-lg border border-blue-100 dark:border-slate-700/50 transition-all duration-300 hover:-translate-y-0.5">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                                                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">文件名</div>
                                                    <div className="text-sm font-semibold break-all text-slate-900 dark:text-white">{fileData.file.name}</div>
                                                </div>
                                            </div>
                                        )}
                                        {fileData.link.showFilesize && fileData.file.size && (
                                            <div className="group flex items-start gap-3 p-4 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md hover:shadow-lg border border-purple-100 dark:border-slate-700/50 transition-all duration-300 hover:-translate-y-0.5">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                                                    <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">文件大小</div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {fileData.link.expiresAt && (
                                            <div className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-sm shadow-md hover:shadow-lg border border-amber-200 dark:border-amber-800/50 transition-all duration-300 hover:-translate-y-0.5">
                                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                                                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs text-amber-700 dark:text-amber-300 mb-1 font-medium">过期时间</div>
                                                    <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                                        {new Date(fileData.link.expiresAt).toLocaleString('zh-CN')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Uploader Profile Card */}
                            {fileData.uploader && (fileData.uploader.name || fileData.uploader.avatar) && (
                                <div className="mt-8 pt-8 border-t border-blue-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                            {fileData.uploader.avatar ? (
                                                <img src={fileData.uploader.avatar} alt={fileData.uploader.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800">
                                                    <span className="text-lg font-bold">{fileData.uploader.name?.[0]?.toUpperCase() || 'U'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{fileData.uploader.name}</h3>
                                            {(fileData.uploader.title || fileData.uploader.company) && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {fileData.uploader.title}
                                                    {fileData.uploader.title && fileData.uploader.company && ' @ '}
                                                    {fileData.uploader.company}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bio - Controlled by showBio flag or default true if undefined (legacy compatibility) */}
                                    {(fileData.uploader.showBio !== false) && fileData.uploader.bio && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                                            {fileData.uploader.bio}
                                        </p>
                                    )}

                                    {/* Social Links - Controlled by showSocials flag */}
                                    {(fileData.uploader.showSocials !== false) && (
                                        <div className="flex flex-wrap gap-2">
                                            {fileData.uploader.website && (
                                                <a href={fileData.uploader.website} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
                                                    <Globe className="w-3 h-3" /> 网站
                                                </a>
                                            )}
                                            {/* Parse social links JSON safely */}
                                            {(() => {
                                                try {
                                                    const social = typeof fileData.uploader.socialLinks === 'string'
                                                        ? JSON.parse(fileData.uploader.socialLinks || '{}')
                                                        : fileData.uploader.socialLinks || {}

                                                    return (
                                                        <>
                                                            {social.mobile && (
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(social.mobile)
                                                                        alert(`手机号已复制: ${social.mobile}`)
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1"
                                                                    title="点击复制手机号"
                                                                >
                                                                    <Phone className="w-3 h-3" /> 手机
                                                                </button>
                                                            )}
                                                            {social.wechat && (
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(social.wechat)
                                                                        alert(`微信号已复制: ${social.wechat}`)
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center gap-1"
                                                                    title="点击复制微信号"
                                                                >
                                                                    <MessageSquare className="w-3 h-3" /> 微信
                                                                </button>
                                                            )}
                                                            {social.qq && (
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(social.qq)
                                                                        alert(`QQ号已复制: ${social.qq}`)
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1"
                                                                    title="点击复制QQ号"
                                                                >
                                                                    <MessageCircle className="w-3 h-3" /> QQ
                                                                </button>
                                                            )}
                                                            {social.weibo && (
                                                                <a href={social.weibo} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1">
                                                                    <Hash className="w-3 h-3" /> 微博
                                                                </a>
                                                            )}
                                                            {social.email && (
                                                                <a href={`mailto:${social.email}`} className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" /> 邮件
                                                                </a>
                                                            )}
                                                            {social.github && (
                                                                <a href={social.github} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
                                                                    <Github className="w-3 h-3" /> GitHub
                                                                </a>
                                                            )}
                                                            {social.x && (
                                                                <a href={social.x} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
                                                                    <Twitter className="w-3 h-3" /> X / Twitter
                                                                </a>
                                                            )}
                                                            {social.linkedin && (
                                                                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1">
                                                                    <Linkedin className="w-3 h-3" /> LinkedIn
                                                                </a>
                                                            )}
                                                        </>
                                                    )
                                                } catch (e) { return null }
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fixed bottom branding */}
                    {!fileData.link.hideBranding && (
                        <div className="flex-shrink-0 p-6 border-t border-blue-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                                    <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="font-medium">由 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">{siteName}</span> 提供安全分享服务</span>
                            </div>
                        </div>
                    )}
                </aside>
            </>
        )
    }

    if (loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error === 'PASSWORD_REQUIRED') {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">需要访问密码</h2>
                        <p className="text-slate-500 mb-8">该链接受密码保护，请输入密码继续访问</p>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="请输入密码"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-lg"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!password}
                                className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && verifyingPwd ? '验证中...' : '访问文件'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{error}</h2>
                    <p className="text-slate-500">无法加载文件，请检查链接是否正确或已过期</p>
                </div>
            </div>
        )
    }

    // Full screen card mode handled by component
    if (!isMinimal && displayMode === 'CARD' && !showingContent) {
        return (
            <CardModeView
                displayTitle={fileData.link.displayTitle || fileData.file.name}
                description={fileData.link.description}
                coverImage={fileData.link.coverImage}
                fileName={fileData.file.name}
                fileSize={fileData.file.size}
                onViewFile={() => setShowingContent(true)}
            />
        )
    }

    return (
        <div className={`h-[100dvh] flex flex-col ${isMinimal ? (fileType === 'PDF' ? 'bg-white' : 'bg-black') : 'bg-slate-50 dark:bg-slate-950'}`}>
            {/* MINIMAL mode - full screen content */}
            {isMinimal ? (
                <main className={`flex-1 flex items-center justify-center ${fileType === 'PDF' ? 'bg-white' : 'bg-black'}`}>
                    <div className="w-full h-full">
                        {renderFileContent()}
                    </div>
                </main>
            ) : (
                /* DEFAULT/CARD mode - left-right layout with independent scrolling */
                <div className="flex-1 flex flex-row overflow-hidden relative">
                    {/* Mobile Menu Button - Floating */}
                    {!showMobileSidebar && !isMinimal && (
                        <button
                            onClick={() => setShowMobileSidebar(true)}
                            className="fixed bottom-6 right-6 lg:hidden z-30 p-3 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    )}

                    {/* Main content area - Left side (独立滚动) */}
                    <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
                        {renderFileContent()}
                    </main>

                    {/* Sidebar - Right side (独立滚动) */}
                    {renderSidebar()}
                </div>
            )}
        </div>
    )
}
