import { Badge } from "@/components/ui/badge";

export function SupplierBadge({ supplier }: { supplier: string }) {
    return (
        <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border px-2 py-0.5 text-xs font-medium shadow-none">
            {supplier}
        </Badge>
    );
}
