import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        let settings = await db.systemSettings.findFirst();

        if (!settings) {
            // Criar configurações padrão se não existirem
            settings = await db.systemSettings.create({
                data: {
                    id: 'singleton',
                    whatsappNumber: '(11) 99999-9999',
                    contactEmail: 'contato@casaoliveira.com.br',
                    minNightsDefault: 2,
                    maxGuestsDefault: 4
                }
            });
        }

        const property = await db.property.findFirst();

        return NextResponse.json({ settings, property });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao carregar configurações.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { settings: settingsData, property: propertyData } = body;

        // 1. Atualizar ou Criar Settings
        const settings = await db.systemSettings.upsert({
            where: { id: 'singleton' },
            update: {
                mercadoPagoPublicKey: settingsData.mercadoPagoPublicKey,
                mercadoPagoAccessToken: settingsData.mercadoPagoAccessToken,
                whatsappNumber: settingsData.whatsappNumber,
                contactEmail: settingsData.contactEmail,
                minNightsDefault: parseInt(settingsData.minNightsDefault),
                maxGuestsDefault: parseInt(settingsData.maxGuestsDefault),
            },
            create: {
                id: 'singleton',
                mercadoPagoPublicKey: settingsData.mercadoPagoPublicKey,
                mercadoPagoAccessToken: settingsData.mercadoPagoAccessToken,
                whatsappNumber: settingsData.whatsappNumber,
                contactEmail: settingsData.contactEmail,
                minNightsDefault: parseInt(settingsData.minNightsDefault),
                maxGuestsDefault: parseInt(settingsData.maxGuestsDefault),
            }
        });

        // 2. Atualizar Property (se houver dados)
        let property = null;
        if (propertyData && propertyData.id) {
            property = await db.property.update({
                where: { id: propertyData.id },
                data: {
                    name: propertyData.name,
                    shortDescription: propertyData.shortDescription,
                    basePrice: parseFloat(propertyData.basePrice),
                    cleaningFee: parseFloat(propertyData.cleaningFee),
                }
            });
        }

        return NextResponse.json({ success: true, settings, property });
    } catch (error) {
        console.error('Settings Update Error:', error);
        return NextResponse.json({ error: 'Erro ao salvar configurações.' }, { status: 500 });
    }
}
