import { useState } from "react";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon, Users, Search, Moon, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export function SearchBar({ onSearch, isSearching }: { onSearch: (params: { arrival?: Date, departure?: Date, guests: number, children: number, rooms: number }) => void, isSearching: boolean }) {
    const [arrival, setArrival] = useState<Date>();
    const [departure, setDeparture] = useState<Date>();
    const [guests, setGuests] = useState("2");
    const [children, setChildren] = useState("0");
    const [rooms, setRooms] = useState("1");

    const handleArrivalSelect = (date: Date | undefined) => {
        setArrival(date);
        if (date && (!departure || date >= departure)) {
            setDeparture(addDays(date, 1));
        }
    };

    const nights = arrival && departure ? differenceInDays(departure, arrival) : 0;

    return (
        <div className="sticky top-6 z-40 w-full mb-8 bg-card/90 backdrop-blur-md rounded-[12px] p-4 border border-border flex flex-col xl:flex-row gap-4 xl:items-center">

            <div className="flex-1 min-w-[150px] border-b xl:border-b-0 xl:border-r border-border pb-4 xl:pb-0 xl:pr-4">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center mb-1.5"><CalendarIcon className="h-3 w-3 mr-1" /> Arrival</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className={cn(
                                "w-full justify-start text-left font-medium px-0 h-auto hover:bg-transparent",
                                !arrival && "text-muted-foreground font-normal"
                            )}
                        >
                            {arrival ? format(arrival, "PPP") : <span>Select Date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-border rounded-[12px]" align="start">
                        <Calendar mode="single" selected={arrival} onSelect={handleArrivalSelect} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex-1 min-w-[150px] border-b xl:border-b-0 xl:border-r border-border pb-4 xl:pb-0 xl:pr-4">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center mb-1.5"><CalendarIcon className="h-3 w-3 mr-1" /> Departure</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className={cn(
                                "w-full justify-start text-left font-medium px-0 h-auto hover:bg-transparent",
                                !departure && "text-muted-foreground font-normal"
                            )}
                        >
                            {departure ? format(departure, "PPP") : <span>Select Date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-border rounded-[12px]" align="start">
                        <Calendar mode="single" selected={departure} onSelect={setDeparture} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex-1 min-w-[80px] border-b xl:border-b-0 xl:border-r border-border pb-4 xl:pb-0 xl:pr-4 flex flex-col justify-center">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center mb-1.5"><Moon className="h-3 w-3 mr-1" /> Nights</label>
                <div className="font-medium text-foreground px-0 h-auto flex items-center">
                    {nights > 0 ? `${nights} Night${nights !== 1 ? 's' : ''}` : '-'}
                </div>
            </div>

            <div className="flex-1 min-w-[80px] border-b xl:border-b-0 xl:border-r border-border pb-4 xl:pb-0 xl:pr-4">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center mb-1.5"><Users className="h-3 w-3 mr-1" /> Adults</label>
                <Input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="border-0 shadow-none px-0 h-auto focus-visible:ring-0 text-foreground font-medium bg-transparent"
                    min="1"
                />
            </div>

            <div className="flex-1 min-w-[80px] border-b xl:border-b-0 xl:border-r border-border pb-4 xl:pb-0 xl:pr-4">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center mb-1.5"><Users className="h-3 w-3 mr-1" /> Children</label>
                <Input
                    type="number"
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    className="border-0 shadow-none px-0 h-auto focus-visible:ring-0 text-foreground font-medium bg-transparent"
                    min="0"
                />
            </div>

            <div className="flex-1 min-w-[80px] pb-4 xl:pb-0 xl:pr-4">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center mb-1.5"><BedDouble className="h-3 w-3 mr-1" /> Rooms</label>
                <Input
                    type="number"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="border-0 shadow-none px-0 h-auto focus-visible:ring-0 text-foreground font-medium bg-transparent"
                    min="1"
                />
            </div>

            <div className="flex-shrink-0">
                <Button
                    onClick={() => onSearch({ arrival, departure, guests: parseInt(guests) || 2, children: parseInt(children) || 0, rooms: parseInt(rooms) || 1 })}
                    disabled={isSearching}
                    className="w-full xl:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-serif rounded-[8px] px-8 py-6 h-auto text-lg transition-colors shadow-sm"
                >
                    {isSearching ? "Searching..." : <><Search className="h-5 w-5 mr-2" /> View Availability</>}
                </Button>
            </div>

        </div>
    );
}
