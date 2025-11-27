import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixStatus() {
    const result = await prisma.file.updateMany({
        where: {
            status: 'PROCESSING'
        },
        data: {
            status: 'READY'
        }
    })

    console.log(`Updated ${result.count} files from PROCESSING to READY`)
    await prisma.$disconnect()
}

fixStatus()
