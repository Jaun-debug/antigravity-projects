"use client"
import { useState, useEffect } from "react"
import { INITIAL_LODGES } from "@/data/lodges"

import { Plus, Edit2, Trash2, MapPin, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const INITIAL_REGIONS = [
  "Swakopmund", "Sossusvlei", "South Etosha", "East Etosha", "West Etosha",
  "Damaraland", "Kunene Skeleton Coast", "Kalahari", "Canyon",
  "Luderitz", "Central Namibia", "Windhoek", "Opuwo", "Epupa",
  "Caprivi", "Kaokoland"
]

export default function RegionsLodgesPage() {
  const [regionsList, setRegionsList] = useState<string[]>(INITIAL_REGIONS)
  const defaultLodges = INITIAL_LODGES.map(l => ({ id: l.bbid, name: l.name, region: l.region, supplier: 'Unknown' }))
  const [lodges, setLodges] = useState<{ id: string, name: string, region: string, supplier: string }[]>(defaultLodges)

  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({})

  // Load from LocalStorage on mount
  /* eslint-disable */
  useEffect(() => {
    const savedRegions = localStorage.getItem('dt-regions')
    const savedLodges = localStorage.getItem('dt-lodges')

    if (savedRegions) {
      const parsed = JSON.parse(savedRegions).map((r: string) => r === "Epuwo" ? "Opuwo" : (r === "Caprivi East" || r === "Caprivi West" ? "Caprivi" : r));
      // Automatically add new regions if they are missing from local storage
      const missingRegions = INITIAL_REGIONS.filter(r => !parsed.includes(r));
      setRegionsList([...new Set([...parsed, ...missingRegions])]);
    }

    if (savedLodges) {
      const parsedLodges = JSON.parse(savedLodges).map((l: { id: string, name: string, region: string, supplier: string }) => {
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
      const defaultLodges = INITIAL_LODGES.map(l => ({ id: l.bbid, name: l.name, region: l.region, supplier: 'Unknown' }))
      const existingIds = new Set(parsedLodges.map((l: any) => l.id));
      const missingLodges = defaultLodges.filter(l => !existingIds.has(l.id));
      setLodges([...parsedLodges, ...missingLodges]);
    }
  }, [])
  /* eslint-enable */

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('dt-regions', JSON.stringify(regionsList))
  }, [regionsList])

  useEffect(() => {
    localStorage.setItem('dt-lodges', JSON.stringify(lodges))
  }, [lodges])

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => ({ ...prev, [region]: !prev[region] }))
  }

  const handleAddRegion = (regionName: string) => {
    if (!regionsList.includes(regionName)) {
      setRegionsList(prev => [...prev, regionName])
    }
  }

  const handleAddLodge = (lodge: { name: string, region: string, supplier: string }) => {
    setLodges(prev => [...prev, { id: Math.random().toString(), ...lodge }])
    // Auto-expand region when adding lodge to it
    setExpandedRegions(prev => ({ ...prev, [lodge.region]: true }))
  }

  const handleEditLodge = (id: string, updatedLodge: { name: string, region: string, supplier: string }) => {
    setLodges(prev => prev.map(l => l.id === id ? { ...l, ...updatedLodge } : l))
  }

  const handleDeleteLodge = (id: string) => {
    setLodges(prev => prev.filter(lodge => lodge.id !== id))
  }

  return (
    <div className="max-w-[1600px] mx-auto min-h-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Page Header */}
      <div className="mb-0 -mt-2 lg:-mt-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-serif text-foreground mb-3 tracking-tight">Regions & Lodges</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Manage the database of properties, review their linked suppliers, and update connection details.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="font-sans shrink-0 items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Region
              </Button>
            </DialogTrigger>
            <AddRegionModalContent onSave={handleAddRegion} />
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="font-sans shrink-0 items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Lodge
              </Button>
            </DialogTrigger>
            <AddLodgeModalContent onSave={handleAddLodge} regions={regionsList} />
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {regionsList.map(region => {
          const regionLodges = lodges.filter(l => l.region === region);
          const isExpanded = expandedRegions[region] || false;
          const hasLodges = regionLodges.length > 0;

          return (
            <div key={region} className="border border-border rounded-[12px] bg-card overflow-hidden shadow-sm">

              {/* Accordion Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleRegion(region)}
              >
                <h3 className="text-xl font-serif font-medium text-foreground flex items-center gap-3">
                  <MapPin className={`h-5 w-5 ${hasLodges ? 'text-primary' : 'text-muted-foreground'}`} />
                  {region}
                  {hasLodges && (
                    <span className="text-xs font-sans font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-2">
                      {regionLodges.length}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </span>
                </div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="border-t border-border bg-background p-4 md:p-6">
                  {!hasLodges ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-[12px] bg-card/30">
                      <p className="text-muted-foreground mb-4 text-sm">No lodges currently mapped to {region}.</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="font-sans">
                            <Plus className="mr-2 h-4 w-4" />
                            Add to {region}
                          </Button>
                        </DialogTrigger>
                        <AddLodgeModalContent onSave={handleAddLodge} defaultRegion={region} regions={regionsList} />
                      </Dialog>
                    </div>
                  ) : (
                    <div className="border border-border rounded-[12px] bg-card overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-muted-foreground border-b border-border">
                          <tr>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Lodge Name</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Primary Supplier</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {regionLodges.map((lodge) => (
                            <tr key={lodge.id} className="hover:bg-muted/50 transition-colors">
                              <td className="px-6 py-4 font-serif text-base">{lodge.name}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-primary/10 border border-primary/20 text-primary">
                                  {lodge.supplier}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <AddLodgeModalContent
                                      onSave={(updated) => handleEditLodge(lodge.id, updated)}
                                      initialData={lodge}
                                      isEdit={true}
                                      regions={regionsList}
                                    />
                                  </Dialog>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDeleteLodge(lodge.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}

function AddRegionModalContent({ onSave }: { onSave?: (region: string) => void }) {
  const [name, setName] = useState("")

  const handleSave = () => {
    if (onSave && name) {
      onSave(name)
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">Add New Region</DialogTitle>
        <DialogDescription>
          Create a new geographical region to map lodges to.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="regionName">Region Name</Label>
          <Input id="regionName" placeholder="e.g. Swakopmund" className="text-foreground border-border bg-background" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="submit" onClick={handleSave}>Save Region</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

function AddLodgeModalContent({ onSave, defaultRegion = "", initialData, isEdit = false, regions = [] }: { onSave?: (lodge: { name: string, region: string, supplier: string }) => void, defaultRegion?: string, initialData?: { name: string, region: string, supplier: string }, isEdit?: boolean, regions?: string[] }) {
  const [name, setName] = useState(initialData?.name || "")
  const [region, setRegion] = useState(initialData?.region || defaultRegion)
  const [supplier, setSupplier] = useState(initialData?.supplier || "")

  const handleSave = () => {
    if (onSave && name && region && supplier) {
      onSave({ name, region, supplier })
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">{isEdit ? "Edit Lodge" : "Add New Lodge"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update the mapped architectural property and remote supplier connection." : "Map a new architectural property to a remote supplier connection."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Lodge Name</Label>
          <Input id="name" placeholder="e.g. Sossusvlei Lodge" className="text-foreground border-border bg-background" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="region">Region</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger id="region" className="w-full bg-background">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="supplier">Primary Supplier</Label>
          <Select value={supplier} onValueChange={setSupplier}>
            <SelectTrigger id="supplier" className="w-full bg-background">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nightsbridge">Nightsbridge</SelectItem>
              <SelectItem value="Wilderness">Wilderness</SelectItem>
              <SelectItem value="Taleni">Taleni</SelectItem>
              <SelectItem value="O&L Leisure">O&L Leisure</SelectItem>
              <SelectItem value="Direct Contract">Direct Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="submit" onClick={handleSave}>{isEdit ? "Save Changes" : "Save Lodge"}</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}
