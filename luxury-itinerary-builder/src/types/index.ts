export interface Region {
  id: string;
  name: string;
  summary: string;
  heroImage: string;
  galleryImages: string[];
}

export interface Lodge {
  id: string;
  regionId: string;
  name: string;
  description: string;
  priceListFile?: string;
  heroImage: string;
  galleryImages: string[];
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  regionId: string;
  lodgeId: string;
  title: string;
  description: string;
  activities: string[];
  notes?: string;
  images: string[];
}

export interface Itinerary {
  id: string;
  title: string;
  clientName: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
}
