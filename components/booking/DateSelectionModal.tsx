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
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DateSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (range: { checkIn: string; checkOut: string }) => void;
    initialCheckIn?: string;
    initialCheckOut?: string;
    propertyId: string;
}

export function DateSelectionModal({
    isOpen,
    onClose,
    onSelect,
    initialCheckIn,
    initialCheckOut,
    propertyId
}: DateSelectionModalProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

    const parseLocal = (dStr: string) => {
        if (!dStr) return new Date();
        // Garante que o formato seja YYYY-MM-DD ignorando T...
        const datePart = dStr.includes('T') ? dStr.split('T')[0] : dStr;
        const [y, m, d] = datePart.split('-');
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    };

    const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
        start: initialCheckIn ? parseLocal(initialCheckIn) : null,
        end: initialCheckOut ? parseLocal(initialCheckOut) : null
    });

    useEffect(() => {
        if (isOpen && propertyId) {
            const loadData = async () => {
                setLoading(true);
                try {
                    const { data } = await axios.get(`/api/calendar?propertyId=${propertyId}`);
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

    const getDayRules = (date: Date) => {
        if (!data?.pricingRules) return [];
        const dateOnly = startOfDay(date);
        const now = startOfDay(new Date());

        return data.pricingRules.filter((rule: any) => {
            if (!rule.isActive) return false;
            if (rule.type === 'WEEKEND_SURGE' && (dateOnly.getDay() === 0 || dateOnly.getDay() === 6)) return true;
            if (rule.type === 'SEASONAL' && rule.startDate && rule.endDate) {
                const s = startOfDay(parseLocal(rule.startDate));
                const e = startOfDay(parseLocal(rule.endDate));
                if (dateOnly >= s && dateOnly <= e) return true;
            }
            if (rule.type === 'LAST_MINUTE') {
                const daysToDate = differenceInDays(dateOnly, now);
                return daysToDate >= 0 && daysToDate <= (rule.minDays || 7);
            }
            if (rule.type === 'EARLY_BIRD') {
                const daysToDate = differenceInDays(dateOnly, now);
                return daysToDate >= (rule.minDays || 30);
            }
            return false;
        });
    };

    const isDateAvailable = (date: Date) => {
        if (!data) return false;

        const d = startOfDay(date);
        const today = startOfDay(new Date());

        // Regra 1: Não permitir datas passadas
        if (isBefore(d, today)) return false;

        // Regra 2: Janelas de Disponibilidade
        const hasWindows = data.availabilityWindows && data.availabilityWindows.length > 0;
        if (hasWindows) {
            const inWindow = data.availabilityWindows.some((w: any) => {
                const start = startOfDay(parseLocal(w.startDate));
                const end = startOfDay(parseLocal(w.endDate));
                return isWithinInterval(d, { start, end });
            });
            if (!inWindow) return false;
        }

        // Regra 3: Não pode estar bloqueado manualmente ou por iCal
        const isBlocked = data.blockedDates?.some((b: any) => isSameDay(parseLocal(b.date), d));
        if (isBlocked) return false;

        // Regra 4: Não pode ter reserva confirmada
        const hasReservation = data.reservations?.some((r: any) => {
            const start = startOfDay(parseLocal(r.checkIn));
            const end = startOfDay(parseLocal(r.checkOut));
            // Checkout day is free for check-in (Standard Practice)
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
            const nights = differenceInDays(selectedRange.end, selectedRange.start);
            const minNights = data?.property?.minimumNights || 1;

            if (nights < minNights) {
                toast.error(`A estadia mínima para este imóvel é de ${minNights} noites.`);
                return;
            }

            onSelect({
                checkIn: format(selectedRange.start, "yyyy-MM-dd"),
                checkOut: format(selectedRange.end, "yyyy-MM-dd")
            });
            onClose();
        }
    };

    const calculateTotal = () => {
        if (!selectedRange.start || !selectedRange.end || !data) return 0;

        let total = 0;
        const interval = eachDayOfInterval({
            start: selectedRange.start,
            end: addDays(selectedRange.end, -1) // Checkout exclusive
        });

        const propertyBasePrice = data.property?.basePrice || 0;

        for (const date of interval) {
            const dayOverride = data?.overrides?.find((o: any) => isSameDay(parseLocal(o.date), date));
            let dayPrice = dayOverride?.price || propertyBasePrice;

            if (!dayOverride) {
                const rules = getDayRules(date);
                rules.forEach((r: any) => { dayPrice *= r.value; });
            }
            total += Math.round(dayPrice);
        }

        return total + (data.property?.cleaningFee || 0);
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

                        const isHovered = selectedRange.start && !selectedRange.end && hoveredDate &&
                            isCurrentMonth && isAvailable &&
                            ((date >= selectedRange.start && date <= hoveredDate) || (date <= selectedRange.start && date >= hoveredDate));

                        // Cálculo de Preço igual ao Admin
                        const dayOverride = data?.overrides?.find((o: any) => isSameDay(parseLocal(o.date), date));
                        let finalPrice = dayOverride?.price || data?.property?.basePrice || 0;
                        if (!dayOverride) {
                            const activeRules = getDayRules(date);
                            activeRules.forEach((rule: any) => {
                                finalPrice *= rule.value;
                            });
                        }
                        const price = Math.round(finalPrice);

                        // Verificação se é dia de checkout de reserva alheia (poderia ter checkin no mesmo dia)
                        const isCheckoutOnly = data?.reservations?.some((r: any) => isSameDay(parseLocal(r.checkOut), date)) && isAvailable;

                        return (
                            <div
                                key={i}
                                onClick={() => isCurrentMonth && onDateClick(date)}
                                onMouseEnter={() => isCurrentMonth && isAvailable && setHoveredDate(date)}
                                onMouseLeave={() => setHoveredDate(null)}
                                className={cn(
                                    "h-14 md:h-20 flex flex-col items-center justify-center relative cursor-pointer text-sm transition-all group",
                                    !isCurrentMonth && "opacity-0 pointer-events-none",
                                    isCurrentMonth && !isAvailable && "opacity-30 cursor-not-allowed grayscale",
                                    isAvailable && isCurrentMonth && "hover:bg-olive-900/5 rounded-2xl",
                                    (isInRange || isHovered) && "bg-olive-900/5 rounded-none",
                                    isSelectedStart && "bg-olive-900 text-white rounded-2xl z-10 shadow-lg shadow-olive-900/20 opacity-100 grayscale-0",
                                    isSelectedEnd && "bg-olive-900 text-white rounded-2xl z-10 shadow-lg shadow-olive-900/20 opacity-100 grayscale-0",
                                    isToday && !isSelectedStart && !isSelectedEnd && "underline underline-offset-4 decoration-2 decoration-olive-900/30"
                                )}
                            >
                                <span className={cn(
                                    "relative z-10 font-black block text-lg transition-colors",
                                    (isSelectedStart || isSelectedEnd) ? "text-white" : (isAvailable ? "text-olive-900" : "text-olive-900/20")
                                )}>
                                    {format(date, "d")}
                                </span>

                                {isAvailable && isCurrentMonth && (
                                    <span className={cn(
                                        "text-[10px] font-bold mt-1 z-10 transition-colors",
                                        (isSelectedStart || isSelectedEnd) ? "text-white/60" : "text-olive-900/40"
                                    )}>
                                        R${price}
                                    </span>
                                )}

                                {isCheckoutOnly && !isSelectedStart && !isSelectedEnd && (
                                    <div className="absolute top-1 right-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" title="Disponível para check-in após o meio-dia" />
                                    </div>
                                )}

                                {!isAvailable && isCurrentMonth && (
                                    <div className="w-6 h-[1px] bg-olive-900/10 mt-2" />
                                )}

                                {(isInRange || isHovered) && !isSelectedStart && !isSelectedEnd && (
                                    <div className="absolute inset-0 bg-olive-900/[0.03] -mx-[1px] rounded-none" />
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
                        <div className="flex flex-col">
                            <button
                                onClick={clearDates}
                                className="text-sm font-bold text-olive-900 underline hover:text-black transition-colors text-left"
                            >
                                Limpar datas
                            </button>
                            {selectedRange.start && selectedRange.end && (
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xl font-black text-olive-900">Total: R${calculateTotal()}</span>
                                    <span className="text-[10px] font-bold text-olive-900/40 uppercase bg-olive-900/5 px-2 py-0.5 rounded-full">
                                        {differenceInDays(selectedRange.end, selectedRange.start)} noites
                                    </span>
                                </div>
                            )}
                        </div>
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
