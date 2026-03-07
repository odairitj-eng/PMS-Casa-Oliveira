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
    eachDayOfInterval
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DateSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (range: { checkIn: string; checkOut: string }) => void;
    initialCheckIn?: string;
    initialCheckOut?: string;
}

export function DateSelectionModal({
    isOpen,
    onClose,
    onSelect,
    initialCheckIn,
    initialCheckOut
}: DateSelectionModalProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
        start: initialCheckIn ? new Date(initialCheckIn + 'T12:00:00') : null,
        end: initialCheckOut ? new Date(initialCheckOut + 'T12:00:00') : null
    });

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setLoading(true);
                try {
                    const { data } = await axios.get("/api/calendar");
                    setData(data);
                } catch (error) {
                    console.error("Erro ao carregar dados do calendário", error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [isOpen]);

    const isDateAvailable = (date: Date) => {
        if (!data) return false;

        const d = startOfDay(date);
        const today = startOfDay(new Date());

        // Regra 1: Não permitir datas passadas
        if (isBefore(d, today)) return false;

        // Regra 2: Deve estar dentro de uma janela de disponibilidade (Availability Window)
        const inWindow = data.availabilityWindows?.some((w: any) => {
            const start = startOfDay(new Date(w.startDate));
            const end = startOfDay(new Date(w.endDate));
            return isWithinInterval(d, { start, end });
        });
        if (!inWindow) return false;

        // Regra 3: Não pode estar bloqueado manualmente
        const isBlocked = data.blockedDates?.some((b: any) => isSameDay(new Date(b.date), d));
        if (isBlocked) return false;

        // Regra 4: Não pode ter reserva confirmada
        const hasReservation = data.reservations?.some((r: any) => {
            const start = startOfDay(new Date(r.checkIn));
            const end = startOfDay(new Date(r.checkOut));
            // Checkout pode ser no mesmo dia do Checkin de outra reserva, mas aqui tratamos como intervalo fechado
            // Simplificação: se o dia está entre checkin e checkout, está ocupado.
            return isWithinInterval(d, { start, end: subMonths(addMonths(end, 0), 0) }); // Checkout exclusive?
            // Na maioria dos sistemas, checkout day é livre para checkin.
            // Para simplificar agora:
            return d >= start && d < end;
        });
        if (hasReservation) return false;

        return true;
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
                // Verificar se há bloqueios no meio do intervalo
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

    const handleConfirm = () => {
        if (selectedRange.start && selectedRange.end) {
            onSelect({
                checkIn: format(selectedRange.start, "yyyy-MM-dd"),
                checkOut: format(selectedRange.end, "yyyy-MM-dd")
            });
            onClose();
        }
    };

    const clearDates = () => {
        setSelectedRange({ start: null, end: null });
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
            <div className="flex-1 min-w-[300px]">
                <h3 className="text-center font-bold text-olive-900 mb-4 capitalize">
                    {format(monthDate, "MMMM yyyy", { locale: ptBR })}
                </h3>
                <div className="grid grid-cols-7 mb-2">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-olive-900/30 py-2">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {days.map((date, i) => {
                        const isCurrentMonth = isSameMonth(date, monthStart);
                        const isAvailable = isDateAvailable(date);
                        const isSelectedStart = selectedRange.start && isSameDay(date, selectedRange.start);
                        const isSelectedEnd = selectedRange.end && isSameDay(date, selectedRange.end);
                        const isInRange = selectedRange.start && selectedRange.end &&
                            isWithinInterval(date, { start: selectedRange.start, end: selectedRange.end });
                        const isToday = isSameDay(date, new Date());

                        return (
                            <div
                                key={i}
                                onClick={() => isCurrentMonth && onDateClick(date)}
                                className={cn(
                                    "h-10 md:h-12 flex items-center justify-center relative cursor-pointer text-sm transition-all",
                                    !isCurrentMonth && "opacity-0 pointer-events-none",
                                    isCurrentMonth && !isAvailable && "text-olive-900/10 cursor-not-allowed line-through",
                                    isAvailable && isCurrentMonth && "hover:bg-olive-900/5 rounded-full",
                                    isInRange && "bg-olive-900/5 rounded-none",
                                    isSelectedStart && "bg-olive-900 text-white rounded-full z-10",
                                    isSelectedEnd && "bg-olive-900 text-white rounded-full z-10",
                                    isToday && !isSelectedStart && !isSelectedEnd && "underline underline-offset-4 decoration-2 decoration-olive-900/30"
                                )}
                            >
                                <span className="relative z-10 font-bold">{format(date, "d")}</span>
                                {isInRange && !isSelectedStart && !isSelectedEnd && (
                                    <div className="absolute inset-0 bg-olive-900/5 -mx-[1px]" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none rounded-3xl shadow-2xl">
                <div className="p-6 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <DialogTitle className="text-2xl md:text-3xl font-bold text-olive-900 mb-1">
                                Selecionar datas
                            </DialogTitle>
                            <p className="text-olive-900/60 font-medium">
                                Adicione suas datas de viagem para ver os preços exatos
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-sand-50/50 p-2 rounded-2xl border border-olive-900/10">
                            <div className={cn(
                                "px-4 py-2 rounded-xl transition-all",
                                !selectedRange.start ? "bg-white shadow-sm ring-2 ring-olive-900" : "bg-transparent"
                            )}>
                                <span className="text-[10px] font-bold uppercase block text-olive-900/40">Check-in</span>
                                <span className="text-sm font-bold text-olive-900">
                                    {selectedRange.start ? format(selectedRange.start, "dd/MM/yyyy") : "Adicionar data"}
                                </span>
                            </div>
                            <div className={cn(
                                "px-4 py-2 rounded-xl transition-all",
                                selectedRange.start && !selectedRange.end ? "bg-white shadow-sm ring-2 ring-olive-900" : "bg-transparent"
                            )}>
                                <span className="text-[10px] font-bold uppercase block text-olive-900/40">Checkout</span>
                                <span className="text-sm font-bold text-olive-900">
                                    {selectedRange.end ? format(selectedRange.end, "dd/MM/yyyy") : "Adicionar data"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                            {renderMonth(currentMonth)}
                            <div className="hidden lg:block">
                                {renderMonth(addMonths(currentMonth, 1))}
                            </div>
                        </div>

                        {/* Controles de Navegação */}
                        <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none px-2">
                            <button
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="p-2 hover:bg-olive-900/5 rounded-full transition-all text-olive-900 pointer-events-auto"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="p-2 hover:bg-olive-900/5 rounded-full transition-all text-olive-900 pointer-events-auto"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-olive-900/10 flex items-center justify-between">
                        <button
                            onClick={clearDates}
                            className="text-sm font-bold text-olive-900 underline hover:text-black transition-colors"
                        >
                            Limpar datas
                        </button>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-bold text-olive-900 hover:bg-olive-900/5 rounded-xl transition-all"
                            >
                                Fechar
                            </button>
                            <Button
                                onClick={handleConfirm}
                                disabled={!selectedRange.start || !selectedRange.end}
                                className="bg-olive-900 text-sand-50 px-8 py-2.5 rounded-xl font-bold hover:bg-olive-800 transition-all shadow-lg shadow-olive-900/20 disabled:opacity-50"
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
