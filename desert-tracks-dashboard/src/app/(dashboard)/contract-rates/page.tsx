"use client"

import { useState } from "react"
import { Upload, FileText, CheckCircle2, TrendingUp, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const REGIONS = [
  "Swakopmund", "Sossusvlei", "South Etosha", "East Etosha", "West Etosha",
  "Damaraland", "Kunene Skeleton Coast", "Kalahari", "Canyon",
  "Luderitz", "Central Namibia", "Windhoek", "Opuwo", "Epupa",
  "Caprivi", "Kaokoland"
]

export default function ContractRatesPage() {
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedLodge, setSelectedLodge] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadComplete(false);
      setUploadProgress(0);
    }
  }

  const simulateUpload = () => {
    if (!file) return;
    setIsUploading(true);
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setUploadComplete(true);
        }, 500);
      }
      setUploadProgress(progress);
    }, 300);
  }

  return (
    <div className="max-w-[1600px] mx-auto min-h-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Page Header */}
      <div className="mb-0 -mt-2 lg:-mt-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-4 tracking-tight">Contract Rates</h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Upload and manage your STO (Standard Trade Offer) sheets. The AI Engine will automatically parse and map these contract rates directly to their respective properties.
          </p>
        </div>
        <div className="text-right flex-shrink-0 bg-primary/5 border border-primary/20 p-4 rounded-[12px]">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1 flex items-center justify-end"><Sparkles className="h-3 w-3 mr-1" /> AI Engine Active</p>
          <p className="font-serif text-foreground font-medium">Ready to parse PDF & CSV rates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Upload Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card/60 border-border rounded-[16px] shadow-sm overflow-hidden relative">
            <CardContent className="p-8">
              <h3 className="text-xl font-serif font-medium text-foreground mb-2">Upload Rate Sheet</h3>
              <p className="text-sm text-muted-foreground mb-6">Upload supplier PDFs, Excel docs, or CSV pricing matrices.</p>

              <div className={`border-2 border-dashed border-primary/30 rounded-[12px] bg-card p-8 text-center hover:bg-muted/50 transition-colors relative`}>
                <input
                  type="file"
                  accept=".csv, .pdf, .xls, .xlsx"
                  aria-label="Upload rate sheet"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="font-medium text-foreground mb-1">{file ? file.name : "Drag & Drop or Browse"}</p>
                <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports PDF, CSV, Excel"}</p>
              </div>

              <div className="space-y-4 my-6">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={selectedRegion} onValueChange={(val) => { setSelectedRegion(val); setSelectedLodge("") }}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select region..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedRegion && (
                  <div className="space-y-2">
                    <Label>Lodge Name</Label>
                    <Input
                      value={selectedLodge}
                      onChange={(e) => setSelectedLodge(e.target.value)}
                      placeholder="Type the lodge name..."
                      className="bg-background"
                    />
                  </div>
                )}
              </div>

              {file && !uploadComplete && (
                <div className="mt-6">
                  <Button
                    onClick={simulateUpload}
                    disabled={isUploading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif h-12 rounded-[8px]"
                  >
                    {isUploading ? "Uploading & Analyzing..." : "Process with AIEngine"}
                  </Button>
                </div>
              )}

              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Processing...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadComplete && (
                <div className="mt-6 bg-green-500/10 border border-green-500/20 text-green-700 rounded-[8px] p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Upload Successful</p>
                    <p className="text-xs mt-1 opacity-80">Rates extracted and mapped. 34 properties recognized.</p>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Status Column */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-sans font-semibold text-muted-foreground uppercase tracking-wider">Recently Processed Sheets</h3>

          <div className="bg-card/60 border border-border rounded-[16px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-[8px]">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Taleni_Group_STO_2026.pdf</p>
                  <p className="text-xs text-muted-foreground">Processed Feb 28, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-500/10 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wider">Active</span>
              </div>
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Matched Properties</p>
                <p className="font-serif text-2xl font-medium text-foreground">4 Lodges</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Average Yield Margin</p>
                <div className="flex items-center gap-2">
                  <p className="font-serif text-2xl font-medium text-green-700">22.5%</p>
                  <TrendingUp className="h-4 w-4 text-green-700" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Missing Rate Warnings</p>
                <div className="flex items-center gap-2">
                  <p className="font-serif text-2xl font-medium text-foreground">0</p>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/60 border border-border rounded-[16px] shadow-sm overflow-hidden opacity-60">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-[8px]">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground line-through">Wilderness_Destinations_2025.csv</p>
                  <p className="text-xs text-muted-foreground">Processed Jan 12, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full uppercase tracking-wider">Expired</span>
              </div>
            </div>
            <div className="p-6 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">These rates are currently inactive and do not impact search queries.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
