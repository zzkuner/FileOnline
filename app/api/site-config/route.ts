import { NextResponse } from 'next/server'
import { getConfigs } from '@/lib/config'

// 公开 API：返回非敏感的站点配置（无需登录）
// 用于前端页面动态显示网站名称、描述等
export async function GET() {
    try {
        const cfg = await getConfigs([
            'SITE_NAME', 'SITE_URL', 'SITE_SLOGAN', 'SITE_DESCRIPTION',
            'FOOTER_TEXT', 'ICP_NUMBER', 'ICP_NUMBER_ENABLED', 'REGISTRATION_ENABLED',
            'CONTACT_EMAIL', 'CONTACT_EMAIL_ENABLED',
            'CONTACT_WECHAT', 'CONTACT_WECHAT_ENABLED',
            'CONTACT_QQ', 'CONTACT_QQ_ENABLED',
        ])

        return NextResponse.json({
            siteName: cfg.SITE_NAME || 'InsightLink',
            siteUrl: cfg.SITE_URL || '',
            siteSlogan: cfg.SITE_SLOGAN || '让本地文件拥有"在线生命"',
            siteDescription: cfg.SITE_DESCRIPTION || '简单拖拽，本地文件秒变在线直链。实时追踪访客行为，让每一次分享都心中有数。',
            footerText: cfg.FOOTER_TEXT || '',
            icpNumber: cfg.ICP_NUMBER || '',
            icpNumberEnabled: cfg.ICP_NUMBER_ENABLED !== 'false',
            registrationEnabled: cfg.REGISTRATION_ENABLED !== 'false',
            contactEmail: cfg.CONTACT_EMAIL || '',
            contactEmailEnabled: cfg.CONTACT_EMAIL_ENABLED === 'true',
            contactWechat: cfg.CONTACT_WECHAT || '',
            contactWechatEnabled: cfg.CONTACT_WECHAT_ENABLED === 'true',
            contactQQ: cfg.CONTACT_QQ || '',
            contactQQEnabled: cfg.CONTACT_QQ_ENABLED === 'true',
        })
    } catch (error) {
        return NextResponse.json({
            siteName: 'InsightLink',
            siteUrl: '',
            siteSlogan: '让本地文件拥有"在线生命"',
            siteDescription: '简单拖拽，本地文件秒变在线直链。实时追踪访客行为，让每一次分享都心中有数。',
            footerText: '',
            icpNumber: '',
            icpNumberEnabled: true,
            registrationEnabled: true,
            contactEmail: '',
            contactEmailEnabled: false,
            contactWechat: '',
            contactWechatEnabled: false,
            contactQQ: '',
            contactQQEnabled: false,
        })
    }
}
