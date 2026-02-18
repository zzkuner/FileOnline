import { prisma } from '@/lib/db'

// 默认等级配额配置（后备值）
const DEFAULT_TIER_LIMITS = {
    FREE: {
        label: '免费版',
        maxFiles: 2,
        maxLinksPerFile: 3,
        maxStorageBytes: 20 * 1024 * 1024, // 20MB
        maxFileSize: 100 * 1024 * 1024, // 100MB
        features: {
            analytics: false,
            hideBranding: false,
            customDomain: false,
            customTheme: false,
        }
    },
    PRO: {
        label: 'Pro',
        maxFiles: 50,
        maxLinksPerFile: Infinity,
        maxStorageBytes: 1024 * 1024 * 1024, // 1GB
        maxFileSize: 1024 * 1024 * 1024, // 1GB
        features: {
            analytics: true,
            hideBranding: true,
            customDomain: false,
            customTheme: false,
        }
    },
    MAX: {
        label: 'Max',
        maxFiles: Infinity,
        maxLinksPerFile: Infinity,
        maxStorageBytes: Infinity,
        maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
        features: {
            analytics: true,
            hideBranding: true,
            customDomain: true,
            customTheme: true,
        }
    }
} as const

export type TierName = keyof typeof DEFAULT_TIER_LIMITS

// 从数据库读取管理员配置的等级限额，回退到默认值
export async function getTierLimits(tier: string) {
    const t = (tier as TierName) || 'FREE'
    const defaults = DEFAULT_TIER_LIMITS[t] || DEFAULT_TIER_LIMITS.FREE

    try {
        const keys = [
            `TIER_${t}_MAX_FILES`,
            `TIER_${t}_MAX_LINKS`,
            `TIER_${t}_MAX_STORAGE_MB`,
            `TIER_${t}_MAX_FILE_SIZE_MB`,
            `TIER_${t}_ANALYTICS`,
            `TIER_${t}_HIDE_BRANDING`,
            `TIER_${t}_CUSTOM_DOMAIN`,
            `TIER_${t}_CUSTOM_THEME`,
        ]

        const configs = await prisma.systemConfig.findMany({
            where: { key: { in: keys } }
        })
        const map: Record<string, string> = {}
        configs.forEach(c => { map[c.key] = c.value })

        const parseNum = (val: string | undefined, fallback: number) => {
            if (!val) return fallback
            const n = parseInt(val)
            return n === -1 ? Infinity : (isNaN(n) ? fallback : n)
        }

        const parseBool = (val: string | undefined, fallback: boolean) => {
            if (val === undefined || val === '') return fallback
            return val === 'true'
        }

        return {
            label: defaults.label,
            maxFiles: parseNum(map[`TIER_${t}_MAX_FILES`], defaults.maxFiles),
            maxLinksPerFile: parseNum(map[`TIER_${t}_MAX_LINKS`], defaults.maxLinksPerFile),
            maxStorageBytes: parseNum(map[`TIER_${t}_MAX_STORAGE_MB`], defaults.maxStorageBytes / (1024 * 1024)) * 1024 * 1024,
            maxFileSize: parseNum(map[`TIER_${t}_MAX_FILE_SIZE_MB`], defaults.maxFileSize / (1024 * 1024)) * 1024 * 1024,
            features: {
                analytics: parseBool(map[`TIER_${t}_ANALYTICS`], defaults.features.analytics),
                hideBranding: parseBool(map[`TIER_${t}_HIDE_BRANDING`], defaults.features.hideBranding),
                customDomain: parseBool(map[`TIER_${t}_CUSTOM_DOMAIN`], defaults.features.customDomain),
                customTheme: parseBool(map[`TIER_${t}_CUSTOM_THEME`], defaults.features.customTheme),
            }
        }
    } catch (error) {
        // 如果数据库不可用，使用默认值
        console.warn('读取等级配置失败，使用默认值:', error)
        return {
            ...defaults,
            maxStorageBytes: defaults.maxStorageBytes === Infinity ? Infinity : defaults.maxStorageBytes,
        }
    }
}

// 同步版本，用于不支持 async 的场景（使用默认值）
export function getTierLimitsSync(tier: string) {
    return DEFAULT_TIER_LIMITS[tier as TierName] || DEFAULT_TIER_LIMITS.FREE
}

export function formatStorageSize(bytes: number | null): string {
    if (bytes === Infinity || bytes === null) return '不限'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

export function formatLimit(n: number | null): string {
    return (n === Infinity || n === null) ? '不限' : n.toString()
}
