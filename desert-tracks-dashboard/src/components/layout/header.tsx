import { User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="flex h-16 items-center bg-background px-6 sticky top-0 z-50">
      <div className="hidden lg:flex flex-col ml-4">
        {/* Placeholder for top breadcrumbs or title if needed */}
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              <User className="h-5 w-5 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card text-foreground border-border rounded-[12px]">
            <DropdownMenuLabel className="font-sans">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="focus:bg-muted font-sans cursor-pointer transition-colors">Profile</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-destructive focus:text-destructive-foreground font-sans cursor-pointer transition-colors">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
