const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function promoteToAdmin() {
    const email = 'test@example.com';

    const user = await prisma.user.update({
        where: { email },
        data: {
            role: 'ADMIN'
        }
    });

    console.log(`Promoted ${email} to ADMIN`);
}

promoteToAdmin()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
