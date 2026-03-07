"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, Search, MoreHorizontal, UserPlus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GuestModal } from "@/components/admin/GuestModal";
import axios from "axios";
import toast from "react-hot-toast";

interface Guest {
    id: string;
    name: string;
    email: string;
    phone: string;
    isVip: boolean;
    isFiveStar: boolean;
    status: string;
    notes: string;
    totalBookings: number;
    createdAt: string;
    sourceChannel: string;
}

export default function GuestsPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

    const fetchGuests = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api/admin/guests");
            setGuests(response.data);
        } catch (error) {
            console.error("Erro ao carregar hóspedes", error);
            toast.error("Erro ao carregar lista de hóspedes");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGuests();
    }, []);

    const handleEdit = (guest: Guest) => {
        setSelectedGuest(guest);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedGuest(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este hóspede? Esta ação não pode ser desfeita.")) return;

        try {
            await axios.delete(`/api/admin/guests?id=${id}`);
            toast.success("Hóspede excluído com sucesso");
            fetchGuests();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao excluir hóspede");
        }
    };

    const filteredGuests = guests.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-olive-900/5 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-olive-900">Gestão de Hóspedes (CRM)</h1>
                    <p className="text-olive-900/60 font-medium">Histórico, preferências e status VIP da Casa Oliveira.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-900/40" />
                        <Input
                            placeholder="Buscar por nome ou e-mail..."
                            className="pl-11 h-12 rounded-2xl border-olive-900/10 focus:border-olive-900/30 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleNew}
                        className="h-12 px-6 rounded-2xl bg-olive-900 hover:bg-olive-800 text-sand-50 font-bold flex items-center gap-2 shadow-lg shadow-olive-900/10"
                    >
                        <UserPlus className="w-5 h-5" /> Novo Hóspede
                    </Button>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-olive-900/40 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <p className="font-bold uppercase text-[10px] tracking-widest">Carregando CRM...</p>
                        </div>
                    ) : filteredGuests.length === 0 ? (
                        <div className="p-20 text-center text-olive-900/40 space-y-4">
                            <p className="font-bold">Nenhum hóspede encontrado.</p>
                            {searchQuery && (
                                <Button variant="ghost" onClick={() => setSearchQuery("")} className="font-bold underline text-olive-900/60">
                                    Limpar busca
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-olive-900/5 bg-olive-900/5">
                                        <th className="p-6 font-bold text-olive-900/60 text-[10px] uppercase tracking-widest">Nome</th>
                                        <th className="p-6 font-bold text-olive-900/60 text-[10px] uppercase tracking-widest">Contato</th>
                                        <th className="p-6 font-bold text-olive-900/60 text-[10px] uppercase tracking-widest text-center">Status</th>
                                        <th className="p-6 font-bold text-olive-900/60 text-[10px] uppercase tracking-widest text-center">Estadias</th>
                                        <th className="p-6 font-bold text-olive-900/60 text-[10px] uppercase tracking-widest">Cadastro</th>
                                        <th className="p-6 font-bold text-olive-900/60 text-[10px] uppercase tracking-widest text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGuests.map(g => (
                                        <tr key={g.id} className="border-b border-olive-900/5 hover:bg-olive-900/[0.02] transition-colors group">
                                            <td className="p-6">
                                                <div className="font-bold text-olive-900 text-lg">{g.name}</div>
                                                {g.notes && (
                                                    <div className="text-[10px] text-olive-900/40 font-medium truncate max-w-[200px]" title={g.notes}>
                                                        📝 {g.notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className="font-bold text-olive-900 text-sm">{g.email}</div>
                                                <div className="text-olive-900/60 text-xs font-medium">{g.phone || "Sem telefone"}</div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {g.isVip && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md">
                                                            <BadgeCheck className="w-3.5 h-3.5" /> VIP
                                                        </span>
                                                    )}
                                                    {g.isFiveStar && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-olive-900 text-sand-50 shadow-md">
                                                            ⭐ 5 ESTRELAS
                                                        </span>
                                                    )}
                                                    {!g.isVip && !g.isFiveStar && (
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-olive-900/5 text-olive-900/60 uppercase">
                                                            {g.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="font-black text-xl text-olive-900">{g.totalBookings}</div>
                                                <div className="text-[9px] font-bold text-olive-900/40 uppercase">Reserva(s)</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-xs font-bold text-olive-900/60">{new Date(g.createdAt).toLocaleDateString("pt-BR")}</div>
                                                <div className="text-[10px] text-olive-900/30 font-medium uppercase">{g.sourceChannel}</div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        className="rounded-xl h-10 px-4 hover:bg-olive-900/5 text-olive-900 font-bold text-xs flex items-center gap-2 border border-olive-900/10"
                                                        onClick={() => window.location.href = `/admin/guests/${g.id}`}
                                                    >
                                                        Ver Ficha
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-xl h-10 w-10 hover:bg-olive-900/5 text-olive-900/40 hover:text-olive-900 border border-olive-900/10"
                                                        onClick={() => handleEdit(g)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <GuestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchGuests}
                guest={selectedGuest}
            />
        </div>
    );
}
