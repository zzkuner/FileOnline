// Next.js instrumentation - 启动时运行
// 将 .env 中的关键配置项初始化到 SystemConfig 数据库中
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            const { seedConfigFromEnv } = await import('@/lib/config')
            await seedConfigFromEnv()

            const { seedAdminFromEnv } = await import('@/lib/admin-seed')
            await seedAdminFromEnv()

            // Internal Cron Setup
            // Check every hour (3600000 ms)
            // 注意：这只在长运行的 Node.js 进程中有效 (VPS/Docker/Local)，在 Vercel Serverless 中无效
            setInterval(async () => {
                try {
                    const { generateAndSendSummary } = await import('@/lib/admin-summary')
                    await generateAndSendSummary(false) // force=false, 内部会自动检查 lastSentTime
                } catch (err) {
                    console.error('Internal Cron Error:', err)
                }
            }, 60 * 60 * 1000)

            // Initial check on startup (after 1 min delay to let DB connect)
            setTimeout(async () => {
                try {
                    const { generateAndSendSummary } = await import('@/lib/admin-summary')
                    await generateAndSendSummary(false)
                } catch (err) {
                    console.error('Startup Cron Check Error:', err)
                }
            }, 60 * 1000)

        } catch (e) {
            console.warn('Config seeding / Cron setup skipped:', e)
        }
    }
}
