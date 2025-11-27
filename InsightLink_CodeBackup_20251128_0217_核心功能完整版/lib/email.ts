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

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
    // If no SMTP config, log to console (Dev Mode)
    if (!process.env.SMTP_HOST) {
        console.log('📧 [Mock Email] -----------------------------')
        console.log(`To: ${to}`)
        console.log(`Subject: ${subject}`)
        console.log(`Text: ${text}`)
        console.log('---------------------------------------------')
        return true
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
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}
