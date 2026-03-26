import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ChevronDown, Search } from 'lucide-react';
import OLLogo from '../components/Logo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Ohlthaver & List Group',
  description: 'Namibia’s leading privately held corporation.',
};

const NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about-us', dropdown: ['About us', 'O&L Persona', 'Vision', 'Values', 'O&L History'] },
  { name: 'Industries', href: '/industries', dropdown: ['Full Portfolio', 'Centralised Services', 'Energy', 'Engineering', 'Fishing & Aquaculture', 'Fresh Produce', 'Hospitality', 'Information Technology', 'Marketing', 'Properties', 'Retail'] },
  { name: 'Leadership', href: '/leadership', dropdown: ['Board of Directors', 'Executive Committee', 'Group Executives'] },
  { name: 'Reports', href: '/reports', dropdown: ['Annual', 'Financial'] },
  { name: 'Media', href: '/media', dropdown: ['News', 'Press Kit', 'Videos'] },
  { name: 'Sustainability', href: '/sustainability', dropdown: [] },
  { name: 'Careers', href: '/careers', dropdown: [] },
  { name: 'Contact Us', href: '/contact-us', dropdown: [] }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased text-[#1c325b] bg-white min-h-screen flex flex-col">
        
        {/* Header Navigation */}
        <header className="fixed w-full z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
          <div className="max-w-[1400px] mx-auto px-6 h-24 flex justify-between items-center">
            
            {/* Logo */}
            <a href="/" className="w-48 lg:w-56 block">
              <OLLogo lightMode={false} />
            </a>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center space-x-1">
              {NAVIGATION.map((item) => (
                <div key={item.name} className="relative group px-3 py-8">
                  <a href={item.href} className="text-[13px] font-bold uppercase tracking-wider text-[#1c325b] hover:text-[#7cbd36] transition-colors flex items-center gap-1">
                    {item.name} {item.dropdown && item.dropdown.length > 0 && <ChevronDown size={14} />}
                  </a>
                  
                  {/* Dropdown Menu */}
                  {item.dropdown && item.dropdown.length > 0 && (
                    <div className="absolute top-[88px] left-0 w-64 bg-white border-t-2 border-[#7cbd36] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                      <div className="py-2">
                        {item.dropdown.map((subItem) => (
                          <a key={subItem} href="#" className="block px-6 py-3 text-sm text-[#1c325b] font-medium hover:bg-gray-50 hover:text-[#7cbd36] transition-colors">
                            {subItem}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <button className="ml-4 p-2 text-[#1c325b] hover:text-[#7cbd36] transition-colors">
                <Search size={20} />
              </button>
            </nav>
            
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 pt-24">
          {children}
        </div>

        {/* Comprehensive Footer */}
        <footer className="bg-[#1c325b] text-white pt-20 pb-8 mt-auto">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              
              <div className="space-y-6">
                <div className="w-48 bg-white p-3 rounded-sm"><OLLogo lightMode={false} /></div>
                <p className="text-white/80 text-sm leading-relaxed font-light">
                  Ohlthaver & List is Namibia's largest privately held corporation, with revenues contributing significantly to state coffers and GDP. Our purpose is "Creating a future, enhancing life."
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7cbd36] transition-colors">FB</a>
                  <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7cbd36] transition-colors">IN</a>
                  <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7cbd36] transition-colors">YT</a>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-serif font-bold text-[#7cbd36] mb-6 capitalize">Quick Links</h4>
                <ul className="space-y-3 text-sm font-light text-white/80">
                  <li><a href="/about-us" className="hover:text-white transition-colors">About the Group</a></li>
                  <li><a href="/industries" className="hover:text-white transition-colors">Portfolio</a></li>
                  <li><a href="/sustainability" className="hover:text-white transition-colors">Sustainability</a></li>
                  <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="/media" className="hover:text-white transition-colors">Media Newsroom</a></li>
                  <li><a href="/reports" className="hover:text-white transition-colors">Reports & Financials</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-serif font-bold text-[#7cbd36] mb-6 capitalize">Contact Information</h4>
                <ul className="space-y-4 text-sm font-light text-white/80">
                  <li className="flex gap-3">
                    <span className="text-[#7cbd36]">📍</span>
                    <span>O&L Centre, Alexander Forbes House<br/>Fidel Castro Street<br/>Windhoek, Namibia</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#7cbd36]">📞</span>
                    <span>+264 61 207 5111</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#7cbd36]">✉️</span>
                    <span>info@ol.na</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-serif font-bold text-[#7cbd36] mb-6 capitalize">Newsletter Subscribe</h4>
                <p className="text-sm font-light text-white/80 mb-4">Stay updated with the latest news and announcements from the O&L Group.</p>
                <form className="flex">
                  <input type="email" placeholder="Your email address" className="bg-white/5 border border-white/20 px-4 py-3 w-full text-sm focus:outline-none focus:border-[#7cbd36] text-white" />
                  <button type="submit" className="bg-[#7cbd36] px-6 text-white font-bold hover:bg-[#68a02c] transition-colors">GO</button>
                </form>
                <div className="mt-8">
                  <h4 className="text-sm font-serif font-bold text-[#7cbd36] mb-3 capitalize">Upcoming Events</h4>
                  <a href="#" className="text-xs font-light text-white/80 hover:text-white underline">View Calendar</a>
                </div>
              </div>

            </div>
            
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-white/60">
              <p>&copy; {new Date().getFullYear()} Ohlthaver & List Group. All Rights Reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">PAIA Manual</a>
                <a href="#" className="hover:text-white transition-colors">Sitemap</a>
              </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
