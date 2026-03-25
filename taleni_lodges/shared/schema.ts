import { z } from "zod";
// Room rate entry with STO rates for each season
export const roomRateSchema = z.object({
    roomType: z.string(),
    basis: z.string().nullable(),
    lowSeason: z.number().nullable().optional(),
    shoulderSeason: z.number().nullable().optional(),
    highSeason: z.number().nullable().optional(),
});
export type RoomRate = z.infer<typeof roomRateSchema>;
// Property section (e.g., Mushara Bush Camp, Mushara Lodge)
export const propertySectionSchema = z.object({
    propertyName: z.string(),
    description: z.string().nullable().optional(),
    rates: z.array(roomRateSchema),
    notes: z.array(z.string()).optional(),
});
export type PropertySection = z.infer<typeof propertySectionSchema>;
// Complete extraction result with multiple properties
export const extractionResultSchema = z.object({
    id: z.string(),
    fileName: z.string(),
    hotelName: z.string().nullable(),
    location: z.string().nullable(),
    validFrom: z.string().nullable(),
    validTo: z.string().nullable(),
    currency: z.string().nullable(),
    stoPercentage: z.string().nullable().optional(),
    properties: z.array(propertySectionSchema).optional(),
    createdAt: z.string(),
});
export type ExtractionResult = z.infer<typeof extractionResultSchema>;
// Insert schema for creating new extractions
export const insertExtractionSchema = extractionResultSchema.omit({ id: true, createdAt: true });
export type InsertExtraction = z.infer<typeof insertExtractionSchema>;
