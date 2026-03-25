import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Search, FileSpreadsheet, MapPin, Settings } from "lucide-react"

export function Sidebar({ className }: { className?: string }) {
  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/search", label: "Search Availability", icon: Search },
    { href: "/contract-rates", label: "Contract Rates", icon: FileSpreadsheet },
    { href: "/regions", label: "Regions & Lodges", icon: MapPin },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className={cn("pb-12 h-screen sticky top-0 bg-sidebar border-r border-border transition-colors duration-200 z-50", className)}>
      <div className="space-y-4 py-6">
        <div className="px-6 py-2">
          <h2 className="text-2xl font-serif text-foreground font-semibold tracking-tight mb-8">Desert Tracks</h2>
          <div className="space-y-1.5">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center rounded-[8px] px-3 py-2.5 text-sm font-sans font-medium text-sidebar-foreground hover:bg-card hover:shadow-sm transition-all duration-200">
                <link.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
