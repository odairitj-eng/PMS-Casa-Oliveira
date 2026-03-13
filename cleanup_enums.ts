
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- VERIFICANDO STATUS DE RESERVAS ---");
    // Usamos queryRaw para evitar erros de tipo se o enum no cliente for diferente do banco
    const reservations = await prisma.$queryRaw`SELECT id, status FROM "Reservation" WHERE status = 'CANCELLED'`;
    console.log(`Reservas com status 'CANCELLED': ${Array.isArray(reservations) ? reservations.length : 0}`);

    if (Array.isArray(reservations) && reservations.length > 0) {
        console.log("Atualizando reservas 'CANCELLED' para 'CANCELLED_SYSTEM' para compatibilidade...");
        await prisma.$executeRaw`UPDATE "Reservation" SET status = 'CANCELLED_SYSTEM' WHERE status = 'CANCELLED'`;
        console.log("Atualização concluída.");
    } else {
        console.log("Nenhuma reserva com status 'CANCELLED' encontrada.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
