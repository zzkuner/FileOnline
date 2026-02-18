import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToStorage, getFileUrl } from '@/lib/storage'
import { nanoid } from 'nanoid'
import path from 'path'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            )
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Max size is 2MB.' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = path.extname(file.name)
        const key = `avatars/${session.user.id}/${nanoid()}-${Date.now()}${ext}`

        // Upload to storage
        await uploadFileToStorage(buffer, key, file.type)

        // Get URL
        const url = await getFileUrl(key)

        return NextResponse.json({ url })
    } catch (error) {
        console.error('Avatar upload error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
