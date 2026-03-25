
'use client';

// ------------------------------------
// UI modifications extending page.tsx
// ------------------------------------
import { useState, useEffect } from 'react';
import { Search, Download, Trash2, Mail, Briefcase, Globe2, Loader2, Save, FolderOpen, X } from 'lucide-react';

export default function Home() {
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('Tourism DMC');
  const [customIndustry, setCustomIndustry] = useState('');
  
  const [filters, setFilters] = useState({ onlyEmails: true, onlyBusiness: true });
  const [apiKey, setApiKey] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Vault state
  const [savedLists, setSavedLists] = useState<any[]>([]);
  const [showVault, setShowVault] = useState(false);

  useEffect(() => {
      const stored = localStorage.getItem('leadVault');
      if(stored) setSavedLists(JSON.parse(stored));
  }, []);

  const saveToVault = () => {
      if(leads.length === 0) return alert("No leads to save!");
      const listName = prompt("Enter a name for this list (e.g. 'German DMCs 2024'):");
      if(!listName) return;

      const newList = {
          id: Date.now(),
          name: listName,
          date: new Date().toLocaleDateString(),
          count: leads.length,
          leads: [...leads]
      };

      const updated = [newList, ...savedLists];
      setSavedLists(updated);
      localStorage.setItem('leadVault', JSON.stringify(updated));
      alert(`Successfully saved ${leads.length} leads to your Vault!`);
  };

  const deleteFromVault = (id: number) => {
      if(!confirm("Are you sure you want to delete this list?")) return;
      const updated = savedLists.filter(l => l.id !== id);
      setSavedLists(updated);
      localStorage.setItem('leadVault', JSON.stringify(updated));
  };

  const loadFromVault = (listLeads: any[]) => {
      setLeads(listLeads);
      setShowVault(false);
  };

  const startScrape = async () => {
    if (!country) return alert("Enter a country.");
    setLoading(true);
    
    try {
        const res = await fetch('/api/scrape', {
            method: 'POST',
            body: JSON.stringify({
                country,
                industry: industry === 'Custom' ? customIndustry : industry,
                filters,
                apiKey
            })
        });
        const data = await res.json();
        if (data.leads) {
            setLeads(data.leads.sort((a:any, b:any) => b.score - a.score));
        }
    } catch(err) {
        alert("Error scraping. Vercel timeout maybe?");
    }
    setLoading(false);
  };

  const exportCSV = (dataToExport = leads, exportName = country) => {
      const headers = ["Company Name", "Country", "Industry", "Website", "Email", "Score", "Source"];
      const rows = dataToExport.map(l => [l.companyName, l.country, l.industry, l.website, l.email, l.score, l.source]);
      
      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => `"${e.join('","')}"`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Global_Leads_${exportName}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C2C] font-sans relative">
      <header className="bg-[#1B2922] text-[#E8DCC4] py-6 shadow-md border-b-4 border-[#C19A6B]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <h1 className="text-3xl font-[Playfair_Display] font-semibold tracking-wide flex items-center gap-3">
                <Globe2 className="w-8 h-8 text-[#C19A6B]" /> 
                Global Lead Scraper
            </h1>
            <div className="flex gap-4 items-center">
                <button onClick={() => setShowVault(true)} className="flex items-center gap-2 text-sm font-semibold hover:text-white transition cursor-pointer">
                    <FolderOpen className="w-5 h-5 text-[#C19A6B]" /> Vault ({savedLists.length})
                </button>
                <div className="text-sm border-l border-[#5A5A4A] pl-4 font-light text-[#A8A88B]">Advanced Sales Machine</div>
            </div>
        </div>
      </header>

      {/* VAULT MODAL */}
      {showVault && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-6">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border-2 border-[#E0D5C1]">
                  <div className="bg-[#F6F3EB] px-6 py-4 flex justify-between items-center border-b border-[#E0D5C1]">
                      <h3 className="font-[Playfair_Display] text-xl font-semibold flex items-center gap-2"><FolderOpen className="w-5 h-5 text-[#C19A6B]"/> My Lead Vault</h3>
                      <button onClick={() => setShowVault(false)} className="text-[#8A8A7A] hover:text-red-500 transition"><X /></button>
                  </div>
                  <div className="p-6 max-h-[60vh] overflow-y-auto bg-[#FDFBF7]">
                      {savedLists.length === 0 ? (
                          <div className="text-center py-10 text-[#5A5A4A]">No saved lists yet. Scrape some leads and hit "Save to Vault".</div>
                      ) : (
                          <div className="grid grid-cols-1 gap-4">
                              {savedLists.map(list => (
                                  <div key={list.id} className="bg-white p-4 rounded-lg border border-[#E0D5C1] shadow-sm flex justify-between items-center">
                                      <div>
                                          <h4 className="font-semibold text-lg">{list.name}</h4>
                                          <p className="text-xs text-[#8A8A7A] mt-1">{list.leads.length} Leads • Saved on {list.date}</p>
                                      </div>
                                      <div className="flex gap-2">
                                          <button onClick={() => loadFromVault(list.leads)} className="px-3 py-1.5 bg-[#F6F3EB] hover:bg-[#E0D5C1] text-sm font-semibold rounded transition text-[#2C2C2C]">Load</button>
                                          <button onClick={() => exportCSV(list.leads, list.name)} className="px-3 py-1.5 border border-[#C19A6B] hover:bg-[#C19A6B] hover:text-white text-sm font-semibold rounded transition text-[#C19A6B]">Export</button>
                                          <button onClick={() => deleteFromVault(list.id)} className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-sm font-semibold rounded transition text-red-500"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR CONFIG */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-[#E0D5C1] h-fit">
            <h2 className="text-xl font-[Playfair_Display] font-medium mb-6 flex items-center gap-2 border-b border-[#E0D5C1] pb-3">
                <Search className="w-5 h-5 text-[#C19A6B]"/> Deep Search
            </h2>
            
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-[#5A5A4A] mb-1">Target Country</label>
                    <input type="text" placeholder="e.g. Namibia, Germany" 
                           value={country} onChange={e => setCountry(e.target.value)}
                           className="w-full bg-[#F9F7F2] border border-[#D5CBB8] rounded-md px-4 py-2 focus:ring-2 focus:ring-[#C19A6B] outline-none transition" />
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-[#5A5A4A] mb-1">Industry</label>
                    <select value={industry} onChange={e => setIndustry(e.target.value)}
                            className="w-full bg-[#F9F7F2] border border-[#D5CBB8] rounded-md px-4 py-2 focus:ring-2 focus:ring-[#C19A6B] outline-none">
                        <option>Tourism DMC</option>
                        <option>Travel Agents / Booking Agents</option>
                        <option>Tour Operators</option>
                        <option>Second-hand Vehicle Dealerships</option>
                        <option>Custom</option>
                    </select>
                    {industry === 'Custom' && (
                        <input type="text" placeholder="Custom keyword..." 
                           value={customIndustry} onChange={e => setCustomIndustry(e.target.value)}
                           className="w-full mt-2 bg-white border border-[#D5CBB8] rounded-md px-4 py-2 outline-none" />
                    )}
                </div>

                <div className="pt-4 border-t border-[#E0D5C1]">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                        <input type="checkbox" checked={filters.onlyEmails} onChange={e=>setFilters({...filters, onlyEmails: e.target.checked})} className="accent-[#C19A6B] w-4 h-4" />
                        Must have Email Address
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium mt-3">
                        <input type="checkbox" checked={filters.onlyBusiness} onChange={e=>setFilters({...filters, onlyBusiness: e.target.checked})} className="accent-[#C19A6B] w-4 h-4" />
                        Exclude Gmail/Yahoo 
                    </label>
                </div>

                <div className="pt-4 border-t border-[#E0D5C1]">
                    <label className="block text-sm font-semibold text-[#5A5A4A] mb-1">
                        Serper.dev API Key <span className="text-xs font-normal text-red-500">(Required)</span>
                    </label>
                    <input type="password" placeholder="Paste free Serper API key..." 
                           value={apiKey} onChange={e => setApiKey(e.target.value)}
                           className="w-full bg-[#F9F7F2] border border-[#D5CBB8] rounded-md px-4 py-2 focus:ring-2 focus:ring-[#C19A6B] outline-none text-sm" />
                    <p className="text-[11px] text-[#A8A88B] mt-1">Get 2,500 free searches at <a href="https://serper.dev" target="_blank" className="underline hover:text-[#C19A6B]">serper.dev</a></p>
                </div>

                <button onClick={startScrape} disabled={loading}
                        className="w-full mt-6 bg-[#C19A6B] hover:bg-[#A8865B] text-white py-3 rounded-md font-semibold font-[Jost] tracking-wide transition shadow-md disabled:opacity-70 flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    {loading ? 'Extacting Leads...' : 'Commence Scrape'}
                </button>
            </div>
        </aside>

        {/* MAIN RESULTS BOARD */}
        <section className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-[#E0D5C1] overflow-hidden flex flex-col min-h-[600px]">
                
                {/* TOOLBAR */}
                <div className="bg-[#F6F3EB] px-6 py-4 flex justify-between items-center border-b border-[#E0D5C1]">
                    <div>
                        <h3 className="font-[Playfair_Display] text-lg font-semibold">Discovery Pipeline</h3>
                        <p className="text-xs text-[#8A8A7A] mt-1">{leads.length} Qualified Leads Found</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={saveToVault} disabled={leads.length===0} className="px-3 py-2 bg-white border border-[#D5CBB8] text-[#5A5A4A] hover:border-[#C19A6B] hover:text-[#C19A6B] rounded text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50">
                            <Save className="w-4 h-4" /> Save to Vault
                        </button>
                        <button onClick={() => exportCSV()} disabled={leads.length===0} className="px-4 py-2 bg-[#1B2922] text-[#E8DCC4] hover:bg-[#2C3E34] rounded text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#1B2922] text-[#E8DCC4] uppercase text-xs">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Company</th>
                                <th className="px-5 py-3 font-semibold"><Briefcase className="w-4 h-4 inline mr-1"/>Industry</th>
                                <th className="px-5 py-3 font-semibold"><Mail className="w-4 h-4 inline mr-1"/>Contact</th>
                                <th className="px-5 py-3 font-semibold text-center">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E0D5C1]">
                            {leads.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="text-center py-24 text-[#8A8A7A]">
                                        <div className="flex flex-col items-center gap-3">
                                            <Globe2 className="w-12 h-12 text-[#E0D5C1]" />
                                            <span>Enter search parameters to initiate the worldwide sweep.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {leads.map((l, i) => (
                                <tr key={i} className="hover:bg-[#FCFAFA] transition">
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-[15px]">{l.companyName}</div>
                                        <div className="text-xs text-[#5A5A4A] mt-1 truncate max-w-[200px]"><a href={l.website} target="_blank" className="hover:text-[#C19A6B] underline decoration-[#E0D5C1]">{l.website}</a></div>
                                    </td>
                                    <td className="px-5 py-4 text-[#5A5A4A]">{l.industry}</td>
                                    <td className="px-5 py-4 font-medium">{l.email}</td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${l.score > 2 ? 'bg-green-100 text-green-700' : l.score >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                            {l.score > 0 ? '+'+l.score : l.score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </section>

      </main>
    </div>
  );
}
