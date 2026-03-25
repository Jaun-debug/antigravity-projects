import { useCallback, useState } from "react";
interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isUploading: boolean;
}
export function FileUpload({ onFileSelect, isUploading }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const handleFile = (file: File) => {
        setSelectedFile(file);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };
    const handleExtract = () => {
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };
    return (
        <div className="w-full space-y-4">
            {!selectedFile ? (
                <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                        onChange={handleInputChange}
                        disabled={isUploading}
                    />
                    <p className="text-lg font-medium">Drop your price list here</p>
                    <p className="text-gray-500 text-sm">or click to browse files</p>
                    <p className="text-xs text-gray-400 mt-2">Supports PNG, JPG, WEBP, GIF, PDF</p>
                </label>
            ) : (
                <div className="p-4 border rounded">
                    <p className="font-medium">{selectedFile.name}</p>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleExtract}
                            disabled={isUploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            {isUploading ? "Extracting..." : "Extract Prices"}
                        </button>
                        <button
                            onClick={() => setSelectedFile(null)}
                            disabled={isUploading}
                            className="px-4 py-2 border rounded"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
