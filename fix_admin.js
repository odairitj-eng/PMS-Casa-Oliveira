const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("--- BUSCANDO USUÁRIOS NO BANCO ---");
    const users = await prisma.user.findMany({
        orderBy: { id: 'desc' },
        take: 5
    });

    if (users.length === 0) {
        console.log("Nenhum usuário encontrado.");
        return;
    }

    console.log("Usuários encontrados:", users.map(u => `${u.email} (${u.role})`).join(", "));

    // Se houver usuários, vamos mudar o primeiro (mais recente) para ADMIN para teste
    const targetUser = users[0];
    if (targetUser.role !== "ADMIN") {
        console.log(`Promovendo ${targetUser.email} para ADMIN...`);
        await prisma.user.update({
            where: { id: targetUser.id },
            data: { role: "ADMIN" }
        });
        console.log("Sucesso!");
    } else {
        console.log(`${targetUser.email} já é ADMIN.`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
