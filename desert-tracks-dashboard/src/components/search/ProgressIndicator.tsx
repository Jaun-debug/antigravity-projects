import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export function ProgressIndicator({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center w-full max-w-sm space-y-2">
                <h3 className="text-xl font-serif text-foreground">Searching Availability...</h3>
                <p className="text-sm text-muted-foreground">{label}</p>
                <Progress value={value} className="h-2 w-full mt-4 bg-muted [&>div]:bg-primary" />
            </div>
        </div>
    );
}
