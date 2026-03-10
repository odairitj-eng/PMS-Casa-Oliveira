export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { generateIcalFeed } from '@/lib/calendar';
import { db } from '@/lib/db';

/**
 * GET /api/ical/export/[slug]
 * Exporta o calendário iCal de um imóvel específico pelo seu slug.
 * Substituiu a rota anterior /api/ical/export/[token] que usava ID hardcoded.
 */
export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        const property = await db.property.findUnique({
            where: { slug },
            select: { id: true, name: true, isActive: true },
        });

        if (!property || !property.isActive) {
            return new NextResponse('Property not found', { status: 404 });
        }

        const icsContent = await generateIcalFeed(property.id);

        const safeFilename = slug.replace(/[^a-z0-9-]/gi, '-');
        return new NextResponse(icsContent, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="${safeFilename}-calendario.ics"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('[iCal Export Error]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
