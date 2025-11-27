/**
 * User Agent 解析工具
 * 识别设备类型、操作系统、浏览器等信息
 */

export interface ParsedUserAgent {
    deviceType: string      // Desktop, Mobile, Tablet
    deviceName: string      // iPhone, iPad, Android, Windows PC, Mac等
    os: string             // iOS 15.0, Android 12, Windows 11等
    browser: string        // Chrome 120, Safari 17等
    icon: string           // 设备图标
}

export function parseUserAgent(ua: string | null): ParsedUserAgent {
    if (!ua) {
        return {
            deviceType: '未知',
            deviceName: '未知设备',
            os: '未知',
            browser: '未知',
            icon: '💻'
        }
    }

    let deviceType = 'Desktop'
    let deviceName = '未知设备'
    let os = '未知'
    let browser = '未知'
    let icon = '💻'

    // 检测设备类型和名称
    if (/iPhone/.test(ua)) {
        deviceType = 'Mobile'
        deviceName = 'iPhone'
        icon = '📱'
    } else if (/iPad/.test(ua)) {
        deviceType = 'Tablet'
        deviceName = 'iPad'
        icon = '📱'
    } else if (/Android/.test(ua)) {
        if (/Mobile/.test(ua)) {
            deviceType = 'Mobile'
            deviceName = 'Android 手机'
            icon = '📱'
        } else {
            deviceType = 'Tablet'
            deviceName = 'Android 平板'
            icon = '📱'
        }
    } else if (/Windows Phone/.test(ua)) {
        deviceType = 'Mobile'
        deviceName = 'Windows Phone'
        icon = '📱'
    } else if (/Mac/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua)) {
        deviceType = 'Desktop'
        deviceName = 'Mac'
        icon = '🖥️'
    } else if (/Windows/.test(ua)) {
        deviceType = 'Desktop'
        deviceName = 'Windows PC'
        icon = '💻'
    } else if (/Linux/.test(ua)) {
        deviceType = 'Desktop'
        deviceName = 'Linux PC'
        icon = '💻'
    } else if (/Mac/.test(ua)) {
        deviceType = 'Desktop'
        deviceName = 'Mac'
        icon = '🖥️'
    }

    // 检测操作系统
    if (/iPhone OS (\d+)_(\d+)/.test(ua)) {
        const match = ua.match(/iPhone OS (\d+)_(\d+)/)
        os = `iOS ${match![1]}.${match![2]}`
    } else if (/iPad.*OS (\d+)_(\d+)/.test(ua)) {
        const match = ua.match(/OS (\d+)_(\d+)/)
        os = `iPadOS ${match![1]}.${match![2]}`
    } else if (/Android (\d+\.?\d*)/.test(ua)) {
        const match = ua.match(/Android (\d+\.?\d*)/)
        os = `Android ${match![1]}`
    } else if (/Windows NT (\d+\.\d+)/.test(ua)) {
        const match = ua.match(/Windows NT (\d+\.\d+)/)
        const version = match![1]
        const winVersionMap: Record<string, string> = {
            '10.0': 'Windows 10/11',
            '6.3': 'Windows 8.1',
            '6.2': 'Windows 8',
            '6.1': 'Windows 7',
            '6.0': 'Windows Vista'
        }
        os = winVersionMap[version] || `Windows NT ${version}`
    } else if (/Mac OS X (\d+)[._](\d+)/.test(ua)) {
        const match = ua.match(/Mac OS X (\d+)[._](\d+)/)
        os = `macOS ${match![1]}.${match![2]}`
    } else if (/Linux/.test(ua)) {
        os = 'Linux'
    }

    // 检测浏览器
    if (/Edg\/(\d+)/.test(ua)) {
        const match = ua.match(/Edg\/(\d+)/)
        browser = `Edge ${match![1]}`
    } else if (/Chrome\/(\d+)/.test(ua) && !/Edg/.test(ua)) {
        const match = ua.match(/Chrome\/(\d+)/)
        browser = `Chrome ${match![1]}`
    } else if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) {
        const match = ua.match(/Version\/(\d+)/)
        browser = match ? `Safari ${match[1]}` : 'Safari'
    } else if (/Firefox\/(\d+)/.test(ua)) {
        const match = ua.match(/Firefox\/(\d+)/)
        browser = `Firefox ${match![1]}`
    } else if (/MSIE (\d+)/.test(ua) || /Trident.*rv:(\d+)/.test(ua)) {
        browser = 'IE'
    }

    return {
        deviceType,
        deviceName,
        os,
        browser,
        icon
    }
}

/**
 * 获取简短的设备描述
 */
export function getDeviceDescription(ua: string | null): string {
    const parsed = parseUserAgent(ua)
    return `${parsed.icon} ${parsed.deviceName}`
}

/**
 * 获取完整的设备信息描述
 */
export function getFullDeviceInfo(ua: string | null): string {
    const parsed = parseUserAgent(ua)
    return `${parsed.deviceName} (${parsed.os}) - ${parsed.browser}`
}
