import { prisma } from '@/lib/db'
import { formatBytes } from '@/lib/utils'
import { getTierLimits } from '@/lib/tier-config'

interface QuotaCheckResult {
    allowed: boolean
    reason?: string
    current?: number
    limit?: number
}

/**
 * 检查用户是否可以上传新文件
 */
export async function checkFileUploadQuota(userId: string): Promise<QuotaCheckResult> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, tierExpiresAt: true, isBlocked: true }
    })

    if (!user) return { allowed: false, reason: '用户不存在' }
    if (user.isBlocked) return { allowed: false, reason: '账户已被封禁' }

    // 检查等级是否过期
    const effectiveTier = getEffectiveTier(user.tier, user.tierExpiresAt)
    const limits = await getTierLimits(effectiveTier)

    const fileCount = await prisma.file.count({ where: { userId } })

    if (fileCount >= limits.maxFiles) {
        return {
            allowed: false,
            reason: `${limits.label}最多上传 ${limits.maxFiles} 个文件，当前已有 ${fileCount} 个`,
            current: fileCount,
            limit: limits.maxFiles
        }
    }

    return { allowed: true }
}

/**
 * 检查用户存储空间
 */
export async function checkStorageQuota(userId: string, additionalBytes: number): Promise<QuotaCheckResult> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, tierExpiresAt: true, storageUsed: true }
    })

    if (!user) return { allowed: false, reason: '用户不存在' }

    const effectiveTier = getEffectiveTier(user.tier, user.tierExpiresAt)
    const limits = await getTierLimits(effectiveTier)

    if (limits.maxStorageBytes === Infinity) return { allowed: true }

    const newTotal = user.storageUsed + additionalBytes

    if (newTotal > limits.maxStorageBytes) {
        return {
            allowed: false,
            reason: `存储空间不足。当前已用 ${formatBytes(user.storageUsed)}，上限 ${formatBytes(limits.maxStorageBytes)}`,
            current: user.storageUsed,
            limit: limits.maxStorageBytes
        }
    }

    return { allowed: true }
}

/**
 * 检查单个文件大小是否超限
 */
export async function checkFileSizeLimit(userId: string, fileSize: number): Promise<QuotaCheckResult> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, tierExpiresAt: true }
    })

    if (!user) return { allowed: false, reason: '用户不存在' }

    const effectiveTier = getEffectiveTier(user.tier, user.tierExpiresAt)
    const limits = await getTierLimits(effectiveTier)

    if (limits.maxFileSize === Infinity) return { allowed: true }

    if (fileSize > limits.maxFileSize) {
        return {
            allowed: false,
            reason: `单文件大小超限。当前等级最大允许 ${formatBytes(limits.maxFileSize)}，上传文件大小 ${formatBytes(fileSize)}`,
            current: fileSize,
            limit: limits.maxFileSize
        }
    }

    return { allowed: true }
}

/**
 * 检查用户是否可以为某文件创建新链接
 */
export async function checkLinkQuota(userId: string, fileId: string): Promise<QuotaCheckResult> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, tierExpiresAt: true }
    })

    if (!user) return { allowed: false, reason: '用户不存在' }

    const effectiveTier = getEffectiveTier(user.tier, user.tierExpiresAt)
    const limits = await getTierLimits(effectiveTier)

    if (limits.maxLinksPerFile === Infinity) return { allowed: true }

    const linkCount = await prisma.link.count({ where: { fileId } })

    if (linkCount >= limits.maxLinksPerFile) {
        return {
            allowed: false,
            reason: `${limits.label}每个文件最多 ${limits.maxLinksPerFile} 个链接，当前已有 ${linkCount} 个`,
            current: linkCount,
            limit: limits.maxLinksPerFile
        }
    }

    return { allowed: true }
}

/**
 * 获取有效等级（考虑过期）
 */
export function getEffectiveTier(tier: string, expiresAt: Date | null): string {
    if (tier === 'FREE') return 'FREE'
    if (!expiresAt) return tier // 永久会员
    if (new Date() > expiresAt) return 'FREE' // 已过期
    return tier
}



/**
 * 检查用户是否有权隐藏品牌
 */
export async function checkBrandingPrivilege(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, tierExpiresAt: true }
    })

    if (!user) return false

    const effectiveTier = getEffectiveTier(user.tier, user.tierExpiresAt)
    const limits = await getTierLimits(effectiveTier)

    return limits.features.hideBranding
}
