
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import ViewerClient from './ViewerClient'
import { getConfig } from '@/lib/config'
import { unstable_cache } from 'next/cache'

interface Props {
    params: Promise<{ slug: string }>
}

// 缓存配置读取 (60秒)
const getCachedConfig = unstable_cache(
    async (key: string, defaultValue: string) => getConfig(key, defaultValue),
    ['system-config'],
    { revalidate: 60 }
)

// 缓存链接信息读取 (60秒)
const getLinkMetadata = unstable_cache(
    async (slug: string) => {
        return await prisma.link.findUnique({
            where: { slug },
            include: {
                file: {
                    select: {
                        originalName: true,
                        isBanned: true,
                        storagePath: true,
                        fileSize: true,
                        fileType: true,
                        mimeType: true,
                        user: {
                            select: {
                                name: true,
                                avatar: true,
                                bio: true,
                                title: true,
                                company: true,
                                website: true,
                                socialLinks: true
                            }
                        }
                    }
                }
            }
        })
    },
    ['link-metadata'],
    { revalidate: 60 }
)

// 1. 动态生成 Metadata (SEO/社交分享卡片)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params

    // 使用缓存获取数据
    const [linkData, siteName] = await Promise.all([
        getLinkMetadata(slug),
        getCachedConfig('SITE_NAME', 'InsightLink')
    ])
    const link = linkData as any

    // 处理 404
    if (!link) {
        return {
            title: `链接不存在 - ${siteName}`,
            description: '该链接无效或已被删除。'
        }
    }

    // 处理 封禁
    if (link.isBanned || link.file.isBanned) {
        return {
            title: `内容不可用 - ${siteName}`,
            description: '该内容已被管理员屏蔽。'
        }
    }

    // 处理 过期
    if (link.expiresAt && new Date() > link.expiresAt) {
        return {
            title: `链接已过期 - ${siteName}`,
            description: '该分享链接已超过有效期。'
        }
    }

    // 处理 密码保护
    if (link.password) {
        return {
            title: `受密码保护的内容 - ${siteName}`,
            description: '访问该内容需要输入密码验证。'
        }
    }

    // 正常显示
    return {
        title: `${link.displayTitle || link.file.originalName} - ${siteName}`,
        description: link.description || `查看文件: ${link.file.originalName}`,
        openGraph: {
            title: link.displayTitle || link.file.originalName,
            description: link.description || `在 ${siteName} 上查看此文件`,
            images: link.coverImage ? [link.coverImage] : [],
        }
    }
}

// 2. 页面组件 (Server Component)
export default async function ViewerPage() {
    // 这里我们直接渲染 Client Component
    // 实际的数据获取仍然由 ViewerClient 在客户端进行 (保持现有的密码验证逻辑)
    // 这样既有了 SEO Metadata，又不用重写复杂的客户端逻辑
    return <ViewerClient />
}
