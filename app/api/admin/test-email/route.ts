import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: '无权限' }, { status: 403 })
        }

        // 读取请求体中的目标地址
        let targetEmail = ''
        try {
            const body = await request.json()
            targetEmail = body.to || ''
        } catch { }

        // 从 SystemConfig 读取 SMTP 配置
        const configs = await (prisma as any).systemConfig.findMany({
            where: {
                key: {
                    in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SMTP_FROM_NAME', 'SMTP_SECURE']
                }
            }
        })
        const cfg: Record<string, string> = {}
        configs.forEach((c: any) => { cfg[c.key] = c.value })

        if (!cfg.SMTP_HOST || !cfg.SMTP_USER || !cfg.SMTP_PASS) {
            return NextResponse.json({ error: 'SMTP 未配置完整，请先填写 SMTP 服务器、用户名和密码' }, { status: 400 })
        }

        const transporter = nodemailer.createTransport({
            host: cfg.SMTP_HOST,
            port: parseInt(cfg.SMTP_PORT || '465'),
            secure: cfg.SMTP_SECURE !== 'false',
            auth: {
                user: cfg.SMTP_USER,
                pass: cfg.SMTP_PASS,
            },
            connectionTimeout: 10000,
        })

        // 验证连接
        await transporter.verify()

        // 发送测试邮件
        const adminEmail = targetEmail || session.user.email || cfg.SMTP_USER
        await transporter.sendMail({
            from: `"${cfg.SMTP_FROM_NAME || 'InsightLink'}" <${cfg.SMTP_FROM || cfg.SMTP_USER}>`,
            to: adminEmail,
            subject: '📧 InsightLink 邮件测试',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
                    <h2 style="color: #6366f1; margin-bottom: 16px;">✅ 邮件服务配置成功！</h2>
                    <p style="color: #475569;">如果您能收到这封邮件，说明 SMTP 配置正确。</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="color: #94a3b8; font-size: 12px;">
                        服务器: ${cfg.SMTP_HOST}:${cfg.SMTP_PORT || '465'}<br/>
                        发件人: ${cfg.SMTP_FROM || cfg.SMTP_USER}<br/>
                        发送时间: ${new Date().toLocaleString('zh-CN')}
                    </p>
                </div>
            `,
        })

        return NextResponse.json({ message: `测试邮件已发送至 ${adminEmail}` })
    } catch (error: any) {
        console.error('邮件测试失败:', error)
        const msg = error?.message || '未知错误'
        if (msg.includes('ECONNREFUSED')) {
            return NextResponse.json({ error: 'SMTP 服务器连接被拒绝，请检查服务器地址和端口' }, { status: 500 })
        }
        if (msg.includes('auth') || msg.includes('AUTH')) {
            return NextResponse.json({ error: 'SMTP 认证失败，请检查用户名和密码/授权码' }, { status: 500 })
        }
        return NextResponse.json({ error: `邮件测试失败: ${msg}` }, { status: 500 })
    }
}
