'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FileText, Globe, Users, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

const HIGHLIGHT_COMPANIES = [
  { name: 'Broll Namibia', text: 'Leaders in commercial property management, ensuring maximal asset performance & retail value.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800' },
  { name: 'Hangana Abalone', text: 'Premium, sustainable abalone aquaculture driven by world-class farming operations.', img: 'https://images.unsplash.com/photo-1555529902-5261145633bf?q=80&w=800' },
  { name: 'Hartlief', text: 'A proudly Namibian heritage producing premium quality processed meat since 1946.', img: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=800' },
  { name: 'Model', text: 'Trusted retail and logistics provisioning across key sectors.', img: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=800' },
  { name: 'Namibia Dairies', text: 'Connecting farm to table with leading dairy brands, nourishing the nation daily.', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=800' },
];

const LATEST_NEWS = [
  { category: 'News', title: 'O&L Group Announces 2024 Financial Results', date: 'October 15, 2024' },
  { category: 'Sustainability', title: 'Namibia Breweries Inaugurates Expanded Solar Plant', date: 'September 28, 2024' },
  { category: 'Corporate', title: 'Ohlthaver & List Honored with Best Employer Award', date: 'August 12, 2024' },
];

export default function Home() {
  return (
    <main className="w-full bg-white relative">
      
      {/* 2. Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000" alt="O&L Corporate Headquarters" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-[#0a1a3a]/70"></div> {/* Strong dark overlay */}
        </div>
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-tight max-w-5xl mx-auto leading-tight"
          >
            Creating a future, enhancing life.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="mt-8 text-lg md:text-2xl font-light text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            Ohlthaver & List Group is Namibia's largest privately held corporation, steadfastly committed to driving sustainable economic growth and enriching lives since 1919.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
            className="mt-12 flex justify-center gap-4"
          >
            <a href="#portfolio" className="bg-[#7cbd36] text-white px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-[#68a02c] transition-colors flex items-center gap-2 group shadow-xl">
              Explore Our Portfolio <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* 3. Intro Card Section (Overlapping Hero) */}
      <section className="relative z-20 max-w-[1400px] mx-auto px-6 -mt-24 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-t-4 border-[#7cbd36] group hover:-translate-y-2 transition-transform duration-300">
            <Globe className="w-10 h-10 text-[#7cbd36] mb-6" />
            <h3 className="text-3xl font-serif font-bold text-[#1c325b] mb-4">About Us</h3>
            <p className="text-gray-600 font-light leading-relaxed mb-8">
              A century of visionary leadership across diverse industries. Learn about our persona, our history since 1919, and the driving vision and core values that unify our purpose and operations.
            </p>
            <a href="/about-us" className="text-[#1c325b] font-bold text-sm uppercase tracking-wider flex items-center gap-2 group-hover:text-[#7cbd36] transition-colors">
              Read About O&L <ArrowRight size={16} />
            </a>
          </div>
          
          <div className="bg-[#1c325b] p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-t-4 border-[#7cbd36] group hover:-translate-y-2 transition-transform duration-300">
            <FileText className="w-10 h-10 text-[#7cbd36] mb-6" />
            <h3 className="text-3xl font-serif font-bold text-white mb-4">Latest Insights</h3>
            <p className="text-white/80 font-light leading-relaxed mb-8">
              Stay informed on our strategic milestone reporting, financial statements, and recent corporate developments shaping the future of Namibia and the broader continent.
            </p>
            <a href="/media" className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 group-hover:text-[#7cbd36] transition-colors">
              View Media Newsroom <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 4 & 5. Portfolio Highlights */}
      <section id="portfolio" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h4 className="text-[#7cbd36] font-bold uppercase tracking-widest text-sm mb-3">Industries</h4>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1c325b] leading-tight">
                Our Extraordinary Portfolio
              </h2>
              <p className="mt-6 text-gray-600 font-light text-lg">
                We operate leading brands across Food & Beverage, Retail, Properties, Hospitality, Fishing, and Engineering. Our operating companies are deeply integrated into the economic fabric of Namibia.
              </p>
            </div>
            <a href="/industries" className="flex items-center gap-2 text-[#1c325b] font-bold uppercase tracking-wider text-sm hover:text-[#7cbd36] transition-colors pb-2 border-b-2 border-transparent hover:border-[#7cbd36]">
              View Full Portfolio <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {HIGHLIGHT_COMPANIES.map((company, idx) => (
              <div key={idx} className="group cursor-pointer bg-white rounded shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[#1c325b]/20 group-hover:opacity-0 transition-opacity z-10" />
                  <img src={company.img} alt={company.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-serif font-bold text-[#1c325b] mb-3 group-hover:text-[#7cbd36] transition-colors">{company.name}</h3>
                  <p className="text-sm text-gray-600 font-light leading-relaxed flex-1">{company.text}</p>
                  <div className="mt-8 text-xs font-bold uppercase tracking-widest text-[#1c325b] flex items-center gap-2">
                    Read More <ArrowUpRight size={14} className="text-[#7cbd36]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Latest News Section */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h4 className="text-[#7cbd36] font-bold uppercase tracking-widest text-sm mb-3">Media Center</h4>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1c325b]">Latest News & Events</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {LATEST_NEWS.map((news, i) => (
              <a href="#" key={i} className="flex flex-col bg-gray-50 border border-gray-100 p-8 hover:bg-[#1c325b] hover:border-[#1c325b] hover:text-white transition-all duration-300 group">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7cbd36] group-hover:text-[#7cbd36] bg-white group-hover:bg-white/10 px-3 py-1">{news.category}</span>
                  <span className="text-xs font-mono text-gray-400 group-hover:text-white/60">{news.date}</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1c325b] group-hover:text-white mb-6 leading-snug">
                  {news.title}
                </h3>
                <p className="text-gray-600 group-hover:text-white/80 font-light mt-auto">Read the full press release to discover how O&L continues to shape industry standards.</p>
              </a>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <a href="/media" className="inline-flex items-center gap-2 bg-transparent text-[#1c325b] border-2 border-[#1c325b] px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-[#1c325b] hover:text-white transition-colors">
              Access All Press Releases
            </a>
          </div>
        </div>
      </section>

      {/* 7. Sustainability / Governance / Risk Content Area */}
      <section className="py-24 bg-[#1c325b] text-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h4 className="text-[#7cbd36] font-bold uppercase tracking-widest text-sm mb-3">Our Commitment</h4>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">
                Governance, Risk,<br/>& Sustainability.
              </h2>
              <p className="text-white/80 font-light text-lg leading-relaxed mb-10">
                At the core of the O&L Group is a resolute commitment to world-class corporate governance, meticulous risk management, and environmental stewardship. We operate strictly for the welfare of our stakeholders.
              </p>
              
              <div className="space-y-6">
                <a href="/sustainability" className="flex items-center justify-between p-6 bg-white/5 border border-white/10 hover:bg-[#7cbd36] hover:border-[#7cbd36] transition-all group">
                  <div className="flex items-center gap-4">
                    <ShieldAlert className="text-[#7cbd36] group-hover:text-white" size={24} />
                    <h3 className="text-xl font-bold font-serif">Governance Framework</h3>
                  </div>
                  <ArrowRight size={20} />
                </a>
                <a href="/about-us" className="flex items-center justify-between p-6 bg-white/5 border border-white/10 hover:bg-[#7cbd36] hover:border-[#7cbd36] transition-all group">
                  <div className="flex items-center gap-4">
                    <Award className="text-[#7cbd36] group-hover:text-white" size={24} />
                    <h3 className="text-xl font-bold font-serif">Risk Management</h3>
                  </div>
                  <ArrowRight size={20} />
                </a>
                <a href="/reports" className="flex items-center justify-between p-6 bg-white/5 border border-white/10 hover:bg-[#7cbd36] hover:border-[#7cbd36] transition-all group">
                  <div className="flex items-center gap-4">
                    <Users className="text-[#7cbd36] group-hover:text-white" size={24} />
                    <h3 className="text-xl font-bold font-serif">Our Stakeholders</h3>
                  </div>
                  <ArrowRight size={20} />
                </a>
              </div>
            </div>
            
            <div className="relative h-full min-h-[500px]">
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200" alt="Sustainability" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#7cbd36]/20 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Talent Development / Careers CTA */}
      <section className="py-24 bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <Users className="w-16 h-16 mx-auto text-[#7cbd36] mb-8" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1c325b] mb-6">Empowering Talent.</h2>
          <p className="text-gray-600 font-light text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            We offer more than just jobs. We offer careers that enrich lives. Become part of a globally unified front of professionals driving purpose in Namibia.
          </p>
          <a href="/careers" className="inline-flex items-center gap-4 bg-[#1c325b] text-white px-10 py-5 font-bold uppercase tracking-wider text-sm hover:bg-[#7cbd36] transition-colors shadow-2xl">
            Start Your Career Journey <ArrowRight size={18} />
          </a>
        </div>
      </section>

    </main>
  );
}
