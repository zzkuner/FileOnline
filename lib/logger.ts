import { prisma } from '@/lib/db'

type LogLevel = 'INFO' | 'WARN' | 'ERROR'

export async function logAction(
    action: string,
    detail?: string,
    options?: { userId?: string; ip?: string; level?: LogLevel }
) {
    try {
        await prisma.systemLog.create({
            data: {
                level: options?.level || 'INFO',
                action,
                detail,
                userId: options?.userId,
                ip: options?.ip
            }
        })
    } catch (e) {
        console.error('Failed to write system log:', e)
    }
}
