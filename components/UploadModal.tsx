'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'

interface UploadModalProps {
    isOpen: boolean
    onClose: () => void
    onUploadSuccess: () => void
    userId: string
}

export function UploadModal({ isOpen, onClose, onUploadSuccess, userId }: UploadModalProps) {
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!isOpen) return null

    const handleFileUpload = async (file: File) => {
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', userId)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                throw new Error('Upload failed')
            }

            toast.success('文件上传成功！', {
                description: `${file.name} 已就绪`
            })

            onUploadSuccess()
            onClose()
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('上传失败，请重试')
        } finally {
            setUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="glass rounded-3xl p-8 shadow-2xl">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <h2 className="text-2xl font-bold mb-6">上传文件</h2>

                    <div
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 scale-[1.02]'
                                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className={`w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 transition-transform ${isDragging ? 'scale-110' : ''
                            }`}>
                            <Upload className={`w-10 h-10 text-white ${isDragging ? 'animate-bounce' : ''}`} />
                        </div>

                        <h3 className="text-xl font-bold mb-2">
                            {uploading ? '上传中...' : isDragging ? '松开上传文件' : '拖拽文件或点击上传'}
                        </h3>
                        <p className="text-muted-foreground">
                            支持 PDF、视频、图片、Markdown等多种格式
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                            accept=".pdf,.mp4,.mov,.jpg,.jpeg,.png,.ppt,.pptx,.md,.txt"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
