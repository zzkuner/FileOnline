import React from 'react'
import { Download, Eye } from 'lucide-react'

interface CardModeViewProps {
    displayTitle: string
    description?: string
    coverImage?: string
    fileName: string
    fileSize: number
    onViewFile: () => void
}

export default function CardModeView({
    displayTitle,
    description,
    coverImage,
    fileName,
    fileSize,
    onViewFile
}: CardModeViewProps) {
    const formatFileSize = (bytes: number) => {
        if (!bytes || isNaN(bytes)) return '未知大小'
        return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
            <div className="max-w-2xl w-full">
                {/* 卡片容器 */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02]">
                    {/* 封面图区域 */}
                    {coverImage ? (
                        <div className="relative h-64 md:h-80 overflow-hidden">
                            <img
                                src={coverImage}
                                alt="封面"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                    ) : (
                        <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white text-6xl md:text-8xl opacity-20">
                                    {displayTitle.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 内容区域 */}
                    <div className="p-8 md:p-10">
                        {/* 标题 */}
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {displayTitle}
                        </h1>

                        {/* 描述 */}
                        {description && (
                            <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
                                <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                                    {description}
                                </p>
                            </div>
                        )}

                        {/* 文件信息 */}
                        <div className="flex items-center gap-4 mb-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>可用</span>
                            </div>
                            <span>•</span>
                            <span>{formatFileSize(fileSize)}</span>
                        </div>

                        {/* CTA 按钮 */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onViewFile}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                查看内容
                            </button>
                            <button
                                onClick={onViewFile}
                                className="sm:w-auto bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-6 py-4 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                下载
                            </button>
                        </div>

                        {/* 底部提示 */}
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-center text-muted-foreground">
                                由 <span className="font-semibold text-blue-600">阅迹 ViewTrace</span> 提供安全分享服务
                            </p>
                        </div>
                    </div>
                </div>

                {/* 额外信息卡片 */}
                <div className="mt-6 px-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                            <div className="flex-1">
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    <strong>文件名：</strong>{fileName}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
