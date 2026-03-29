'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, History, Heart, Target } from 'lucide-react';

export default function AboutUs() {
  return (
    <main className="w-full bg-white relative pb-24">
      
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center bg-[#1c325b]">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=1600" alt="About O&L" className="w-full h-full object-cover mix-blend-overlay opacity-30" />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold uppercase text-white tracking-tight"
          >
            About Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-xl text-white/80 font-light max-w-2xl mx-auto"
          >
            Our roots run deep in the Namibian soil. Discover our Persona, Vision, Values, and History.
          </motion.p>
        </div>
      </section>

      {/* Flagged Content Migration Notice */}
      <section className="max-w-[1200px] mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-[#fff9e6] border-l-4 border-yellow-500 p-8 shadow-lg flex items-start gap-4 mb-16">
          <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">Content Migration Flag</h3>
            <p className="text-yellow-700 leading-relaxed font-light">
              Server extraction from <strong>www.ol.na</strong> was intentionally blocked by a TLS security layer. The structural layout below represents the comprehensive architecture demanded. Please manually insert the final copy blocks to permanently eliminate this flag.
            </p>
          </div>
        </div>

        {/* Mapped Content Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-gray-50 border border-gray-100 p-8 hover:shadow-xl transition-shadow group">
            <Target className="w-10 h-10 text-[#7cbd36] mb-6" />
            <h4 className="text-2xl font-serif font-bold text-[#1c325b] mb-4">O&L Persona & Vision</h4>
            <div className="h-32 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center p-4 text-center">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Inject Vision Text Here</span>
            </div>
            <a href="#" className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#1c325b] group-hover:text-[#7cbd36] transition-colors">Complete Section <ArrowRight size={16} /></a>
          </div>

          <div className="bg-gray-50 border border-gray-100 p-8 hover:shadow-xl transition-shadow group">
            <Heart className="w-10 h-10 text-[#7cbd36] mb-6" />
            <h4 className="text-2xl font-serif font-bold text-[#1c325b] mb-4">Core Values</h4>
            <div className="h-32 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center p-4 text-center">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Inject Corporate Values Here</span>
            </div>
            <a href="#" className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#1c325b] group-hover:text-[#7cbd36] transition-colors">Complete Section <ArrowRight size={16} /></a>
          </div>

          <div className="bg-gray-50 border border-gray-100 p-8 hover:shadow-xl transition-shadow group">
            <History className="w-10 h-10 text-[#7cbd36] mb-6" />
            <h4 className="text-2xl font-serif font-bold text-[#1c325b] mb-4">Our History</h4>
            <div className="h-32 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center p-4 text-center">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Inject Timeline Content Here</span>
            </div>
            <a href="#" className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#1c325b] group-hover:text-[#7cbd36] transition-colors">Complete Section <ArrowRight size={16} /></a>
          </div>

        </div>
      </section>

    </main>
  );
}
