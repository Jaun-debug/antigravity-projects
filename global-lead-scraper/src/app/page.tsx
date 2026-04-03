'use client';

import { useState, useRef } from 'react';
import { Search, Download, Globe2, Loader2, Briefcase, Mail, CheckCircle2, User, Star, Play, Square } from 'lucide-react';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Home() {
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('DMC');
  const [minScore, setMinScore] = useState(30);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scannedCountries, setScannedCountries] = useState<Record<string, number>>({});
  const isAutoPilot = useRef(false);
  const [autoPilotStatus, setAutoPilotStatus] = useState(false);

  const extractForCountry = async (target: string) => {
    setLoading(true);
    setCountry(target); // Force UI visual sync
    try {
        const res = await fetch('/api/scrape', {
            method: 'POST',
            body: JSON.stringify({ country: target, industry: 'DMC', minScore })
        });
        const data = await res.json();
        if (data.leads) {
            setLeads(prev => {
                const baseList = prev.filter(l => l.country !== target);
                // Create a unique map using email to prevent global duplicates across ALL countries
                const leadMap = new Map();
                baseList.forEach(lead => leadMap.set(lead.email, lead));
                data.leads.forEach((lead: any) => leadMap.set(lead.email, lead));
                
                return Array.from(leadMap.values()).sort((a: any, b: any) => b.score - a.score);
            });
            setScannedCountries(prev => ({
                ...prev,
                [target]: data.leads.length
            }));
        }
    } catch(err) {
        console.error("Extraction error for", target);
    }
    setLoading(false);
  };

  const startScrape = async () => {
    if (!country) return alert("Please select a target country.");
    await extractForCountry(country);
  };

  const toggleAutoPilot = async () => {
      if (autoPilotStatus) {
          isAutoPilot.current = false;
          setAutoPilotStatus(false);
          return;
      }
      
      const proceed = window.confirm("Enable Auto-Pilot? The engine will continuously fetch leads from every country sequentially. This process uses API credits.");
      if (!proceed) return;

      isAutoPilot.current = true;
      setAutoPilotStatus(true);
      
      for (const nextCountry of COUNTRIES) {
          if (!isAutoPilot.current) break; // If user clicked Stop
          
          // Skip if already in memory
          if (scannedCountries[nextCountry] !== undefined) continue;
          
          await extractForCountry(nextCountry);
          // Wait 3 seconds between runs so we don't spam the network/API 
          await new Promise(r => setTimeout(r, 3000));
      }
      
      isAutoPilot.current = false;
      setAutoPilotStatus(false);
  };



  const exportCSV = () => {
      const headers = ["Company Name", "Country", "Website", "Verified Email", "Contact Name", "Score"];
      const rows = leads.map(l => [
          l.companyName, 
          l.country, 
          l.website, 
          l.email, 
          l.contactName || 'N/A', 
          l.score
      ]);
      
      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => `"${e.join('","')}"`).join("\n");
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Global_Verified_Leads_Database.csv`);
      document.body.appendChild(link);
      link.click();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C2C] font-['Open_Sans',sans-serif]">
      {/* HEADER */}
      <header className="bg-[#FAF5EC] text-[#2C2C2C] py-8 shadow-sm border-b border-[#E6DBCA]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <h1 className="text-3xl font-['Playfair_Display',serif] italic tracking-wide flex items-center gap-3 text-[#5A4F43]">
                <Globe2 className="w-8 h-8 text-[#A89476]" /> 
                Global DMC Lead Engine
            </h1>
            <div className="text-sm font-light text-[#8A7F6F] tracking-widest uppercase">Premium Partner Network</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR CONFIG */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#EBE3D5] h-fit">
            <h2 className="text-xl font-['Playfair_Display',serif] font-medium mb-6 flex items-center gap-2 border-b border-[#EBE3D5] pb-3 text-[#5A4F43]">
                <Search className="w-5 h-5 text-[#A89476]"/> Engine Parameters
            </h2>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-[#665D52] mb-2 uppercase tracking-wide text-xs">Target Country</label>
                    <select 
                        value={country} 
                        onChange={e => setCountry(e.target.value)}
                        className="w-full bg-[#FCFAF6] border border-[#E0D5C1] rounded px-4 py-2.5 focus:ring-1 focus:ring-[#A89476] focus:border-[#A89476] outline-none transition font-medium"
                    >
                        <option value="" disabled>Select a Country</option>
                        {COUNTRIES.map(c => {
                            const isScanned = scannedCountries[c] !== undefined;
                            return (
                                <option 
                                    key={c} 
                                    value={c} 
                                    style={isScanned ? { color: '#166534', fontWeight: 'bold' } : {}}
                                >
                                    {c} {isScanned ? `✓ (${scannedCountries[c]} Leads)` : ""}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <label className="block text-sm font-semibold text-[#665D52] uppercase tracking-wide text-xs">Minimum Lead Quality</label>
                        <span className="text-xs font-bold text-[#A89476]">{minScore} pts</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="80" step="5"
                        value={minScore} 
                        onChange={e => setMinScore(parseInt(e.target.value))}
                        className="w-full accent-[#A89476] h-1.5 bg-[#EBE3D5] rounded-lg appearance-none cursor-pointer" 
                    />
                    <div className="flex justify-between text-[10px] text-[#A8A8A8] mt-1 font-bold">
                        <span>Low (0)</span>
                        <span>Premium (80)</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-[#EBE3D5] space-y-3">
                    <p className="text-xs text-[#8A7F6F] leading-relaxed mb-4 italic">
                        The engine will seamlessly extract, enrich, and strictly verify addresses using NeverBounce protocols.
                    </p>
                    <button onClick={startScrape} disabled={loading || autoPilotStatus}
                            className="w-full bg-[#463F3A] hover:bg-[#2C2724] text-[#FDFBF7] py-3.5 rounded font-semibold tracking-wide transition shadow-md disabled:opacity-70 flex justify-center items-center gap-2">
                        {loading && !autoPilotStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Scan Selected Country
                    </button>

                    <button onClick={toggleAutoPilot} 
                            className={`w-full py-3.5 rounded font-semibold tracking-wide transition shadow-md flex justify-center items-center gap-2 ${autoPilotStatus ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-[#EBF2EA] text-[#3D6B3C] border border-[#C5D9C4] hover:bg-[#DDF0DC]'}`}>
                        {autoPilotStatus ? (
                            <><Square className="w-4 h-4 fill-current"/> Stop Auto-Pilot</>
                        ) : (
                            <><Play className="w-4 h-4 fill-current"/> Run Global Auto-Pilot</>
                        )}
                    </button>
                </div>
            </div>
        </aside>

        {/* MAIN RESULTS BOARD */}
        <section className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#EBE3D5] overflow-hidden flex flex-col min-h-[600px]">
                
                {/* TOOLBAR */}
                <div className="bg-[#FAF5EC] px-6 py-4 flex justify-between items-center border-b border-[#EBE3D5]">
                    <div>
                        <h3 className="font-['Playfair_Display',serif] text-xl text-[#3A332C]">Verified Database</h3>
                        <p className="text-sm text-[#8A7F6F] mt-0.5">{leads.length} High-Quality Prospects Extracted</p>
                    </div>
                    <div>
                        <button onClick={exportCSV} disabled={leads.length===0} className="px-5 py-2.5 border border-[#A89476] text-[#A89476] hover:bg-[#A89476] hover:text-white rounded text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50 tracking-wide">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#F4EFE6] text-[#665D52] uppercase text-[11px] tracking-wider border-b border-[#EBE3D5]">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Company & Location</th>
                                <th className="px-6 py-4 font-semibold"><User className="w-3.5 h-3.5 inline mr-1"/>Contact Name</th>
                                <th className="px-6 py-4 font-semibold"><Mail className="w-3.5 h-3.5 inline mr-1"/>Verified Email</th>
                                <th className="px-6 py-4 font-semibold text-center"><Star className="w-3.5 h-3.5 inline mr-1"/>Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0ECE1]">
                            {leads.length === 0 && !loading && !autoPilotStatus && (
                                <tr>
                                    <td colSpan={4} className="text-center py-32 text-[#A89476]">
                                        <div className="flex flex-col items-center gap-4">
                                            <Globe2 className="w-12 h-12 opacity-40" />
                                            <span className="font-['Playfair_Display',serif] text-lg italic text-[#5A4F43]">Awaiting engine activation.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {(loading && leads.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="text-center py-32">
                                        <div className="flex flex-col items-center gap-4 text-[#A89476]">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                                            <span className="text-sm font-semibold tracking-wide uppercase">Extracting premium targets...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {leads.map((l, i) => (
                                <tr key={i} className="hover:bg-[#FCFAFA] transition group">
                                    <td className="px-6 py-5">
                                        <div className="font-semibold text-[15px] text-[#3A332C]">{l.companyName}</div>
                                        <div className="text-xs text-[#8A7F6F] mt-1 truncate max-w-[220px]">
                                            {l.country} &bull; <a href={l.website} target="_blank" className="hover:text-[#A89476] transition">{l.website}</a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[#5A4F43]">
                                        {l.contactName ? <span className="font-medium">{l.contactName}</span> : <span className="text-[#A8A8A8] italic">Unlisted</span>}
                                        <div className="text-[11px] text-[#A8A8A8] mt-0.5">{l.role || ''}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 font-medium text-[#4A4138]">
                                            {l.email} 
                                            <CheckCircle2 className="w-4 h-4 text-green-600 opacity-80" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold tracking-wider ${l.score >= 50 ? 'bg-[#EBF2EA] text-[#3D6B3C]' : l.score >= 30 ? 'bg-[#F4EFE6] text-[#A89476]' : 'bg-[#F9ECEB] text-[#9A4B4B]'}`}>
                                            {l.score} PTS
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
