'use client'

import { useState } from 'react'
import { X, Copy, Check, Mail, MessageCircle, MessageSquare } from 'lucide-react'

import { toast } from 'sonner'
import { useSiteConfig } from '@/hooks/use-site-config'

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const {
        contactEmail, contactEmailEnabled,
        contactWechat, contactWechatEnabled,
        contactQQ, contactQQEnabled
    } = useSiteConfig()

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success(`已复制 ${label}`)
        } catch (err) {
            toast.error('复制失败')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold">反馈与建议</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500 mb-4">
                        如果您有任何问题或建议，欢迎通过以下方式联系我们：
                    </p>

                    <div className="grid gap-3">
                        {contactEmailEnabled && contactEmail && (
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-500">发送邮件</div>
                                    <div className="font-medium text-sm truncate select-all">{contactEmail}</div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(contactEmail, '邮箱地址')}
                                    className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {contactWechatEnabled && contactWechat && (
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-green-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-500">微信联系</div>
                                    <div className="font-medium text-sm truncate select-all">{contactWechat}</div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(contactWechat, '微信号')}
                                    className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {contactQQEnabled && contactQQ && (
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-500">QQ 联系</div>
                                    <div className="font-medium text-sm truncate select-all">{contactQQ}</div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(contactQQ, 'QQ 号')}
                                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {!contactEmailEnabled && !contactWechatEnabled && !contactQQEnabled && (
                            <div className="text-center py-8 text-slate-500">
                                暂无开放的反馈通道
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-400">
                    我们会尽快查看您的反馈
                </div>
            </div>
        </div>
    )
}
