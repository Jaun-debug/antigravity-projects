import { useState } from "react";
import { FileUpload } from "../components/FileUpload";
import { ExtractionResults } from "../components/ExtractionResults";
import type { ExtractionResult } from "@shared/schema";

export default function PriceListExtractor() {
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState < ExtractionResult | null > (null);
    const [error, setError] = useState < string | null > (null);

    const handleFileSelect = async (file: File) => {
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:3000/api/extract", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to extract prices");
            }

            const data = await response.json();
            setResults(data);
        } catch (err: any) {
            console.error("Extraction error:", err);
            setError(err.message || "An error occurred during extraction");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Price List Extractor</h1>
                <p className="text-gray-500">
                    Upload a price list (PDF or image) to extract structured STO rates.
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <FileUpload onFileSelect={handleFileSelect} isUploading={isUploading} />

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center justify-center">
                        {error}
                    </div>
                )}
            </div>

            {results && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ExtractionResults result={results} />
                </div>
            )}
        </div>
    );
}
