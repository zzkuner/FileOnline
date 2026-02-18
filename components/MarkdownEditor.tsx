'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import { useTheme } from 'next-themes'

const MDEditor = dynamic(
    () => import('@uiw/react-md-editor'),
    { ssr: false }
) as any

interface MarkdownEditorProps {
    value: string
    onChange: (value: string | undefined) => void
    height?: number
    className?: string
}

export default function MarkdownEditor({
    value,
    onChange,
    height = 200,
    className
}: MarkdownEditorProps) {
    const { theme } = useTheme()

    return (
        <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className={className}>
            <MDEditor
                value={value}
                onChange={onChange}
                height={height}
                preview="live"
                visibleDragbar={false}
                className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
            />
        </div>
    )
}
