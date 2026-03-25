import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "Available" | "Unavailable" | "Ask" | "No Data";

export function AvailabilityBadge({ status }: { status: Status | string }) {
    const getBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "available":
                return "bg-available text-white hover:bg-available/90";
            case "unavailable":
                return "bg-unavailable text-white hover:bg-unavailable/90";
            case "ask":
                return "bg-ask text-white hover:bg-ask/90";
            default:
                return "bg-nodata text-white hover:bg-nodata/90";
        }
    };

    return (
        <Badge className={cn("px-2.5 py-0.5 font-medium border-0 shadow-sm", getBadgeVariant(status))}>
            {status}
        </Badge>
    );
}
