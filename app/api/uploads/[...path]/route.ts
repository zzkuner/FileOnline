import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'
import { getStorageConfig } from '@/lib/storage-config'
import { getS3PresignedUrl } from '@/lib/storage'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const LOCAL_SECRET = process.env.NEXTAUTH_SECRET || 'local-storage-secret-key'

function getMimeType(ext: string): string {
    const map: Record<string, string> = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
        '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
        '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
        '.pdf': 'application/pdf', '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.zip': 'application/zip', '.rar': 'application/x-rar-compressed',
        '.txt': 'text/plain', '.csv': 'text/csv',
        '.json': 'application/json', '.xml': 'application/xml',
        '.m3u8': 'application/vnd.apple.mpegurl', '.ts': 'video/mp2t',
    }
    return map[ext.toLowerCase()] || 'application/octet-stream'
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await context.params

        // 验证签名
        const url = new URL(request.url)
        const token = url.searchParams.get('token')
        const expires = url.searchParams.get('expires')
        const pathname = url.pathname

        if (!token || !expires) {
            return NextResponse.json({ error: 'Unauthorized: Missing signature' }, { status: 401 })
        }
        if (Date.now() / 1000 > parseInt(expires)) {
            return NextResponse.json({ error: 'Link expired' }, { status: 410 })
        }

        const signString = `${pathname}:${expires}`
        const validSignature = crypto
            .createHmac('sha256', LOCAL_SECRET)
            .update(signString)
            .digest('hex')

        if (token !== validSignature) {
            return NextResponse.json({ error: 'Forbidden: Invalid signature' }, { status: 403 })
        }

        const key = pathSegments.join('/')
        const ext = path.extname(pathSegments[pathSegments.length - 1])
        const contentType = getMimeType(ext)
        const range = request.headers.get('range')

        const cfg = await getStorageConfig()

        if (cfg.storageType === 'local') {
            // 本地存储：从磁盘读取
            const filePath = path.join(UPLOAD_DIR, ...pathSegments)
            const resolvedPath = path.resolve(filePath)

            if (!resolvedPath.startsWith(path.resolve(UPLOAD_DIR))) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            try { await fs.access(resolvedPath) } catch {
                return NextResponse.json({ error: 'File not found' }, { status: 404 })
            }

            const stat = await fs.stat(resolvedPath)

            if (range) {
                const parts = range.replace(/bytes=/, '').split('-')
                const start = parseInt(parts[0], 10)
                const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1
                const chunkSize = end - start + 1
                const fileBuffer = Buffer.alloc(chunkSize)
                const fh = await fs.open(resolvedPath, 'r')
                await fh.read(fileBuffer, 0, chunkSize, start)
                await fh.close()
                return new NextResponse(fileBuffer, {
                    status: 206,
                    headers: {
                        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': String(chunkSize),
                        'Content-Type': contentType,
                        'Cache-Control': 'private, max-age=3600',
                    },
                })
            }

            const fileBuffer = await fs.readFile(resolvedPath)
            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': String(stat.size),
                    'Cache-Control': 'private, max-age=3600',
                    'Accept-Ranges': 'bytes',
                },
            })
        } else {
            // S3/R2 存储：服务器端代理请求，浏览器无需跨域
            const presignedUrl = await getS3PresignedUrl(key, 3600)

            const fetchHeaders: HeadersInit = {}
            if (range) fetchHeaders['Range'] = range

            const s3Res = await fetch(presignedUrl, { headers: fetchHeaders })

            if (!s3Res.ok && s3Res.status !== 206) {
                console.error('S3 proxy fetch failed:', s3Res.status, key)
                return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
            }

            const resHeaders: Record<string, string> = {
                'Content-Type': s3Res.headers.get('Content-Type') || contentType,
                'Cache-Control': 'private, max-age=3600',
                'Accept-Ranges': 'bytes',
            }
            const cl = s3Res.headers.get('Content-Length')
            if (cl) resHeaders['Content-Length'] = cl
            const cr = s3Res.headers.get('Content-Range')
            if (cr) resHeaders['Content-Range'] = cr

            return new NextResponse(s3Res.body, {
                status: s3Res.status,
                headers: resHeaders,
            })
        }

    } catch (error) {
        console.error('File serve error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
