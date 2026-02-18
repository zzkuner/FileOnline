import { prisma } from '@/lib/db'
import { getConfig, getConfigBool } from '@/lib/config'
import { sendAdminSummary } from '@/lib/email'

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * 生成并发送定期总结报告
 * @param force 是否强制发送（忽略时间间隔检查）
 */
export async function generateAndSendSummary(force: boolean = false) {
    // 检查是否开启功能
    const enabled = await getConfigBool('NOTIFY_ADMIN_WEEKLY_DIGEST', false)
    if (!enabled && !force) {
        return { success: false, message: 'Summary notification disabled' }
    }

    const adminEmail = await getConfig('ADMIN_NOTIFY_EMAIL')
    if (!adminEmail) {
        return { success: false, message: 'Admin email not configured' }
    }

    // 检查上次发送时间 (如果不是强制发送)
    // 检查上次发送时间 (如果不是强制发送)
    if (!force) {
        // 获取配置
        const intervalDays = parseInt(await getConfig('NOTIFY_ADMIN_SUMMARY_INTERVAL_DAYS') || '7') // 默认 7 天
        const configHour = parseInt(await getConfig('NOTIFY_ADMIN_WEEKLY_HOUR') || '9') // 默认 9:00

        const now = new Date()
        const currentHour = now.getHours()

        // 1. 检查是否到了配置的时间点
        if (currentHour < configHour) {
            return { success: false, message: 'Not yet scheduled hour' }
        }

        // 2. 检查距离上次发送的时间
        const lastSentStr = await getConfig('LAST_SUMMARY_SENT_AT')
        if (lastSentStr) {
            const lastSent = new Date(lastSentStr)
            const intervalMs = intervalDays * 24 * 60 * 60 * 1000

            // 允许 1 小时的误差缓冲，防止因为执行时间微小差异导致略小于间隔
            if (Date.now() - lastSent.getTime() < intervalMs - 60 * 1000) {
                return { success: false, message: 'Not yet time to send summary (Interval check)' }
            }

            // 额外检查：确保今天没有发送过（针对 intervalDays=1 的情况，防止一天发多次）
            // 如果上次发送日期是今天，且时间差很小，则不发送。
            // 但上面的 intervalMs check 已经涵盖了主要逻辑。
            // 只要 intervalDays >= 1，那么上面就保证了至少间隔 24 小时。
        }
    }

    // 获取过去 N 天的数据 (使用配置的间隔，或者默认7天)
    const intervalDays = parseInt(await getConfig('NOTIFY_ADMIN_SUMMARY_INTERVAL_DAYS') || '7')
    const rangeDate = new Date()
    rangeDate.setDate(rangeDate.getDate() - intervalDays)

    try {
        const [newUsers, newFiles, totalVisits, activeLinks, totalStorage] = await Promise.all([
            prisma.user.count({ where: { createdAt: { gte: rangeDate } } }),
            prisma.file.count({ where: { createdAt: { gte: rangeDate } } }),
            prisma.visit.count({ where: { startedAt: { gte: rangeDate } } }),
            prisma.link.count({ where: { isActive: true } }),
            (prisma as any).user.aggregate({ _sum: { storageUsed: true } })
        ])

        const storageUsed = formatBytes((totalStorage as any)._sum.storageUsed || 0)
        const period = `${rangeDate.toLocaleDateString()} - ${new Date().toLocaleDateString()}`

        const result = await sendAdminSummary({
            to: adminEmail,
            period,
            stats: {
                newUsers,
                newFiles,
                activeLinks,
                totalVisits,
                storageUsed
            }
        })

        if (result.success) {
            // 更新发送时间
            // update or create config
            const now = new Date().toISOString()
            const existing = await (prisma as any).systemConfig.findUnique({ where: { key: 'LAST_SUMMARY_SENT_AT' } })
            if (existing) {
                await (prisma as any).systemConfig.update({
                    where: { key: 'LAST_SUMMARY_SENT_AT' },
                    data: { value: now }
                })
            } else {
                await (prisma as any).systemConfig.create({
                    data: { key: 'LAST_SUMMARY_SENT_AT', value: now }
                })
            }
            return { success: true, message: 'Summary sent' }
        } else {
            return { success: false, message: `Failed to send email: ${result.error}` }
        }
    } catch (error) {
        console.error('Error generating summary:', error)
        return { success: false, error: 'Internal Error' }
    }
}
