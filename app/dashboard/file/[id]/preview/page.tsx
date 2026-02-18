'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic imports for preview components
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false })
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false })

interface FileDetail {
    id: string
    originalName: string
    fileType: string
    fileSize: number
    url?: string
    hlsUrl?: string
}

export default function DashboardPreviewPage() {
    const router = useRouter()
    const params = useParams()
    const fileId = params.id as string

    const [file, setFile] = useState<FileDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (fileId) {
            loadFile()
        }
    }, [fileId])

    const loadFile = async () => {
        try {
            const res = await fetch(`/api/files/${fileId}`)
            if (res.ok) {
                const data = await res.json()
                setFile(data.file)
            } else {
                setError('文件不存在或无法访问')
            }
        } catch (error) {
            console.error('Failed to load file:', error)
            setError('网络错误')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">加载中...</div>
    }

    if (error || !file) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-lg text-muted-foreground">{error || '文件不存在'}</p>
                <button onClick={() => router.back()} className="text-primary hover:underline">
                    返回上一页
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="bg-slate-900/50 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-white"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-white font-medium truncate max-w-md">{file.originalName}</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-6xl h-[80vh] flex items-center justify-center">
                    {file.fileType === 'VIDEO' ? (
                        <VideoPlayer
                            src={file.hlsUrl || file.url || ''}
                            type={file.hlsUrl ? 'application/x-mpegURL' : 'video/mp4'}
                        />
                    ) : file.fileType === 'PDF' ? (
                        <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                            <PDFViewer src={file.url || ''} />
                        </div>
                    ) : file.fileType === 'IMAGE' ? (
                        <img
                            src={file.url}
                            alt={file.originalName}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-4">
                            <FileText className="w-16 h-16" />
                            <p>暂不支持预览此格式</p>
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 rounded-full bg-primary text-white hover:opacity-90 transition-opacity"
                            >
                                下载文件
                            </a>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
