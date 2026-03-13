import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const token = params.token;

        // Tenta encontrar a reserva pelo accessToken
        const reservation = await db.reservation.findUnique({
            where: { accessToken: token } as any,
            include: {
                property: {
                    include: {
                        guide: {
                            include: {
                                sections: {
                                    where: { isActive: true },
                                    orderBy: { sortOrder: "asc" },
                                },
                                places: {
                                    where: { isActive: true },
                                    orderBy: { sortOrder: "asc" },
                                },
                            },
                        } as any,
                        photos: {
                            orderBy: { sortOrder: "asc" },
                            take: 5,
                        },
                        amenities: {
                            where: { isActive: true },
                        },
                    },
                },
                guest: true,
            },
        }) as any;

        if (!reservation) {
            // Se não for um token de reserva, verifica se é um propertyId para acesso público geral
            const property = await db.property.findUnique({
                where: { id: token }, // O 'token' aqui seria o propertyId
                include: {
                    guide: {
                        include: {
                            sections: {
                                where: { isActive: true },
                                orderBy: { sortOrder: "asc" },
                            },
                            places: {
                                where: { isActive: true },
                                orderBy: { sortOrder: "asc" },
                            },
                        },
                    } as any,
                    photos: {
                        orderBy: { sortOrder: "asc" },
                        take: 5,
                    },
                    amenities: {
                        where: { isActive: true },
                    },
                },
            }) as any;

            if (!property || !property.guide || !property.guide.isActive) {
                return new NextResponse("Guide not found", { status: 404 });
            }

            return NextResponse.json({
                type: "PUBLIC",
                property: {
                    id: property.id,
                    name: property.name,
                    publicTitle: property.publicTitle,
                    locationText: property.locationText,
                    hostName: property.hostName,
                    photos: property.photos,
                    amenities: property.amenities,
                    checkInStart: property.checkInStart,
                    checkOutEnd: property.checkOutEnd,
                },
                guide: property.guide,
            });
        }

        // Acesso vinculado à reserva
        if (!reservation.property.guide || !reservation.property.guide.isActive) {
            return new NextResponse("Guide not configured for this property", { status: 404 });
        }

        return NextResponse.json({
            type: "PRIVATE",
            reservation: {
                id: reservation.id,
                checkIn: reservation.checkIn,
                checkOut: reservation.checkOut,
                status: reservation.status,
                totalNights: reservation.totalNights,
            },
            guest: {
                name: reservation.guest.name,
            },
            property: {
                id: reservation.property.id,
                name: reservation.property.name,
                publicTitle: reservation.property.publicTitle,
                locationText: reservation.property.locationText,
                hostName: reservation.property.hostName,
                photos: reservation.property.photos,
                amenities: reservation.property.amenities,
                checkInStart: reservation.property.checkInStart,
                checkOutEnd: reservation.property.checkOutEnd,
                street: reservation.property.street,
                streetNumber: reservation.property.streetNumber,
                neighborhood: reservation.property.neighborhood,
                city: reservation.property.city,
                state: reservation.property.state,
                latitude: reservation.property.latitude,
                longitude: reservation.property.longitude,
            },
            guide: reservation.property.guide,
        });
    } catch (error) {
        console.error("[PUBLIC_GUIDE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
