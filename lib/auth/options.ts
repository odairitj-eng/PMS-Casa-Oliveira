import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { db } from "@/lib/db";
import fs from 'fs';
import path from 'path';

const authLog = path.join(process.cwd(), 'debug_auth.log');
const alog = (msg: string) => {
    try { fs.appendFileSync(authLog, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { }
};

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db as any) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            alog(`JWT CALLBACK: token.id=${token.id}, user.id=${user?.id}`);

            if (user) {
                token.id = user.id;
                token.email = user.email;
            }

            if (token.id) {
                // Promoção Automática via Variável de Ambiente (Reforço no JWT)
                const adminEmail = process.env.ADMIN_EMAIL;
                const currentEmail = token.email as string;

                if (adminEmail && currentEmail && currentEmail.toLowerCase() === adminEmail.toLowerCase()) {
                    // Busca o usuário para ver se já é ADMIN
                    const dbUser = await db.user.findUnique({
                        where: { id: token.id as string },
                        select: { role: true }
                    });

                    if (dbUser && dbUser.role !== 'ADMIN') {
                        await db.user.update({
                            where: { id: token.id as string },
                            data: { role: 'ADMIN' }
                        });
                        token.role = 'ADMIN';
                        alog(`JWT: User promoted to ADMIN in DB and Token`);
                    } else if (dbUser) {
                        token.role = dbUser.role;
                    }
                } else {
                    // Usuário normal, apenas busca a role
                    const dbUser = await db.user.findUnique({
                        where: { id: token.id as string },
                        select: { role: true }
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                alog(`SESSION CALLBACK: user=${session.user.email}, role=${(session.user as any).role}`);
            }
            return session;
        },
    },
    events: {
        async signIn({ user }) {
            if (user.email) {
                // 1. Promoção Automática para ADMIN via Variável de Ambiente
                const adminEmail = process.env.ADMIN_EMAIL;
                if (adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase()) {
                    await db.user.update({
                        where: { id: user.id },
                        data: { role: 'ADMIN' }
                    });
                    console.log(`[AUTH] Usuário ${user.email} promovido a ADMIN automaticamente.`);
                }

                // 2. Busca o hóspede no CRM pelo e-mail
                const guest = await db.guest.findUnique({
                    where: { email: user.email }
                });

                if (guest) {
                    // Já existe no CRM, vincula ao novo ID de usuário
                    await db.guest.update({
                        where: { id: guest.id },
                        data: { userId: user.id }
                    });
                } else {
                    // Não existe no CRM, cria um novo
                    await db.guest.create({
                        data: {
                            name: user.name || "Hóspede",
                            email: user.email,
                            phone: "",
                            userId: user.id
                        }
                    });
                }
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
