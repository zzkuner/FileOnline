import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    try {
        const qrCode = await QRCode.toDataURL(url)
        return NextResponse.json({ qrCode })
    } catch (error) {
        console.error('QR Code generation error:', error)
        return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
    }
}
