'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { ArrowRight, Upload, Shield, Zap, Globe, Github, Menu, X, Link2, Eye, BarChart3, Bell, Lock, Clock, FolderOpen, LogOut } from 'lucide-react'
import { useSiteConfig } from '@/hooks/use-site-config'
import { UploadModal } from '@/components/UploadModal'

export default function LandingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { siteName, siteDescription, footerText, icpNumber, icpNumberEnabled, siteSlogan } = useSiteConfig()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useState<HTMLInputElement | null>(null)[0]

  const handleUploadSuccess = () => {
    // 上传成功后跳转到Dashboard
    router.push('/dashboard')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && session?.user?.id) {
      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    if (!session?.user?.id) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', session.user.id)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      toast.success('文件上传成功！', {
        description: `${file.name} 已就绪`
      })

      // 上传成功后可以选择跳转到Dashboard或刷新
      setTimeout(() => router.push('/dashboard'), 1000)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('上传失败', {
        description: error instanceof Error ? error.message : '请重试'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLoggedIn) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (!isLoggedIn || !session?.user?.id) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      await uploadFile(droppedFiles[0])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-transparent">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              {siteName}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">功能</a>
                <a href="#use-cases" className="text-sm font-medium hover:text-primary transition-colors">应用场景</a>
                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">登录</Link>
                <Link
                  href="/register"
                  className="px-6 py-2 rounded-full gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                  开始使用
                </Link>
              </>
            ) : (
              <>
                <div className="text-sm">
                  <div className="font-medium">{session?.user?.name || '用户'}</div>
                  <div className="text-xs text-muted-foreground">{session?.user?.email}</div>
                </div>
                <Link
                  href="/dashboard"
                  className="px-6 py-2 rounded-full gradient-primary text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  进入Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 mb-8">
            <div className="inline-block">
              <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4 animate-glow">
                🚀 {siteSlogan || '让本地文件拥有"在线生命"'}
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                {siteName}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed">
              {siteDescription || '简单拖拽，本地文件秒变在线直链。实时追踪访客行为，让每一次分享都心中有数。'}
            </p>
          </div>

          {/* Upload Area / Dashboard Quickstart */}
          <div className="max-w-3xl mx-auto">
            {!isLoggedIn ? (
              <Link href="/register" className="block group">
                <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-white/50 dark:bg-slate-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300 p-10 text-center cursor-pointer group-hover:border-indigo-500 group-hover:shadow-2xl group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-8 h-8 text-white animate-bounce" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        点击或拖拽本地文件
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        立即生成可追踪的在线直链
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4" /> 安全存储
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4" /> 极速访问
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="glass rounded-3xl p-8 border-2 border-indigo-200 dark:border-indigo-800">
                {/* ... existing LoggedIn UI ... */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">👋 欢迎回来，{session?.user?.name}！</h3>
                  <p className="text-muted-foreground">继续分享您的文件</p>
                </div>
                {/* ... keep existing buttons ... */}
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
                  >
                    <FolderOpen className="w-12 h-12 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <div className="font-bold text-lg">我的文件库</div>
                      <div className="text-sm opacity-90">查看访问统计</div>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <div
                    className={`relative group flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 cursor-pointer ${isDragging
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500 scale-105 shadow-xl'
                      : uploading
                        ? 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-105'
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!uploading) {
                        document.getElementById('landing-file-input')?.click()
                      }
                    }}
                  >
                    <Upload className={`w-12 h-12 text-indigo-600 dark:text-indigo-400 transition-transform ${isDragging ? 'scale-125 animate-bounce' : uploading ? 'animate-pulse' : 'group-hover:scale-110'
                      }`} />
                    <div className="text-center">
                      <div className="font-bold text-lg">
                        {uploading ? '上传中...' : isDragging ? '松开上传' : '上传新文件'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {uploading ? '请稍候' : '生成新的追踪链接'}
                      </div>
                    </div>
                    {!uploading && !isDragging && (
                      <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <input
                      id="landing-file-input"
                      type="file"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                      accept=".pdf,.mp4,.mov,.jpg,.jpeg,.png,.ppt,.pptx,.md,.txt"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">Online</div>
              <div className="text-sm text-muted-foreground mt-2">可在线访问</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">Link</div>
              <div className="text-sm text-muted-foreground mt-2">一键生成外链</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">Track</div>
              <div className="text-sm text-muted-foreground mt-2">全链路追踪</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/50 dark:bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">为什么选择 {siteName}？</h2>
            <p className="text-xl text-muted-foreground">解决本地文件分享痛点，数据从未如此清晰</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass p-8 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">本地文件 &rarr; 在线直链</h3>
              <p className="text-muted-foreground">
                打破本地存储限制，无需繁琐传输。一键上传，即刻生成可供随时随地访问的在线链接（URL）。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass p-8 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">谁在看？全景追踪</h3>
              <p className="text-muted-foreground">
                不再盲目分享。实时记录每一位访客的访问时间、地理位置、设备型号。这是您的私人数据雷达。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass p-8 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">访问实时通知</h3>
              <p className="text-muted-foreground">
                链接被打开的瞬间，您将收到邮件或浏览器通知。把握最佳跟进时机，绝不错过任何商机。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass p-8 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">停留时长分析</h3>
              <p className="text-muted-foreground">
                访客在您的文件上停留了多久？深入分析阅读行为，判断内容的吸引力与客户的意向度。
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass p-8 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">访问权限控制</h3>
              <p className="text-muted-foreground">
                灵活设置访问密码、过期时间、最大访问次数。确保您的私密文件只在授权范围内传播。
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass p-8 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">内容深度洞察</h3>
              <p className="text-muted-foreground">
                (高级功能) PDF 热力图与视频完播率分析。知道哪页最受关注，哪段视频被反复观看。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">应用场景</h2>
            <p className="text-xl text-muted-foreground">适用于各行各业，解决实际问题</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-2xl">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-3">销售场景</h3>
              <p className="text-muted-foreground mb-4">
                发送报价单、产品手册给客户后，实时了解客户是否查看、关注哪些内容，抓住最佳跟进时机。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">报价单追踪</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">演示文稿</span>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-2xl font-bold mb-3">求职招聘</h3>
              <p className="text-muted-foreground mb-4">
                投递简历后，知道 HR 是否查看、停留时长。投递作品集时，了解面试官最感兴趣的项目。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">简历追踪</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">作品集分析</span>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold mb-3">教育培训</h3>
              <p className="text-muted-foreground mb-4">
                分享课程资料、录播视频，了解学员学习进度和薄弱环节，有针对性地辅导。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">视频学习</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">课件分析</span>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">市场调研</h3>
              <p className="text-muted-foreground mb-4">
                分享方案给不同客户，对比不同地区、不同人群的关注点，优化产品和营销策略。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">方案对比</span>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">数据洞察</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass p-12 rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              开始追踪你的文件
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              注册即可免费使用，无需信用卡
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
            >
              立即注册 <span className="text-2xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6">
        <div className="pt-8 text-center text-slate-500">
          <p className="mb-2">{footerText || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}</p>
          {(icpNumber && (typeof icpNumberEnabled !== 'boolean' || icpNumberEnabled)) && (
            <p className="text-xs text-slate-400">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {icpNumber}
              </a>
            </p>
          )}
        </div>
      </footer>

      {/* Upload Modal */}
      {isLoggedIn && session?.user?.id && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
          userId={session.user.id}
        />
      )}
    </div>
  )
}
