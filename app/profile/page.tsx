"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User as UserIcon, Mail, Phone, Calendar, ShieldCheck, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [guestData, setGuestData] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Safety Timeout: Forçar fim do loading após 10s para evitar spinner infinito
        const timer = setTimeout(() => setIsLoading(false), 10000);

        if (status === "authenticated") {
            const fetchData = async () => {
                try {
                    const [guestRes, reservationsRes] = await Promise.all([
                        axios.get("/api/guests/me"),
                        axios.get("/api/reservations/me")
                    ]);
                    setGuestData(guestRes.data);
                    setReservations(reservationsRes.data);
                } catch (error) {
                    console.error("Erro ao buscar dados do perfil", error);
                } finally {
                    setIsLoading(false);
                    clearTimeout(timer);
                }
            };
            fetchData();
        } else if (status === "unauthenticated") {
            setIsLoading(false);
            clearTimeout(timer);
        }

        return () => clearTimeout(timer);
    }, [status]);

    if (isLoading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sand-50">
                <Loader2 className="w-10 h-10 animate-spin text-olive-900" />
            </div>
        );
    }

    const user = session?.user;

    return (
        <div className="min-h-screen bg-sand-50 py-12 px-4 bg-[url('/imagens/pattern.png')] bg-repeat">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Cabeçalho do Perfil */}
                <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-8 rounded-[3rem] shadow-xl border border-olive-900/5">
                    <div className="relative">
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || "Perfil"}
                                width={120}
                                height={120}
                                className="rounded-full ring-4 ring-olive-900/10 shadow-lg"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-olive-900 flex items-center justify-center text-sand-50 text-4xl font-bold">
                                {user?.name?.[0].toUpperCase()}
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-white shadow-md">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-3xl font-bold text-olive-900">{user?.name}</h1>
                        <p className="text-olive-900/60 font-medium flex items-center justify-center md:justify-start gap-2">
                            <Mail className="w-4 h-4" /> {user?.email}
                        </p>
                        <span className="inline-block mt-2 px-3 py-1 bg-olive-900 text-[10px] text-sand-50 font-bold rounded-full uppercase tracking-wider">
                            {(user as any)?.role === "ADMIN" ? "Administrador" : "Hóspede Verificado"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Detalhes da Conta */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden">
                            <CardHeader className="bg-olive-900/5 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-olive-900" /> Seus Dados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-olive-900/40">WhatsApp</label>
                                    <p className="font-bold flex items-center gap-2 text-olive-900">
                                        <Phone className="w-4 h-4 text-olive-900/40" /> {guestData?.phone || "Não informado"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-olive-900/40">Membro desde</label>
                                    <p className="font-bold flex items-center gap-2 text-olive-900">
                                        <Calendar className="w-4 h-4 text-olive-900/40" /> {new Date().getFullYear()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Histórico de Reservas */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="rounded-[2.5rem] border-0 shadow-lg min-h-[400px]">
                            <CardHeader className="border-b border-olive-900/5 p-8">
                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <History className="w-6 h-6 text-olive-900" /> Minhas Reservas
                                </CardTitle>
                                <CardDescription>Histórico completo de estadias na Casa Oliveira.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                {reservations.length === 0 ? (
                                    <div className="text-center py-20 space-y-4">
                                        <div className="bg-olive-900/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-olive-900/20">
                                            <Calendar className="w-8 h-8" />
                                        </div>
                                        <p className="text-olive-900/40 font-bold uppercase text-xs tracking-widest">Nenhuma reserva encontrada</p>
                                        <Link href="/">
                                            <button className="text-olive-900 font-bold underline">Que tal agendar sua primeira estadia?</button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Listagem de reservas... */}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
