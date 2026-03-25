
'use client';

import { useState } from 'react';
import { Search, Download, Trash2, Mail, Briefcase, Globe2, Loader2 } from 'lucide-react';

export default function Home() {
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('Tourism DMC');
  const [customIndustry, setCustomIndustry] = useState('');
  
  const [filters, setFilters] = useState({ onlyEmails: true, onlyBusiness: true });
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const startScrape = async () => {
    if (!country) return alert("Enter a country.");
    setLoading(true);
    
    try {
        const res = await fetch('/api/scrape', {
            method: 'POST',
            body: JSON.stringify({
                country,
                industry: industry === 'Custom' ? customIndustry : industry,
                filters
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

  const exportCSV = () => {
      const headers = ["Company Name", "Country", "Industry", "Website", "Email", "Score", "Source"];
      const rows = leads.map(l => [l.companyName, l.country, l.industry, l.website, l.email, l.score, l.source]);
      
      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => `"${e.join('","')}"`).join("\n");
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Global_Leads_${country}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C2C] font-sans">
      <header className="bg-[#1B2922] text-[#E8DCC4] py-6 shadow-md border-b-4 border-[#C19A6B]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <h1 className="text-3xl font-[Playfair_Display] font-semibold tracking-wide flex items-center gap-3">
                <Globe2 className="w-8 h-8 text-[#C19A6B]" /> 
                Global Lead Scraper
            </h1>
            <div className="text-sm font-light text-[#A8A88B]">Advanced Sales Machine</div>
        </div>
      </header>

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
                        <button onClick={exportCSV} disabled={leads.length===0} className="px-4 py-2 border border-[#C19A6B] text-[#C19A6B] hover:bg-[#C19A6B] hover:text-white rounded text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50">
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
