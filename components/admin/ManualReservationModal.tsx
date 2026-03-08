"use client";

import { useState, useEffect } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    isBefore,
    startOfDay,
    isWithinInterval,
    differenceInDays,
    eachDayOfInterval,
    isWeekend
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Calendar as CalendarIcon, Home, Users, CheckCircle2, ChevronLeft, ChevronRight, X, AlertCircle, Plus, Minus, UserPlus, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ManualReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    guest: {
        id: string;
        name: string;
        email: string;
    };
    onSuccess: () => void;
}

export function ManualReservationModal({
    isOpen,
    onClose,
    guest,
    onSuccess
}: ManualReservationModalProps) {
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null
    });

    const [calendarData, setCalendarData] = useState<any>(null);
    const [pricing, setPricing] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [numGuests, setNumGuests] = useState(1);
    const [occupants, setOccupants] = useState<any[]>([]);

    useEffect(() => {
        if (numGuests > 1) {
            setOccupants(prev => {
                const newOccs = [...prev];
                while (newOccs.length < numGuests - 1) {
                    newOccs.push({ name: "", document: "", isChild: false });
                }
                return newOccs.slice(0, numGuests - 1);
            });
        } else {
            setOccupants([]);
        }
    }, [numGuests]);

    // Carregar imóveis ativos
    useEffect(() => {
        if (isOpen) {
            const fetchProperties = async () => {
                try {
                    const res = await axios.get("/api/admin/properties");
                    const actives = res.data.filter((p: any) => p.isActive);
                    setProperties(actives);
                    if (actives.length > 0) setSelectedPropertyId(actives[0].id);
                } catch (error) {
                    toast.error("Erro ao carregar imóveis");
                }
            };
            fetchProperties();
        }
    }, [isOpen]);

    // Carregar dados de calendário do imóvel selecionado
    useEffect(() => {
        if (isOpen && selectedPropertyId) {
            const loadCalendar = async () => {
                setIsLoadingData(true);
                try {
                    const { data } = await axios.get(`/api/calendar?propertyId=${selectedPropertyId}`);
                    setCalendarData(data);
                } catch (error) {
                    console.error("Erro ao carregar calendário", error);
                    toast.error("Erro ao carregar disponibilidade do imóvel.");
                } finally {
                    setIsLoadingData(false);
                }
            };
            loadCalendar();
            // Resetar datas ao mudar de imóvel
            setSelectedRange({ start: null, end: null });
            setPricing(null);
        }
    }, [selectedPropertyId, isOpen]);

    // Calcular preço ao selecionar intervalo
    useEffect(() => {
        if (selectedRange.start && selectedRange.end && selectedPropertyId) {
            const fetchPricing = async () => {
                try {
                    const res = await axios.get(`/api/pricing`, {
                        params: {
                            propertyId: selectedPropertyId,
                            checkIn: format(selectedRange.start!, "yyyy-MM-dd"),
                            checkOut: format(selectedRange.end!, "yyyy-MM-dd"),
                            guests: numGuests // Admin não precisa filtrar por hospedes para reserva manual básica
                        }
                    });
                    setPricing(res.data);
                } catch (error) {
                    console.error("Erro ao calcular preço", error);
                }
            };
            fetchPricing();
        } else {
            setPricing(null);
        }
    }, [selectedRange, selectedPropertyId, numGuests]);

    const isDateAvailable = (date: Date) => {
        if (!calendarData) return false;

        const d = startOfDay(date);
        const today = startOfDay(new Date());

        // Regra 1: Não permitir datas passadas (mesma regra do sistema)
        if (isBefore(d, today)) return false;

        // Regra 2: Janelas de Disponibilidade
        const hasWindows = calendarData.availabilityWindows && calendarData.availabilityWindows.length > 0;
        if (hasWindows) {
            const inWindow = calendarData.availabilityWindows.some((w: any) => {
                const start = startOfDay(new Date(w.startDate));
                const end = startOfDay(new Date(w.endDate));
                return isWithinInterval(d, { start, end });
            });
            if (!inWindow) return false;
        }

        // Regra 3: Bloqueios
        const isBlocked = calendarData.blockedDates?.some((b: any) => isSameDay(new Date(b.date), d));
        if (isBlocked) return false;

        // Regra 4: Reservas
        const hasReservation = calendarData.reservations?.some((r: any) => {
            const start = startOfDay(new Date(r.checkIn));
            const end = startOfDay(new Date(r.checkOut));
            return d >= start && d < end;
        });
        if (hasReservation) return false;

        return true;
    };

    const getDayRules = (date: Date) => {
        if (!calendarData?.pricingRules) return [];
        const dateOnly = startOfDay(date);
        const now = startOfDay(new Date());

        return calendarData.pricingRules.filter((rule: any) => {
            if (!rule.isActive) return false;

            if (rule.type === 'WEEKEND_SURGE' && isWeekend(dateOnly)) return true;

            if (rule.type === 'SEASONAL' && rule.startDate && rule.endDate) {
                const s = startOfDay(new Date(rule.startDate));
                const e = startOfDay(new Date(rule.endDate));
                if (dateOnly >= s && dateOnly <= e) return true;
            }

            if (rule.type === 'LAST_MINUTE') {
                const daysToDate = differenceInDays(dateOnly, now);
                if (daysToDate >= 0 && daysToDate <= (rule.minDays || 7)) return true;
            }

            if (rule.type === 'EARLY_BIRD') {
                const daysToDate = differenceInDays(dateOnly, now);
                if (daysToDate >= (rule.minDays || 30)) return true;
            }

            return false;
        });
    };

    const onDateClick = (day: Date) => {
        if (!isDateAvailable(day)) return;

        if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
            setSelectedRange({ start: day, end: null });
        } else {
            if (isBefore(day, selectedRange.start)) {
                setSelectedRange({ start: day, end: selectedRange.start });
            } else if (isSameDay(day, selectedRange.start)) {
                setSelectedRange({ start: null, end: null });
            } else {
                const interval = eachDayOfInterval({ start: selectedRange.start, end: day });
                const hasBlockInRange = interval.some(d => !isDateAvailable(d));

                if (hasBlockInRange) {
                    setSelectedRange({ start: day, end: null });
                } else {
                    setSelectedRange({ ...selectedRange, end: day });
                }
            }
        }
    };

    const handleConfirmReservation = async () => {
        if (!selectedRange.start || !selectedRange.end || !pricing) return;

        setIsSubmitting(true);
        const tId = toast.loading("Confirmando reserva manual...");
        try {
            await axios.post("/api/admin/reservations", {
                propertyId: selectedPropertyId,
                guestId: guest.id,
                checkIn: format(selectedRange.start, "yyyy-MM-dd"),
                checkOut: format(selectedRange.end, "yyyy-MM-dd"),
                totalAmount: pricing.total,
                nightlyRate: pricing.total / pricing.breakdown.length,
                cleaningFee: pricing.cleaningFee,
                totalNights: pricing.breakdown.length,
                numGuests,
                occupants: occupants.filter(o => o.name)
            });

            toast.success("Reserva criada com sucesso!", { id: tId });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao criar reserva.", { id: tId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderMonth = (monthDate: Date) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = [];
        let day = startDate;
        while (day <= endDate) {
            days.push(day);
            day = addDays(day, 1);
        }

        return (
            <div className="flex-1">
                <h3 className="text-center font-bold text-olive-900 mb-4 capitalize text-sm">
                    {format(monthDate, "MMMM yyyy", { locale: ptBR })}
                </h3>
                <div className="grid grid-cols-7 mb-2">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-olive-900/30 py-1">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-0.5">
                    {days.map((date, i) => {
                        const isCurrentMonth = isSameMonth(date, monthStart);
                        const isAvailable = isDateAvailable(date);
                        const isSelectedStart = selectedRange.start && isSameDay(date, selectedRange.start);
                        const isSelectedEnd = selectedRange.end && isSameDay(date, selectedRange.end);
                        const isInRange = selectedRange.start && selectedRange.end &&
                            isWithinInterval(date, { start: selectedRange.start, end: selectedRange.end });
                        const isToday = isSameDay(date, new Date());

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => {
                                    if (!isCurrentMonth) return;
                                    if (!isAvailable) {
                                        toast.error("Esta data não está disponível.");
                                        return;
                                    }
                                    console.log("Data clicada:", format(date, "yyyy-MM-dd"));
                                    onDateClick(date);
                                }}
                                className={cn(
                                    "h-9 flex items-center justify-center relative cursor-pointer text-xs transition-all w-full active:scale-90",
                                    !isCurrentMonth && "opacity-0 pointer-events-none",
                                    isCurrentMonth && !isAvailable && "text-olive-900/10 cursor-not-allowed line-through",
                                    isAvailable && isCurrentMonth && "hover:bg-olive-900/10 rounded-lg",
                                    isInRange && "bg-olive-900/10 rounded-none",
                                    isSelectedStart && "bg-olive-900 text-white rounded-lg z-10 scale-110 shadow-lg font-black",
                                    isSelectedEnd && "bg-olive-900 text-white rounded-lg z-10 scale-110 shadow-lg font-black",
                                    isToday && !isSelectedStart && !isSelectedEnd && "ring-2 ring-olive-900/20 rounded-lg"
                                )}
                            >
                                <span className="relative z-10">{format(date, "d")}</span>
                                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 px-1">
                                    {getDayRules(date).map((rule: any) => (
                                        <div
                                            key={rule.id}
                                            className="w-1 h-1 rounded-full"
                                            style={{ backgroundColor: rule.color || '#10b981' }}
                                        />
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#F5EBE1] border-none rounded-[2rem] shadow-2xl">
                <div className="flex flex-col h-[90vh] md:h-auto">
                    {/* Header */}
                    <div className="p-8 border-b border-olive-900/5 bg-white/40">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-olive-900 rounded-2xl shadow-lg shadow-olive-900/20">
                                    <CalendarIcon className="w-6 h-6 text-sand-50" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black text-olive-900">Reserva Manual</DialogTitle>
                                    <p className="text-olive-900/60 font-bold text-sm">Hóspede: {guest.name}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-olive-900/10">
                                <X className="w-5 h-5 text-olive-900" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* Coluna Esquerda: Configuração */}
                            <div className="lg:col-span-7 space-y-8">

                                {/* Seleção de Imóvel */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-olive-900/40 uppercase tracking-widest flex items-center gap-2">
                                        <Home className="w-3 h-3" /> Escolha o Imóvel
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {properties.length === 0 && !isLoadingData && (
                                            <p className="text-xs text-olive-900/40 italic">Nenhum imóvel disponível no momento.</p>
                                        )}
                                        {properties.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    console.log("CLICK IMÓVEL:", p.id);
                                                    if (selectedPropertyId === p.id) {
                                                        toast.success(`${p.name} já está selecionado. Agora escolha as datas no calendário abaixo.`);
                                                        return;
                                                    }
                                                    setSelectedPropertyId(p.id);
                                                    toast.success(`Imóvel ${p.name} selecionado!`);
                                                }}
                                                className={cn(
                                                    "p-5 rounded-[2rem] border-2 transition-all text-left flex items-center justify-between group cursor-pointer active:scale-95 outline-none relative overflow-hidden",
                                                    selectedPropertyId === p.id
                                                        ? "bg-olive-900 border-olive-900 text-sand-50 shadow-xl shadow-olive-900/30 scale-[1.02]"
                                                        : "bg-white border-olive-900/5 text-olive-900 hover:border-olive-900/20"
                                                )}
                                            >
                                                <div className="flex-1 pr-4">
                                                    <div className="font-bold text-sm leading-tight mb-1">{p.name}</div>
                                                    <div className={cn("text-[10px] font-bold opacity-40 uppercase tracking-widest", selectedPropertyId === p.id ? "text-sand-100" : "text-olive-900")}>
                                                        {p.city} • {p.state}
                                                    </div>
                                                </div>
                                                <div>
                                                    {selectedPropertyId === p.id ? (
                                                        <div className="bg-sand-50 text-olive-900 rounded-full p-1 shadow-inner animate-in zoom-in duration-300">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border-2 border-olive-900/10 group-hover:border-olive-900/20 transition-colors" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantidade de Hóspedes */}
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-olive-900/40 flex items-center gap-2">
                                        <Users className="w-3 h-3" /> Quantidade de Hóspedes
                                    </label>
                                    <div className="flex items-center gap-6 bg-white p-4 rounded-3xl border border-olive-900/10 shadow-sm w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setNumGuests(Math.max(1, numGuests - 1))}
                                            className="w-10 h-10 rounded-full border border-olive-900/10 flex items-center justify-center hover:bg-olive-900 hover:text-white transition-all active:scale-90 disabled:opacity-20"
                                            disabled={numGuests <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-xl font-black text-olive-900 min-w-[1.5rem] text-center">{numGuests}</span>
                                        <button
                                            type="button"
                                            onClick={() => setNumGuests(numGuests + 1)}
                                            className="w-10 h-10 rounded-full border border-olive-900/10 flex items-center justify-center hover:bg-olive-900 hover:text-white transition-all active:scale-90"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {occupants.length > 0 && (
                                        <div className="space-y-4 pt-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive-900/40">Dados dos Acompanhantes</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {occupants.map((occ, idx) => (
                                                    <div key={idx} className="bg-olive-900/[0.02] p-5 rounded-3xl border border-olive-900/5 space-y-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="w-5 h-5 rounded-full bg-olive-900 text-white text-[10px] flex items-center justify-center font-bold">
                                                                {idx + 2}
                                                            </div>
                                                            <span className="text-xs font-bold text-olive-900/60 uppercase tracking-widest">Hóspede Adicional</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] font-bold text-olive-900/40 uppercase ml-1">Nome Completo</Label>
                                                                <Input
                                                                    placeholder="Nome do hóspede"
                                                                    value={occ.name}
                                                                    onChange={(e) => {
                                                                        const newOccs = [...occupants];
                                                                        newOccs[idx] = { ...newOccs[idx], name: e.target.value };
                                                                        setOccupants(newOccs);
                                                                    }}
                                                                    className="h-11 rounded-2xl border-olive-900/10 bg-white"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] font-bold text-olive-900/40 uppercase ml-1">Documento (CPF/RG)</Label>
                                                                <Input
                                                                    placeholder="000.000.000-00"
                                                                    value={occ.document}
                                                                    onChange={(e) => {
                                                                        const newOccs = [...occupants];
                                                                        newOccs[idx] = { ...newOccs[idx], document: e.target.value };
                                                                        setOccupants(newOccs);
                                                                    }}
                                                                    className="h-11 rounded-2xl border-olive-900/10 bg-white"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Calendário */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-olive-900/40 uppercase tracking-widest flex items-center gap-2">
                                        <CalendarIcon className="w-3 h-3" /> Selecionar Datas
                                    </label>
                                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-olive-900/5 relative">
                                        {isLoadingData && (
                                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-3xl">
                                                <Loader2 className="w-8 h-8 animate-spin text-olive-900/40" />
                                            </div>
                                        )}
                                        <div className="flex gap-8 relative">
                                            {renderMonth(currentMonth)}
                                            <div className="hidden md:block">
                                                {renderMonth(addMonths(currentMonth, 1))}
                                            </div>

                                            {/* Navegação */}
                                            <div className="absolute top-0 left-0 right-0 flex justify-between px-2">
                                                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-olive-900/5 rounded-full transition-all text-olive-900">
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-olive-900/5 rounded-full transition-all text-olive-900">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna Direita: Resumo */}
                            <div className="lg:col-span-5">
                                <div className="bg-olive-900 rounded-[2.5rem] p-8 text-sand-50 shadow-2xl space-y-8 sticky top-0">
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Resumo da Reserva</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                                                <div className="text-xs font-bold text-white/60">CHECK-IN</div>
                                                <div className="font-bold text-sm">
                                                    {selectedRange.start ? format(selectedRange.start, "dd 'de' MMM", { locale: ptBR }) : "--/--"}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                                                <div className="text-xs font-bold text-white/60">CHECK-OUT</div>
                                                <div className="font-bold text-sm">
                                                    {selectedRange.end ? format(selectedRange.end, "dd 'de' MMM", { locale: ptBR }) : "--/--"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {pricing ? (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className="text-white/60">Diárias ({differenceInDays(selectedRange.end!, selectedRange.start!)} noites)</span>
                                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pricing.total - pricing.cleaningFee)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className="text-white/60">Taxa de Limpeza</span>
                                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pricing.cleaningFee)}</span>
                                                </div>
                                                <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                                                    <div>
                                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">TOTAL DA RESERVA</div>
                                                        <div className="text-3xl font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pricing.total)}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleConfirmReservation}
                                                disabled={isSubmitting}
                                                className="w-full h-16 rounded-2xl bg-white text-olive-900 hover:bg-sand-50 font-black text-lg shadow-xl"
                                            >
                                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirmar Reserva"}
                                            </Button>

                                            <p className="text-[10px] text-center text-white/40 font-bold uppercase tracking-widest">
                                                Esta ação criará a reserva diretamente com status CONFIRMADO.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="h-40 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/20 rounded-3xl">
                                            <CalendarIcon className="w-8 h-8 text-white/20 mb-3" />
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-tight">
                                                Selecione as datas no calendário para calcular os valores
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
