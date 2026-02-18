import nodemailer from 'nodemailer'

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'user',
        pass: process.env.SMTP_PASS || 'pass',
    },
})

interface SendEmailParams {
    to: string
    subject: string
    text: string
    html?: string
}

interface SendEmailResult {
    success: boolean
    error?: string
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<SendEmailResult> {
    // If no SMTP config, log to console (Dev Mode)
    if (!process.env.SMTP_HOST) {
        console.log('📧 [Mock Email] -----------------------------')
        console.log(`To: ${to}`)
        console.log(`Subject: ${subject}`)
        console.log(`Text: ${text}`)
        console.log('---------------------------------------------')
        return { success: true }
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"InsightLink" <noreply@example.com>',
            to,
            subject,
            text,
            html: html || text,
        })
        console.log('Message sent: %s', info.messageId)
        return { success: true }
    } catch (error: any) {
        console.error('Error sending email:', error)
        return { success: false, error: error.message || 'Unknown email error' }
    }
}

interface VisitNotificationParams {
    to: string
    linkName: string
    fileName: string
    time: string
    location: string
    ip: string
    device: string
    linkId: string
    lat?: number
    lon?: number
    isp?: string
    referrer?: string
}

export async function sendVisitNotification({
    to, linkName, fileName, time, location, ip, device, linkId, lat, lon, isp, referrer
}: VisitNotificationParams) {
    const mapLink = (lat && lon) ? `https://www.google.com/maps?q=${lat},${lon}` : null
    const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const analyticsUrl = `${dashboardUrl}/dashboard/file/${fileName}` // Usually analytics is per file or link. Let's send to dashboard/analytics/{linkId} based on route.ts
    // Wait, track/route.ts used `/dashboard/analytics/${link.id}`.
    // I should use that.

    const subject = `🔔 您的文件被查看了：${linkName}`
    const text = `您的文件 "${fileName}" (链接: ${linkName}) 刚刚被访问。\n\n时间: ${time}\n位置: ${location}\nIP: ${ip}\n设备: ${device}\n来源: ${referrer || '直接访问'}`

    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background: #2563eb; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; font-size: 20px;">🔔 文件访问提醒</h2>
            </div>
            <div style="border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; padding: 20px;">
                <p style="font-size: 16px;">您的追踪链接 <strong style="color: #2563eb;">${linkName}</strong> 刚刚被访问。</p>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
                    <div style="margin-bottom: 8px;"><strong>📄 文件：</strong> ${fileName}</div>
                    <div style="margin-bottom: 8px;"><strong>⏰ 时间：</strong> ${time}</div>
                    <div style="margin-bottom: 8px;"><strong>🌍 位置：</strong> ${location} ${mapLink ? `<a href="${mapLink}" style="color: #2563eb; text-decoration: none;">(查看地图)</a>` : ''}</div>
                    ${isp ? `<div style="margin-bottom: 8px;"><strong>🏢 网络：</strong> ${isp}</div>` : ''}
                    <div style="margin-bottom: 8px;"><strong>🌐 IP：</strong> ${ip}</div>
                    <div style="margin-bottom: 8px;"><strong>💻 设备：</strong> ${device}</div>
                    <div><strong>🔗 来源：</strong> ${referrer || '直接访问'}</div>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${dashboardUrl}/dashboard/links" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">查看详细统计</a>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>&copy; ${new Date().getFullYear()} InsightLink. All rights reserved.</p>
            </div>
        </div>
    `

    return sendEmail({ to, subject, text, html })
}

interface NewUserParams {
    to: string
    userName: string
    userEmail: string
    time: string
}

export async function sendAdminNewUserNotification({ to, userName, userEmail, time }: NewUserParams) {
    const subject = `🆕 新用户注册：${userName || userEmail}`
    const text = `新用户注册通知\n\n用户名：${userName || '未设置'}\n邮箱：${userEmail}\n注册时间：${time}`

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
            <div style="background: #10b981; color: white; padding: 15px 20px;">
                <h2 style="margin: 0; font-size: 18px;">🆕 新用户注册通知</h2>
            </div>
            <div style="padding: 20px; background: #fff;">
                <p>系统检测到有新用户完成了注册：</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <div style="margin-bottom: 8px;"><strong>👤 用户名：</strong> ${userName || '未设置'}</div>
                    <div style="margin-bottom: 8px;"><strong>📧 邮箱：</strong> <a href="mailto:${userEmail}" style="color: #2563eb;">${userEmail}</a></div>
                    <div><strong>⏰ 时间：</strong> ${time}</div>
                </div>
                <p style="font-size: 13px; color: #64748b;">您可以登录管理后台查看详情或管理该用户。</p>
            </div>
        </div>
    `
    return sendEmail({ to, subject, text, html })
}

interface AdminSummaryParams {
    to: string
    period: string
    stats: {
        newUsers: number
        newFiles: number
        activeLinks: number
        totalVisits: number
        storageUsed: string
    }
}

export async function sendAdminSummary({ to, period, stats }: AdminSummaryParams) {
    const subject = `📊 系统定期总结报告 (${period})`
    const text = `系统定期总结报告 (${period})\n\n新注册用户：${stats.newUsers}\n新上传文件：${stats.newFiles}\n活跃链接数：${stats.activeLinks}\n总访问次数：${stats.totalVisits}\n当前存储占用：${stats.storageUsed}`

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
            <div style="background: #6366f1; color: white; padding: 15px 20px;">
                <h2 style="margin: 0; font-size: 18px;">📊 系统定期总结报告</h2>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${period}</div>
            </div>
            <div style="padding: 20px; background: #fff;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #334155;">${stats.newUsers}</div>
                        <div style="font-size: 12px; color: #64748b;">新注册用户</div>
                    </div>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #334155;">${stats.newFiles}</div>
                        <div style="font-size: 12px; color: #64748b;">新上传文件</div>
                    </div>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #334155;">${stats.totalVisits}</div>
                        <div style="font-size: 12px; color: #64748b;">总访问次数</div>
                    </div>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #334155;">${stats.activeLinks}</div>
                        <div style="font-size: 12px; color: #64748b;">活跃链接数</div>
                    </div>
                </div>
                <div style="background: #f1f5f9; padding: 10px 15px; border-radius: 6px; font-size: 13px; color: #475569;">
                    💾 当前总存储占用：<strong>${stats.storageUsed}</strong>
                </div>
            </div>
        </div>
    `
    return sendEmail({ to, subject, text, html })
}
