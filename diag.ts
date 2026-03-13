
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- BUSCANDO PROPRIEDADES ---");
    const pCount = await prisma.property.count();
    console.log(`Total de propriedades: ${pCount}`);

    const props = await prisma.property.findMany({ select: { id: true, name: true, slug: true } });
    console.log("Lista de IDs:");
    props.forEach(p => console.log(` - ${p.id} (${p.name})`));

    const targetId = 'casa-oliveira-id';
    const windowsCount = await prisma.availabilityWindow.count({ where: { propertyId: targetId } });
    const blockedCount = await prisma.blockedDate.count({ where: { propertyId: targetId } });
    console.log(`\nDados para '${targetId}':`);
    console.log(` - Janelas: ${windowsCount}`);
    console.log(` - Bloqueios: ${blockedCount}`);

    if (windowsCount === 0 && blockedCount === 0) {
        console.log("AVISO: Dados de disponibilidade não vinculados a este ID!");
    } else {
        console.log("SUCESSO: Disponibilidade vinculada corretamente.");
    }

    const allGuests = await prisma.guest.count();
    console.log(`Total de hóspedes no banco: ${allGuests}`);

    const allReservations = await prisma.reservation.count();
    console.log(`\nTotal de reservas no banco (todos imóveis): ${allReservations}`);

    const logsCount = await prisma.syncLog.count();
    console.log(`Total de logs de sincronização: ${logsCount}`);

    const globalBlockedCount = await prisma.blockedDate.count();
    console.log(`Total de datas bloqueadas (global): ${globalBlockedCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
