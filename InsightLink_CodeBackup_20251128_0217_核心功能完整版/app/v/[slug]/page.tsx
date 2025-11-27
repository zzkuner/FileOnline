'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Lock, AlertCircle, FileText, HardDrive, Calendar, Eye } from 'lucide-react'
import dynamic from 'next/dynamic'
import MarkdownViewer from '@/components/MarkdownViewer'
import CardModeView from '@/components/CardModeView'

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false })
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false })

export default function ViewerPage() {
    const params = useParams()
    const slug = params.slug as string

    const [fileData, setFileData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [needPassword, setNeedPassword] = useState(false)
    const [password, setPassword] = useState('')
    const [visitId, setVisitId] = useState<string | null>(null)
    const [showingContent, setShowingContent] = useState(false)
    const [markdownContent, setMarkdownContent] = useState<string>('')

    const visitIdRef = useRef<string | null>(null)
    const visitStartTime = useRef<number>(Date.now())

    const displayMode = fileData?.link?.displayMode || 'DEFAULT'
    const fileType = fileData?.file?.type
    const isMinimal = displayMode === 'MINIMAL'
    const isCard = displayMode === 'CARD'

    useEffect(() => {
        loadContent()
    }, [slug])

    useEffect(() => {
        const updateDuration = () => {
            if (visitIdRef.current) {
                const duration = Math.floor((Date.now() - visitStartTime.current) / 1000)
                const data = JSON.stringify({ duration })
                navigator.sendBeacon(`/api/visit/${visitIdRef.current}`, data)
            }
        }

        window.addEventListener('beforeunload', updateDuration)
        window.addEventListener('pagehide', updateDuration)

        return () => {
            window.removeEventListener('beforeunload', updateDuration)
            window.removeEventListener('pagehide', updateDuration)
            updateDuration()
        }
    }, [])

    useEffect(() => {
        if (fileType === 'MARKDOWN' && fileData?.file?.url) {
            fetch(fileData.file.url)
                .then(res => res.text())
                .then(text => setMarkdownContent(text))
                .catch(err => console.error('Failed to load markdown:', err))
        }
    }, [fileType, fileData])

    const loadContent = async (pwd?: string) => {
        try {
            const url = pwd
                ? `/api/viewer/${slug}?password=${encodeURIComponent(pwd)}`
                : `/api/viewer/${slug}`

            const res = await fetch(url)
            const data = await res.json()

            if (res.ok) {
                setFileData(data)
                setVisitId(data.visitId)
                visitIdRef.current = data.visitId
                setError(null)
                setNeedPassword(false)
                visitStartTime.current = Date.now()
            } else {
                if (res.status === 401 && data.needPassword) {
                    setNeedPassword(true)
                } else {
                    setError(data.error || '加载失败')
                }
            }
        } catch (err) {
            console.error('❌ 加载错误:', err)
            setError('网络错误，请重试')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        loadContent(password)
    }

    const handleTrackingEvent = async (eventType: string, payload?: any) => {
        if (!visitIdRef.current) return

        try {
            await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    visitId: visitIdRef.current,
                    eventType,
                    payload: payload || {}
                })
            })
        } catch (error) {
            console.error('Track error:', error)
        }
    }

    const handleViewFile = () => {
        setShowingContent(true)
        handleTrackingEvent('CARD_VIEW_CLICKED')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>加载中...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold mb-2">无法访问文件</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    if (needPassword) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full">
                    <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-center mb-2">请输入访问密码</h1>
                    <p className="text-muted-foreground text-center mb-6">此文件受密码保护</p>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            确认
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    if (!fileData) {
        return null
    }

    // CARD Mode - Show card first, then content after click
    if (isCard && !showingContent) {
        return (
            <CardModeView
                displayTitle={fileData.link.displayTitle || fileData.link.name}
                description={fileData.link.description}
                coverImage={fileData.link.coverImage}
                fileName={fileData.file.name}
                fileSize={fileData.file.size}
                onViewFile={handleViewFile}
            />
        )
    }

    // Render file content
    const renderFileContent = () => {
        switch (fileType) {
            case 'VIDEO':
                return (
                    <div className="flex items-center justify-center h-full p-4">
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
                    <div className="w-full h-full min-h-screen">
                        <PDFViewer
                            src={fileData.file.url}
                            onEvent={handleTrackingEvent}
                        />
                    </div>
                )

            case 'MARKDOWN':
                return (
                    <div className="flex items-start justify-center h-full overflow-auto">
                        <div className="w-full max-w-4xl p-8">
                            <MarkdownViewer content={markdownContent} />
                        </div>
                    </div>
                )

            case 'IMAGE':
                return (
                    <div className="flex items-center justify-center h-full p-8">
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

        const hasInfo = fileData.link.displayTitle || fileData.link.description || fileData.link.showFilename || fileData.link.showFilesize

        if (!hasInfo) return null

        return (
            <aside className="w-full lg:w-96 flex-shrink-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-purple-950/30 border-t lg:border-t-0 lg:border-l border-blue-100 dark:border-slate-800 flex flex-col max-h-[50vh] lg:max-h-none overflow-hidden">
                {/* Scrollable content area with vertical centering */}
                <div className="flex-1 overflow-y-auto flex flex-col justify-center px-6 lg:px-8 py-6 lg:py-8">
                    <div className="space-y-8 max-w-sm mx-auto">
                        {/* Title */}
                        {fileData.link.displayTitle && (
                            <div className="text-center animate-in fade-in duration-700">
                                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
                                    {fileData.link.displayTitle}
                                </h2>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full mx-auto shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"></div>
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
                                <div className="prose prose-sm dark:prose-invert max-w-none text-center [&>*]:mx-auto [&_p]:text-slate-700 [&_p]:dark:text-slate-300">
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
                    </div>
                </div>

                {/* Fixed bottom branding */}
                <div className="flex-shrink-0 p-6 border-t border-blue-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-medium">由 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">InsightLink</span> 提供安全分享服务</span>
                    </div>
                </div>
            </aside>
        )
    }

    return (
        <div className={`h-screen flex flex-col ${isMinimal ? (fileType === 'PDF' ? 'bg-white' : 'bg-black') : 'bg-slate-50 dark:bg-slate-950'}`}>
            {/* MINIMAL mode - full screen content */}
            {isMinimal ? (
                <main className={`flex-1 flex items-center justify-center ${fileType === 'PDF' ? 'bg-white' : 'bg-black'}`}>
                    <div className="w-full h-full">
                        {renderFileContent()}
                    </div>
                </main>
            ) : (
                /* DEFAULT/CARD mode - left-right layout with independent scrolling */
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
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
