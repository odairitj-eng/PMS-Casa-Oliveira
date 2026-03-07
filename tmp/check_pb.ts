import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const p = await prisma.property.findUnique({ where: { id: "casa-oliveira-id" } });
    console.log("BASE_PRICE:", p?.basePrice);
    process.exit(0);
}
main();
