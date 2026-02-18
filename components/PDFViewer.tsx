'use client'

import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure worker - use CDN to ensure version match
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
    src: string
    onEvent?: (event: string, data?: any) => void
}

export default function PDFViewer({ src, onEvent }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
        setLoading(false)
        onEvent?.('PDF_LOAD', { numPages })
    }

    function onDocumentLoadError(error: Error) {
        console.error('PDF load error:', error)
        setError('无法加载PDF文件')
        setLoading(false)
    }

    const [startTime, setStartTime] = useState<number>(Date.now())
    const [currentPage, setCurrentPage] = useState<number>(1)

    useEffect(() => {
        // Reset timer on page change
        setStartTime(Date.now())

        return () => {
            // Calculate duration on page exit
            const duration = Math.floor((Date.now() - startTime) / 1000)
            if (duration > 0) {
                onEvent?.('PDF_PAGE_VIEW', { page: currentPage, duration })
            }
        }
    }, [currentPage])

    return (
        <div className="w-full h-full bg-white overflow-auto">
            {loading && (
                <div className="flex items-center justify-center h-full bg-white">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-slate-600">加载 PDF 中...</p>
                    </div>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-center h-full bg-white">
                    <div className="text-center text-red-600">
                        <p className="text-lg font-semibold mb-2">加载失败</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}
            <div ref={containerRef} className={`flex flex-col items-center bg-white py-4 ${loading || error ? 'hidden' : ''}`}>
                <Document
                    file={src}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="max-w-full bg-white"
                    loading=""
                >
                    {Array.from(new Array(numPages), (_, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-lg mb-4 bg-white"
                            width={Math.min(typeof window !== 'undefined' ? window.innerWidth * 0.9 : 800, 900)}
                            loading=""
                        />
                    ))}
                </Document>
            </div>
        </div>
    )
}
