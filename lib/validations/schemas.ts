import { z } from "zod";

// Schema para Propriedade
export const propertySchema = z.object({
    name: z.string().min(3).max(100).trim(),
    slug: z.string().optional(),
    basePrice: z.number().positive(),
    cleaningFee: z.number().nonnegative().optional().default(0),
    maxGuests: z.number().int().positive().max(50),
    bedrooms: z.number().int().nonnegative(),
    beds: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative(),
    city: z.string().min(2).max(100).trim().optional(),
    state: z.string().length(2).trim().optional(),
    country: z.string().trim().optional(),
    description: z.string().max(4000).trim().optional(),
    publicTitle: z.string().max(200).trim().optional(),
    publicSubtitle: z.string().max(200).trim().optional(),
    shortDescription: z.string().max(500).trim().optional(),
    fullDescription: z.string().max(10000).trim().optional(),
    isActive: z.boolean().optional().default(true),
    channexId: z.string().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
});

// Schema para Ocupante
export const occupantSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    document: z.string().min(5).max(20).trim().optional(),
    isChild: z.boolean().default(false),
});

// Schema para Reserva (Hardened)
export const reservationSchema = z.object({
    propertyId: z.string().uuid(),
    checkIn: z.string().datetime() || z.string().refine((val) => !isNaN(Date.parse(val)), "Data de check-in inválida"),
    checkOut: z.string().datetime() || z.string().refine((val) => !isNaN(Date.parse(val)), "Data de check-out inválida"),
    guests: z.number().int().min(1).max(50),
    email: z.string().email().toLowerCase().trim(),
    phone: z.string().min(10).max(25).trim(),
    name: z.string().min(3).max(100).trim(),
    document: z.string().min(5).max(20).trim().optional(),
    paymentMethod: z.enum(["PIX", "CREDIT_CARD", "GIFT_CARD"]).default("PIX"),
    occupants: z.array(occupantSchema).max(50).optional(),
}).refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out deve ser após o Check-in",
    path: ["checkOut"],
});

// Schema para Hóspedes (Hardened)
export const guestSchema = z.object({
    name: z.string().min(3).max(100).trim(),
    email: z.string().email().toLowerCase().trim(),
    phone: z.string().min(10).max(25).trim(),
    document: z.string().min(5).max(20).trim().optional(),
    status: z.enum(["REGULAR", "VIP", "FIVE_STAR", "INACTIVE", "BLOCKED"]).default("REGULAR"),
    notes: z.string().max(1000).optional(),
});

// Schema para Bloqueio de Data
export const blockedDateSchema = z.object({
    propertyId: z.string().uuid(),
    date: z.string().datetime(),
    source: z.enum(["MANUAL", "AIRBNB", "BOOKING", "CHANNEX", "ADMIN", "DIRECT_RESERVATION"]),
    reason: z.string().max(200).optional(),
});

export const propertyPhotoSchema = z.object({
    id: z.string().optional(),
    propertyId: z.string().optional(),
    imageUrl: z.string().url("URL da imagem inválida"),
    sortOrder: z.number().int().default(0),
    isPrimary: z.boolean().default(false),
});

export const propertyRuleSchema = z.object({
    id: z.string().optional(),
    propertyId: z.string().optional(),
    ruleText: z.string().min(3, "Regra muito curta").max(200),
    iconName: z.string().optional().default("info"),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export const propertyAmenitySchema = z.object({
    id: z.string().optional(),
    propertyId: z.string().optional(),
    amenityKey: z.string().min(2).max(50),
    amenityName: z.string().min(2).max(100),
    iconName: z.string().optional().default("check-circle"),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type PropertyPhotoInput = z.infer<typeof propertyPhotoSchema>;
export type PropertyRuleInput = z.infer<typeof propertyRuleSchema>;
export type PropertyAmenityInput = z.infer<typeof propertyAmenitySchema>;
