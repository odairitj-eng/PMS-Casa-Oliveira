export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db as prisma } from "@/lib/db";
import { propertySchema } from "@/lib/validations/schemas";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Obter as propriedades, idealmente teremos apenas uma.
        let property = await prisma.property.findFirst();

        if (!property) {
            // Se não houver, criamos a infraestrutura inicial de id casa-oliveira-id.
            property = await prisma.property.create({
                data: {
                    id: "casa-oliveira-id",
                    name: "Casa Oliveira",
                    basePrice: 100, // Preço mínimo default
                    currency: "BRL"
                } as any
            });
        }

        return NextResponse.json(property);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // VALIDAÇÃO ZOD PARCIAL
        const validation = propertySchema.partial().safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Dados inválidos", details: validation.error.flatten() }, { status: 400 });
        }

        const data = validation.data;

        let property = await prisma.property.findFirst();
        if (!property) {
            return NextResponse.json({ error: "Propriedade não encontrada" }, { status: 404 });
        }

        const updateData: any = {
            ...data,
            // Fallback para campos numéricos se vierem como string (Next.js forms)
            maxGuests: data.maxGuests !== undefined ? Number(data.maxGuests) : undefined,
            bedrooms: data.bedrooms !== undefined ? Number(data.bedrooms) : undefined,
            beds: data.beds !== undefined ? Number(data.beds) : undefined,
            bathrooms: data.bathrooms !== undefined ? Number(data.bathrooms) : undefined,
            maxPets: (data as any).maxPets !== undefined ? Number((data as any).maxPets) : undefined,
            basePrice: data.basePrice !== undefined ? Number(data.basePrice) : undefined,
            cleaningFee: data.cleaningFee !== undefined ? Number(data.cleaningFee) : undefined,
            minimumNights: (data as any).minimumNights !== undefined ? Number((data as any).minimumNights) : undefined,
        };

        // Lógica de Geocoding Automático (Fallback)
        if (!updateData.latitude && !updateData.longitude && (updateData.street || updateData.city)) {
            const fullAddress = `${updateData.street || ''}, ${updateData.streetNumber || ''}, ${updateData.neighborhood || ''}, ${updateData.city || ''}, ${updateData.state || ''}, ${updateData.country || ''}`;
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`, {
                    headers: { 'User-Agent': 'CasaOliveiraApp/1.0' }
                });
                const geoData = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    updateData.latitude = parseFloat(geoData[0].lat);
                    updateData.longitude = parseFloat(geoData[0].lon);
                }
            } catch (e) {
                console.error("Geocoding failed", e);
            }
        }

        // Lógica de Offset Automático para Localização Pública
        if (updateData.latitude && updateData.longitude && !updateData.publicLatitude && !updateData.publicLongitude) {
            // Adiciona um pequeno offset aleatório (aprox 150m) para preservar a privacidade
            const offset = 0.0015;
            updateData.publicLatitude = updateData.latitude + (Math.random() - 0.5) * offset;
            updateData.publicLongitude = updateData.longitude + (Math.random() - 0.5) * offset;
        }

        const updated = await prisma.property.update({
            where: { id: property.id },
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("ERRO AO ATUALIZAR PROPRIEDADE:", error);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}
