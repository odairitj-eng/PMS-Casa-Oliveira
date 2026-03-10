'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp, TrendingDown, Users, CalendarCheck, DollarSign,
    AlertTriangle, CheckCircle2, Clock, Loader2, ArrowRight, Star, Crown
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardData {
    stats: {
        revenueTotal: number;
        revenueGrowth: number | null;
        occupancyRate: number;
        availableNights: number;
        adr: number;
        basePrice: number;
        newGuests: number;
        newVips: number;
    };
    upcomingArrivals: Array<{
        id: string;
        checkIn: string;
        checkOut: string;
        totalNights: number;
        totalAmount: number;
        guest: { name: string; email: string; isVip: boolean; isFiveStar: boolean; };
    }>;
    pendingReservations: Array<{
        id: string;
        holdExpiresAt: string;
        guest: { name: string; };
    }>;
    lastSyncs: Array<{
        id: string;
        platform: string;
        status: string;
        eventsAdded: number;
        errorMessage: string | null;
        createdAt: string;
    }>;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

function CheckInLabel({ dateStr }: { dateStr: string }) {
    const date = new Date(dateStr);
    if (isToday(date)) return <span className="text-xs font-bold text-green-600 uppercase">Hoje</span>;
    if (isTomorrow(date)) return <span className="text-xs font-bold text-orange-500 uppercase">Amanhã</span>;
    return <span className="text-xs font-medium text-olive-900/60">{format(date, "dd/MM", { locale: ptBR })}</span>;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get('/api/admin/dashboard')
            .then(res => setData(res.data))
            .catch(err => {
                const detail = err.response?.data?.detail || err.response?.data?.error || err.message;
                setError(`Erro: ${detail}`);
            })
            .finally(() => setLoading(false));
    }, []);

    const isLoadingData = loading && !data;

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
            </div>
        );
    }

    // Default Fallback Data if API fails or returns null
    const stats = data?.stats || {
        revenueTotal: 0,
        revenueGrowth: null,
        occupancyRate: 0,
        availableNights: 30,
        adr: 0,
        basePrice: 0,
        newGuests: 0,
        newVips: 0
    };

    const upcomingArrivals = data?.upcomingArrivals || [];
    const pendingReservations = data?.pendingReservations || [];
    const lastSyncs = data?.lastSyncs || [];


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-olive-900 tracking-tight">Visão Geral</h1>
                <p className="text-olive-900/60 mt-1 font-medium">Desempenho da Casa Oliveira nos últimos 30 dias.</p>
            </div>

            {/* ─── KPI Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Receita Total */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-olive-900/70 uppercase">Receita Total</CardTitle>
                        <DollarSign className="w-5 h-5 text-olive-900/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-olive-900">{formatCurrency(stats.revenueTotal)}</div>
                        <p className="text-xs text-olive-900/60 mt-1 font-medium flex items-center gap-1">
                            {stats.revenueGrowth !== null ? (
                                stats.revenueGrowth >= 0 ? (
                                    <>
                                        <TrendingUp className="w-3 h-3 text-green-600" />
                                        <span className="text-green-600">+{stats.revenueGrowth}%</span> em relação ao mês anterior
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown className="w-3 h-3 text-red-500" />
                                        <span className="text-red-500">{stats.revenueGrowth}%</span> em relação ao mês anterior
                                    </>
                                )
                            ) : (
                                <span>Sem dados do mês anterior</span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                {/* Taxa de Ocupação */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-olive-900/70 uppercase">Taxa de Ocupação</CardTitle>
                        <CalendarCheck className="w-5 h-5 text-olive-900/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-olive-900">{stats.occupancyRate}%</div>
                        <div className="mt-2 w-full bg-olive-100 rounded-full h-1.5">
                            <div
                                className="h-1.5 rounded-full bg-olive-600 transition-all"
                                style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-olive-900/60 mt-1 font-medium">
                            {stats.availableNights} noites disponíveis nos próximos 30 dias
                        </p>
                    </CardContent>
                </Card>

                {/* Diária Média ADR */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-olive-900/70 uppercase">Diária Média (ADR)</CardTitle>
                        <TrendingUp className="w-5 h-5 text-olive-900/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-olive-900">
                            {stats.adr > 0 ? formatCurrency(stats.adr) : '—'}
                        </div>
                        <p className="text-xs text-olive-900/60 mt-1 font-medium">
                            {stats.adr > 0 && stats.basePrice > 0 ? (
                                stats.adr >= stats.basePrice
                                    ? `Acima do preço base (${formatCurrency(stats.basePrice)})`
                                    : `Abaixo do preço base (${formatCurrency(stats.basePrice)})`
                            ) : (
                                'Sem reservas no período'
                            )}
                        </p>
                    </CardContent>
                </Card>

                {/* Novos Hóspedes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-olive-900/70 uppercase">Novos Hóspedes</CardTitle>
                        <Users className="w-5 h-5 text-olive-900/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-olive-900">{stats.newGuests}</div>
                        <p className={`text-xs mt-1 font-medium ${stats.newVips > 0 ? 'text-green-600' : 'text-olive-900/60'}`}>
                            {stats.newVips > 0
                                ? `${stats.newVips} marcado${stats.newVips > 1 ? 's' : ''} como VIP`
                                : 'Nenhum VIP no período'}
                        </p>
                    </CardContent>
                </Card>

            </div>

            {/* ─── Próximas Chegadas + Avisos ─────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Próximas Chegadas */}
                <Card className="min-h-[400px]">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Próximas Chegadas</CardTitle>
                        <Link
                            href="/admin/calendar"
                            className="text-xs font-bold text-olive-700 hover:text-olive-900 flex items-center gap-1 transition-colors"
                        >
                            Ver calendário <ArrowRight className="w-3 h-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {upcomingArrivals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-olive-900/40">
                                <CalendarCheck className="w-10 h-10 mb-2" />
                                <span className="font-medium">Nenhuma chegada nos próximos 7 dias.</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingArrivals.map(res => (
                                    <div
                                        key={res.id}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-olive-100 hover:bg-olive-50 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center font-bold text-olive-700 text-sm uppercase">
                                            {res.guest.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-sm text-olive-900 truncate">{res.guest.name}</span>
                                                {res.guest.isVip && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" aria-label="VIP" />}
                                            </div>
                                            <p className="text-xs text-olive-900/50">
                                                {res.totalNights} noite{res.totalNights > 1 ? 's' : ''} · {formatCurrency(res.totalAmount)}
                                            </p>
                                        </div>
                                        <CheckInLabel dateStr={res.checkIn} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Avisos do Sistema */}
                <Card className="min-h-[400px]">
                    <CardHeader>
                        <CardTitle>Avisos do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">

                            {/* Reservas aguardando pagamento */}
                            {pendingReservations.length > 0 ? (
                                pendingReservations.map(p => (
                                    <div key={p.id} className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-4 h-4 text-orange-600" />
                                            <span className="font-bold text-orange-800 text-sm">Pagamento Pendente</span>
                                        </div>
                                        <p className="text-orange-900/70 text-sm font-medium">
                                            <span className="font-bold">{p.guest.name}</span> tem uma reserva aguardando pagamento.{' '}
                                            Expira {formatDistanceToNow(new Date(p.holdExpiresAt), { addSuffix: true, locale: ptBR })}.
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="font-bold text-green-800 text-sm">Pagamentos em Dia</span>
                                    </div>
                                    <p className="text-green-900/70 text-sm font-medium">Nenhuma reserva aguardando pagamento.</p>
                                </div>
                            )}

                            {/* Última sincronização iCal */}
                            {lastSyncs.length > 0 ? (
                                lastSyncs.slice(0, 3).map(sync => (
                                    <div
                                        key={sync.id}
                                        className={`p-4 rounded-xl border ${sync.status === 'SUCCESS'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {sync.status === 'SUCCESS'
                                                ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                : <AlertTriangle className="w-4 h-4 text-red-600" />
                                            }
                                            <span className={`font-bold text-sm ${sync.status === 'SUCCESS' ? 'text-green-800' : 'text-red-800'}`}>
                                                Sincronização iCal ({sync.platform})
                                            </span>
                                        </div>
                                        <p className={`text-sm font-medium ${sync.status === 'SUCCESS' ? 'text-green-900/70' : 'text-red-900/70'}`}>
                                            {sync.status === 'SUCCESS'
                                                ? `${sync.eventsAdded} evento${sync.eventsAdded !== 1 ? 's' : ''} adicionado${sync.eventsAdded !== 1 ? 's' : ''}. Executado ${formatDistanceToNow(new Date(sync.createdAt), { addSuffix: true, locale: ptBR })}.`
                                                : sync.errorMessage ?? 'Erro desconhecido na sincronização.'
                                            }
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 bg-olive-50 border border-olive-100 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle className="w-4 h-4 text-olive-600" />
                                        <span className="font-bold text-olive-800 text-sm">Sem Integrações Configuradas</span>
                                    </div>
                                    <p className="text-olive-900/50 text-sm font-medium">
                                        Nenhuma sincronização iCal encontrada.{' '}
                                        <Link href="/admin/integrations" className="underline text-olive-700 font-bold">
                                            Configurar agora
                                        </Link>
                                    </p>
                                </div>
                            )}

                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
