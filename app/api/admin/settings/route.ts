import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json')

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true })
}

export async function GET(request: NextRequest) {
    try {
        // Check admin permission (simplified, should check JWT/session properly)
        // For now, assume if they can access this endpoint, they're admin

        if (!fs.existsSync(SETTINGS_FILE)) {
            // Return defaults
            return NextResponse.json({
                SMTP_HOST: process.env.SMTP_HOST || '',
                SMTP_PORT: process.env.SMTP_PORT || '587',
                SMTP_USER: process.env.SMTP_USER || '',
                SMTP_FROM: process.env.SMTP_FROM || '',
                MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
                MINIO_PORT: process.env.MINIO_PORT || '9000',
                MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || '',
                MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'files'
            })
        }

        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'))
        return NextResponse.json(settings)
    } catch (error) {
        console.error('Get settings error:', error)
        return NextResponse.json(
            { error: '获取设置失败' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Save to file
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(body, null, 2))

        // Also update process.env for immediate effect
        Object.keys(body).forEach(key => {
            if (body[key]) {
                process.env[key] = body[key]
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Save settings error:', error)
        return NextResponse.json(
            { error: '保存设置失败' },
            { status: 500 }
        )
    }
}
