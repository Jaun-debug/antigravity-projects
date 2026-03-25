import Link from "next/link"
import { Search, MapPin, FileText, ArrowRight, TrendingUp, CalendarDays, Activity, Globe } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-[1600px] mx-auto min-h-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Welcome Hero */}
      <div className="mb-0 -mt-2 lg:-mt-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-4 tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Welcome back to the Desert Tracks Intelligence Hub. Monitor live availability scrape jobs, maintain your lodge database, and analyze competitive supply.
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">System Status</p>
          <div className="flex items-center justify-end space-x-2 text-green-700">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
            </div>
            <span className="font-medium">Scraping Engine Live</span>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

        {/* Availability */}
        <Link href="/search" className="group block h-full">
          <div className="h-full bg-card/60 hover:bg-card/90 transition-all duration-300 border border-border hover:border-primary/30 rounded-[16px] p-8 shadow-sm hover:shadow-md flex flex-col">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-3">Live Search</h3>
            <p className="text-muted-foreground mb-8 flex-grow">Query real-time availability across major Namibian suppliers like Nightsbridge, Wilderness, and Taleni instances simultaneously.</p>
            <div className="flex items-center text-primary font-medium uppercase tracking-wider text-sm mt-auto">
              Run Query <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Regions */}
        <Link href="/regions" className="group block h-full">
          <div className="h-full bg-card/60 hover:bg-card/90 transition-all duration-300 border border-border hover:border-primary/30 rounded-[16px] p-8 shadow-sm hover:shadow-md flex flex-col">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-3">Lodge Directory</h3>
            <p className="text-muted-foreground mb-8 flex-grow">Manage the exact mapping architecture connecting specific Sossusvlei and Etosha properties to API endpoints.</p>
            <div className="flex items-center text-primary font-medium uppercase tracking-wider text-sm mt-auto">
              View Database <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Contract Rates */}
        <Link href="/contract-rates" className="group block h-full">
          <div className="h-full bg-card/60 hover:bg-card/90 transition-all duration-300 border border-border hover:border-primary/30 rounded-[16px] p-8 shadow-sm hover:shadow-md flex flex-col">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-3">Contract Margins</h3>
            <p className="text-muted-foreground mb-8 flex-grow">Review injected AI STO sheets against dynamic rack rates to accurately calculate gross booking yields.</p>
            <div className="flex items-center text-primary font-medium uppercase tracking-wider text-sm mt-auto">
              Inspect Rates <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Data Insight Section */}
      <h2 className="text-xl font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-6">Database Telemetry</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-transparent border border-border rounded-[12px] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Monitored Lodges</p>
            <Globe className="h-4 w-4 text-primary opacity-50" />
          </div>
          <div>
            <h4 className="text-3xl font-serif font-medium text-foreground">293+</h4>
            <p className="text-xs text-muted-foreground mt-2">+209 mapped this week</p>
          </div>
        </div>

        <div className="bg-transparent border border-border rounded-[12px] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Supplier APIs</p>
            <Activity className="h-4 w-4 text-primary opacity-50" />
          </div>
          <div>
            <h4 className="text-3xl font-serif font-medium text-foreground">5</h4>
            <p className="text-xs text-green-700 mt-2 font-medium">100% Connectivity</p>
          </div>
        </div>

        <div className="bg-transparent border border-border rounded-[12px] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Queries (24h)</p>
            <TrendingUp className="h-4 w-4 text-primary opacity-50" />
          </div>
          <div>
            <h4 className="text-3xl font-serif font-medium text-foreground">142</h4>
            <p className="text-xs text-muted-foreground mt-2">Nightsbridge & Wilderness</p>
          </div>
        </div>

        <div className="bg-transparent border border-border rounded-[12px] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Cached Rates</p>
            <CalendarDays className="h-4 w-4 text-primary opacity-50" />
          </div>
          <div>
            <h4 className="text-3xl font-serif font-medium text-foreground">3,205</h4>
            <p className="text-xs text-muted-foreground mt-2">Active pricing blocks</p>
          </div>
        </div>
      </div>

    </div>
  )
}
