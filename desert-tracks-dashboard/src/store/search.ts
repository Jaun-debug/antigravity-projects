import { create } from 'zustand'
import axios from 'axios'
import type { LodgeData } from '@/components/search/LodgeCard'

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://DESERT-TRACKS-ITINERARIES.replit.app"
})

export type SearchParams = Record<string, unknown>;

export interface SearchPayload {
    regions: string[];
    lodges: string[];
    params?: SearchParams;
    arrival?: Date;
    departure?: Date;
    guests: number;
    children: number;
    rooms: number;
}

interface SearchStore {
    isSearching: boolean;
    hasSearched: boolean;
    results: Record<string, LodgeData[]> | null;
    error: unknown | null;
    executeSearch: (payload: SearchPayload) => Promise<void>;
}

export const useSearchStore = create<SearchStore>((set) => ({
    isSearching: false,
    hasSearched: false,
    results: null,
    error: null,
    executeSearch: async (payload: SearchPayload) => {
        // Marking it as searching and clearing old results
        set({ isSearching: true, hasSearched: true, error: null, results: null });

        try {
            // Default dates if missing to bypass strict validation in the new backend
            const defaultArrival = new Date();
            defaultArrival.setDate(defaultArrival.getDate() + 7);
            const defaultDeparture = new Date(defaultArrival);
            defaultDeparture.setDate(defaultDeparture.getDate() + 2);

            const payloadToSend = {
                regions: payload.regions,
                lodges: payload.lodges,
                arrival: (payload.arrival || defaultArrival).toISOString().split('T')[0],
                departure: (payload.departure || defaultDeparture).toISOString().split('T')[0],
                guests: payload.guests || 2,
                children: payload.children || 0,
                rooms: payload.rooms || 1
            };
            const response = await apiClient.post("/search", payloadToSend);

            const rawResults = response.data.results || {};
            const mappedResults: Record<string, LodgeData[]> = {};

            for (const [region, arr] of Object.entries(rawResults)) {
                const regionLodges: LodgeData[] = (arr as Record<string, unknown>[]).map((apiItem) => {
                    const pRate = typeof apiItem.publicRate === "number" ? apiItem.publicRate : 0;
                    return {
                        id: (apiItem.lodgeId as number) || Math.random(),
                        name: (apiItem.lodgeName as string) || "Unknown Property",
                        supplier: (apiItem.supplier as string) || "unknown",
                        status: apiItem.available ? "Available" : "Unavailable",
                        publicRate: pRate,
                        nettRate: pRate * 0.8 // Display 20% standard margin in demo mode
                    };
                });

                const targetLodges = payload.lodges || [];
                const filtered = targetLodges.length > 0
                    ? regionLodges.filter((l: LodgeData) => {
                        return targetLodges.some((target: string) => {
                            const targetLower = target.toLowerCase();
                            const lodgeLower = l.name.toLowerCase();
                            // Basic fuzzy match
                            if (targetLower === lodgeLower) return true;
                            if (lodgeLower.includes(targetLower)) return true;
                            if (targetLower.includes(lodgeLower)) return true;

                            const targetBaseName = targetLower.split(',')[0].trim();
                            const lodgeBaseName = lodgeLower.split(',')[0].trim();

                            if (targetBaseName.includes(lodgeBaseName) || lodgeBaseName.includes(targetBaseName)) return true;

                            // Fallback
                            const tWords = targetLower.split(/\s+/).filter((w: string) => w.length > 3);
                            const lWords = lodgeLower.split(/\s+/).filter((w: string) => w.length > 3);
                            const overlap = tWords.filter((w: string) => lWords.includes(w));
                            return overlap.length >= 2;
                        });
                    })
                    : regionLodges;

                if (filtered.length > 0) {
                    mappedResults[region] = filtered;
                }
            }

            // Storing the results securely in the exact shape the component expects
            set({ isSearching: false, results: Object.keys(mappedResults).length > 0 ? mappedResults : null });
        } catch (err) {
            set({ isSearching: false, error: err });
        }
    }
}));
