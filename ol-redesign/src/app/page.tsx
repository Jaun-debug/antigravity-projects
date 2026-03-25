'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, ArrowRight, Menu, X, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = ['Group', 'Companies', 'Insights', 'Careers', 'Contact'];

const COMPANIES = [
  { name: 'Namibia Breweries Limited', desc: 'Brewing excellence since 1920.', img: 'https://images.unsplash.com/photo-1590483736622-398541ce1a6c?q=80&w=800&auto=format&fit=crop' },
  { name: 'Pick n Pay Namibia', desc: 'Retail leader in value and quality.', img: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=800&auto=format&fit=crop' },
  { name: 'Broll Namibia', desc: 'Premier property management.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop' },
  { name: 'Hangana Seafood', desc: 'Sustainable ocean harvest.', img: 'https://images.unsplash.com/photo-1555529902-5261145633bf?q=80&w=800&auto=format&fit=crop' },
  { name: 'Kraatz', desc: 'Engineering & maritime solutions.', img: 'https://images.unsplash.com/photo-1504917595217-d4bf5011ba20?q=80&w=800&auto=format&fit=crop' },
  { name: 'O&L Leisure', desc: 'World-class hospitality.', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop' },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative bg-white overflow-hidden min-h-screen">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-serif font-bold tracking-tight ${isScrolled ? 'text-olgreen' : 'text-white'}`}>
              Ohlthaver & List
            </div>
          </div>
          <div className="hidden lg:flex gap-8 items-center">
            {NAV_LINKS.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} className={`text-sm font-medium hover:text-olgold transition-colors ${isScrolled ? 'text-olgrav' : 'text-white/90'}`}>
                {link}
              </a>
            ))}
            <button className="bg-olgreen text-white px-6 py-2.5 rounded-sm text-sm font-medium hover:bg-olgreen/90 transition-all">
              Investor Portal
            </button>
          </div>
          <button className="lg:hidden text-olgrav" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className={isScrolled ? 'text-olgrav' : 'text-white'} /> : <Menu className={isScrolled ? 'text-olgrav' : 'text-white'} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-oldark">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop" alt="Corporate Architecture" className="w-full h-full object-cover object-center opacity-60 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-oldark via-oldark/60 to-transparent"></div>
        </motion.div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 mt-20 text-center lg:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl lg:text-7xl font-serif font-bold text-white leading-tight max-w-4xl tracking-tight"
          >
            Creating a future, <br />
            <span className="text-olgold italic font-light">enhancing life.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
            className="mt-6 text-lg lg:text-xl text-white/80 max-w-2xl font-light"
          >
            Namibia's leading privately held corporation. We are driven by purpose, excellence, and a commitment to global leadership in diverse industries.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 lg:justify-start justify-center"
          >
            <button className="bg-olgreen text-white px-8 py-4 rounded-none font-medium hover:bg-white hover:text-olgreen transition-all flex items-center justify-center gap-2 group">
              Explore Group <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-none font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              About Us
            </button>
          </motion.div>
        </div>
      </section>

      {/* About / Manifesto */}
      <section id="group" className="py-32 bg-olbeige relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
              <span className="text-olgold font-bold tracking-widest text-sm uppercase">Our Legacy</span>
              <h2 className="text-4xl lg:text-5xl font-serif font-bold mt-4 text-oldark">A century of excellence and innovation.</h2>
              <p className="mt-6 text-olgrav leading-relaxed text-lg font-light">
                Since our inception, the Ohlthaver & List Group has been the catalyst for economic growth and industrial development in Namibia. Our diverse portfolio spans food and beverage, retail, property, hospitality, and engineering.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-5xl font-serif font-bold text-olgreen">1920</div>
                  <div className="text-sm text-olgrav mt-2 uppercase tracking-wide font-medium">Established</div>
                </div>
                <div>
                  <div className="text-5xl font-serif font-bold text-olgreen">6,000+</div>
                  <div className="text-sm text-olgrav mt-2 uppercase tracking-wide font-medium">Employees</div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="relative h-[600px] w-full">
              <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop" alt="Corporate Team" className="absolute inset-0 w-full h-full object-cover rounded-sm shadow-2xl" />
              <div className="absolute -bottom-8 -left-8 bg-white p-8 shadow-xl max-w-xs">
                <p className="font-serif italic text-xl text-oldark">"Authentic, caring, and passionate."</p>
                <p className="text-sm uppercase tracking-widest text-olgold font-bold mt-4">Our Core Values</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio / Companies */}
      <section id="companies" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-olgold font-bold tracking-widest text-sm uppercase">Our Portfolio</span>
              <h2 className="text-4xl lg:text-5xl font-serif font-bold mt-4 text-oldark">Operating Companies</h2>
            </div>
            <button className="text-olgreen font-medium flex items-center gap-2 hover:gap-3 transition-all border-b border-olgreen pb-1">
              View All Subsidiaries <ArrowRight size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COMPANIES.map((company, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative h-96 overflow-hidden rounded-sm cursor-pointer"
              >
                <img src={company.img} alt={company.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-oldark/90 via-oldark/20 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">{company.name}</h3>
                  <p className="text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{company.desc}</p>
                  <div className="mt-4 flex items-center gap-2 text-olgold font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                    Explore <ArrowUpRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Insights */}
      <section id="insights" className="py-32 bg-olbeige border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="text-olgold font-bold tracking-widest text-sm uppercase">Media Hub</span>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mt-4 text-oldark">Latest Insights</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Article */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-8 group cursor-pointer aspect-video relative overflow-hidden rounded-sm shadow-md">
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1600&auto=format&fit=crop" alt="News" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-oldark to-transparent/30"></div>
              <div className="absolute bottom-0 left-0 p-8 lg:p-12">
                <span className="bg-olgreen text-white px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 inline-block">Press Release</span>
                <h3 className="text-3xl lg:text-4xl font-serif font-bold text-white leading-tight">O&L Group Announces Record Revenue Growth for Q3 and New Sustainability Targets.</h3>
                <p className="text-white/80 mt-4 font-light">Discover how our strategic initiatives are driving value and transforming communities across Namibia.</p>
              </div>
            </motion.div>

            {/* Side Articles */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {[1, 2].map((i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="group cursor-pointer flex flex-col h-full bg-white p-6 shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                  <span className="text-olgold text-xs font-bold uppercase tracking-wider mb-2">Corporate News</span>
                  <h3 className="text-xl font-serif font-bold text-oldark group-hover:text-olgreen transition-colors leading-snug">Namibia Breweries Secures International Quality Award for 10th Consecutive Year</h3>
                  <p className="text-olgrav text-sm mt-3 line-clamp-3 leading-relaxed">The international recognition affirms NBL's unwavering commitment to brewing perfection adhering to the Reinheitsgebot.</p>
                  <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-medium text-oldark">
                    Read Story <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Careers / Culture */}
      <section id="careers" className="relative py-32 bg-oldark overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop" alt="Team" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-6">Join the O&L Family</h2>
          <p className="text-lg text-white/80 mb-10 font-light leading-relaxed">
            We believe that our people are our greatest asset. Build a rewarding career in an environment that fosters growth, authentic leadership, and innovation.
          </p>
          <button className="bg-olgold border-none text-oldark px-8 py-4 rounded-none font-bold uppercase tracking-widest hover:bg-white transition-colors">
            View Opportunities
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111] text-white/70 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-bold text-white mb-6">Ohlthaver & List</h3>
            <p className="text-sm leading-relaxed mb-6">Creating a future, enhancing life. Namibia's premier corporate powerhouse driving sustainable growth.</p>
            <div className="text-sm">
              <p>📍 Windhoek, Namibia</p>
              <p className="mt-2">📞 +264 61 207 5111</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Companies</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-olgold transition-colors">Namibia Breweries</a></li>
              <li><a href="#" className="hover:text-olgold transition-colors">Pick n Pay Namibia</a></li>
              <li><a href="#" className="hover:text-olgold transition-colors">O&L Leisure</a></li>
              <li><a href="#" className="hover:text-olgold transition-colors">Hangana Seafood</a></li>
              <li><a href="#" className="hover:text-olgold transition-colors">Kraatz</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-olgold transition-colors">About the Group</a></li>
              <li><a href="#" className="hover:text-olgold transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-olgold transition-colors">Media Newsroom</a></li>
              <li><a href="#" className="hover:text-olgold transition-colors">Investor Relations</a></li>
              <li><a href="#" className="hover:text-olgold transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Newsletter</h4>
            <p className="text-sm mb-4">Subscribe for the latest corporate updates and insights.</p>
            <div className="flex">
              <input type="email" placeholder="Email Address" className="bg-white/5 border border-white/10 px-4 py-3 w-full text-white text-sm focus:outline-none focus:border-olgold" />
              <button className="bg-olgreen px-4 flex items-center justify-center hover:bg-olgold transition-colors text-white">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>&copy; {new Date().getFullYear()} Ohlthaver & List Group. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">PAIA Manual</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
