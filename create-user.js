const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            passwordHash: 'hashedpassword',
            name: 'Test User',
            role: 'USER',
        },
    })
    console.log('Created user:', user)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
