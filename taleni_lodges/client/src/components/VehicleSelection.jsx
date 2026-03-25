import { ExternalLink, X, RotateCcw } from 'lucide-react';

export default function VehicleSelection() {
    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden relative">

            {/* Header / Controls */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100 bg-white z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-neutral-600">Live NamCars Market</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => document.getElementById('namcars-frame').src = document.getElementById('namcars-frame').src}
                        className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-lg hover:bg-neutral-50"
                        title="Refresh"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <a
                        href="https://car-market-namibia.replit.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                        Open in New Tab <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>

            {/* Application Embed */}
            <iframe
                id="namcars-frame"
                src="https://car-market-namibia.replit.app"
                title="NamCars Vehicle Marketplace"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
            />
        </div>
    );
}
