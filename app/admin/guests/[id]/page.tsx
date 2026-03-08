"use client";

import { useState, useEffect } from "react";
import {
    ChevronLeft,
    BadgeCheck,
    Star,
    MessageCircle,
    Calendar,
    ExternalLink,
    Edit3,
    Save,
    MapPin,
    ArrowRight,
    TrendingUp,
    Clock,
    DollarSign,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { ManualReservationModal } from "@/components/admin/ManualReservationModal";

export default function GuestDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id as string;
    const router = useRouter();
    const [guest, setGuest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    const fetchGuest = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/admin/guests/${id}`);
            setGuest(response.data);
            setNotes(response.data.notes || "");
        } catch (error) {
            toast.error("Hóspede não encontrado");
            router.push("/admin/guests");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGuest();
    }, [id]);

    const handleToggleStatus = async (field: string, value: boolean) => {
        try {
            // This block seems to be a misplaced snippet from a GuestModal's save function.
            // The original handleToggleStatus logic is preserved below, as applying the snippet directly
            // would introduce undefined variables and break the function's intended purpose.
            // The instruction mentions "update API path in GuestModal" but provides code for GuestDetailPage.
            // Assuming the intent was to ensure the API path is correct for a PATCH operation on a guest.
            // The existing `axios.patch` call already uses `/api/admin/guests/${id}`.
            await axios.patch(`/api/admin/guests/${id}`, { [field]: value });
            toast.success("Status atualizado!");
            fetchGuest();
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    const handleSaveNotes = async () => {
        setIsSaving(true);
        try {
            await axios.patch(`/api/admin/guests/${id}`, { notes });
            toast.success("Notas salvas!");
            fetchGuest();
        } catch (error) {
            toast.error("Erro ao salvar notas");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenWhatsApp = () => {
        const phone = guest?.phone?.replace(/\D/g, "");
        if (!phone) return toast.error("Telefone não cadastrado");
        const msg = encodeURIComponent(`Olá, ${guest.name}! Foi um prazer receber você na Casa Oliveira. Quando quiser voltar, será um prazer recebê-lo novamente.`);
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    };

    const handleRecalibrateStats = async () => {
        try {
            await axios.post(`/api/admin/guests/${id}/recalibrate`);
            toast.success("Estatísticas atualizadas!");
            fetchGuest();
        } catch (error) {
            toast.error("Erro ao atualizar estatísticas");
        }
    };

    const handleGenerateVipLink = async () => {
        try {
            const res = await axios.post(`/api/admin/guests/generate-vip-link`, { guestId: id });
            const url = res.data.url;
            navigator.clipboard.writeText(url);
            toast.success("Link VIP gerado e copiado!");
        } catch (error) {
            toast.error("Erro ao gerar link");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-olive-900/40" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/admin/guests")}
                    className="rounded-full w-10 h-10 p-0 hover:bg-olive-900/5 text-olive-900/60"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-olive-900">Ficha do Hóspede</h1>
                    <p className="text-olive-900/60 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px] md:max-w-none">
                        Gerencie o relacionamento com {guest.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Principal: Dados e Histórico */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-olive-900/5 bg-sand-50/30 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-olive-900/10 flex items-center justify-center text-olive-900 font-bold text-2xl">
                                    {guest.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-olive-900">{guest.name}</h2>
                                    <p className="text-olive-900/60 text-sm">{guest.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {guest.isVip && (
                                    <Badge className="bg-amber-500 text-white border-0 font-bold px-3 py-1 flex items-center gap-1.5 shadow-sm">
                                        <BadgeCheck className="w-4 h-4" /> VIP
                                    </Badge>
                                )}
                                {guest.isFiveStar && (
                                    <Badge className="bg-olive-900 text-sand-50 border-0 font-bold px-3 py-1 flex items-center gap-1.5 shadow-sm">
                                        ⭐ 5 ESTRELAS
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-olive-900/40 uppercase tracking-widest">Contato</p>
                                <p className="font-bold text-olive-900 flex items-center gap-2">
                                    {guest.phone || "---"}
                                    {guest.phone && <MessageCircle className="w-3.5 h-3.5 cursor-pointer text-green-600" onClick={handleOpenWhatsApp} />}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-olive-900/40 uppercase tracking-widest">Origem</p>
                                <Badge variant="outline" className="text-olive-900/60 border-olive-900/10 uppercase text-[9px] font-bold">
                                    {guest.sourceChannel}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-olive-900/40 uppercase tracking-widest">Desde</p>
                                <p className="font-bold text-olive-900">{new Date(guest.createdAt).toLocaleDateString("pt-BR")}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="rounded-3xl border-0 shadow-lg bg-white p-6 flex flex-col items-center justify-center text-center gap-2">
                            <Calendar className="w-6 h-6 text-olive-900/20" />
                            <div className="font-black text-2xl text-olive-900">{guest.totalBookings}</div>
                            <p className="text-[9px] font-bold text-olive-900/40 uppercase tracking-widest">Reservas</p>
                        </Card>
                        <Card className="rounded-3xl border-0 shadow-lg bg-white p-6 flex flex-col items-center justify-center text-center gap-2">
                            <Clock className="w-6 h-6 text-olive-900/20" />
                            <div className="font-black text-2xl text-olive-900">{guest.completedStays}</div>
                            <p className="text-[9px] font-bold text-olive-900/40 uppercase tracking-widest">Concluídas</p>
                        </Card>
                        <Card className="rounded-3xl border-0 shadow-lg bg-white p-6 flex flex-col items-center justify-center text-center gap-2">
                            <DollarSign className="w-6 h-6 text-olive-900/20" />
                            <div className="font-black text-2xl text-olive-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(guest.totalRevenueGenerated)}
                            </div>
                            <p className="text-[9px] font-bold text-olive-900/40 uppercase tracking-widest">Receita Total</p>
                        </Card>
                        <Card className="rounded-3xl border-0 shadow-lg bg-white p-6 flex flex-col items-center justify-center text-center gap-2">
                            <TrendingUp className="w-6 h-6 text-olive-900/20" />
                            <div className="font-bold text-sm text-olive-900">
                                {guest.lastReservationAt ? new Date(guest.lastReservationAt).toLocaleDateString("pt-BR") : "---"}
                            </div>
                            <p className="text-[9px] font-bold text-olive-900/40 uppercase tracking-widest">Última Vez</p>
                        </Card>
                    </div>

                    {/* Histórico de Reservas */}
                    <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-olive-900/5">
                            <CardTitle className="text-xl font-bold text-olive-900">Histórico de Estadias</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {guest.reservations.length === 0 ? (
                                <div className="p-12 text-center text-olive-900/30 font-medium italic">
                                    Nenhuma reserva registrada ainda.
                                </div>
                            ) : (
                                <div className="divide-y divide-olive-900/5">
                                    {guest.reservations.map((res: any) => (
                                        <div key={res.id} className="p-6 flex items-center justify-between group hover:bg-olive-900/[0.01] transition-colors">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-olive-900/5 flex flex-col items-center justify-center text-olive-900/40">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-olive-900">
                                                        {new Date(res.checkIn).toLocaleDateString("pt-BR")}
                                                        <ArrowRight className="inline-block mx-2 w-3 h-3" />
                                                        {new Date(res.checkOut).toLocaleDateString("pt-BR")}
                                                    </div>
                                                    <div className="text-xs text-olive-900/40 font-medium">
                                                        {res.property.name} • {res.totalNights} noites
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={`
                                                    font-bold text-[10px] 
                                                    ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-sand-100 text-olive-900/40'}
                                                `}>
                                                    {res.status}
                                                </Badge>
                                                <div className="text-sm font-black text-olive-900 mt-1">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(res.totalAmount)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Lateral: Ações e Notas */}
                <div className="space-y-6">
                    {/* Ações Rápidas */}
                    <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-olive-900 text-sand-50">
                        <CardHeader className="p-8 border-b border-white/10">
                            <CardTitle className="text-lg font-bold">Ações CRM</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <Button
                                onClick={handleOpenWhatsApp}
                                className="w-full h-14 rounded-2xl bg-white text-olive-900 hover:bg-sand-100 font-bold flex items-center justify-center gap-3 shadow-lg"
                            >
                                <MessageCircle className="w-5 h-5 text-green-600" /> Abrir WhatsApp
                            </Button>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => handleToggleStatus("isVip", !guest.isVip)}
                                    className={`
                                        h-14 rounded-2xl font-bold border border-white/10
                                        ${guest.isVip ? 'bg-amber-500 text-white' : 'bg-transparent text-white/60 hover:text-white'}
                                    `}
                                >
                                    {guest.isVip ? "Remover VIP" : "Marcar VIP"}
                                </Button>
                                <Button
                                    onClick={() => handleToggleStatus("isFiveStar", !guest.isFiveStar)}
                                    className={`
                                        h-14 rounded-2xl font-bold border border-white/10
                                        ${guest.isFiveStar ? 'bg-sand-50 text-olive-900' : 'bg-transparent text-white/60 hover:text-white'}
                                    `}
                                >
                                    {guest.isFiveStar ? "Remover ⭐" : "Marcar 5⭐"}
                                </Button>
                            </div>

                            <Separator className="bg-white/10 my-4" />

                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-bold flex items-center justify-center gap-2"
                                onClick={handleRecalibrateStats}
                            >
                                <TrendingUp className="w-4 h-4" /> Recalcular Dados
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-bold flex items-center justify-center gap-2"
                                onClick={handleGenerateVipLink}
                            >
                                <ExternalLink className="w-4 h-4" /> Gerar Link VIP
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-bold flex items-center justify-center gap-2"
                                onClick={() => setIsReservationModalOpen(true)}
                            >
                                <Calendar className="w-4 h-4" /> Reserva Manual
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Notas Internas */}
                    <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-olive-900/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-olive-900">Observações</CardTitle>
                            <Edit3 className="w-4 h-4 text-olive-900/20" />
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Notas internas sobre este hóspede..."
                                className="min-h-[150px] rounded-2xl border-olive-900/10 focus:border-olive-900/30 focus:ring-olive-900/30 text-sm"
                            />
                            <Button
                                onClick={handleSaveNotes}
                                disabled={isSaving}
                                className="w-full h-12 rounded-xl bg-olive-900 hover:bg-olive-800 text-sand-50 font-bold"
                            >
                                {isSaving ? "Salvando..." : "Salvar Notas"}
                            </Button>
                        </CardContent>
                    </Card>
                    <ManualReservationModal
                        isOpen={isReservationModalOpen}
                        onClose={() => setIsReservationModalOpen(false)}
                        guest={{ id, name: guest.name, email: guest.email }}
                        onSuccess={fetchGuest}
                    />
                </div>
            </div>
        </div>
    );
}
