import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

interface MarkdownViewerProps {
    content: string
    className?: string
}

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
    return (
        <div className={`markdown-viewer prose prose-slate dark:prose-invert max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                    // 自定义链接样式
                    a: ({ node, ...props }) => (
                        <a {...props} className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer" />
                    ),
                    // 自定义代码块样式
                    code: ({ node, inline, className, children, ...props }: any) => {
                        return inline ? (
                            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    },
                    // 自定义表格样式
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-gray-200" {...props} />
                        </div>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
