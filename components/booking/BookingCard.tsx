"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Plus, Minus, Calendar as CalendarIcon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { DateSelectionModal } from "./DateSelectionModal";

interface BookingCardProps {
    propertyId?: string;
    maxGuests?: number;
    allowsPets?: boolean;
    maxPets?: number;
}

export function BookingCard({
    propertyId = "casa-oliveira-id",
    maxGuests = 4,
    allowsPets = false,
    maxPets = 0
}: BookingCardProps) {
    const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const [pricing, setPricing] = useState<any>(null);
    const [isPricingLoading, setIsPricingLoading] = useState(false);

    // Estado de Hóspedes
    const [isGuestOpen, setIsGuestOpen] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [pets, setPets] = useState(0);

    const guestRef = useRef<HTMLDivElement>(null);

    const hasDates = dates.checkIn && dates.checkOut;
    const totalOccupants = adults + children;
    const canAddOccupant = totalOccupants < maxGuests;

    // Fechar popover ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
                setIsGuestOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Buscar preços dinâmicos quando as datas mudarem
    useEffect(() => {
        if (hasDates) {
            const getPricing = async () => {
                setIsPricingLoading(true);
                try {
                    const { data } = await axios.get(
                        `/api/pricing?propertyId=${propertyId}&checkIn=${dates.checkIn}&checkOut=${dates.checkOut}`
                    );
                    setPricing(data);
                } catch (error) {
                    console.error("Erro ao carregar preços", error);
                    toast.error("Ocorreu um erro ao calcular o preço.");
                } finally {
                    setIsPricingLoading(false);
                }
            };
            getPricing();
        } else {
            setPricing(null);
        }
    }, [dates.checkIn, dates.checkOut, propertyId, hasDates]);

    const handleActionClick = () => {
        if (!hasDates) {
            setIsDatePickerOpen(true);
            return;
        }
        // Se já tem datas, prossegue para o checkout
        window.location.href = `/checkout?propertyId=${propertyId}&checkIn=${dates.checkIn}&checkOut=${dates.checkOut}&guests=${totalOccupants}&infants=${infants}&pets=${pets}`;
    };

    const handleDateSelect = (range: { checkIn: string; checkOut: string }) => {
        setDates(range);
    };

    const formatGuestLabel = () => {
        let label = `${totalOccupants} hóspede${totalOccupants > 1 ? 's' : ''}`;
        if (infants > 0) label += `, ${infants} bebê${infants > 1 ? 's' : ''}`;
        if (pets > 0) label += `, ${pets} pet${pets > 1 ? 's' : ''}`;
        return label;
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return "Adicionar data";
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <Card className="sticky top-8 w-full transition-all duration-500 shadow-xl hover:shadow-2xl rounded-[2rem] border-olive-900/10 hover:border-olive-900/30 group/card overflow-hidden">
            <CardHeader className="pb-6 pt-8 px-8">
                <div className="flex items-baseline gap-1">
                    <CardTitle className="text-3xl md:text-4xl font-bold text-olive-900 tracking-tight">
                        {hasDates && pricing
                            ? `R$ ${Math.round(pricing.total / pricing.breakdown.length)}`
                            : "Consultar"
                        }
                    </CardTitle>
                    <span className="text-olive-900/60 font-medium">/ noite</span>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 px-8 pb-8">
                <div className="relative border border-olive-900/20 rounded-2xl overflow-hidden bg-sand-50/50 shadow-inner">
                    <div className="grid grid-cols-2 border-b border-olive-900/20">
                        <button
                            onClick={() => setIsDatePickerOpen(true)}
                            className="p-4 text-left border-r border-olive-900/20 hover:bg-olive-900/5 transition-colors group"
                        >
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-olive-900/50 group-hover:text-olive-900 mb-1 block cursor-pointer">
                                Check-in
                            </Label>
                            <span className="text-sm font-bold text-olive-900">
                                {formatDateDisplay(dates.checkIn)}
                            </span>
                        </button>
                        <button
                            onClick={() => setIsDatePickerOpen(true)}
                            className="p-4 text-left hover:bg-olive-900/5 transition-colors group"
                        >
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-olive-900/50 group-hover:text-olive-900 mb-1 block cursor-pointer">
                                Checkout
                            </Label>
                            <span className="text-sm font-bold text-olive-900">
                                {formatDateDisplay(dates.checkOut)}
                            </span>
                        </button>
                    </div>

                    <div className="relative" ref={guestRef}>
                        <button
                            className="w-full p-4 text-left flex justify-between items-center hover:bg-olive-900/5 transition-colors group"
                            onClick={() => setIsGuestOpen(!isGuestOpen)}
                        >
                            <div className="min-w-0">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-olive-900/50 group-hover:text-olive-900 mb-1 block cursor-pointer">
                                    Hóspedes
                                </Label>
                                <div className="text-sm font-bold text-olive-900 truncate pr-4">
                                    {formatGuestLabel()}
                                </div>
                            </div>
                            {isGuestOpen ? <ChevronUp className="w-5 h-5 text-olive-900/40" /> : <ChevronDown className="w-5 h-5 text-olive-900/40" />}
                        </button>

                        {isGuestOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-olive-900/10 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-olive-900 text-sm">Adultos</div>
                                            <div className="text-xs text-olive-900/50">13 anos ou mais</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1} className="w-8 h-8 rounded-full border border-olive-900/20 flex items-center justify-center disabled:opacity-20"><Minus className="w-4 h-4" /></button>
                                            <span className="w-4 text-center text-sm font-bold">{adults}</span>
                                            <button onClick={() => setAdults(adults + 1)} disabled={!canAddOccupant} className="w-8 h-8 rounded-full border border-olive-900/20 flex items-center justify-center disabled:opacity-20"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-olive-900 text-sm">Crianças</div>
                                            <div className="text-xs text-olive-900/50">2 a 12 anos</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0} className="w-8 h-8 rounded-full border border-olive-900/20 flex items-center justify-center disabled:opacity-20"><Minus className="w-4 h-4" /></button>
                                            <span className="w-4 text-center text-sm font-bold">{children}</span>
                                            <button onClick={() => setChildren(children + 1)} disabled={!canAddOccupant} className="w-8 h-8 rounded-full border border-olive-900/20 flex items-center justify-center disabled:opacity-20"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-olive-900 text-sm">Bebês</div>
                                            <div className="text-xs text-olive-900/50">Menor de 2 anos</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setInfants(Math.max(0, infants - 1))} disabled={infants <= 0} className="w-8 h-8 rounded-full border border-olive-900/20 flex items-center justify-center disabled:opacity-20"><Minus className="w-4 h-4" /></button>
                                            <span className="w-4 text-center text-sm font-bold">{infants}</span>
                                            <button onClick={() => setInfants(infants + 1)} disabled={infants >= 5} className="w-8 h-8 rounded-full border border-olive-900/20 flex items-center justify-center disabled:opacity-20"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    {allowsPets && (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-olive-900 text-sm">Pets</div>
                                                <div className="text-xs text-olive-900/50">Animais de estimação</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setPets(Math.max(0, pets - 1))} disabled={pets <= 0} className="w-8 h-8 rounded-full border border-olive-900/20 flex items-center justify-center disabled:opacity-20"><Minus className="w-4 h-4" /></button>
                                                <span className="w-4 text-center text-sm font-bold">{pets}</span>
                                                <button onClick={() => setPets(pets + 1)} disabled={pets >= maxPets} className="w-8 h-8 rounded-full border border-olive-900/20 flex items-center justify-center disabled:opacity-20"><Plus className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-end pt-2">
                                        <button onClick={() => setIsGuestOpen(false)} className="text-xs font-bold underline text-olive-900">Fechar</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    onClick={handleActionClick}
                    disabled={isPricingLoading}
                    className="w-full h-14 text-lg font-bold rounded-2xl bg-olive-900 text-sand-50 hover:bg-olive-800 transition-all shadow-xl shadow-olive-900/20 active:scale-95 px-6"
                >
                    {isPricingLoading ? "Calculando..." : hasDates ? "Reservar Agora" : "Consultar Disponibilidade"}
                </Button>

                <p className="text-center text-xs text-olive-900/60 font-medium">
                    {hasDates ? "Você ainda não será cobrado agora" : "Selecione check-in e checkout para ver o valor total da estadia."}
                </p>

                {hasDates && pricing && (
                    <div className="pt-6 border-t border-olive-900/5 space-y-3 animate-in fade-in duration-500">
                        <div className="flex justify-between text-sm text-olive-900/70">
                            <span className="underline decoration-1 underline-offset-2">
                                R$ {Math.round(pricing.total / pricing.breakdown.length)} x {pricing.breakdown.length} noites
                            </span>
                            <span>R$ {(pricing.total - pricing.cleaningFee).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-olive-900/70">
                            <span className="underline decoration-1 underline-offset-2">Taxa de limpeza</span>
                            <span>R$ {pricing.cleaningFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-4 border-t border-olive-900/10 text-olive-900">
                            <span>Total</span>
                            <span>R$ {pricing.total.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </CardContent>

            <DateSelectionModal
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onSelect={handleDateSelect}
                initialCheckIn={dates.checkIn}
                initialCheckOut={dates.checkOut}
            />
        </Card>
    );
}
