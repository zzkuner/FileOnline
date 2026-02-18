import { UAParser } from 'ua-parser-js'

/**
 * 解析 User Agent
 */
export function parseUserAgent(userAgent: string) {
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    return {
        browser: result.browser.name || 'Unknown',
        os: result.os.name || 'Unknown',
        deviceType: result.device.type || 'Desktop'
    }
}

/**
 * 获取访客 IP（从请求头中提取）
 */
export function getClientIP(request: Request): string | null {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    if (realIp) {
        return realIp
    }

    return null
}

/**
 * IP 地理位置解析
 * 使用 ip-api.com (免费版，仅限非商业用途，HTTP)
 */
export interface GeoLocation {
    location: string
    lat?: number
    lon?: number
    isp?: string
}

export async function getLocationFromIP(ip: string | null): Promise<GeoLocation> {
    const unknown = { location: '未知位置' }
    if (!ip || ip === '::1' || ip === '127.0.0.1') return { location: '本地访问 (Localhost)' }

    try {
        const res = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`)
        if (res.ok) {
            const data = await res.json()
            if (data.status === 'success') {
                return {
                    location: `${data.country} ${data.regionName} ${data.city}`,
                    lat: data.lat,
                    lon: data.lon,
                    isp: data.isp
                }
            }
        }
    } catch (error) {
        console.error('GeoIP fetch failed:', error)
    }

    return unknown
}
