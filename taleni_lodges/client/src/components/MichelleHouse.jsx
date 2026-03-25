import { Home, Download, Printer, ExternalLink } from 'lucide-react';

export default function MichelleHouse() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="bg-neutral-50 px-8 py-6 border-b border-neutral-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Home className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-light text-neutral-900">Michelle House</h2>
                        <p className="text-sm text-neutral-500">Architectural Plan Revision 1.0</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <a href="/michelle_plan.png" download="Michelle_House_Plan_Rev1.png" className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-50 flex items-center gap-2 transition-colors">
                        <Download className="w-4 h-4" /> Download
                    </a>
                    <button onClick={() => window.print()} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 flex items-center gap-2 transition-colors">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Plan Viewer (Left - 2 Cols) */}
                    {/* Plan Viewer (Left - 2 Cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border-2 border-dashed border-neutral-200 rounded-xl p-2 flex items-center justify-center relative">
                            <div className="relative w-full">
                                <img
                                    src="/michelle_plan_cut_walls_v2.png"
                                    alt="Michelle House Plan (Walls Removed V2)"
                                    className="w-full h-auto rounded-lg shadow-sm"
                                />

                                {/* USER HANDWRITTEN LABELS (Base State) */}

                                {/* a - Main Bedroom (Top Left) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '38%', left: '26%', transform: 'translate(-50%, -50%)' }}>a</div>

                                {/* b - Ensuite (Next to a) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '38%', left: '34%', transform: 'translate(-50%, -50%)' }}>b</div>

                                {/* c - Bed 2 (Next to b) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '38%', left: '42%', transform: 'translate(-50%, -50%)' }}>c</div>

                                {/* d - Bathroom (Next to c) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '38%', left: '50%', transform: 'translate(-50%, -50%)' }}>d</div>

                                {/* o - Bedroom 3 (Between d and e) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '38%', left: '58%', transform: 'translate(-50%, -50%)' }}>o</div>

                                {/* e - Existing Study (Far Right) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '38%', left: '66%', transform: 'translate(-50%, -50%)' }}>e</div>

                                {/* f - New Storage (Green Room Top Right) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '25%', left: '76%', transform: 'translate(-50%, -50%)' }}>f</div>

                                {/* g - Garage */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '68%', left: '35%', transform: 'translate(-50%, -50%)' }}>g</div>

                                {/* i - Packing Room (Between Garage & House) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '52%', left: '50%', transform: 'translate(-50%, -50%)' }}>i</div>

                                {/* l - Living Room (Center) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '55%', left: '60%', transform: 'translate(-50%, -50%)' }}>l</div>

                                {/* h - Kitchen (Below l, Right of Garage) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '70%', left: '60%', transform: 'translate(-50%, -50%)' }}>h</div>

                                {/* j - Small Room (Right of Kitchen) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '65%', left: '68%', transform: 'translate(-50%, -50%)' }}>j</div>

                                {/* p - Room Underneath j */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '74%', left: '68%', transform: 'translate(-50%, -50%)' }}>p</div>

                                {/* k - Room K (Right of j) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '60%', left: '74%', transform: 'translate(-50%, -50%)' }}>k</div>

                                {/* n - Braai Room (Green Room Bottom Right) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '55%', left: '82%', transform: 'translate(-50%, -50%)' }}>n</div>

                                {/* m - ERF Label (Far Right) */}
                                <div className="absolute font-bold text-white bg-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-xs" style={{ top: '40%', left: '90%', transform: 'translate(-50%, -50%)' }}>m</div>
                            </div>
                        </div>
                        <p className="text-xs text-center text-neutral-400">Reference Letters (Walls Removed per Diagram - V2)</p>
                    </div>

                    {/* Specs / Changelog (Right - 1 Col) */}
                    <div className="space-y-6">
                        <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100">
                            <h3 className="font-medium text-neutral-900 mb-4 flex items-center gap-2">
                                <ConstructionIcon /> Room Key
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                                <span><strong>a:</strong> Main Bedroom</span>
                                <span><strong>b:</strong> Ensuite</span>
                                <span><strong>c:</strong> Bedroom 2</span>
                                <span><strong>d:</strong> Bathroom</span>
                                <span><strong>o:</strong> Bedroom 3</span>
                                <span><strong>e:</strong> Existing Study</span>
                                <span><strong>f:</strong> Storage (Green)</span>
                                <span><strong>g:</strong> Garage (Existing)</span>
                                <span><strong>h:</strong> Kitchen Area</span>
                                <span><strong>i:</strong> Packing Room</span>
                                <span><strong>j:</strong> Scullery/Passage</span>
                                <span><strong>p:</strong> Store/WC (Lower)</span>
                                <span><strong>k:</strong> Side Room</span>
                                <span><strong>l:</strong> Living Room</span>
                                <span><strong>n:</strong> Braai Room</span>
                                <span><strong>m:</strong> ERF No.</span>
                            </div>
                            <p className="mt-4 text-xs text-neutral-500 border-t border-neutral-200 pt-3">
                                Locations match your handwritten diagram.
                            </p>
                        </div>

                        <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100">
                            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Architect's Notes</h4>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                This plan is a conceptual draft based on the requested modifications. Please verify all dimensions on site before commencing structural work.
                            </p>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}

function ConstructionIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="8" rx="1" /><path d="M17 14v7" /><path d="M7 14v7" /><path d="M17 3v3" /><path d="M7 3v3" /><path d="M10 14 2.3 6.3" /><path d="m14 6 7.7 7.7" /><path d="m8 6 8 8" /></svg>
    );
}
