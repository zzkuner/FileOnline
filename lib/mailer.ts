import nodemailer from 'nodemailer'
import { prisma } from '@/lib/db'

// 从数据库 SystemConfig 表读取 SMTP 配置
async function getSmtpConfig() {
    const configs = await prisma.systemConfig.findMany({
        where: {
            key: {
                in: [
                    'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS',
                    'SMTP_FROM', 'SMTP_FROM_NAME', 'SMTP_SECURE'
                ]
            }
        }
    })
    const map: Record<string, string> = {}
    configs.forEach(c => { map[c.key] = c.value })
    return map
}

export async function sendMail(to: string, subject: string, html: string) {
    try {
        const cfg = await getSmtpConfig()

        if (!cfg.SMTP_HOST || !cfg.SMTP_USER || !cfg.SMTP_PASS) {
            console.warn('⚠️ SMTP 未配置，跳过发送邮件:', subject)
            return false
        }

        const transporter = nodemailer.createTransport({
            host: cfg.SMTP_HOST,
            port: parseInt(cfg.SMTP_PORT || '465'),
            secure: cfg.SMTP_SECURE !== 'false',
            auth: {
                user: cfg.SMTP_USER,
                pass: cfg.SMTP_PASS,
            },
        })

        await transporter.sendMail({
            from: `"${cfg.SMTP_FROM_NAME || '阅迹 ViewTrace'}" <${cfg.SMTP_FROM || cfg.SMTP_USER}>`,
            to,
            subject,
            html,
        })

        console.log('✅ 邮件已发送:', to, subject)
        return true
    } catch (error) {
        console.error('❌ 邮件发送失败:', error)
        return false
    }
}

// 预定义邮件模板
export async function sendNotification(userId: string, type: string, data: Record<string, string> = {}) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { notificationSetting: true }
        })
        if (!user) return

        const settings = user.notificationSetting
        const email = settings?.notifyEmail || user.email

        // 检查用户是否开启了对应通知
        const typeMap: Record<string, string> = {
            'view': 'emailOnView',
            'expire': 'emailOnExpire',
            'register': 'emailOnRegister',
            'tier_change': 'emailOnTierChange',
            'tier_expire': 'emailOnTierExpire',
            'file_banned': 'emailOnFileBanned',
        }

        const settingKey = typeMap[type]
        if (settingKey && settings && !(settings as any)[settingKey]) {
            return // 用户关闭了此类通知
        }

        const templates: Record<string, { subject: string; html: string }> = {
            register: {
                subject: '欢迎注册 阅迹 ViewTrace',
                html: `<h2>欢迎使用 阅迹 ViewTrace！</h2><p>您的账号 <strong>${user.email}</strong> 已创建成功。</p><p>赶快上传文件并创建追踪链接吧！</p>`
            },
            tier_change: {
                subject: '会员等级已变更',
                html: `<h2>会员等级变更通知</h2><p>您的账号等级已变更为 <strong>${data.tier || ''}</strong>。</p><p>${data.message || ''}</p>`
            },
            tier_expire: {
                subject: '会员即将到期提醒',
                html: `<h2>会员到期提醒</h2><p>您的 <strong>${data.tier || ''}</strong> 会员将于 <strong>${data.expireDate || ''}</strong> 到期。</p><p>请及时续费以保持服务。</p>`
            },
            file_banned: {
                subject: '文件违规通知',
                html: `<h2>文件违规通知</h2><p>您的文件 <strong>${data.fileName || ''}</strong> 已被标记为不合规。</p><p>原因：${data.reason || '未说明'}</p><p>该文件的所有分享链接已被禁止访问。</p>`
            },
            view: {
                subject: '有人查看了您的文件',
                html: `<h2>新访客通知</h2><p>有人查看了您分享的文件 <strong>${data.fileName || ''}</strong>。</p>`
            },
        }

        const template = templates[type]
        if (!template) return

        await sendMail(email, template.subject, template.html)
    } catch (error) {
        console.error('发送通知失败:', error)
    }
}
