import { prisma } from '@/lib/db'

/**
 * 从 SystemConfig 数据库读取配置值
 * 优先使用 DB，fallback 到 process.env，最后使用默认值
 */
export async function getConfig(key: string, defaultValue: string = ''): Promise<string> {
    try {
        const config = await (prisma as any).systemConfig.findUnique({ where: { key } })
        if (config?.value !== undefined && config.value !== '') return config.value
    } catch (e) {
        // DB 不可用时 fallback
    }
    return process.env[key] || defaultValue
}

/**
 * 批量读取多个配置
 */
export async function getConfigs(keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    try {
        const configs = await (prisma as any).systemConfig.findMany({
            where: { key: { in: keys } }
        })
        configs.forEach((c: any) => { result[c.key] = c.value })
    } catch (e) {
        // DB 不可用
    }
    // fallback 到 env
    keys.forEach(key => {
        if (!result[key] && process.env[key]) {
            result[key] = process.env[key]!
        }
    })
    return result
}

/**
 * 布尔型配置读取（toggle 开关等）
 */
export async function getConfigBool(key: string, defaultValue: boolean = false): Promise<boolean> {
    const val = await getConfig(key)
    if (val === '') return defaultValue
    return val === 'true'
}

/**
 * 启动时将 .env 中的关键配置项写入 SystemConfig（仅当 DB 中尚未设置时）
 * 这样管理员在后台修改配置后会优先使用 DB 值
 */
export async function seedConfigFromEnv() {
    // 只同步 STORAGE_TYPE 和 SMTP 配置
    // S3 凭证不自动同步，避免 S3/R2 配置互相污染
    const envMap: Record<string, string> = {
        'STORAGE_TYPE': 'STORAGE_TYPE',
        // SMTP
        'SMTP_HOST': 'SMTP_HOST',
        'SMTP_PORT': 'SMTP_PORT',
        'SMTP_USER': 'SMTP_USER',
        'SMTP_PASS': 'SMTP_PASS',
        'SMTP_FROM': 'SMTP_FROM',
        'SMTP_FROM_NAME': 'SMTP_FROM_NAME',
        'SMTP_SECURE': 'SMTP_SECURE',
    }

    let seeded = 0
    for (const [envKey, configKey] of Object.entries(envMap)) {
        const envValue = process.env[envKey]
        if (!envValue) continue

        try {
            const existing = await (prisma as any).systemConfig.findUnique({ where: { key: configKey } })
            if (!existing) {
                // S3_ENDPOINT 需要加 https:// 前缀
                let value = envValue
                if (envKey === 'MINIO_ENDPOINT' && !value.startsWith('http')) {
                    value = `https://${value}`
                }
                await (prisma as any).systemConfig.create({
                    data: { key: configKey, value }
                })
                seeded++
            }
        } catch (e) {
            // ignore individual failures
        }
    }

    if (seeded > 0) {
        console.log(`✅ Seeded ${seeded} config values from .env into SystemConfig`)
    }
}
