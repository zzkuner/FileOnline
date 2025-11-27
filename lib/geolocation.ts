/**
 * IP地理位置解析工具
 * 使用 ip-api.com 免费API
 */

interface GeoLocation {
    country: string
    city: string
    region: string
    timezone: string
    lat: number
    lon: number
}

export async function getGeoLocation(ip: string): Promise<string | null> {
    try {
        // 跳过本地地址
        if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
            return '本地访问'
        }

        // 调用 ip-api.com
        const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN&fields=status,country,city,regionName`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })

        if (!response.ok) {
            console.warn('IP地理位置API请求失败:', response.status)
            return null
        }

        const data = await response.json()

        if (data.status !== 'success') {
            console.warn('IP地理位置解析失败:', data)
            return null
        }

        // 格式化地理位置: 国家 - 省份 - 城市
        const parts = []
        if (data.country) parts.push(data.country)
        if (data.regionName && data.regionName !== data.city) parts.push(data.regionName)
        if (data.city) parts.push(data.city)

        return parts.length > 0 ? parts.join(' - ') : null

    } catch (error) {
        console.error('获取地理位置失败:', error)
        return null
    }
}

export async function getDetailedGeoLocation(ip: string): Promise<GeoLocation | null> {
    try {
        if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
            return null
        }

        const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })

        if (!response.ok) return null

        const data = await response.json()

        if (data.status !== 'success') return null

        return {
            country: data.country || '',
            city: data.city || '',
            region: data.regionName || '',
            timezone: data.timezone || '',
            lat: data.lat || 0,
            lon: data.lon || 0
        }

    } catch (error) {
        console.error('获取详细地理位置失败:', error)
        return null
    }
}
