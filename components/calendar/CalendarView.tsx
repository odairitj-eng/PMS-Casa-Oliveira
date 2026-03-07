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
    isWithinInterval
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronLeft, ChevronRight, Lock, Clock, Info, X, Calendar, Minus } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { CalendarSidebar } from "@/components/admin/CalendarSidebar";
import toast from "react-hot-toast";

export function CalendarView({ refreshKey = 0 }: { refreshKey?: number }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [refreshKey]);

    const onDateClick = (day: Date) => {
        const clickedDay = startOfDay(day);

        if (!selectedRange || (selectedRange.start && selectedRange.end && !isSameDay(selectedRange.start, selectedRange.end))) {
            setSelectedRange({ start: clickedDay, end: clickedDay });
        } else {
            if (isBefore(clickedDay, selectedRange.start)) {
                setSelectedRange({ start: clickedDay, end: selectedRange.start });
            } else {
                setSelectedRange({ ...selectedRange, end: clickedDay });
            }
        }
    };

    const handleOpenSidebar = () => {
        if (selectedRange) setIsSidebarOpen(true);
    };

    const isDateInWindow = (date: Date) => {
        if (!data?.availabilityWindows) return false;
        return data.availabilityWindows.some((w: any) => {
            const start = startOfDay(new Date(w.startDate));
            const end = startOfDay(new Date(w.endDate));
            return isWithinInterval(startOfDay(date), { start, end });
        });
    };

    const handleRecalcRolling = async () => {
        const tId = toast.loading("Recalculando janelas dinâmicas...");
        try {
            await axios.post("/api/admin/availability-windows/recalc");
            toast.success("Janelas rolling atualizadas!", { id: tId });
            window.location.reload();
        } catch {
            toast.error("Erro ao recalcular janelas.", { id: tId });
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-2 mb-6">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors group">
                        <h2 className="text-2xl font-bold text-olive-900 capitalize">
                            {viewMode === 'month'
                                ? format(currentMonth, "MMMM", { locale: ptBR })
                                : format(currentMonth, "yyyy")
                            }
                        </h2>
                        <ChevronRight className="w-5 h-5 text-olive-900 transform group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <div className="flex items-center gap-1 ml-4">
                        <div className="flex">
                            <button
                                onClick={() => setCurrentMonth(viewMode === 'month' ? subMonths(currentMonth, 1) : addMonths(currentMonth, -12))}
                                className="p-2 hover:bg-olive-900/5 rounded-full transition-all text-olive-900"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentMonth(viewMode === 'month' ? addMonths(currentMonth, 1) : addMonths(currentMonth, 12))}
                                className="p-2 hover:bg-olive-900/5 rounded-full transition-all text-olive-900"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            onClick={handleRecalcRolling}
                            className="p-2 hover:bg-olive-900/5 rounded-full transition-all text-olive-900/20 hover:text-olive-900 ml-2"
                            title="Recalcular janelas dinâmicas (Rolling)"
                        >
                            <Clock className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-sand-50 rounded-xl p-1 flex border border-olive-900/5">
                        <button
                            onClick={() => setViewMode('month')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-bold rounded-lg transition-all",
                                viewMode === 'month' ? "bg-white shadow-sm text-olive-900" : "text-olive-900/40 hover:text-olive-900"
                            )}
                        >
                            Mês
                        </button>
                        <button
                            onClick={() => setViewMode('year')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-bold rounded-lg transition-all",
                                viewMode === 'year' ? "bg-white shadow-sm text-olive-900" : "text-olive-900/40 hover:text-olive-900"
                            )}
                        >
                            Ano
                        </button>
                    </div>

                    {selectedRange && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="bg-olive-900 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-olive-900/20">
                                {format(selectedRange.start, "d 'de' MMM", { locale: ptBR })}
                                {isSameDay(selectedRange.start, selectedRange.end) ? "" : ` — ${format(selectedRange.end, "d 'de' MMM", { locale: ptBR })}`}
                                <X
                                    className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-sand-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRange(null);
                                    }}
                                />
                            </div>
                            <button
                                className="bg-olive-900 text-white rounded-full h-8 px-5 text-xs font-bold hover:bg-olive-950 transition-colors shadow-lg shadow-olive-900/20"
                                onClick={handleOpenSidebar}
                            >
                                Configurar
                            </button>
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

                const dayOverride = data?.overrides?.find((o: any) => isSameDay(new Date(o.date), cloneDay));
                const dayReservation = data?.reservations?.find((r: any) =>
                    isWithinInterval(cloneDay, { start: startOfDay(new Date(r.checkIn)), end: startOfDay(new Date(r.checkOut)) })
                );
                const dayBlock = data?.blockedDates?.find((b: any) => isSameDay(new Date(b.date), cloneDay));

                const isSelected = selectedRange && isWithinInterval(cloneDay, { start: selectedRange.start, end: selectedRange.end });

                const price = dayOverride?.price || data?.property?.basePrice || 0;

                days.push(
                    <div
                        key={cloneDay.toString()}
                        className={cn(
                            "relative h-40 p-5 transition-all cursor-pointer group rounded-[2rem] border",
                            !isCurrentMonth && "bg-gray-50/10 text-gray-300 border-transparent",
                            !inWindow && isCurrentMonth && "bg-gray-100/50 grayscale-[0.8] opacity-60 border-olive-900/5",
                            inWindow && isCurrentMonth && "bg-white border-olive-900/20 hover:border-olive-900 shadow-sm",
                            isSelected && "bg-olive-900/10 border-olive-900/60 z-20 grayscale-0 opacity-100",
                            isToday && !isSelected && "border-olive-900/60 shadow-inner bg-sand-50/30"
                        )}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-lg font-black mb-1",
                                    isToday && !isSelected && "text-olive-900 underline decoration-2 underline-offset-4",
                                    isSelected ? "text-olive-900" : (inWindow ? "text-olive-900" : "text-olive-900/60"),
                                    !isCurrentMonth && "text-olive-900/10"
                                )}>
                                    {format(cloneDay, "d")}
                                </span>
                                {!inWindow && isCurrentMonth && !dayReservation && !dayBlock && (
                                    <Lock className="w-3 h-3 text-olive-900/20" />
                                )}
                            </div>

                            {isCurrentMonth && (
                                <div className="mt-auto">
                                    {dayReservation ? (
                                        <div className={cn(
                                            "flex items-center gap-1 text-[10px] font-bold py-1 px-2 rounded-full",
                                            isSelected ? "bg-olive-900/10 text-olive-900" : "bg-olive-900/5 text-olive-900/60"
                                        )}>
                                            <div className="w-3.5 h-3.5 rounded-full bg-olive-900/20 flex-shrink-0" />
                                            <span className="truncate font-bold">Reserva confirmada</span>
                                        </div>
                                    ) : dayBlock ? (
                                        <div className={cn(
                                            "flex items-center gap-1 text-[10px] font-bold py-1 px-2 rounded-full",
                                            isSelected ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"
                                        )}>
                                            <Minus className="w-2.5 h-2.5" />
                                            <span className="truncate">{dayBlock.reason || "Indisponível"}</span>
                                        </div>
                                    ) : !inWindow ? (
                                        <div className="flex flex-col opacity-30">
                                            <span className="text-[10px] font-bold text-olive-900/40 uppercase">Fechado</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-lg font-black tracking-tight",
                                                isSelected ? "text-olive-900" : (inWindow ? "text-olive-900" : "text-olive-900/60")
                                            )}>
                                                R${price}
                                            </span>
                                            {dayOverride?.minNights && (
                                                <div className="flex items-center gap-1 mt-0.5 opacity-40">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span className="text-[9px] font-bold">{dayOverride.minNights} nts mín.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {!isSelected && (
                            <div className="absolute inset-0 bg-transparent group-hover:bg-olive-900/[0.02] rounded-2xl transition-all z-0" />
                        )}
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
                                const isSelected = selectedRange && isWithinInterval(day, { start: selectedRange.start, end: selectedRange.end });
                                const inWindow = isDateInWindow(day);

                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-8 rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all",
                                            !isCurrentMonth && "opacity-0 pointer-events-none",
                                            isSelected ? "bg-olive-900 text-white" :
                                                !inWindow ? "bg-gray-100/50 text-olive-900/20" :
                                                    "hover:bg-sand-50 text-olive-900/60"
                                        )}
                                        onClick={() => onDateClick(day)}
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
    }

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 pb-12">
            {renderHeader()}

            {viewMode === 'month' && (
                <div className="grid grid-cols-7 mb-4 px-2">
                    {["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."].map((day, idx) => (
                        <div key={idx} className="text-center text-[10px] font-bold uppercase tracking-widest text-olive-900/30">
                            {day}
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
            />
        </div>
    );
}
