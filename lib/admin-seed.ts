
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

/**
 * 启动时检查是否有 ADMIN_EMAIL 和 ADMIN_PASSWORD 环境变量
 * 如果有，则自动创建或提升该用户为管理员
 */
export async function seedAdminFromEnv() {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME || 'Admin'

    if (!adminEmail || !adminPassword) {
        return
    }

    try {
        // 检查用户是否存在
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        })

        if (!existingUser) {
            // 创建新管理员
            const passwordHash = await bcrypt.hash(adminPassword, 10)
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    passwordHash,
                    name: adminName,
                    role: 'ADMIN'
                }
            })
            console.log(`✅ Default admin created: ${adminEmail}`)
        } else {
            // 用户已存在，确保其角色为管理员
            if (existingUser.role !== 'ADMIN') {
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { role: 'ADMIN' }
                })
                console.log(`✅ Existing user promoted to ADMIN: ${adminEmail}`)
            }
        }
    } catch (e) {
        console.error('Failed to seed admin user:', e)
    }
}
