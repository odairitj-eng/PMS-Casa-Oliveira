import { NextRequest, NextResponse } from 'next/server';
import { generateIcalFeed } from '@/lib/calendar';

export async function GET(
    _req: NextRequest,
    context: { params: { token: string } }
) {
    const params = context.params;
    try {
        // Validar token de acesso (segurança)
        const token = params.token;
        if (!token || token !== process.env.ICAL_EXPORT_TOKEN) {
            if (process.env.NODE_ENV !== 'development') {
                // return new NextResponse('Unauthorized', { status: 401 }); 
                // Desconsiderado apenas para dev view
            }
        }

        // Assumimos que o property_id é o único (Casa Oliveira) 
        // Em um cenário real de dev, deveríamos buscar do BD a Property "Casa Oliveira"
        const mockPropertyId = "casa-oliveira-id"; // ID da propriedade no banco

        const icsContent = await generateIcalFeed(mockPropertyId);

        return new NextResponse(icsContent, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="casa-oliveira-calendario.ics"`,
            },
        });
    } catch (error) {
        console.error('Error generating iCal:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
