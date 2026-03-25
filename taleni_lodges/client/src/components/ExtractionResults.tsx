import { MapPin, Banknote, FileText, Info } from "lucide-react";
import type { ExtractionResult, PropertySection } from "@shared/schema";
interface ExtractionResultsProps {
    result: ExtractionResult;
}
export function ExtractionResults({ result }: ExtractionResultsProps) {
    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return "-";
        const symbol = result.currency === "NAD" ? "N$ " : result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : result.currency === "GBP" ? "£" : result.currency ? `${result.currency} ` : "";
        return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const hasNewFormat = result.properties && result.properties.length > 0;
    const hasLowSeason = hasNewFormat && result.properties?.some(p => p.rates.some(r => r.lowSeason !== null && r.lowSeason !== undefined));
    const hasShoulderSeason = hasNewFormat && result.properties?.some(p => p.rates.some(r => r.shoulderSeason !== null && r.shoulderSeason !== undefined));
    const hasHighSeason = hasNewFormat && result.properties?.some(p => p.rates.some(r => r.highSeason !== null && r.highSeason !== undefined));
    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="card">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold">{result.hotelName || "Price List"}</h1>
                    {result.stoPercentage && (
                        <span className="badge">{result.stoPercentage} STO RATES</span>
                    )}
                    {(result.validFrom || result.validTo) && (
                        <p className="text-sm text-gray-500">
                            Valid: {result.validFrom || "..."} - {result.validTo || "..."}
                        </p>
                    )}
                    {result.currency && (
                        <p className="text-sm text-gray-500">Currency: {result.currency}</p>
                    )}

                    <button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => {
                            const filename = `${(result.hotelName || "Rate_Sheet").replace(/\s+/g, '_')}_${result.validFrom || "2026"}.json`;
                            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        }}
                    >
                        Save Extracted Rates
                    </button>
                </div>
            </div>
            {/* Property Tables */}
            {result.properties?.map((property, propIndex) => (
                <div key={propIndex} className="card">
                    <div className="text-center mb-4">
                        <h2 className="text-lg font-semibold">{property.propertyName}</h2>
                        {property.description && (
                            <p className="text-sm text-gray-500">{property.description}</p>
                        )}
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left p-2">ROOM TYPE</th>
                                <th className="text-left p-2">BASIS</th>
                                {hasLowSeason && <th className="text-right p-2">LOW SEASON</th>}
                                {hasShoulderSeason && <th className="text-right p-2">SHOULDER SEASON</th>}
                                {hasHighSeason && <th className="text-right p-2">HIGH SEASON</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {property.rates.map((rate, rateIndex) => (
                                <tr key={rateIndex} className="border-b">
                                    <td className="p-2 font-medium">{rate.roomType}</td>
                                    <td className="p-2 text-gray-500">{rate.basis || "-"}</td>
                                    {hasLowSeason && (
                                        <td className="p-2 text-right font-mono">{formatCurrency(rate.lowSeason)}</td>
                                    )}
                                    {hasShoulderSeason && (
                                        <td className="p-2 text-right font-mono">{formatCurrency(rate.shoulderSeason)}</td>
                                    )}
                                    {hasHighSeason && (
                                        <td className="p-2 text-right font-mono">{formatCurrency(rate.highSeason)}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {property.notes && property.notes.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 text-xs text-gray-600">
                            {property.notes.map((note, i) => <p key={i}>{note}</p>)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
