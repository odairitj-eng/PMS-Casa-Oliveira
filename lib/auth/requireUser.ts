import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./options";

export async function requireUser() {
    const session = await getServerSession(authOptions);

    if (!session) {
        // Redireciona para o login mantendo a URL original para retorno
        // O Next.js trata o redirecionamento em Server Components
        // Para simplificar, o Auth.js já tem helpers, mas aqui fazemos manual
        redirect("/auth/login");
    }

    return session;
}

export async function requireAdmin() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    return session;
}
