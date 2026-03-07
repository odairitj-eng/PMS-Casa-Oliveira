const { PrismaClient } = require('./prisma/generated/client');

console.log('Testando conexão com Prisma...');
const db = new PrismaClient();

async function test() {
    try {
        const start = Date.now();
        const props = await db.property.findMany({
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                publicTitle: true,
                isActive: true,
                city: true,
                state: true,
                basePrice: true,
                maxGuests: true,
                createdAt: true,
                _count: { select: { reservations: true, photos: true } },
            },
        });
        console.log(`Prisma finalizado em ${Date.now() - start}ms! Retornou ${props.length} linhas.`);
    } catch (err) {
        console.error('ERRO PRISMA:', err);
    } finally {
        await db.$disconnect();
    }
}

test();
