"use client"

import React, { useState } from "react"
import { useSearchStore } from "@/store/search"
import { SearchBar } from "@/components/search/SearchBar"
import { RegionSidebar } from "@/components/search/RegionSidebar"
import { LodgeCard, type LodgeData } from "@/components/search/LodgeCard"
import { ProgressIndicator } from "@/components/search/ProgressIndicator"

export default function SearchPage() {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedLodges, setSelectedLodges] = useState<string[]>([]);

  // Define proper types for search mutation to avoid 'any'
  type SearchParams = Record<string, unknown>;
  const [searchParams] = useState<SearchParams>({});

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const toggleLodge = (lodgeName: string) => {
    setSelectedLodges(prev =>
      prev.includes(lodgeName)
        ? prev.filter(l => l !== lodgeName)
        : [...prev, lodgeName]
    );
  };

  const selectAllLodges = (lodges: string[], selectAll: boolean) => {
    if (selectAll) {
      setSelectedLodges(prev => Array.from(new Set([...prev, ...lodges])));
    } else {
      setSelectedLodges(prev => prev.filter(l => !lodges.includes(l)));
    }
  };

  const { isSearching, hasSearched, results, executeSearch } = useSearchStore();

  // Optionally fetch dynamic regions from GET .../regions
  // useQuery({ queryKey: ['regions'], queryFn: async () => (await apiClient.get("/regions")).data });

  return (
    <div className="max-w-[1600px] mx-auto min-h-full">

      {/* Page Header */}
      <div className="mb-0 -mt-2 lg:-mt-10">
        <h1 className="text-4xl font-serif text-foreground mb-3 tracking-tight">Search Availability</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mb-6">Find real-time luxury lodge availability, check supplier margins, and secure client bookings across Namibia.</p>
      </div>

      {/* Search Bar placed above everything */}
      <SearchBar
        isSearching={isSearching}
        onSearch={({ arrival, departure, guests, children, rooms }) => executeSearch({ regions: selectedRegions, lodges: selectedLodges, params: searchParams, arrival, departure, guests, children, rooms })}
      />

      <RegionSidebar
        selectedRegions={selectedRegions}
        selectedLodges={selectedLodges}
        onRegionToggle={toggleRegion}
        onLodgeToggle={toggleLodge}
        onSelectAllLodges={selectAllLodges}
      />

      <div className="w-full mt-4">

        {/* Main Content Area */}
        <div className="min-w-0 w-full">

          <div className="min-h-[400px]">
            {isSearching && (
              <ProgressIndicator value={65} label="Checking availability across 293+ lodges on Nightsbridge and Wilderness systems..." />
            )}

            {!isSearching && !hasSearched && (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-[12px] bg-card/50">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-muted-foreground opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-medium text-foreground mb-2">No Search Results Yet</h3>
                <p className="text-muted-foreground max-w-md">Adjust your dates and regions in the search bar above to fetch live availability.</p>
              </div>
            )}

            {!isSearching && hasSearched && (!results || Object.keys(results).length === 0) && (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-[12px] bg-card/50 mt-8">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🐪</span>
                </div>
                <h3 className="text-xl font-serif font-medium text-foreground mb-2">No availability found</h3>
                <p className="text-muted-foreground max-w-md">Try searching different dates or expanding your region selection.</p>
              </div>
            )}

            {!isSearching && results && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {Object.entries(results).map(([region, lodges]) => (
                  <div key={region} className="space-y-6">
                    <h2 className="text-3xl font-serif font-medium text-foreground pb-2 border-b border-border">
                      {region}
                      <span className="text-base font-sans text-muted-foreground font-normal ml-3 tracking-normal">
                        {lodges.length} lodges found
                      </span>
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                      {lodges.map((lodge: LodgeData) => (
                        <LodgeCard key={lodge.id} lodge={lodge} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
