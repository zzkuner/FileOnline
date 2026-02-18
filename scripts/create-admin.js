const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'Admin';

    if (!email || !password) {
        console.error('❌ Error: ADMIN_EMAIL or ADMIN_PASSWORD not found in .env');
        process.exit(1);
    }

    console.log(`Checking admin user: ${email}...`);

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!existingUser) {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash: hashedPassword,
                    role: 'ADMIN',
                },
            });
            console.log('✅ Admin user created successfully.');
        } else {
            console.log('User exists. Updating role to ADMIN...');
            // Update password if you want to reset it, currently just role
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    role: 'ADMIN',
                    passwordHash: hashedPassword // Optional: Force reset password to match .env
                },
            });
            console.log('✅ User role updated to ADMIN and password reset to .env value.');
        }
    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
