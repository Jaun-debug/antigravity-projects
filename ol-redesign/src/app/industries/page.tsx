'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Building2, Droplets, Zap, ChevronRight } from 'lucide-react';

const SECTORS = [
  { name: 'Full Portfolio', icon: Building2 },
  { name: 'Centralised Services', icon: Zap },
  { name: 'Energy', icon: Zap },
  { name: 'Engineering', icon: Building2 },
  { name: 'Fishing & Aquaculture', icon: Droplets },
  { name: 'Fresh Produce', icon: Droplets },
  { name: 'Hospitality', icon: Building2 },
  { name: 'Information Technology', icon: Zap },
  { name: 'Marketing', icon: Zap },
  { name: 'Properties', icon: Building2 },
  { name: 'Retail', icon: Building2 },
];

export default function Industries() {
  return (
    <main className="w-full bg-gray-50 relative pb-24">
      
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center bg-[#1c325b]">
        <div className="absolute inset-0 bg-[#7cbd36]/10"></div>
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold uppercase text-white tracking-tight"
          >
            Industries
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-xl text-white/80 font-light max-w-2xl mx-auto"
          >
            A dynamic enterprise delivering value across Namibia's most critical sectors.
          </motion.p>
        </div>
      </section>

      {/* Flagged Content Migration Notice */}
      <section className="max-w-[1200px] mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-[#fff9e6] border-l-4 border-yellow-500 p-8 shadow-lg flex items-start gap-4 mb-16">
          <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">Portfolio Data Migration Blocked</h3>
            <p className="text-yellow-700 leading-relaxed font-light">
              We mapped the exact dropdown architecture for <strong>Industries</strong> from <code>ol.na</code>, but the proprietary textual corporate data was inaccessible via automated extraction. The framework is primed for final manual text population below.
            </p>
          </div>
        </div>

        {/* Portfolio Nav Array */}
        <div className="bg-white p-12 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-12">
          
          <aside className="w-full md:w-1/3">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#7cbd36] mb-6">Sector Navigation</h4>
            <ul className="space-y-4">
              {SECTORS.map((sector) => (
                <li key={sector.name}>
                  <a href="#" className="flex items-center justify-between text-[#1c325b] hover:text-[#7cbd36] font-medium transition-colors border-b border-gray-100 pb-3">
                    {sector.name} <ChevronRight size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
          
          <div className="w-full md:w-2/3">
            <h3 className="text-3xl font-serif font-bold text-[#1c325b] mb-6">Centralised Overview</h3>
            <div className="h-[400px] bg-gray-100 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-center p-8">
              <span className="text-lg font-bold text-gray-500 mb-2">Content Placeholder</span>
              <p className="text-sm text-gray-400 font-light max-w-sm">Select an industry from the sidebar to populate its respective portfolio summary, financial metrics, and executive insights here.</p>
            </div>
          </div>
        </div>

      </section>

    </main>
  );
}
