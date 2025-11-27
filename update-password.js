const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updatePassword() {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
        where: { email },
        data: {
            passwordHash: hashedPassword
        }
    });

    console.log(`Updated password for ${email} to '${password}'`);
}

updatePassword()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
