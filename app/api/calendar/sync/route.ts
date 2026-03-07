import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        // Em um sistema real, aqui buscaríamos as URLs do Airbnb/Booking do banco de dados (Tabela Integration)
        // Para este MVP, vamos simular o processo de "fetching" e "parsing"

        // 1. Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. Simular a lógica de sincronização:
        // - Deletar bloqueios antigos vindos de 'AIRBNB' ou 'BOOKING'
        // - Inserir novos (vlr fixo para demonstração de que algo mudou)

        const mockPropertyId = "casa-oliveira-id";

        await db.$transaction(async (tx: any) => {
            // Limpar sincronizações anteriores para renovar
            await tx.blockedDate.deleteMany({
                where: {
                    propertyId: mockPropertyId,
                    source: { in: ['AIRBNB', 'BOOKING'] }
                }
            });

            // Adicionar um bloqueio fake vindo do "Airbnb" para o próximo final de semana
            const nextSat = new Date();
            nextSat.setDate(nextSat.getDate() + (6 - nextSat.getDay())); // Próximo sábado
            const nextSun = new Date(nextSat);
            nextSun.setDate(nextSun.getDate() + 1);

            await tx.blockedDate.createMany({
                data: [
                    { propertyId: mockPropertyId, date: nextSat, source: 'AIRBNB' },
                    { propertyId: mockPropertyId, date: nextSun, source: 'AIRBNB' },
                ]
            });

            // Logar a sincronização
            await tx.syncLog.create({
                data: {
                    platform: 'AIRBNB',
                    status: 'SUCCESS',
                    errorMessage: 'Sincronização iCal simulada realizada com sucesso.'
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Sincronização iCal concluída. Calendário atualizado.'
        });

    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: 'Erro ao sincronizar calendários externos.' }, { status: 500 });
    }
}
