import React, { useState, useEffect } from 'react';
import { Search, MapPin, ExternalLink, ChevronDown, CheckCircle, Image, FileText, Globe } from 'lucide-react';

const WetuIntegration = () => {
    const [lodges, setLodges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('All');

    // Fetch static lodges on mount
    useEffect(() => {
        fetch('http://localhost:3000/api/static-lodges')
            .then(res => res.json())
            .then(data => {
                setLodges(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load lodges", err);
                setLoading(false);
            });
    }, []);

    // Filter logic
    const filteredLodges = lodges.filter(lodge => {
        const matchesSearch = lodge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lodge.region.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = selectedRegion === 'All' || lodge.region === selectedRegion;
        return matchesSearch && matchesRegion;
    });

    const regions = ['All', ...new Set(lodges.map(l => l.region))].sort();

    return (
        <div className="space-y-8 h-full flex flex-col">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-light text-neutral-800 flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Globe className="w-8 h-8 text-blue-600" />
                        </div>
                        Wetu Content Library
                    </h2>
                    <p className="text-neutral-500 mt-2 text-lg">Access iBrochures, High-Res Images, and Rack Rates for all properties.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search lodges..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-neutral-400">
                        <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-4"></div>
                        Loading Content Library...
                    </div>
                ) : filteredLodges.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-neutral-400 bg-white rounded-2xl border border-neutral-100">
                        <p>No lodges found matching your criteria.</p>
                    </div>
                ) : (
                    filteredLodges.map(lodge => (
                        <WetuLodgeCard key={lodge.bbid || lodge.name} lodge={lodge} />
                    ))
                )}
            </div>
        </div>
    );
};

// Dedicated concise card for Wetu Content
const WetuLodgeCard = ({ lodge }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Mock links logic just like in LodgeCard
    const wetuLinks = {
        iBrochure: `https://wetu.com/iBrochure/en/${lodge.name.replace(/\s+/g, '')}`,
        rackRates: "#",
        images: "#",
        factSheet: "#"
    };

    // Image Logic
    // 1. Scraped Wetu Image
    // 2. Placeholder based on region
    let image = "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=400"; // Fallback Generic

    if (lodge.images && lodge.images.length > 0) {
        image = lodge.images[0];
    } else if (lodge.region === "Etosha") {
        image = "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&q=80&w=400";
    } else if (lodge.region === "Sossusvlei") {
        image = "https://images.unsplash.com/photo-1547901767-c253af7a58c0?auto=format&fit=crop&q=80&w=400";
    } else if (lodge.region === "Swakopmund") {
        image = "https://images.unsplash.com/photo-1614531341773-3e9750e0ce71?auto=format&fit=crop&q=80&w=400";
    } else if (lodge.region === "Damaraland") {
        image = "https://images.unsplash.com/photo-1504966981333-60a137a1cbe5?auto=format&fit=crop&q=80&w=400";
    }

    return (
        <div className="bg-white rounded-xl border border-neutral-200 hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
            <div className="h-40 overflow-hidden relative bg-neutral-100">
                <img
                    src={image}
                    alt={lodge.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-neutral-700 shadow-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500" /> {lodge.region}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-neutral-900 text-lg leading-tight mb-4">{lodge.name}</h3>

                <div className="mt-auto space-y-2">
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isOpen ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}
                        >
                            <span>Access Content</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-20 animate-in slide-in-from-bottom-2 duration-200">
                                <div className="p-1">
                                    <a href={wetuLinks.iBrochure} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                                        <Globe className="w-4 h-4" /> iBrochure
                                    </a>
                                    <a href={wetuLinks.images} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                                        <Image className="w-4 h-4" /> Image Gallery
                                    </a>
                                    <a href={wetuLinks.factSheet} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                                        <FileText className="w-4 h-4" /> Fact Sheet
                                    </a>
                                    <a href={wetuLinks.rackRates} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                                        <CheckCircle className="w-4 h-4" /> Rack Rates
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WetuIntegration;
