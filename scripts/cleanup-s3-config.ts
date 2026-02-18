import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const keysToDelete = [
        'S3_ENDPOINT',
        'S3_REGION',
        'S3_ACCESS_KEY',
        'S3_SECRET_KEY',
        'S3_BUCKET'
    ]

    console.log('Cleaning up wrongly seeded S3 config...')
    const result = await prisma.systemConfig.deleteMany({
        where: {
            key: { in: keysToDelete }
        }
    })
    console.log(`Deleted ${result.count} config entries.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
