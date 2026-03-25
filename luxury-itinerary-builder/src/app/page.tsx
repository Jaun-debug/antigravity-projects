import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-50">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-serif text-stone-900 mb-6 tracking-tight">
          Luxury Safari Itinerary Builder
        </h1>
        <p className="text-stone-600 mb-12 text-lg">
          Welcome to the premier tool for building high-end safari itineraries. Generate beautiful, client-facing proposals in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            href="/agency" 
            className="px-8 py-4 bg-stone-900 text-white font-medium rounded-md hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
          >
            Open Agency Builder
          </Link>
          <Link 
            href="/client/preview" 
            className="px-8 py-4 bg-white text-stone-900 font-medium rounded-md hover:bg-stone-50 transition-colors border border-stone-200 shadow-sm"
          >
            View Example Output
          </Link>
        </div>
      </div>
    </div>
  );
}
