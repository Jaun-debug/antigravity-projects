"use client";

import { useState } from "react";
import Link from "next/link";
import { mockItinerary, mockRegions, mockLodges } from "@/data/mock";

type Tab = "info" | "regions" | "days" | "preview";

export default function AgencyBuilder() {
  const [activeTab, setActiveTab] = useState<Tab>("days");
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const itinerary = mockItinerary;

  return (
    <div className="min-h-screen flex bg-stone-50 text-stone-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-stone-200">
          <span className="font-serif font-bold text-lg tracking-tight">Luxury Builder</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {[{ id: "info", label: "Itinerary Info" }, { id: "regions", label: "Regions & Lodges" }, { id: "days", label: "Day-by-Day Setup" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab);
                if (tab.id !== "regions") setActiveRegionId(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-200">
          <Link
            href="/client/preview"
            target="_blank"
            className="block w-full text-center py-3 bg-stone-100 text-stone-800 rounded-lg text-sm font-semibold hover:bg-stone-200 transition-colors"
          >
            Preview Itinerary ↗
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-serif text-stone-800">
            {activeTab === "info" && "General Information"}
            {activeTab === "regions" && "Manage Regions & Lodges"}
            {activeTab === "days" && "Build Itinerary Days"}
          </h1>
          <button className="px-6 py-2 bg-stone-900 text-white rounded text-sm font-medium hover:bg-stone-800 transition shadow-sm">
            Save Changes
          </button>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {activeTab === "info" && (
            <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
              <h2 className="text-lg font-medium text-stone-900 mb-4">Client & Trip Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Itinerary Title</label>
                  <input type="text" className="w-full border border-stone-300 rounded-md p-2.5 focus:ring-1 focus:ring-stone-900 outline-none" defaultValue={itinerary.title} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Client Name</label>
                  <input type="text" className="w-full border border-stone-300 rounded-md p-2.5 focus:ring-1 focus:ring-stone-900 outline-none" defaultValue={itinerary.clientName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Start Date</label>
                  <input type="date" className="w-full border border-stone-300 rounded-md p-2.5 focus:ring-1 focus:ring-stone-900 outline-none" defaultValue={itinerary.startDate} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">End Date</label>
                  <input type="date" className="w-full border border-stone-300 rounded-md p-2.5 focus:ring-1 focus:ring-stone-900 outline-none" defaultValue={itinerary.endDate} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "regions" && !activeRegionId && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-medium text-stone-900">Configured Regions</h2>
                 <button className="text-sm px-4 py-2 border border-stone-300 rounded hover:bg-stone-100">+ Add Region</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockRegions.map(region => (
                  <div key={region.id} onClick={() => setActiveRegionId(region.id)} className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition hover:-translate-y-1">
                    <div className="h-40 bg-stone-200 relative">
                      <img src={region.heroImage} className="w-full h-full object-cover" alt={region.name}/>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"/>
                    </div>
                    <div className="p-5 flex-1">
                      <h4 className="font-serif text-xl mb-1">{region.name}</h4>
                      <p className="text-sm text-stone-500 line-clamp-2">{region.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "regions" && activeRegionId && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-stone-200">
                 <button onClick={() => setActiveRegionId(null)} className="text-stone-400 hover:text-stone-900 transition-colors flex items-center font-medium">
                   ← Back to Regions
                 </button>
                 <h2 className="text-xl font-serif text-stone-900">
                   {mockRegions.find(r => r.id === activeRegionId)?.name} Lodges
                 </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockLodges.filter(l => l.regionId === activeRegionId).map(lodge => (
                  <div key={lodge.id} className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden flex flex-col group hover:shadow-md transition cursor-pointer hover:-translate-y-1">
                    <div className="h-32 bg-stone-200 relative">
                      <img src={lodge.heroImage} className="w-full h-full object-cover" alt={lodge.name}/>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"/>
                      <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Lodge</span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-serif text-lg mb-1">{lodge.name}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mb-4 flex-1">{lodge.description}</p>
                      <button className="text-xs uppercase tracking-widest font-semibold text-stone-400 hover:text-stone-900 transition-colors text-left mt-auto">Edit Details →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "days" && (
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-6">
                 <p className="text-stone-600">Drag and drop to reorder days. Collapse sections for a cleaner view.</p>
                 <button className="text-sm px-4 py-2 bg-stone-200 text-stone-800 rounded font-medium hover:bg-stone-300 transition">+ Add Day</button>
              </div>

              {itinerary.days.map((day, idx) => {
                const region = mockRegions.find(r => r.id === day.regionId);
                const lodge = mockLodges.find(l => l.id === day.lodgeId);

                return (
                  <div key={day.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 relative group">
                    {/* Drag Handle Mockup */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center py-6 cursor-grab opacity-30 hover:opacity-100 transition border-r border-stone-100 bg-stone-50 rounded-l-2xl">
                       <span className="text-xl">⋮⋮</span>
                    </div>

                    <div className="pl-14 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                           <span className="w-10 h-10 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center font-bold font-serif text-lg">
                             {idx + 1}
                           </span>
                           <div>
                             <h3 className="font-semibold text-stone-900">Day {day.dayNumber}: {day.title}</h3>
                             <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">
                               {region?.name} • {lodge?.name}
                             </p>
                           </div>
                        </div>
                        <button className="text-stone-400 hover:text-stone-800">Edit</button>
                      </div>

                      <div className="mt-6 border-t border-stone-100 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Region</label>
                            <select className="w-full text-sm border border-stone-200 rounded p-2.5 focus:ring-1 focus:ring-stone-900 outline-none bg-white text-stone-700" defaultValue={day.regionId}>
                              {mockRegions.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Lodge</label>
                            <select className="w-full text-sm border border-stone-200 rounded p-2.5 focus:ring-1 focus:ring-stone-900 outline-none bg-white text-stone-700" defaultValue={day.lodgeId}>
                              {mockRegions.map(r => (
                                <optgroup key={r.id} label={r.name}>
                                  {mockLodges.filter(l => l.regionId === r.id).map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                             <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Description</label>
                           <textarea className="w-full text-sm border border-stone-200 rounded p-3 text-stone-700 min-h-[120px] focus:ring-1 focus:ring-stone-900 outline-none" defaultValue={day.description} />
                        </div>
                        <div>
                           <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Activities</label>
                           <div className="space-y-2">
                             {day.activities.map((act, i) => (
                               <div key={i} className="flex gap-2">
                                  <input type="text" className="flex-1 text-sm border border-stone-200 rounded p-2 focus:ring-1 focus:ring-stone-900 outline-none" defaultValue={act} />
                                  <button className="text-stone-300 hover:text-red-500 px-2">×</button>
                               </div>
                             ))}
                             <button className="text-xs text-stone-500 font-medium hover:text-stone-900 mt-2">+ Add Activity</button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
