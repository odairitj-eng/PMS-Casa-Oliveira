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
    isWeekend,
    differenceInDays,
    eachDayOfInterval
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronLeft, ChevronRight, Lock, Clock, Info, X, Calendar, Minus } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { CalendarSidebar } from "@/components/admin/CalendarSidebar";
import { ReservationDetailsModal } from "@/components/admin/ReservationDetailsModal";
import toast from "react-hot-toast";

export function CalendarView({ refreshKey = 0, propertyId }: { refreshKey?: number, propertyId: string }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<any>(null);

    // Estados para seleção por arraste (botão direito)
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Date | null>(null);
    const [dragEnd, setDragEnd] = useState<Date | null>(null);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const parseLocal = (dStr: string) => {
        if (!dStr) return new Date();
        const datePart = dStr.includes('T') ? dStr.split('T')[0] : dStr;
        const [y, m, d] = datePart.split('-');
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    };

    useEffect(() => {
        const loadData = async () => {
            if (!propertyId) {
                setLoading(false);
                return;
            }
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
    }, [refreshKey, propertyId]);

    const onDateClick = (date: Date) => {
        const clickedDay = startOfDay(date);
        const today = startOfDay(new Date());

        if (isBefore(clickedDay, today)) return;

        const propertyMinNights = data?.property?.minimumNights || 1;
        const isNightlyAvailable = isDateNightAvailable(clickedDay);
        const isYesterdayAvailable = isDateNightAvailable(addDays(clickedDay, -1));
        const isTomorrowAvailable = isDateNightAvailable(addDays(clickedDay, 1));

        const dayReservation = data?.reservations?.find((r: any) => {
            const s = startOfDay(parseLocal(r.checkIn));
            const e = startOfDay(parseLocal(r.checkOut));
            return clickedDay >= s && clickedDay < e;
        });

        // Padrãão Profissional: Pode entrar no dia que o outro sai (transiçãão de check-in)
        const isCheckinTransition = !isNightlyAvailable && isTomorrowAvailable;
        const isCheckoutTransition = !isNightlyAvailable && isYesterdayAvailable;

        if (!selectedRange || (selectedRange.start && selectedRange.end && !isSameDay(selectedRange.start, selectedRange.end))) {
            if (!isNightlyAvailable && !isCheckinTransition) {
                if (dayReservation) {
                    setSelectedReservation(dayReservation);
                    setIsDetailsModalOpen(true);
                    return;
                }
                toast.error("Não é possível iniciar uma reserva em uma data ocupada.");
                return;
            }
            setSelectedRange({ start: clickedDay, end: clickedDay });
        } else {
            // Tentando fechar o range
            if (isBefore(clickedDay, selectedRange.start)) {
                if (!isNightlyAvailable && !isCheckinTransition) {
                    toast.error("Não é possível iniciar uma reserva em uma data ocupada.");
                    return;
                }
                setSelectedRange({ start: clickedDay, end: clickedDay });
                return;
            }

            if (isSameDay(clickedDay, selectedRange.start)) {
                setSelectedRange(null);
                return;
            }

            // Validar checkout
            const isAvailableForCheckOut = isNightlyAvailable || isCheckoutTransition;
            if (!isAvailableForCheckOut) {
                toast.error("Esta data está ocupada para checkout.");
                return;
            }

            // Verificar se há bloqueios NO MEIO do caminho (excluindo o dia de saída clickedDay)
            const interval = eachDayOfInterval({ start: selectedRange.start, end: clickedDay });
            const nights = interval.slice(0, -1);

            const hasBlockInRange = nights.some((d: Date, index: number) => {
                const isNighlyAvail = isDateNightAvailable(d);
                if (index === 0) {
                    // Se o primeiro dia for uma transiçãão de check-in, permitimos a noite
                    const isStartTransition = !isNighlyAvail && isDateNightAvailable(addDays(d, 1));
                    if (isStartTransition) return false;
                }
                return !isNighlyAvail;
            });

            if (hasBlockInRange) {
                toast.error("O intervalo contém datas ocupadas. Selecione um período livre.");
                return;
            }

            // Validar Noites Mínimas
            const nightsCount = differenceInDays(clickedDay, selectedRange.start);
            if (nightsCount < propertyMinNights) {
                toast.error(`O período mínimo é de ${propertyMinNights} noite${propertyMinNights > 1 ? 's' : ''}.`);
                return;
            }

            setSelectedRange({ ...selectedRange, end: clickedDay });
        }
    };

    // Handlers para Arraste com Botão Direito
    const handleMonthChange = (offset: number) => {
        if (viewMode === 'month') {
            setCurrentMonth(addMonths(currentMonth, offset));
        } else {
            setCurrentMonth(addMonths(currentMonth, offset * 12));
        }
    };

    const handlePointerDown = (e: React.PointerEvent, date: Date) => {
        if (e.button === 2) { // Botão direito
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            const startDay = startOfDay(date);
            const today = startOfDay(new Date());
            if (isBefore(startDay, today)) return;

            setIsDragging(true);
            setDragStart(startDay);
            setDragEnd(startDay);
        }
    };

    const handlePointerEnter = (day: Date) => {
        if (isDragging) {
            const currentDay = startOfDay(day);
            const today = startOfDay(new Date());
            if (isBefore(currentDay, today)) return;
            setDragEnd(currentDay);
        }
    };

    const handleMouseUp = () => {
        if (isDragging && dragStart && dragEnd) {
            const start = isBefore(dragStart, dragEnd) ? dragStart : dragEnd;
            const end = isBefore(dragStart, dragEnd) ? dragEnd : dragStart;
            setSelectedRange({ start, end });
        }
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
    };

    // Helper para verificar se uma data está no intervalo de arraste de forma performática
    const getIsDateInDragRange = (cloneDay: Date) => {
        if (!isDragging || !dragStart || !dragEnd) return false;
        const t = cloneDay.getTime();
        const s = dragStart.getTime();
        const e = dragEnd.getTime();
        return (t >= s && t <= e) || (t >= e && t <= s);
    };

    // Efeito para finalizar arraste globalmente e gerenciar cursor/seleção
    useEffect(() => {
        const handleGlobalPointerUp = (e: PointerEvent) => {
            if (isDragging) {
                handleMouseUp();
            }
        };

        const handleGlobalContextMenu = (e: MouseEvent) => {
            if (isDragging) e.preventDefault();
        };

        if (isDragging) {
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'crosshair';
            window.addEventListener('pointerup', handleGlobalPointerUp);
            window.addEventListener('contextmenu', handleGlobalContextMenu);
        } else {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }

        return () => {
            window.removeEventListener('pointerup', handleGlobalPointerUp);
            window.removeEventListener('contextmenu', handleGlobalContextMenu);
        };
    }, [isDragging, dragStart, dragEnd]);

    const handleOpenSidebar = () => {
        if (selectedRange) setIsSidebarOpen(true);
    };

    const isDateInWindow = (date: Date) => {
        if (!data?.availabilityWindows) return false;
        return data.availabilityWindows.some((w: any) => {
            const start = startOfDay(parseLocal(w.startDate));
            const end = startOfDay(parseLocal(w.endDate));
            return isWithinInterval(startOfDay(date), { start, end });
        });
    };

    const isDateNightAvailable = (date: Date) => {
        const dateOnly = startOfDay(date);
        const inWindow = isDateInWindow(dateOnly);
        const dayReservation = data?.reservations?.find((r: any) => {
            const s = startOfDay(parseLocal(r.checkIn));
            const e = startOfDay(parseLocal(r.checkOut));
            return dateOnly >= s && dateOnly < e;
        });
        const dayBlock = data?.blockedDates?.find((b: any) => isSameDay(parseLocal(b.date), dateOnly));
        const isPast = isBefore(dateOnly, startOfDay(new Date()));
        return inWindow && !dayBlock && !dayReservation && !isPast;
    };

    const getDayRules = (date: Date) => {
        if (!data?.pricingRules) return [];
        const dateOnly = startOfDay(date);
        const now = startOfDay(new Date());

        return data.pricingRules.filter((rule: any) => {
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

    const handleRecalcRolling = async () => {
        const tId = toast.loading("Recalculando janelas dinâmicas...");
        try {
            await axios.post("/api/admin/availability-windows/recalc", { propertyId });
            toast.success("Janelas rolling atualizadas!", { id: tId });
            window.location.reload();
        } catch {
            toast.error("Erro ao recalcular janelas.", { id: tId });
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-2 mb-4 md:mb-6 gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-hidden">
                    <button className="flex items-center gap-1 hover:bg-gray-100 px-2 md:px-3 py-2 rounded-lg transition-colors group">
                        <h2 className="text-xl md:text-2xl font-bold text-olive-900 capitalize truncate">
                            {viewMode === 'month'
                                ? format(currentMonth, "MMMM", { locale: ptBR })
                                : format(currentMonth, "yyyy")
                            }
                        </h2>
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-olive-900 transform group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <div className="flex items-center gap-1 ml-auto md:ml-4">
                        <div className="flex items-center gap-0.5 md:gap-1">
                            <button
                                onClick={() => handleMonthChange(-1)}
                                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl hover:bg-olive-900/10 text-olive-900 transition-all active:scale-90"
                            >
                                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            <button
                                onClick={() => handleMonthChange(1)}
                                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl hover:bg-olive-900/10 text-olive-900 transition-all active:scale-90"
                            >
                                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>

                        <button
                            onClick={handleRecalcRolling}
                            className="p-2 hover:bg-olive-900/5 rounded-full transition-all text-olive-900/20 hover:text-olive-900 ml-1 md:ml-2"
                            title="Recalcular janelas dinâmicas (Rolling)"
                        >
                            <Clock className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="bg-sand-50 rounded-xl p-1 flex border border-olive-900/5">
                        <button
                            onClick={() => setViewMode('month')}
                            className={cn(
                                "px-3 md:px-4 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-all",
                                viewMode === 'month' ? "bg-white shadow-sm text-olive-900" : "text-olive-900/40 hover:text-olive-900"
                            )}
                        >
                            Mês
                        </button>
                        <button
                            onClick={() => setViewMode('year')}
                            className={cn(
                                "px-3 md:px-4 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-all",
                                viewMode === 'year' ? "bg-white shadow-sm text-olive-900" : "text-olive-900/40 hover:text-olive-900"
                            )}
                        >
                            Ano
                        </button>
                    </div>

                    {selectedRange && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="bg-olive-900 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1.5 md:gap-2 shadow-lg shadow-olive-900/20 max-w-[120px] md:max-w-none">
                                <span className="truncate">
                                    {format(selectedRange.start, "d 'de' MMM", { locale: ptBR })}
                                </span>
                                <X
                                    className="w-3 h-3 md:w-3.5 md:h-3.5 cursor-pointer hover:text-sand-200 flex-shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRange(null);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderMonthGrid = (monthDate: Date) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isCurrentMonth = isSameMonth(cloneDay, monthStart);
                const isToday = isSameDay(cloneDay, new Date());

                const inWindow = isDateInWindow(cloneDay);
                const dayReservation = data?.reservations?.find((r: any) => {
                    const checkIn = startOfDay(parseLocal(r.checkIn));
                    const checkOut = startOfDay(parseLocal(r.checkOut));
                    return cloneDay >= checkIn && cloneDay < checkOut;
                });
                const dayBlock = data?.blockedDates?.find((b: any) => isSameDay(parseLocal(b.date), cloneDay));
                const isPast = isBefore(cloneDay, startOfDay(new Date()));

                const isNightlyAvailable = isDateNightAvailable(cloneDay);
                const isYesterdayAvailable = isDateNightAvailable(addDays(cloneDay, -1));
                const isTomorrowAvailable = isDateNightAvailable(addDays(cloneDay, 1));

                // Padrãão Profissional (Airbnb):
                // ENTRAR: ÚÚltimo dia de um bloqueio (hoje ocupado, amanhãã livre).
                // SAIR: Primeiro dia de um bloqueio (hoje ocupado, ontem livre).
                const isCheckinDay = !isNightlyAvailable && isTomorrowAvailable;
                const isCheckoutDay = !isNightlyAvailable && isYesterdayAvailable;

                const isVivid = isNightlyAvailable || isCheckinDay || isCheckoutDay;
                const canInteract = (inWindow && !isPast) || isCheckoutDay || isCheckinDay;

                const isInDragRange = getIsDateInDragRange(cloneDay);
                const isSelected = (selectedRange && isWithinInterval(cloneDay, {
                    start: isBefore(selectedRange.start, selectedRange.end) ? selectedRange.start : selectedRange.end,
                    end: isBefore(selectedRange.start, selectedRange.end) ? selectedRange.end : selectedRange.start
                })) || isInDragRange;

                let finalPrice = data?.overrides?.find((o: any) => isSameDay(parseLocal(o.date), cloneDay))?.price || data?.property?.basePrice || 0;
                const price = Math.round(finalPrice);

                days.push(
                    <div
                        key={cloneDay.toString()}
                        className={cn(
                            "relative h-32 md:h-40 p-1 md:p-5 transition-all cursor-pointer group rounded-2xl md:rounded-[2rem] border",
                            !isCurrentMonth && "bg-gray-50/10 text-gray-300 border-transparent",
                            isPast && isCurrentMonth && "bg-gray-100/50 grayscale-[0.8] opacity-80 border-olive-900/10",
                            !isVivid && !dayBlock && isCurrentMonth && "bg-gray-50/50 grayscale-[0.5] opacity-70 border-olive-900/15",
                            dayBlock && isCurrentMonth && "bg-white border-olive-900/40 shadow-sm transition-opacity",
                            isVivid && isCurrentMonth && "bg-white border-olive-900/40 hover:border-olive-900 shadow-sm",
                            isSelected && "bg-olive-900/15 border-olive-900 z-20 grayscale-0 opacity-100",
                            !isNightlyAvailable && dayReservation && isCurrentMonth && "bg-olive-900/5 border-olive-900/40 grayscale-0 opacity-100",
                            isToday && !isSelected && "border-olive-900/80 shadow-inner bg-sand-50/30"
                        )}
                        onClick={() => canInteract && onDateClick(cloneDay)}
                        onPointerDown={(e) => canInteract && handlePointerDown(e, cloneDay)}
                        onPointerEnter={() => canInteract && handlePointerEnter(cloneDay)}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <div className="relative z-10 flex flex-col items-center h-full overflow-hidden text-center">
                            <span className={cn(
                                "text-sm md:text-lg font-black mb-0.5 md:mb-1 transition-colors",
                                isToday && !isSelected && "text-olive-900 underline decoration-2 underline-offset-4",
                                isSelected ? "text-olive-900" : (isNightlyAvailable || isCheckoutDay || isCheckinDay ? "text-olive-900" : "text-olive-900/40"),
                                !isCurrentMonth && "text-olive-900/0"
                            )}>
                                {format(cloneDay, "d")}
                            </span>

                            <div className="flex flex-col items-center gap-0.5 w-full">
                                {!isNightlyAvailable && isCheckoutDay && isCurrentMonth && !isSelected && (
                                    <span className="text-[7px] md:text-[9px] font-bold text-olive-900 bg-olive-900/10 px-1 rounded uppercase truncate max-w-full">Out</span>
                                )}
                                {isCheckinDay && isCurrentMonth && !isSelected && (
                                    <span className="text-[7px] md:text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1 rounded uppercase truncate max-w-full">In</span>
                                )}
                            </div>

                            {isCurrentMonth && (
                                <div className="mt-auto w-full flex flex-col items-center gap-0.5">
                                    {dayReservation ? (
                                        <div className={cn(
                                            "flex flex-col items-center text-[7px] md:text-[10px] font-bold py-0.5 px-1 rounded-lg w-full",
                                            isSelected ? "bg-olive-900/10 text-olive-900" : "bg-olive-900/5 text-olive-900/60"
                                        )}>
                                            <span className="truncate font-bold">Ocupado</span>
                                        </div>
                                    ) : dayBlock ? (
                                        (() => {
                                            const reason = dayBlock.reason || "Indisponível";
                                            const isAirbnb = reason.toUpperCase().includes('AIRBNB');
                                            const isBooking = reason.toUpperCase().includes('BOOKING');
                                            let bgClass = "bg-gray-100";
                                            let textClass = "text-gray-400";
                                            if (isAirbnb) { bgClass = "bg-rose-100"; textClass = "text-rose-700"; }
                                            else if (isBooking) { bgClass = "bg-blue-100"; textClass = "text-blue-800"; }
                                            return (
                                                <div className={cn("flex flex-col items-center text-[6px] md:text-[9px] font-bold py-0.5 px-1 rounded-lg w-full", bgClass, textClass)}>
                                                    <span className="truncate">{reason}</span>
                                                </div>
                                            );
                                        })()
                                    ) : isNightlyAvailable ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] md:text-lg font-black tracking-tight text-olive-900">R${price}</span>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-2 mb-2" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="w-full">{rows}</div>;
    };

    const renderYearView = () => {
        const startOfCurMonth = startOfMonth(currentMonth);
        const months = Array.from({ length: 12 }, (_, i) => addMonths(startOfCurMonth, i));

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {months.map((month) => (
                    <div key={month.toString()} className="space-y-4">
                        <h3 className="text-lg font-bold text-olive-900 capitalize px-2">
                            {format(month, "MMMM", { locale: ptBR })}
                        </h3>
                        <div className="grid grid-cols-7 gap-1">
                            {["d", "s", "t", "q", "q", "s", "s"].map((d, i) => (
                                <div key={i} className="text-[8px] font-bold uppercase text-olive-900/30 text-center">{d}</div>
                            ))}
                            {Array.from({ length: 42 }, (_, i) => {
                                const day = addDays(startOfWeek(startOfMonth(month)), i);
                                const isCurrentMonth = isSameMonth(day, month);
                                const inWindow = isDateInWindow(day);
                                const dayBlock = data?.blockedDates?.find((b: any) => isSameDay(parseLocal(b.date), day));
                                const isPast = isBefore(day, startOfDay(new Date()));
                                const isAvailable = inWindow && !dayBlock && !isPast;
                                const canInteract = inWindow && !isPast;
                                const isInDragRange = getIsDateInDragRange(day);

                                const isSelected = (selectedRange && isWithinInterval(day, {
                                    start: isBefore(selectedRange.start, selectedRange.end) ? selectedRange.start : selectedRange.end,
                                    end: isBefore(selectedRange.start, selectedRange.end) ? selectedRange.end : selectedRange.start
                                })) || isInDragRange;

                                return (
                                    <div
                                        key={day.toString()}
                                        className={cn(
                                            "relative min-h-[50px] md:min-h-[140px] px-1 py-1 md:p-3 border-t border-olive-900/5 flex flex-col group transition-all",
                                            !isCurrentMonth && "bg-sand-50/30 opacity-30",
                                            isCurrentMonth && "hover:bg-olive-900/5",
                                            isSelected && "bg-olive-900/10 ring-2 ring-inset ring-olive-900/20 z-10"
                                        )}
                                        onClick={() => canInteract && onDateClick(day)}
                                        onPointerDown={(e) => canInteract && handlePointerDown(e, day)}
                                        onPointerEnter={() => canInteract && handlePointerEnter(day)}
                                        onContextMenu={(e) => e.preventDefault()}
                                    >
                                        {format(day, "d")}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 pb-12 select-none" onContextMenu={(e) => e.button === 2 && e.preventDefault()}>
            {renderHeader()}

            {viewMode === 'month' && (
                <div className="grid grid-cols-7 mb-4 px-2">
                    {["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."].map((dayName, idx) => (
                        <div key={idx} className="text-center text-[10px] font-bold uppercase tracking-widest text-olive-900/30">
                            {dayName}
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="h-[600px] flex items-center justify-center bg-white rounded-[2.5rem] border border-olive-900/5">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-900"></div>
                </div>
            ) : (
                viewMode === 'month' ? renderMonthGrid(currentMonth) : renderYearView()
            )}

            <CalendarSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                selectedRange={selectedRange}
                onSuccess={() => {
                    window.location.reload();
                }}
                basePrice={data?.property?.basePrice}
                propertyId={propertyId}
            />

            <ReservationDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                reservation={selectedReservation}
                onSuccess={() => {
                    // Refresh data instead of full reload if possible, but reload is safer for now
                    window.location.reload();
                }}
            />
        </div>
    );
}
