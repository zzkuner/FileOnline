const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function simulateVisits() {
    const linkId = 'cmig595e90009svi7eg7grq0q'; // The link ID we are testing

    console.log('Simulating visits for link:', linkId);

    // Create a few visits
    const visits = [
        { ip: '192.168.1.1', location: 'Shanghai, CN', device: 'Desktop', browser: 'Chrome', duration: 120 },
        { ip: '192.168.1.2', location: 'Beijing, CN', device: 'Mobile', browser: 'Safari', duration: 45 },
        { ip: '192.168.1.3', location: 'New York, US', device: 'Desktop', browser: 'Firefox', duration: 300 },
    ];

    for (const v of visits) {
        const visit = await prisma.visit.create({
            data: {
                linkId,
                visitorIp: v.ip,
                location: v.location,
                deviceType: v.device,
                browser: v.browser,
                os: 'Windows',
                userAgent: 'Mozilla/5.0 ...',
                startedAt: new Date(),
                endedAt: new Date(Date.now() + v.duration * 1000),
                duration: v.duration
            }
        });

        // Add some events
        await prisma.event.create({
            data: {
                visitId: visit.id,
                eventType: 'VIDEO_PLAY',
                payload: JSON.stringify({ currentTime: 0 })
            }
        });

        console.log(`Created visit from ${v.location}`);
    }
}

simulateVisits()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
