'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Users } from 'lucide-react';

export default function Leadership() {
  return (
    <main className="w-full bg-white relative pb-24">
      
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center bg-[#1c325b]">
        <div className="absolute inset-0 bg-[#7cbd36]/10"></div>
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold uppercase text-white tracking-tight"
          >
            Leadership
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-xl text-white/80 font-light max-w-2xl mx-auto"
          >
            The visionaries driving Namibia's most successful enterprise.
          </motion.p>
        </div>
      </section>

      {/* Flagged Content Migration Notice */}
      <section className="max-w-[1200px] mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-[#fff9e6] border-l-4 border-yellow-500 p-8 shadow-lg flex items-start gap-4 mb-16">
          <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">Executive Data Migration Blocked</h3>
            <p className="text-yellow-700 leading-relaxed font-light">
              We mapped the exact executive categories from <strong>www.ol.na</strong> (Board of Directors, Executive Committee, Group Executives). Structural grids are built below, ready for manual data and headshot injection.
            </p>
          </div>
        </div>

        {/* Structural Executives Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-gray-50 border border-gray-100 p-8 text-center shadow-sm">
            <h3 className="text-3xl font-serif font-bold text-[#1c325b] mb-4">Board of Directors</h3>
            <div className="h-48 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-6">
              <span className="text-sm font-medium text-gray-500">Inject Bios Here</span>
            </div>
            <p className="text-gray-500 font-light">Corporate Governance overseers.</p>
          </div>

          <div className="bg-white border border-[#7cbd36] p-8 text-center shadow-lg transform md:-translate-y-8">
            <h3 className="text-3xl font-serif font-bold text-[#1c325b] mb-4">Executive Committee</h3>
            <div className="h-48 bg-gray-100 border-2 border-dashed border-[#7cbd36] rounded flex items-center justify-center mb-6">
              <span className="text-sm font-bold text-[#7cbd36]">Inject Core Executive Bios</span>
            </div>
            <p className="text-gray-500 font-light">The core operational drivers.</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 p-8 text-center shadow-sm">
            <h3 className="text-3xl font-serif font-bold text-[#1c325b] mb-4">Group Executives</h3>
            <div className="h-48 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-6">
              <span className="text-sm font-medium text-gray-500">Inject Group Exec Bios</span>
            </div>
            <p className="text-gray-500 font-light">Strategic multi-sector leaders.</p>
          </div>

        </div>
      </section>

    </main>
  );
}
