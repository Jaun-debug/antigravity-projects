import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { INITIAL_LODGES } from "@/data/lodges";

export function RegionSidebar({
    selectedRegions = [],
    selectedLodges = [],
    onRegionToggle,
    onLodgeToggle,
    onSelectAllLodges
}: {
    selectedRegions?: string[],
    selectedLodges?: string[],
    onRegionToggle?: (region: string) => void,
    onLodgeToggle?: (lodge: string) => void,
    onSelectAllLodges?: (lodges: string[], selectAll: boolean) => void
}) {
    const defaultLodges = INITIAL_LODGES.map(l => ({ id: l.bbid, name: l.name, region: l.region, supplier: 'Unknown' }));
    const [lodges, setLodges] = useState<{ id: string, name: string, region: string, supplier: string }[]>(defaultLodges);

    /* eslint-disable */
    useEffect(() => {
        const savedLodges = localStorage.getItem('dt-lodges');
        if (savedLodges) {
            const parsedLodges = JSON.parse(savedLodges).map((l: any) => {
                let region = l.region;
                if (region === "Epuwo") region = "Opuwo";
                if (["Caprivi East", "Caprivi West", "Rundu", "Divundu"].includes(region)) region = "Caprivi";
                if (["Fish River Canyon", "Aus", "Keetmanshoop", "South", "Noordoewer", "Bethanie"].includes(region)) region = "Canyon";
                if (["Epupa Falls"].includes(region)) region = "Epupa";
                if (["Skeleton Coast", "Cape Cross"].includes(region)) region = "Kunene Skeleton Coast";
                if (["Purros"].includes(region)) region = "Kaokoland";
                if (["Waterberg", "Otjiwarongo", "Okahandja", "Omaruru", "Erongo", "Otavi", "Grootfontein", "Tsumeb"].includes(region)) region = "Central Namibia";
                if (["Outjo"].includes(region)) region = "South Etosha";
                if (["Solitaire", "Namib Rand", "Namib"].includes(region)) region = "Sossusvlei";
                if (["Walvis Bay", "Henties Bay"].includes(region)) region = "Swakopmund";
                if (["Mariental", "Maltahohe", "Helmeringhausen", "Gochas", "Gibeon", "Gobabis"].includes(region)) region = "Kalahari";
                if (["Owamboland", "Etosha North"].includes(region)) region = "East Etosha";
                if (["Twyfelfontein", "Uis"].includes(region)) region = "Damaraland";
                if (region === "Etosha") {
                    const name = l.name.toLowerCase();
                    if (name.includes("mushara") || name.includes("mokuti") || name.includes("onguma") || name.includes("namutoni")) region = "East Etosha";
                    else if (name.includes("hobatere") || name.includes("dolomite")) region = "West Etosha";
                    else region = "South Etosha";
                }
                return { ...l, region };
            });
            const existingIds = new Set(parsedLodges.map((l: any) => l.id));
            const missingLodges = defaultLodges.filter(l => !existingIds.has(l.id));
            setLodges([...parsedLodges, ...missingLodges]);
        }
    }, []);
    /* eslint-enable */

    const relevantLodges = lodges.filter(l => selectedRegions.includes(l.region));
    const isAllSelected = relevantLodges.length > 0 && relevantLodges.every(l => selectedLodges.includes(l.name));

    const groupedLodges = relevantLodges.reduce((acc, lodge) => {
        if (!acc[lodge.region]) acc[lodge.region] = [];
        acc[lodge.region].push(lodge);
        return acc;
    }, {} as Record<string, typeof relevantLodges>);

    return (
        <div className="w-full mb-6">
            <div className="flex flex-wrap gap-x-12 gap-y-6">
                <div>
                    <h2 className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-3">Regions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-rows-3 lg:grid-flow-col gap-y-3 gap-x-6 lg:gap-x-8">
                        {["Swakopmund", "Sossusvlei", "South Etosha", "East Etosha", "West Etosha", "Damaraland", "Kunene Skeleton Coast", "Kalahari", "Canyon", "Luderitz", "Central Namibia", "Windhoek", "Opuwo", "Epupa", "Caprivi", "Kaokoland"].map((region) => (
                            <div key={region} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`r-${region}`}
                                    checked={selectedRegions.includes(region)}
                                    onCheckedChange={() => onRegionToggle?.(region)}
                                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                                <Label htmlFor={`r-${region}`} className="text-sm font-normal cursor-pointer whitespace-nowrap">{region}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-12 gap-y-6">
                    <div>
                        <h2 className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-3">Supplier Filter</h2>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                            {["Nightsbridge", "Wilderness", "Taleni", "O&L Leisure"].map((supplier) => (
                                <div key={supplier} className="flex items-center space-x-2">
                                    <Checkbox id={`s-${supplier}`} className="border-primary data-[state=checked]:bg-primary" />
                                    <Label htmlFor={`s-${supplier}`} className="text-sm font-normal cursor-pointer whitespace-nowrap">{supplier}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-3">Availability</h2>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                            {["Available", "Waitlisted", "Ask", "Unavailable"].map((status) => (
                                <div key={status} className="flex items-center space-x-2">
                                    <Checkbox id={`a-${status}`} className="border-primary data-[state=checked]:bg-primary" />
                                    <Label htmlFor={`a-${status}`} className="text-sm font-normal cursor-pointer whitespace-nowrap">{status}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedRegions.length > 0 && relevantLodges.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider">Lodges to Search</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectAllLodges?.(relevantLodges.map(l => l.name), !isAllSelected)}
                            className="text-xs h-8"
                        >
                            {isAllSelected ? "Deselect All Lodges" : "Select All Lodges"}
                        </Button>
                    </div>
                    <div className="space-y-6">
                        {Object.entries(groupedLodges).map(([region, regionLodges]) => {
                            const isRegionAllSelected = regionLodges.every(l => selectedLodges.includes(l.name));
                            return (
                                <div key={region} className="border border-border/50 bg-muted/20 rounded-[12px] p-4">
                                    <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
                                        <h3 className="text-sm font-serif font-medium text-foreground">{region} <span className="text-muted-foreground text-xs ml-2 font-sans font-normal">{regionLodges.length} lodges</span></h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onSelectAllLodges?.(regionLodges.map(l => l.name), !isRegionAllSelected)}
                                            className="text-[10px] h-6 px-2 uppercase tracking-wider text-muted-foreground hover:text-foreground"
                                        >
                                            {isRegionAllSelected ? "Deselect Group" : "Select Group"}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {regionLodges.map(lodge => (
                                            <div key={lodge.id} className="flex items-center space-x-3 bg-card border border-border px-3 py-2.5 rounded-[8px] hover:border-primary/30 transition-colors">
                                                <Checkbox
                                                    id={`l-${lodge.id}`}
                                                    checked={selectedLodges.includes(lodge.name)}
                                                    onCheckedChange={() => onLodgeToggle?.(lodge.name)}
                                                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground shrink-0"
                                                />
                                                <Label htmlFor={`l-${lodge.id}`} className="text-sm font-medium cursor-pointer w-full leading-tight select-none">
                                                    {lodge.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
