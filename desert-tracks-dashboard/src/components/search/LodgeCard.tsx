import { Card, CardContent } from "@/components/ui/card";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { SupplierBadge } from "./SupplierBadge";

export interface LodgeData {
    id: number;
    name: string;
    supplier: string;
    status: string;
    publicRate: number;
    nettRate: number;
}

export function LodgeCard({ lodge }: { lodge: LodgeData }) {
    const marginStr = (((lodge.publicRate - lodge.nettRate) / lodge.publicRate) * 100).toFixed(0);

    return (
        <Card className="rounded-[12px] border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-serif">{lodge.name}</h3>
                        <SupplierBadge supplier={lodge.supplier} />
                    </div>
                    <p className="text-sm text-muted-foreground">Premium Collection</p>
                </div>

                <div className="flex items-center gap-6 sm:gap-10 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                    <div className="flex-shrink-0 min-w-[80px]">
                        <AvailabilityBadge status={lodge.status} />
                    </div>

                    <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Nett</p>
                        <p className="font-medium text-foreground">N$ {lodge.nettRate.toLocaleString()}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Public</p>
                        <p className="font-medium text-foreground line-through decoration-muted-foreground/50 opacity-80 text-sm">N$ {lodge.publicRate.toLocaleString()}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Margin</p>
                        <p className="font-medium text-available">{marginStr}%</p>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
