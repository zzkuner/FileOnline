'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import '@uiw/react-markdown-preview/markdown.css'

import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

const MarkdownPreview = dynamic(
    () => import('@uiw/react-markdown-preview'),
    { ssr: false }
)

interface MarkdownViewerProps {
    content: string
    className?: string
}

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
    const { theme } = useTheme()

    return (
        <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className={`markdown-viewer w-full ${className}`}>
            <MarkdownPreview
                source={content}
                style={{ backgroundColor: 'transparent' }}
                wrapperElement={{
                    "data-color-mode": theme === 'dark' ? 'dark' : 'light'
                }}
                remarkPlugins={[remarkGfm, remarkBreaks]}
            />
        </div>
    )
}
