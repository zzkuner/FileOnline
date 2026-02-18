'use client'

import { useState, useEffect } from 'react'

interface SiteConfig {
    siteName: string
    siteUrl: string
    siteSlogan: string
    siteDescription: string
    footerText: string
    icpNumber: string
    icpNumberEnabled: boolean
    registrationEnabled: boolean
    contactEmail: string
    contactEmailEnabled: boolean
    contactWechat: string
    contactWechatEnabled: boolean
    contactQQ: string
    contactQQEnabled: boolean
    contactSupport: string
}

const defaultConfig: SiteConfig = {
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
    contactSupport: '',
}

// 全局缓存，避免每个组件都请求
let cachedConfig: SiteConfig | null = null
let fetchPromise: Promise<SiteConfig> | null = null

async function fetchSiteConfig(): Promise<SiteConfig> {
    try {
        const res = await fetch('/api/site-config')
        if (res.ok) {
            const data = await res.json()
            cachedConfig = data
            return data
        }
    } catch (e) { }
    return defaultConfig
}

export function useSiteConfig() {
    const [config, setConfig] = useState<SiteConfig>(cachedConfig || defaultConfig)

    useEffect(() => {
        if (cachedConfig) {
            setConfig(cachedConfig)
            return
        }

        if (!fetchPromise) {
            fetchPromise = fetchSiteConfig()
        }

        fetchPromise.then(cfg => {
            setConfig(cfg)
        })
    }, [])

    return config
}
