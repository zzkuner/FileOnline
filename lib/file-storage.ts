import fs from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

/**
 * 确保上传目录存在
 */
export async function ensureUploadDir() {
    try {
        await fs.access(UPLOAD_DIR)
    } catch {
        await fs.mkdir(UPLOAD_DIR, { recursive: true })
    }
}

/**
 * 保存上传的文件
 */
export async function saveFile(file: File): Promise<{ path: string; size: number }> {
    await ensureUploadDir()

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = path.extname(file.name)
    const filename = `${nanoid()}-${Date.now()}${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    await fs.writeFile(filepath, buffer)

    return {
        path: `/uploads/${filename}`,
        size: buffer.length
    }
}

/**
 * 删除文件
 */
export async function deleteFile(filepath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filepath)
    try {
        await fs.unlink(fullPath)
    } catch (error) {
        console.error('Failed to delete file:', error)
    }
}

/**
 * 获取文件类型
 */
export function getFileType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF'
    if (mimeType.includes('video')) return 'VIDEO'
    if (mimeType.includes('image')) return 'IMAGE'
    if (mimeType.includes('markdown') || mimeType.includes('text/markdown')) return 'MARKDOWN'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PPT'
    if (mimeType.includes('text/plain')) return 'TEXT'
    return 'OTHER'
}
