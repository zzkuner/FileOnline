'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, Building, Globe, MessageSquare, Save, Loader2, Phone, Mail, AtSign } from 'lucide-react'

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        bio: '',
        title: '',
        company: '',
        website: '',
        socialLinks: {
            contactEmail: '',
            phone: '',
            wechat: '',
            qq: '',
            weibo: '',
            linkedin: '',
            twitter: '',
            github: ''
        }
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
            return
        }

        if (status === 'authenticated') {
            loadProfile()
        }
    }, [status, router])

    const loadProfile = async () => {
        try {
            const res = await fetch('/api/user/profile')
            if (res.ok) {
                const data = await res.json()
                const { user } = data
                const parsed = user.socialLinks ? JSON.parse(user.socialLinks) : {}
                setFormData({
                    name: user.name || '',
                    avatar: user.avatar || '',
                    bio: user.bio || '',
                    title: user.title || '',
                    company: user.company || '',
                    website: user.website || '',
                    socialLinks: {
                        contactEmail: parsed.contactEmail || '',
                        phone: parsed.phone || '',
                        wechat: parsed.wechat || '',
                        qq: parsed.qq || '',
                        weibo: parsed.weibo || '',
                        linkedin: parsed.linkedin || '',
                        twitter: parsed.twitter || '',
                        github: parsed.github || ''
                    }
                })
            }
        } catch (error) {
            console.error('Failed to load profile:', error)
            toast.error('加载个人资料失败')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                throw new Error('Failed to update profile')
            }

            toast.success('个人资料已更新')
            router.refresh()
        } catch (error) {
            console.error('Update profile error:', error)
            toast.error('更新失败，请重试')
        } finally {
            setSaving(false)
        }
    }

    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">个人资料</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    设置您的公开资料，这些信息可在分享链接时展示给访问者。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本信息 */}
                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl p-6 space-y-5 border border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
                        <User className="w-5 h-5 text-indigo-500" /> 基本信息
                    </h2>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1.5">头像链接</label>
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-indigo-400" />
                                    )}
                                </div>
                                <input
                                    type="url"
                                    value={formData.avatar}
                                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                    className={`flex-1 ${inputClass}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">显示名称</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="您的名字"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">职位 / 头衔</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="例如：产品经理"
                                className={inputClass}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1.5">个人简介</label>
                            <textarea
                                rows={3}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="介绍一下你自己..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                    </div>
                </div>

                {/* 职业信息 */}
                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl p-6 space-y-5 border border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
                        <Building className="w-5 h-5 text-indigo-500" /> 职业信息
                    </h2>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">公司 / 组织</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="公司名称"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">个人网站</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 联系方式 */}
                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl p-6 space-y-5 border border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
                        <Phone className="w-5 h-5 text-indigo-500" /> 联系方式
                    </h2>
                    <p className="text-sm text-slate-500 -mt-2">
                        这些信息可在分享链接中展示，帮助访问者联系您。
                    </p>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">联系邮箱</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={formData.socialLinks.contactEmail}
                                    onChange={e => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, contactEmail: e.target.value }
                                    })}
                                    placeholder="your@email.com"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">手机号码</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    value={formData.socialLinks.phone}
                                    onChange={e => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, phone: e.target.value }
                                    })}
                                    placeholder="13800138000"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">微信号</label>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.socialLinks.wechat}
                                    onChange={e => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, wechat: e.target.value }
                                    })}
                                    placeholder="微信号"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">QQ</label>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.socialLinks.qq}
                                    onChange={e => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, qq: e.target.value }
                                    })}
                                    placeholder="QQ号"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">微博</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.socialLinks.weibo}
                                    onChange={e => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, weibo: e.target.value }
                                    })}
                                    placeholder="微博昵称或链接"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 社交账号 */}
                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl p-6 space-y-5 border border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
                        <Globe className="w-5 h-5 text-indigo-500" /> 社交账号
                    </h2>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">LinkedIn</label>
                            <input
                                type="text"
                                value={formData.socialLinks.linkedin}
                                onChange={e => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                                })}
                                placeholder="LinkedIn 个人主页链接"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Twitter / X</label>
                            <input
                                type="text"
                                value={formData.socialLinks.twitter}
                                onChange={e => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                                })}
                                placeholder="@username"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">GitHub</label>
                            <input
                                type="text"
                                value={formData.socialLinks.github}
                                onChange={e => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, github: e.target.value }
                                })}
                                placeholder="GitHub 用户名"
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                保存中...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                保存更改
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
