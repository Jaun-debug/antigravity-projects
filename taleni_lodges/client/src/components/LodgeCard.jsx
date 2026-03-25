import React from 'react';
import { CheckCircle2, XCircle, Plus, Download, CheckCircle, RefreshCw, ChevronDown, ExternalLink, Image, X } from 'lucide-react';

import { LODGE_IMAGES } from '../data/wetu_images_export';

export const lodgeImages = {
    // Wetu Images (Auto-populated)
    ...Object.keys(LODGE_IMAGES).reduce((acc, key) => {
        if (LODGE_IMAGES[key] && LODGE_IMAGES[key].length > 0) {
            acc[key] = LODGE_IMAGES[key][0];
        }
        return acc;
    }, {}),

    // Manual Overrides
    "Sossusvlei Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Sossusvlei-Lodge-Intro.jpg",
    "Desert Camp": "https://www.info-namibia.com/images/accommodation/sossusvlei/Sossusvlei-Desert-Camp.jpg",
    "Desert Quiver Camp": "https://www.info-namibia.com/images/accommodation/sossusvlei/Desert-Quiver-Camp-Intro.jpg",
    "Etosha Village": "https://www.info-namibia.com/images/accommodation/etosha/Taleni.jpg",
    "Hoodia Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Hoodia-Intro.jpg",
    "Damaraland Camp": "https://www.info-namibia.com/images/accommodation/damaraland/Damaraland-Camp.jpg",
    "AndBeyond Sossusvlei Desert Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Desert-Whisper-Intro.jpg",
    "Dead Valley Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Dead-Valley-Lodge-Intro.jpg",
    "Sossus Dune Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Sossus-Dune-Lodge.jpg",
    "Kulala Desert Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Kulala-Desert-Camp.jpg",
    "Little Kulala": "https://www.info-namibia.com/images/accommodation/sossusvlei/Little-Kulala.jpg",
    "Hoodia Desert Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Hoodia-Intro.jpg",
    "Le Mirage Resort & Spa": "https://www.info-namibia.com/images/accommodation/sossusvlei/Le_Mirage.jpg",
    "Namib Desert Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Namib-Desert-Lodge.jpg",
    "Namib Desert Camping2Go": "https://www.info-namibia.com/images/accommodation/sossusvlei/Namib-Desert-Lodge.jpg",
    "Agama Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Agama_River_Camp.jpg",
    "Elegant Desert Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Elegant-Desert-Lodge-Intro.jpg",
    "Tsauchab River Camp": "https://www.info-namibia.com/images/accommodation/sossusvlei/Tsauchab-River-Camp.jpg",
    "Desert Homestead Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Desert-Homestead-Intro.jpg",
    "Desert Homestead Outpost": "https://www.info-namibia.com/images/accommodation/sossusvlei/Desert-Outpost-Intro.jpg",
    "Namib Outpost": "https://www.info-namibia.com/images/accommodation/sossusvlei/Desert-Outpost-Intro.jpg",
    "Sesriem Campsite": "https://www.info-namibia.com/images/accommodation/sossusvlei/Sesriem-Campsite.jpg",
    "Sossus Oasis Camp Site": "https://www.info-namibia.com/images/accommodation/sossusvlei/Sossusvlei-Desert-Camp.jpg",
    "Solitaire Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Solitaire-Desert-Farm-Intro.jpg",
    "Solitaire Desert Farm": "https://www.info-namibia.com/images/accommodation/sossusvlei/Solitaire-Desert-Farm-Intro.jpg",
    "Moon Mountain Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Moon-Mountain-Lodge.jpg",
    "Rostock Ritz Desert Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Rostock-Ritz-Intro.jpg",
    "Wolwedans Desert Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Wolwedans-Desert-Lodge.jpg",
    "Wolwedans Dune Camp": "https://www.info-namibia.com/images/accommodation/sossusvlei/Wolwedans-Dune-Camp.jpg",
    // Wetu might have better images for these, so we let the spread above take precedence if we remove the hardcode, 
    // but for now we keep manual overrides if specific art direction is checking these.
    // "Wolwedans Plains Camp": ... (Removed to let Wetu take over)
    "Kwessi Dunes Lodge": "https://www.info-namibia.com/images/accommodation/sossusvlei/Kwessie-Dunes-Intro.jpg",
    "NamibRand Family Hideout": "https://www.info-namibia.com/images/accommodation/sossusvlei/Namibrand-Family-Hideout-Intro.jpg",
    "Tok Tokkie Trails Base Camp": "https://www.info-namibia.com/images/accommodation/sossusvlei/Koiimasis-Intro.jpg"
};

export const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000";

const LodgeCard = ({ lodge, onAddToItinerary }) => {
    const [rateData, setRateData] = React.useState(null);
    const [showRates, setShowRates] = React.useState(false);
    const [isDownloaded, setIsDownloaded] = React.useState(false);

    React.useEffect(() => {
        if (showRates && !rateData) {
            fetch(`http://localhost:3000/api/rates/${encodeURIComponent(lodge.name)}`)
                .then(res => res.json())
                .then(data => setRateData(data))
                .catch(err => console.error("Error fetching rates:", err));
        }
    }, [showRates, lodge.name, rateData]);

    const handleDownload = (e) => {
        e.stopPropagation();

        // Generate content
        const date = new Date().toLocaleDateString();
        let content = `LODGE QUOTATION\n-----------------\n`;
        content += `Lodge: ${lodge.name}\n`;
        content += `Region: ${lodge.region}\n`;
        content += `Generated Date: ${date}\n\n`;

        if (lodge.rooms && lodge.rooms.length > 0) {
            content += `AVAILABLE ROOMS & RATES:\n`;
            lodge.rooms.forEach(room => {
                content += `- ${room.name}: ${room.price}\n`;
            });
        } else if (lodge.price) {
            content += `Indicative Rate: ${lodge.price}\n`;
        } else {
            content += `No live rates currently available.\n`;
        }

        content += `\n-----------------\nGenerated by Namibia Lodge Availability System`;

        // Create Blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${lodge.name.replace(/\s+/g, '_')}_Quote.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsDownloaded(true);
    };

    // Use mapped image or fallback
    const image = lodgeImages[lodge.name] || PLACEHOLDER_IMAGE;

    const [isExtracting, setIsExtracting] = React.useState(false);
    const fileInputRef = React.useRef(null);

    // Persist rate data across navigation
    React.useEffect(() => {
        try {
            const savedRates = localStorage.getItem(`rates_${lodge.name}`);
            if (savedRates) {
                setRateData(JSON.parse(savedRates));
                // Optional: Don't auto-open on restore to keep UI clean, or can set setShowRates(true) if desired.
                // setShowRates(true); 
            }
        } catch (e) {
            console.error("Failed to load saved rates", e);
        }
    }, [lodge.name]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3000/api/extract', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Extraction failed');
            }

            const result = await response.json();

            // Find specific property or default to first
            // Simple mapping: Flatten the extracted data to fit the rateData structure
            // rateData structure expected: { childPolicy, rooms: [{name, rackRate, stoRate, basis}] }

            if (result.properties && result.properties.length > 0) {
                // Heuristic: Try to find a property matching the lodge name, else first
                const match = result.properties.find(p => p.propertyName.includes(lodge.name)) || result.properties[0];

                const mappedData = {
                    childPolicy: "See rate sheet details", // Default or extract if available
                    rooms: match.rates.map(r => ({
                        name: r.roomType,
                        rackRate: r.rackRate || (r.perPersonSharing ? r.perPersonSharing * 2 : (r.stoRate ? r.stoRate * 1.25 : "N/A")),
                        stoRate: r.perPersonSharing || r.stoRate || 0,
                        singleRate: r.singleRate || null,
                        childRate: r.childRate || null,
                        basis: r.basis
                    }))
                };

                setRateData(mappedData);

                // Save to storage
                localStorage.setItem(`rates_${lodge.name}`, JSON.stringify(mappedData));
            }

        } catch (error) {
            console.error(error);
            alert(error.message || "Failed to extract rates. Please try again.");
        } finally {
            setIsExtracting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleReset = (e) => {
        e.stopPropagation();
        localStorage.removeItem(`rates_${lodge.name}`);
        setRateData(null);
        setShowRates(false);
    };

    const [showWetuMenu, setShowWetuMenu] = React.useState(false);
    const [showGallery, setShowGallery] = React.useState(false);

    // Hero Image Logic
    // Priority: lodge.images[0] -> lodgeImages mapping -> region cover -> placeholder
    const heroImage = (lodge.images && lodge.images.length > 0)
        ? lodge.images[0]
        : (image || PLACEHOLDER_IMAGE);

    // Mock Wetu links - in production these would come from the lodge object
    const wetuLinks = {
        iBrochure: `https://wetu.com/iBrochure/en/${lodge.name.replace(/\s+/g, '')}`,
        rackRates: "#",
        images: "#",
        factSheet: "#"
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden border transition-all duration-300 ${rateData ? 'border-emerald-500 shadow-emerald-100 ring-1 ring-emerald-500' : 'border-neutral-100 hover:shadow-xl'} relative`}>
            <div className="h-64 overflow-hidden relative group">
                <img
                    src={heroImage}
                    alt={lodge.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Gallery Button if images exist */}
                {lodge.images && lodge.images.length > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowGallery(true);
                        }}
                        className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                        <Image className="w-4 h-4" />
                        {lodge.images.length} Photos
                    </button>
                )}

                {/* Wetu Menu Button - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowWetuMenu(!showWetuMenu);
                            }}
                            className="bg-white/90 backdrop-blur-sm text-neutral-700 hover:text-amber-600 px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold border border-white/50 flex items-center gap-1 transition-all"
                        >
                            Wetu Info <ChevronDown className={`w-3 h-3 transition-transform ${showWetuMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showWetuMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-neutral-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 z-20">
                                <div className="py-1">
                                    <a href={wetuLinks.iBrochure} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-xs text-neutral-600 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center justify-between group">
                                        iBrochure <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <a href={wetuLinks.rackRates} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-xs text-neutral-600 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center justify-between group">
                                        Rack Rates (Wetu) <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <a href={wetuLinks.images} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-xs text-neutral-600 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center justify-between group">
                                        Image Gallery <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <a href={wetuLinks.factSheet} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-xs text-neutral-600 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center justify-between group">
                                        Fact Sheet <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Overlay - Moved slightly or adjusted */}
                {rateData && (
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in fade-in duration-300">
                        <CheckCircle className="w-3 h-3" />
                        STO RATES
                    </div>
                )}

                {/* Gallery Overlay View */}
                {showGallery && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowGallery(false); }}>
                        <div className="relative w-full max-w-5xl h-full max-h-[80vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowGallery(false)}
                                className="absolute -top-12 right-0 text-white hover:text-amber-400 transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <div className="flex-1 w-full overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {lodge.images.map((img, idx) => (
                                    <div key={idx} className="rounded-lg overflow-hidden border border-white/10 shadow-lg relative group/item">
                                        <img src={img} alt={`${lodge.name} ${idx}`} className="w-full h-48 object-cover" />
                                        <a href={img} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity text-white font-medium text-sm">
                                            View Full Size
                                        </a>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-white/50 text-sm">
                                Showing {lodge.images.length} images from Wetu
                            </div>
                        </div>
                    </div>
                )}

                {lodge.available === false && (
                    <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white text-center py-2 text-sm font-medium backdrop-blur-sm">
                        Fully Booked
                    </div>
                )}
            </div>

            <div className="p-6 space-y-4">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-light text-neutral-900">{lodge.name}</h3>
                        <span className="text-sm font-medium px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                            {lodge.region}
                        </span>
                    </div>

                    <div className="mt-4">
                        {rateData && rateData.rooms && showRates ? (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">CHILD POLICY</p>
                                    <p className="text-sm text-amber-900">{rateData.childPolicy}</p>
                                </div>
                                <div className="space-y-3">
                                    {Object.values(rateData.rooms.reduce((acc, room) => {
                                        const key = room.name || "Unknown Room";
                                        if (!acc[key]) acc[key] = [];
                                        acc[key].push(room);
                                        return acc;
                                    }, {})).map((group, groupIdx) => {
                                        // Helper to normalize basis for comparison
                                        const cleanBasis = (b) => (b || "").toLowerCase().replace(/[^a-z0-9]/g, '');

                                        const bbRate = group.find(r => {
                                            const b = cleanBasis(r.basis);
                                            return b.includes('bed') && !b.includes('dinner') || b === 'bb' || b === 'bnb' || b.includes('breakfast');
                                        });

                                        const dbbRate = group.find(r => {
                                            const b = cleanBasis(r.basis);
                                            return b.includes('dinner') || b === 'dbb' || b.includes('halfboard');
                                        });

                                        return (
                                            <div key={groupIdx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 w-full">
                                                <p className="font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200 text-base">{group[0].name}</p>

                                                <div className="grid grid-cols-2 gap-3 w-full">
                                                    {/* Left Column: Bed & Breakfast */}
                                                    <div className="flex flex-col w-full">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Bed & Breakfast</span>
                                                            {!bbRate && <span className="text-[9px] text-neutral-300 italic">N/A</span>}
                                                        </div>
                                                        {bbRate ? (
                                                            <div className="bg-white p-2 rounded-lg border border-neutral-200 shadow-sm h-full w-full">
                                                                <div className="grid grid-cols-3 gap-1 text-sm">
                                                                    <div className="flex flex-col items-start overflow-hidden">
                                                                        <span className="text-[9px] text-neutral-400 uppercase truncate w-full">PPS</span>
                                                                        <span className="font-bold text-emerald-700 text-sm whitespace-nowrap">N$ {bbRate.stoRate ? Math.round(bbRate.stoRate).toLocaleString() : '-'}</span>
                                                                    </div>
                                                                    <div className="flex flex-col items-start overflow-hidden">
                                                                        <span className="text-[9px] text-neutral-400 uppercase truncate w-full">Single</span>
                                                                        <span className="font-bold text-neutral-700 text-sm whitespace-nowrap">{bbRate.singleRate ? `N$ ${Math.round(bbRate.singleRate).toLocaleString()}` : '-'}</span>
                                                                    </div>
                                                                    <div className="flex flex-col items-start overflow-hidden">
                                                                        <span className="text-[9px] text-neutral-400 uppercase truncate w-full">Child</span>
                                                                        <span className="font-bold text-neutral-700 text-sm whitespace-nowrap">{bbRate.childRate ? `N$ ${Math.round(bbRate.childRate).toLocaleString()}` : '-'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50/50 min-h-[50px]"></div>
                                                        )}
                                                    </div>

                                                    {/* Right Column: Dinner, Bed & Breakfast */}
                                                    <div className="flex flex-col w-full">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider truncate">Dinner, Bed & Bkfst</span>
                                                            {!dbbRate && <span className="text-[9px] text-neutral-300 italic">N/A</span>}
                                                        </div>
                                                        {dbbRate ? (
                                                            <div className="bg-white p-2 rounded-lg border border-neutral-200 shadow-sm h-full w-full">
                                                                <div className="grid grid-cols-3 gap-1 text-sm">
                                                                    <div className="flex flex-col items-start overflow-hidden">
                                                                        <span className="text-[9px] text-neutral-400 uppercase truncate w-full">PPS</span>
                                                                        <span className="font-bold text-emerald-700 text-sm whitespace-nowrap">N$ {dbbRate.stoRate ? Math.round(dbbRate.stoRate).toLocaleString() : '-'}</span>
                                                                    </div>
                                                                    <div className="flex flex-col items-start overflow-hidden">
                                                                        <span className="text-[9px] text-neutral-400 uppercase truncate w-full">Single</span>
                                                                        <span className="font-bold text-neutral-700 text-sm whitespace-nowrap">{dbbRate.singleRate ? `N$ ${Math.round(dbbRate.singleRate).toLocaleString()}` : '-'}</span>
                                                                    </div>
                                                                    <div className="flex flex-col items-start overflow-hidden">
                                                                        <span className="text-[9px] text-neutral-400 uppercase truncate w-full">Child</span>
                                                                        <span className="font-bold text-neutral-700 text-sm whitespace-nowrap">{dbbRate.childRate ? `N$ ${Math.round(dbbRate.childRate).toLocaleString()}` : '-'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50/50 min-h-[50px]"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : lodge.rooms && lodge.rooms.length > 0 ? (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Live Availability</p>
                                <ul className="space-y-2">
                                    {lodge.rooms.map((room, idx) => (
                                        <li key={idx} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-100 group">
                                            <div className="flex flex-col">
                                                <span className="text-neutral-700 font-medium">{room.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-amber-600 font-bold">{room.price}</span>
                                                {onAddToItinerary && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onAddToItinerary(lodge, room);
                                                        }}
                                                        className="bg-neutral-900 text-white p-1.5 rounded-md hover:bg-neutral-700 transition-colors text-xs flex items-center gap-1"
                                                        title="Add to Itinerary"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center mt-2 p-3 bg-neutral-50 rounded-lg">
                                {lodge.price ? (
                                    <>
                                        <span className="text-neutral-500">Live Rack Rate</span>
                                        <span className="text-2xl font-medium text-amber-600">{lodge.price}</span>
                                    </>
                                ) : (
                                    <span className="text-neutral-400 italic">No live rates available</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rate Sheet Config Section */}
                    <div className="mt-6 border-t pt-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept=".pdf,image/*"
                        />

                        <div className="flex items-center gap-3 mb-4">
                            {rateData ? (
                                <>
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-colors bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        STO Rates Uploaded
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Reset / Re-upload Rates"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleUploadClick}
                                    disabled={isExtracting}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isExtracting
                                        ? 'bg-neutral-100 text-neutral-400 cursor-wait'
                                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                                        }`}
                                >
                                    {isExtracting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                                            Extracting...
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-col items-center leading-tight">
                                                <span>Upload STO Rates</span>
                                            </div>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {rateData && (
                            <button
                                onClick={() => setShowRates(!showRates)}
                                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors w-full justify-center"
                            >
                                {showRates ? 'Hide Rate Sheet Details' : 'View Rate Sheet Details'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LodgeCard;
