import { z } from "zod";

// Schema para Propriedade
export const propertySchema = z.object({
    name: z.string().min(3).max(100),
    basePrice: z.number().positive(),
    cleaningFee: z.number().nonnegative().optional().default(0),
    maxGuests: z.number().int().positive().max(50),
    bedrooms: z.number().int().nonnegative(),
    beds: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().length(2).optional(),
    description: z.string().max(2000).optional(),
});

// Schema para Reserva
export const reservationSchema = z.object({
    propertyId: z.string().uuid(),
    checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), "Data de check-in inválida"),
    checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), "Data de check-out inválida"),
    guests: z.number().int().positive(),
    email: z.string().email(),
    phone: z.string().min(10).max(20),
    name: z.string().min(3).max(100),
    document: z.string().min(11).max(14),
    paymentMethod: z.enum(["PIX", "CREDIT_CARD"]),
}).refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out deve ser após o Check-in",
    path: ["checkOut"],
});

// Schema para Hóspedes
export const guestSchema = z.object({
    name: z.string().min(3).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(20),
    document: z.string().min(11).max(14),
    status: z.enum(["REGULAR", "VIP", "FIVE_STAR", "INACTIVE", "BLOCKED"]).optional(),
});
