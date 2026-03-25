import { useState, useEffect } from 'react'
import BlogSection from './pages/BlogSection'
import VehicleSelection from './components/VehicleSelection'
import MichelleHouse from './components/MichelleHouse'
import AccountancyProgram from './components/AccountancyProgram'
import WetuIntegration from './components/WetuIntegration'
import LodgeCard, { lodgeImages, PLACEHOLDER_IMAGE } from './components/LodgeCard'
import PriceListExtractor from './pages/PriceListExtractor'
import { Calendar, Users, Briefcase, ArrowLeft, ArrowRight, MapPin, Trash2, Download, ShoppingBag, X, Car, BookOpen, BedDouble, Home, Calculator, Globe } from 'lucide-react'

function App() {
    const [staticLodges, setStaticLodges] = useState([]);
    const [currentStep, setCurrentStep] = useState('accountancy');

    // Selection state
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedLodge, setSelectedLodge] = useState(null);

    // Search state for Step 3
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Default dates: tomorrow and day after
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDay = new Date(tomorrow);
    nextDay.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const [searchParams, setSearchParams] = useState({
        checkInDate: formatDate(tomorrow),
        checkOutDate: formatDate(nextDay),
        adults: 2,
        children: 0
    });

    // Itinerary State
    const [itinerary, setItinerary] = useState([]);
    const [isItineraryOpen, setIsItineraryOpen] = useState(false);

    const handleAddToItinerary = (lodge, room) => {
        const newItem = {
            id: Date.now(),
            lodgeName: lodge.name,
            region: lodge.region,
            roomName: room.name,
            price: room.price,
            checkIn: searchParams.checkInDate,
            checkOut: searchParams.checkOutDate,
            adults: searchParams.adults,
            children: searchParams.children,
            image: lodgeImages[lodge.name] || PLACEHOLDER_IMAGE
        };
        setItinerary([...itinerary, newItem]);
        setIsItineraryOpen(true);
    };

    const handleRemoveFromItinerary = (id) => {
        setItinerary(itinerary.filter(item => item.id !== id));
    };

    const handleSaveItinerary = () => {
        const text = itinerary.map(item =>
            `Lodge: ${item.lodgeName}\nRoom: ${item.roomName}\nDates: ${item.checkIn} to ${item.checkOut}\nPax: ${item.adults} Adults, ${item.children} Children\nPrice: ${item.price}\n-------------------\n`
        ).join('');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'namibia_itinerary.txt';
        a.click();
    };

    // Load static data on mount
    useEffect(() => {
        fetch('http://localhost:3000/api/static-lodges')
            .then(res => res.json())
            .then(data => setStaticLodges(data))
            .catch(err => console.error("Failed to load static lodges", err));
    }, []);

    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
        setCurrentStep(2);
    };

    const handleLodgeSelect = (lodge) => {
        setSelectedLodge(lodge);
        setCurrentStep(3);
        // Clean previous search data when switching lodges
        setData(null);
    };

    const handleBack = () => {
        if (currentStep === 3) {
            setCurrentStep(2);
            setSelectedLodge(null);
            setData(null);
        } else if (currentStep === 2) {
            setCurrentStep(1);
            setSelectedRegion(null);
        } else if (currentStep === 1 || currentStep === 4 || currentStep === 0 || currentStep === 'vehicles' || currentStep === 'michelle' || currentStep === 'accountancy' || currentStep === 'wetu') {
            setCurrentStep('home');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const queryParams = { ...searchParams, lodgeName: selectedLodge.name };
            const queryString = new URLSearchParams(queryParams).toString();
            const response = await fetch(`http://localhost:3000/api/availability?${queryString}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError('Failed to fetch availability. Please ensure the backend server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSearchParams(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const getRegions = () => {
        const groups = {};
        staticLodges.forEach(lodge => {
            let region = lodge.region ? lodge.region.trim() : "Other";
            if (!groups[region]) groups[region] = [];
            groups[region].push(lodge);
        });
        return groups;
    };

    // REFINED REGION IMAGES MAP
    // Uses reliable Unsplash IDs for specific visual vibes to avoid broken links.
    // Wikimedia links were not rendering reliably, so we use curated high-quality Unsplash replacements.
    const regionImages = {
        // --- MAJOR DESTINATIONS ---
        "Windhoek": "https://images.unsplash.com/photo-1596120613203-b05214041180?auto=format&fit=crop&q=80&w=600",
        "Sossusvlei": "https://images.unsplash.com/photo-1627494490333-e578c77395c3?auto=format&fit=crop&q=80&w=600",
        "Etosha": "https://images.unsplash.com/photo-1516426122078-c23e2843d809?auto=format&fit=crop&q=80&w=600",
        "Etosha North": "https://images.unsplash.com/photo-1516426122078-c23e2843d809?auto=format&fit=crop&q=80&w=600",
        "Swakopmund": "https://images.unsplash.com/photo-1580128795589-417122851f8d?auto=format&fit=crop&q=80&w=600",
        "Walvis Bay": "https://images.unsplash.com/photo-1473215262334-192cb91b858e?auto=format&fit=crop&q=80&w=600",
        "Damaraland": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600",
        "Skeleton Coast": "https://images.unsplash.com/photo-1628065094380-6925de754cc6?auto=format&fit=crop&q=80&w=600",
        "Luderitz": "https://images.unsplash.com/photo-1576487130230-01e956637042?auto=format&fit=crop&q=80&w=600",
        "Kalahari": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600",
        "Keetmanshoop": "https://images.unsplash.com/photo-1555546415-g15951c0985c?auto=format&fit=crop&q=80&w=600", // Quiver Tree

        // --- SPECIFIC TOWNS (Fixed with Reliable Visual Matches) ---
        // Waterberg: Red sandstone plateau
        "Waterberg": "https://images.unsplash.com/photo-1647008149846-5be88398cb28?auto=format&fit=crop&q=80&w=600",
        // Rundu: River/Green vegetation
        "Rundu": "https://images.unsplash.com/photo-1588616149176-b63bf211d279?auto=format&fit=crop&q=80&w=600",
        // Caprivi: Wetlands/River
        "Caprivi": "https://images.unsplash.com/photo-1496545672447-f699b503d270?auto=format&fit=crop&q=80&w=600",
        // Tsumeb: Northern Savannah/Mining area (Generic)
        "Tsumeb": "https://images.unsplash.com/photo-1534336082496-e25866184510?auto=format&fit=crop&q=80&w=600",
        // Gobabis: Eastern Cattle Country (Savanna)
        "Gobabis": "https://images.unsplash.com/photo-1519098901909-b1553a1190af?auto=format&fit=crop&q=80&w=600",
        // Maltahohe: Southern arid scrub
        "Maltahohe": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=600",
        // Helmeringhausen: Remote southern road
        "Helmeringhausen": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=600",
        // Okahandja: Central bushveld
        "Okahandja": "https://images.unsplash.com/photo-1590423049366-a32906c278fb?auto=format&fit=crop&q=80&w=600",
        // Otjiwarongo: Central farmland (Cheetah country)
        "Otjiwarongo": "https://images.unsplash.com/photo-1563725624-9b2d8d8520c4?auto=format&fit=crop&q=80&w=600",
        // Omaruru: Erongo mountains
        "Omaruru": "https://images.unsplash.com/photo-1552727131-5fc611136bdf?auto=format&fit=crop&q=80&w=600",
        // Outjo: Gateway to Etosha
        "Outjo": "https://images.unsplash.com/photo-1534336082496-e25866184510?auto=format&fit=crop&q=80&w=600",
        // Otavi: Green triangle
        "Otavi": "https://images.unsplash.com/photo-1449356669058-f6493307920d?auto=format&fit=crop&q=80&w=600",
        // Mariental: Southern Dam/Farming
        "Mariental": "https://images.unsplash.com/photo-1518182170546-0766ce6ad092?auto=format&fit=crop&q=80&w=600",
        // Henties Bay: Coast/Angling
        "Henties Bay": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        // Cape Cross: Seals
        "Cape Cross": "https://images.unsplash.com/photo-1550503020-f49553757476?auto=format&fit=crop&q=80&w=600",
        // Solitaire: Desert outpost
        "Solitaire": "https://images.unsplash.com/photo-1597341386561-12f007b8b76c?auto=format&fit=crop&q=80&w=600",
        // Twyfelfontein: Red rock engravings
        "Twyfelfontein": "https://images.unsplash.com/photo-1627063428135-e10db3645069?auto=format&fit=crop&q=80&w=600",
        // Epupa Falls: Waterfalls/Baobabs
        "Epupa Falls": "https://images.unsplash.com/photo-1582291535490-67a1dfa5214c?auto=format&fit=crop&q=80&w=600",
        // Kaokoland: Remote northwest
        "Kaokoland": "https://images.unsplash.com/photo-1519098901909-b1553a1190af?auto=format&fit=crop&q=80&w=600",
        // Opuwo: Himba capital
        "Opuwo": "https://images.unsplash.com/photo-1547905786-224422e11749?auto=format&fit=crop&q=80&w=600",
        // Purros: Desert Lions/Elephants
        "Purros": "https://images.unsplash.com/photo-1519098901909-b1553a1190af?auto=format&fit=crop&q=80&w=600",
        // Divundu: Okavango river
        "Divundu": "https://images.unsplash.com/photo-1496545672447-f699b503d270?auto=format&fit=crop&q=80&w=600",

        // --- NEW FIXES FOR BROKEN REGIONS ---
        // Gibeon: Southern arid/railway history -> Southern landscape
        "Gibeon": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600",
        // Bethanie: Historical stone/arid -> Southern rocky landscape
        "Bethanie": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=600",
        // Namib Rand: Fairy circles / red dunes
        "Namib Rand": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=600",
        // Gochas: Kalahari dunes
        "Gochas": "https://images.unsplash.com/photo-1518182170546-0766ce6ad092?auto=format&fit=crop&q=80&w=600",
        // Aus: Wild horses / grassy desert
        "Aus": "https://images.unsplash.com/photo-1551351185-3ce480d28bbd?auto=format&fit=crop&q=80&w=600",
        // Noordoewer: River / Greenery in desert
        "Noordoewer": "https://images.unsplash.com/photo-1588616149176-b63bf211d279?auto=format&fit=crop&q=80&w=600",
        // Uis: Brandberg mountain
        "Uis": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600",

        // --- NEW WETU REGIONS ---
        "Erongo": "https://images.unsplash.com/photo-1552727131-5fc611136bdf?auto=format&fit=crop&q=80&w=600", // Omaruru vibe
        "Fish River Canyon": "https://images.unsplash.com/photo-1518182170546-0766ce6ad092?auto=format&fit=crop&q=80&w=600", // Canyon vibe
        "Owamboland": "https://images.unsplash.com/photo-1547905786-224422e11749?auto=format&fit=crop&q=80&w=600", // Northern vibe
        "Grootfontein": "https://images.unsplash.com/photo-1449356669058-f6493307920d?auto=format&fit=crop&q=80&w=600", // Green/Farming
        "Namib": "https://images.unsplash.com/photo-1627494490333-e578c77395c3?auto=format&fit=crop&q=80&w=600" // Dunes
    };

    const regions = getRegions();

    return (
        <div className="min-h-screen bg-neutral-100 flex font-sans text-neutral-900">
            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isItineraryOpen ? 'mr-96' : ''} p-8`}>
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-light tracking-tight text-neutral-900">Anti Gravity Project Selector</h1>
                        <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500">
                            <button onClick={() => setCurrentStep('home')} className={`hover:text-amber-600 transition-colors ${currentStep === 'home' ? "text-amber-600 font-medium" : ""}`}>Home</button>
                            <span> | </span>
                            <button onClick={() => setCurrentStep(0)} className={`hover:text-amber-600 transition-colors ${currentStep === 0 ? "text-amber-600 font-medium" : ""}`}>Extract Prices</button>
                            <span> | </span>
                            <span className={currentStep === 1 ? "text-amber-600 font-medium" : ""}>1. Select Region</span>
                            <span>&gt;</span>
                            <span className={currentStep === 2 ? "text-amber-600 font-medium" : ""}>2. Select Lodge</span>
                            <span>&gt;</span>
                            <span className={currentStep === 3 ? "text-amber-600 font-medium" : ""}>3. Check Availability</span>
                            <span> | </span>
                            <button onClick={() => setCurrentStep('wetu')} className={`hover:text-amber-600 transition-colors ${currentStep === 'wetu' ? "text-amber-600 font-medium" : ""}`}>Wetu Content</button>
                        </div>
                    </div>

                    {/* Navigation Back Button */}
                    {currentStep !== 'home' && currentStep !== 0 && currentStep !== 1 && currentStep !== 4 && (
                        <button
                            onClick={handleBack}
                            className="flex items-center text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </button>
                    )}

                    {/* Step: Vehicle Selection */}
                    {currentStep === 'vehicles' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <VehicleSelection />
                        </div>
                    )}

                    {/* Step: Michelle House */}
                    {currentStep === 'michelle' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                            <MichelleHouse />
                        </div>
                    )}

                    {/* Step: Accountancy Program */}
                    {currentStep === 'accountancy' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                            <AccountancyProgram />
                        </div>
                    )}

                    {/* Step: Wetu Integration */}
                    {currentStep === 'wetu' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                            <WetuIntegration />
                        </div>
                    )}

                    {/* Step 4: Blog Section */}
                    {currentStep === 4 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <BlogSection />
                        </div>
                    )}

                    {/* Step Home: Dashboard */}
                    {currentStep === 'home' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            <div className="text-center max-w-2xl mx-auto">
                                <h2 className="text-2xl font-light text-neutral-800">Welcome to Desert Tracks</h2>
                                <p className="text-neutral-500 mt-2">Select a module to begin your journey.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                                {/* Block 1: Lodge Availability */}
                                <div
                                    onClick={() => setCurrentStep(1)}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-neutral-100 cursor-pointer transition-all duration-300 group text-center space-y-4"
                                >
                                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-amber-100 transition-colors">
                                        <BedDouble className="w-8 h-8 text-amber-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-neutral-900 group-hover:text-amber-700">Lodge Availability</h3>
                                    <p className="text-neutral-500 text-sm">Check real-time availability and rates for all Desert Tracks lodges.</p>
                                </div>

                                {/* Block 2: Vehicle Availability */}
                                <div
                                    onClick={() => setCurrentStep('vehicles')}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-neutral-100 cursor-pointer transition-all duration-300 group text-center space-y-4"
                                >
                                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-neutral-100 transition-colors">
                                        <Car className="w-8 h-8 text-neutral-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-neutral-900 group-hover:text-neutral-700">Vehicle Availability</h3>
                                    <p className="text-neutral-500 text-sm">Manage fleet inventory and check vehicle status.</p>
                                </div>

                                {/* Block 3: Blogs */}
                                <div
                                    onClick={() => setCurrentStep(4)}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-neutral-100 cursor-pointer transition-all duration-300 group text-center space-y-4"
                                >
                                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-amber-100 transition-colors">
                                        <BookOpen className="w-8 h-8 text-amber-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-neutral-900 group-hover:text-amber-700">Desert Tracks Blogs</h3>
                                    <p className="text-neutral-500 text-sm">Explore travel guides, tips, and stories about Namibia.</p>
                                </div>

                                {/* Block 4: Michelle House */}
                                <div
                                    onClick={() => setCurrentStep('michelle')}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-neutral-100 cursor-pointer transition-all duration-300 group text-center space-y-4"
                                >
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
                                        <Home className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-neutral-900 group-hover:text-blue-700">Michelle House</h3>
                                    <p className="text-neutral-500 text-sm">Project Workspace</p>
                                </div>

                                {/* Block 5: Accountancy Program */}
                                <div
                                    onClick={() => setCurrentStep('accountancy')}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-neutral-100 cursor-pointer transition-all duration-300 group text-center space-y-4 xl:col-span-4 lg:col-span-2 md:col-span-2"
                                >
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-emerald-100 transition-colors">
                                        <Calculator className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-neutral-900 group-hover:text-emerald-700">Accountancy Program</h3>
                                    <p className="text-neutral-500 text-sm">Financial Tools & Reports</p>
                                </div>

                                {/* Block 6: Wetu Content */}
                                <div
                                    onClick={() => setCurrentStep('wetu')}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-neutral-100 cursor-pointer transition-all duration-300 group text-center space-y-4"
                                >
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
                                        <Globe className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-neutral-900 group-hover:text-blue-700">Wetu Content Library</h3>
                                    <p className="text-neutral-500 text-sm">Access iBrochures, High-Res Images, and Rack Rates.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 0: Price List Extractor */}
                    {currentStep === 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <PriceListExtractor />
                        </div>
                    )}

                    {/* Step 1: Region Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-light text-neutral-800">Select a Region</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(regions).map(([region, lodges]) => {
                                    const coverImage = regionImages[region] || lodgeImages[lodges[0].name] || "https://images.unsplash.com/photo-1544256627-f7cb142460d3?auto=format&fit=crop&q=80&w=1000";
                                    return (
                                        <div
                                            key={region}
                                            onClick={() => handleRegionSelect(region)}
                                            className="group cursor-pointer rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 relative h-64"
                                        >
                                            <div className="absolute inset-0">
                                                <img src={coverImage} alt={region} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                                            </div>
                                            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                                                <h3 className="text-3xl font-light mb-2">{region}</h3>
                                                <div className="flex items-center space-x-2 text-sm opacity-90">
                                                    <Briefcase className="w-4 h-4" />
                                                    <span>{lodges.length} Lodges</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Lodge Selection */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-light text-neutral-800">Lodges in {selectedRegion}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {regions[selectedRegion]?.map(lodge => (
                                    <div key={lodge.name} onClick={() => handleLodgeSelect(lodge)} className="cursor-pointer">
                                        <LodgeCard lodge={lodge} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Date Selection & Availability */}
                    {currentStep === 3 && selectedLodge && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
                                <h2 className="text-2xl font-light text-neutral-800 mb-6 flex items-center">
                                    <MapPin className="w-6 h-6 mr-2 text-amber-600" />
                                    Check Availability for <span className="font-medium ml-2">{selectedLodge.name}</span>
                                </h2>

                                <div className="mb-8 w-full">
                                    <LodgeCard lodge={selectedLodge} />
                                </div>

                                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> Check-in</label>
                                        <input type="date" name="checkInDate" value={searchParams.checkInDate} onChange={handleChange} className="w-full p-3 bg-neutral-50 rounded-lg border border-neutral-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> Check-out</label>
                                        <input type="date" name="checkOutDate" value={searchParams.checkOutDate} onChange={handleChange} className="w-full p-3 bg-neutral-50 rounded-lg border border-neutral-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1"><Users className="w-4 h-4" /> Adults</label>
                                        <input type="number" name="adults" min="1" value={searchParams.adults} onChange={handleChange} className="w-full p-3 bg-neutral-50 rounded-lg border border-neutral-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1"><Users className="w-4 h-4" /> Children</label>
                                        <input type="number" name="children" min="0" value={searchParams.children} onChange={handleChange} className="w-full p-3 bg-neutral-50 rounded-lg border border-neutral-200" />
                                    </div>
                                    <button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-lg font-medium transition-colors disabled:opacity-50 h-[50px]">
                                        {loading ? 'Checking...' : 'Check Now'}
                                    </button>
                                </form>
                            </div>

                            {/* Results */}
                            {data && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    {data.map((lodge) => (
                                        <LodgeCard
                                            key={lodge.name}
                                            lodge={lodge}
                                            onAddToItinerary={handleAddToItinerary}
                                        />
                                    ))}
                                </div>
                            )}

                            {data && data.length === 0 && (
                                <div className="text-center py-12 text-neutral-500 bg-white rounded-xl border border-neutral-100">
                                    No availability found based on criteria.
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Itinerary Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${isItineraryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div className="flex items-center gap-2 text-amber-600">
                            <ShoppingBag className="w-5 h-5" />
                            <h2 className="text-xl font-light">Your Itinerary</h2>
                        </div>
                        <button onClick={() => setIsItineraryOpen(false)} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        {itinerary.length === 0 ? (
                            <div className="text-center text-neutral-400 mt-10 space-y-2">
                                <Briefcase className="w-10 h-10 mx-auto opacity-20" />
                                <p>Your itinerary is empty.</p>
                                <p className="text-sm">Select lodges and rooms to build your trip.</p>
                            </div>
                        ) : (
                            itinerary.map((item) => (
                                <div key={item.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 relative group hover:shadow-md transition-shadow">
                                    <div className="flex gap-3 mb-3">
                                        <img src={item.image} alt={item.lodgeName} className="w-16 h-16 rounded-lg object-cover" />
                                        <div>
                                            <h4 className="font-semibold text-sm text-neutral-800 leading-tight">{item.lodgeName}</h4>
                                            <p className="text-xs text-neutral-500 mt-1">{item.region}</p>
                                            <p className="text-xs font-medium text-amber-600 mt-1">{item.roomName}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-xs text-neutral-600 border-t pt-2 border-neutral-200">
                                        <div className="flex justify-between">
                                            <span>Check-in:</span>
                                            <span className="font-medium">{item.checkIn}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Check-out:</span>
                                            <span className="font-medium">{item.checkOut}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Pax:</span>
                                            <span>{item.adults}A, {item.children}C</span>
                                        </div>
                                        <div className="flex justify-between pt-1 text-amber-700 font-bold">
                                            <span>Price:</span>
                                            <span>{item.price}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFromItinerary(item.id)}
                                        className="absolute top-2 right-2 text-neutral-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Actions */}
                    {itinerary.length > 0 && (
                        <div className="mt-6 pt-4 border-t space-y-3">
                            <div className="flex justify-between items-center text-sm text-neutral-500">
                                <span>Total Stops:</span>
                                <span className="font-medium text-neutral-900">{itinerary.length}</span>
                            </div>
                            <button
                                onClick={handleSaveItinerary}
                                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-lg font-medium transition-colors"
                            >
                                <Download className="w-4 h-4" /> Save Itinerary
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Toggle Button (Visible when closed and has items) */}
            {!isItineraryOpen && itinerary.length > 0 && (
                <button
                    onClick={() => setIsItineraryOpen(true)}
                    className="fixed bottom-8 right-8 bg-neutral-900 text-white p-4 rounded-full shadow-2xl hover:bg-neutral-800 transition-all z-50 flex items-center gap-2 animate-bounce-subtle"
                >
                    <ShoppingBag className="w-6 h-6" />
                    <span className="font-bold text-sm bg-amber-500 text-white w-5 h-5 flex items-center justify-center rounded-full absolute -top-1 -right-1 text-xs">
                        {itinerary.length}
                    </span>
                </button>
            )}

            {/* Backdrop for mobile */}
            {isItineraryOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsItineraryOpen(false)}
                />
            )}
        </div>
    )
}

export default App
