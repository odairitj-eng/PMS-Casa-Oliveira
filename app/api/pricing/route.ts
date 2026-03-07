import { NextRequest, NextResponse } from 'next/server';
import { calculateSmartPrice } from '@/lib/pricing';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const propertyId = searchParams.get('propertyId') || 'casa-oliveira-id';
        const checkInStr = searchParams.get('checkIn');
        const checkOutStr = searchParams.get('checkOut');

        if (!checkInStr || !checkOutStr) {
            return NextResponse.json({ error: 'Check-in e Check-out são obrigatórios.' }, { status: 400 });
        }

        const checkIn = new Date(checkInStr);
        const checkOut = new Date(checkOutStr);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            return NextResponse.json({ error: 'Datas inválidas.' }, { status: 400 });
        }

        const pricing = await calculateSmartPrice(propertyId, checkIn, checkOut);

        return NextResponse.json(pricing);
    } catch (error: any) {
        console.error('Pricing API Error:', error);
        return NextResponse.json({ error: error.message || 'Erro ao calcular preço.' }, { status: 400 });
    }
}
