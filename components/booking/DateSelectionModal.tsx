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
        const parts = datePart.split('-');
        if (parts.length !== 3) return new Date();
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
        start: initialCheckIn ? parseLocal(initialCheckIn) : null,
        end: initialCheckOut ? parseLocal(initialCheckOut) : null
    });

    // Mapas para busca O(1)
    const [occupiedMap, setOccupiedMap] = useState<{ [key: string]: 'reservation' | 'blocked' }>({});
    const [priceMap, setPriceMap] = useState<{ [key: string]: number }>({});
    const [rulesMap, setRulesMap] = useState<{ [key: string]: any[] }>({});

    useEffect(() => {
        if (isOpen && propertyId) {
            const loadData = async () => {
                setLoading(true);
                try {
                    const { data } = await axios.get(`/api/calendar?propertyId=${propertyId}`);
                    setData(data);

                    const newOccupiedMap: { [key: string]: 'reservation' | 'blocked' } = {};
                    const newPriceMap: { [key: string]: number } = {};
                    const newRulesMap: { [key: string]: any[] } = {};

                    // 1. Pre-processar datas ocupadas
                    data.reservations?.forEach((r: any) => {
                        const start = startOfDay(parseLocal(r.checkIn));
                        const end = startOfDay(parseLocal(r.checkOut));
                        const interval = eachDayOfInterval({ start, end: addDays(end, -1) });
                        interval.forEach(d => {
                            newOccupiedMap[format(d, "yyyy-MM-dd")] = 'reservation';
                        });
                    });

                    data.blockedDates?.forEach((b: any) => {
                        newOccupiedMap[format(parseLocal(b.date), "yyyy-MM-dd")] = 'blocked';
                    });

                    // 2. Pre-processar Overrides de Preço
                    data.overrides?.forEach((o: any) => {
                        newPriceMap[format(parseLocal(o.date), "yyyy-MM-dd")] = o.price;
                    });

                    setOccupiedMap(newOccupiedMap);
                    setPriceMap(newPriceMap);
                    // O RulesMap será preenchido sob demanda ou cacheado se necessário
                } catch (error) {
                    console.error("Erro ao carregar dados do calendário", error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [isOpen, propertyId]);

    // Função otimizada para buscar regras de um dia específico (com cache interno simples para a sessão)
    const getCachedDayRules = (date: Date) => {
        const dateKey = format(date, "yyyy-MM-dd");
        if (rulesMap[dateKey]) return rulesMap[dateKey];

        if (!data?.pricingRules) return [];
        const dateOnly = startOfDay(date);
        const now = startOfDay(new Date());

        const dayRules = data.pricingRules.filter((rule: any) => {
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

        // Atualiza o mapa de regras (sem disparar re-render excessivo)
        rulesMap[dateKey] = dayRules;
        return dayRules;
    };

    const isDateAvailable = (date: Date) => {
        if (!data) return false;

        const d = startOfDay(date);
        const today = startOfDay(new Date());

        if (isBefore(d, today)) return false;

        const dateKey = format(d, "yyyy-MM-dd");
        if (occupiedMap[dateKey]) return false;

        const hasWindows = data.availabilityWindows && data.availabilityWindows.length > 0;
        if (hasWindows) {
            return data.availabilityWindows.some((w: any) => {
                const start = startOfDay(parseLocal(w.startDate));
                const end = startOfDay(parseLocal(w.endDate));
                return isWithinInterval(d, { start, end });
            });
        }

        return true;
    };

    const isStartOfReservation = (date: Date) => {
        const dKey = format(date, "yyyy-MM-dd");
        if (occupiedMap[dKey] === 'blocked') return true;
        // Otimização: se já sabemos que está ocupado, buscar nos dados apenas se necessário
        if (occupiedMap[dKey] === 'reservation') {
            return data?.reservations?.some((r: any) => format(parseLocal(r.checkIn), "yyyy-MM-dd") === dKey);
        }
        return false;
    };

    const onDateClick = (day: Date) => {
        const d = startOfDay(day);
        const isAvailableForCheckIn = isDateAvailable(d);
        const minNights = data?.property?.minimumNights || 1;

        // Se não tem início ou estamos resetando
        if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
            if (!isAvailableForCheckIn) {
                toast.error("Esta data está ocupada para check-in.");
                return;
            }
            setSelectedRange({ start: d, end: null });
            setHoveredDate(null);
        } else {
            // Tentando fechar o range
            if (isBefore(d, selectedRange.start)) {
                if (!isAvailableForCheckIn) {
                    toast.error("Esta data está ocupada para check-in.");
                    return;
                }
                setSelectedRange({ start: d, end: null });
                return;
            }

            if (isSameDay(d, selectedRange.start)) {
                setSelectedRange({ start: null, end: null });
                return;
            }

            // Verificar se há bloqueios NO MEIO do intervalo (excluindo o dia de saída d)
            const interval = eachDayOfInterval({ start: selectedRange.start, end: d });
            const nightsInterval = interval.slice(0, -1);
            const hasBlockInRange = nightsInterval.some(date => !isDateAvailable(date));

            if (hasBlockInRange) {
                toast.error("O intervalo contém datas ocupadas. Selecione um período livre.");
                if (isAvailableForCheckIn) {
                    setSelectedRange({ start: d, end: null });
                }
                return;
            }

            // Validar Noites Mínimas
            const nightsCount = differenceInDays(d, selectedRange.start);
            if (nightsCount < minNights) {
                toast.error(`O período mínimo é de ${minNights} noite${minNights > 1 ? 's' : ''}.`);
                return;
            }

            setSelectedRange({ ...selectedRange, end: d });
            setHoveredDate(null);
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
            const dateKey = format(date, "yyyy-MM-dd");
            let dayPrice = priceMap[dateKey] || propertyBasePrice;

            if (!priceMap[dateKey]) {
                const rules = getCachedDayRules(date);
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

        const today = startOfDay(new Date());

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
                <div className="grid grid-cols-7 gap-[2px]">
                    {days.map((date, i) => {
                        const dateKey = format(date, "yyyy-MM-dd");
                        const isCurrentMonth = isSameMonth(date, monthStart);
                        const isSelectedStart = selectedRange.start && isSameDay(date, selectedRange.start);
                        const isSelectedEnd = selectedRange.end && isSameDay(date, selectedRange.end);
                        const isInRange = selectedRange.start && selectedRange.end &&
                            isWithinInterval(date, { start: selectedRange.start, end: selectedRange.end });
                        const isNightAvailable = isDateAvailable(date);
                        const isStartBlock = isStartOfReservation(date);
                        const isCheckoutDay = isStartBlock && isDateAvailable(addDays(date, -1));

                        const isVivid = isNightAvailable || isCheckoutDay; // Vívido se noite livre OU checkout após noite livre

                        const isToday = isSameDay(date, today);

                        const isHovered = selectedRange.start && !selectedRange.end && hoveredDate &&
                            isCurrentMonth && (isNightAvailable || isSameDay(date, hoveredDate)) &&
                            ((date >= selectedRange.start && date <= hoveredDate) || (date <= selectedRange.start && date >= hoveredDate));

                        // Otimização: Preço do dia usando o novo mapa O(1) e cache de regras
                        let finalPrice = priceMap[dateKey] || data?.property?.basePrice || 0;
                        if (!priceMap[dateKey]) {
                            const activeRules = getCachedDayRules(date);
                            activeRules.forEach((rule: any) => {
                                finalPrice *= rule.value;
                            });
                        }
                        const price = Math.round(finalPrice);

                        // Verificação se é dia de checkout de reserva alheia (Otimizado)
                        const isCheckoutOnly = isNightAvailable && data?.reservations?.some((r: any) => format(parseLocal(r.checkOut), "yyyy-MM-dd") === dateKey);


                        return (
                            <div
                                key={i}
                                onClick={() => isCurrentMonth && (isVivid || isInRange) && onDateClick(date)}
                                onMouseEnter={() => isCurrentMonth && isVivid && setHoveredDate(date)}
                                onMouseLeave={() => setHoveredDate(null)}
                                className={cn(
                                    "h-14 flex flex-col items-center justify-center relative cursor-pointer text-sm transition-all group",
                                    !isCurrentMonth && "opacity-0 pointer-events-none",
                                    isCurrentMonth && !isVivid && !isStartBlock && "opacity-30 cursor-not-allowed grayscale",
                                    isVivid && isCurrentMonth && "hover:bg-olive-900/5 rounded-xl",
                                    (isInRange || isHovered) && "bg-olive-900/5 rounded-none",
                                    isSelectedStart && "bg-olive-900 text-white rounded-xl z-10 shadow-lg shadow-olive-900/20 opacity-100 grayscale-0",
                                    isSelectedEnd && "bg-olive-900 text-white rounded-xl z-10 shadow-lg shadow-olive-900/20 opacity-100 grayscale-0",
                                    isToday && !isSelectedStart && !isSelectedEnd && "underline underline-offset-4 decoration-2 decoration-olive-900/30"
                                )}
                            >
                                <span className={cn(
                                    "relative z-10 font-black block text-base md:text-lg transition-colors",
                                    (isSelectedStart || isSelectedEnd) ? "text-white" : (isVivid ? "text-olive-900" : "text-olive-900/20")
                                )}>
                                    {format(date, "d")}
                                </span>

                                {isNightAvailable && isCurrentMonth && (
                                    <span className={cn(
                                        "text-[9px] font-bold mt-0.5 z-10 transition-colors",
                                        (isSelectedStart || isSelectedEnd) ? "text-white/60" : "text-olive-900/40"
                                    )}>
                                        R${price}
                                    </span>
                                )}

                                {isCheckoutOnly && !isSelectedStart && !isSelectedEnd && (
                                    <div className="absolute top-1 right-1">
                                        <div className="w-1.5 h-1.5 bg-olive-500 rounded-full" title="Disponível para check-in após o meio-dia" />
                                    </div>
                                )}

                                {!isNightAvailable && isCheckoutDay && isCurrentMonth && !isSelectedStart && !isSelectedEnd && (
                                    <span className="text-[8px] font-bold text-olive-900 bg-olive-900/10 px-1 rounded mt-0.5 z-10 uppercase">Sair</span>
                                )}

                                {(isInRange || isHovered) && !isSelectedStart && !isSelectedEnd && (
                                    <div className="absolute inset-0 bg-olive-900/[0.03] -mx-[1px] rounded-none" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div >
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none rounded-3xl shadow-2xl z-[100]">
                <div className="flex flex-col max-h-[90vh]">
                    {/* Header Fixo */}
                    <div className="p-6 md:p-10 pb-4 border-b border-olive-900/5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <DialogTitle className="text-xl md:text-3xl font-bold text-olive-900 mb-1">
                                    Selecionar datas
                                </DialogTitle>
                                <p className="text-olive-900/60 text-xs md:text-sm font-medium">
                                    Preços exatos com base nas suas datas
                                </p>
                            </div>

                            <div className="flex items-center gap-1 bg-sand-50/50 p-1.5 rounded-xl border border-olive-900/10 w-full sm:w-auto">
                                <div className={cn(
                                    "flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all",
                                    !selectedRange.start ? "bg-white shadow-sm ring-1 ring-olive-900" : "bg-transparent"
                                )}>
                                    <span className="text-[8px] font-bold uppercase block text-olive-900/40">Check-in</span>
                                    <span className="text-xs font-bold text-olive-900">
                                        {selectedRange.start ? format(selectedRange.start, "dd/MM") : "Add data"}
                                    </span>
                                </div>
                                <div className={cn(
                                    "flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all",
                                    selectedRange.start && !selectedRange.end ? "bg-white shadow-sm ring-1 ring-olive-900" : "bg-transparent"
                                )}>
                                    <span className="text-[8px] font-bold uppercase block text-olive-900/40">Checkout</span>
                                    <span className="text-xs font-bold text-olive-900">
                                        {selectedRange.end ? format(selectedRange.end, "dd/MM") : "Add data"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo Com Scroll */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-4 custom-scrollbar">
                        <div className="relative">
                            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                                {renderMonth(currentMonth)}
                                {renderMonth(addMonths(currentMonth, 1))}
                            </div>

                            {/* Controles de Navegação Flutuantes */}
                            <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none px-2 h-10">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-olive-900/5 rounded-full transition-all text-olive-900 pointer-events-auto active:scale-90"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-olive-900/5 rounded-full transition-all text-olive-900 pointer-events-auto active:scale-90"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Fixo */}
                    <div className="p-6 border-t border-olive-900/10 bg-white/80 backdrop-blur-md">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <button
                                    onClick={clearDates}
                                    className="text-xs font-bold text-olive-900 underline hover:text-black transition-colors"
                                >
                                    Limpar
                                </button>
                                {selectedRange.start && selectedRange.end && (
                                    <div className="mt-0.5">
                                        <span className="text-base font-black text-olive-900">R${calculateTotal()}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2.5 text-xs font-bold text-olive-900 hover:bg-olive-900/5 rounded-xl transition-all"
                                >
                                    Fechar
                                </button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={!selectedRange.start || !selectedRange.end}
                                    className="bg-olive-900 text-sand-50 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-olive-800 transition-all shadow-lg shadow-olive-900/20 disabled:opacity-50"
                                >
                                    Confirmar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
