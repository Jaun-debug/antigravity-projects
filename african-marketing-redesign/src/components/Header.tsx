"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Package, Shield, Truck } from 'lucide-react';
import Image from 'next/image';

const NavigationLinks = [
  { name: 'Products', href: '/products', hasMega: true },
  { name: 'Brands', href: '/brands' },
  { name: 'About Us', href: '/about-us', dropdown: [
    { name: 'Our Team', href: '/about-us/our-team' },
    { name: 'History', href: '/about-us/company-history' },
    { name: 'Delivery Routes', href: '/about-us/delivery-routes' }
  ]},
  { name: 'Customers', href: '/customers' },
  { name: 'Contact / Application', href: '/contact' },
  { name: 'Shop', href: '/shop', dropdown: [
    { name: 'Latest Specials', href: '/shop/specials' },
    { name: 'Quick Order', href: '/shop/quick-order' },
    { name: 'Browse All', href: '/products' }
  ]},
];

const ProductCategories = [
  { name: 'Beverages', href: '/products/beverages', icon: Package },
  { name: 'Foods (Ambient)', href: '/products/foods-ambient', icon: Package },
  { name: 'Foods (Chilled)', href: '/products/foods-chilled', icon: Package },
  { name: 'Foods (Frozen)', href: '/products/foods-frozen', icon: Package },
  { name: 'Foods (Fresh)', href: '/products/foods-fresh', icon: Package },
  { name: 'Cleaning', href: '/products/cleaning', icon: Package },
  { name: 'Packaging', href: '/products/packaging', icon: Package },
  { name: 'Appliances', href: '/products/appliances', icon: Package },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 border-b border-transparent ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-stone-200 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50">
            {/* Provide a luxurious text logo or image; Sysco/Bidfood style */}
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 leading-none">
                AFRICAN
              </span>
              <span className="text-[0.65rem] tracking-[0.2em] font-medium text-stone-500 uppercase leading-none mt-1">
                Marketing
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NavigationLinks.map((link) => (
              <div 
                key={link.name}
              <div className="relative group" onMouseEnter={() => link.hasMega || link.dropdown ? setActiveMega(link.name) : null} onMouseLeave={() => setActiveMega(null)}>
                <Link href={link.href} className="text-sm font-medium text-stone-700 hover:text-brand-700 transition-colors flex items-center gap-1">
                  {link.name}
                  {(link.hasMega || link.dropdown) && <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-hover:rotate-180" />}
                </Link>

                {link.dropdown && activeMega === link.name && (
                  <div className="absolute top-full text-left left-0 pt-4 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white border text-left border-stone-100 shadow-xl rounded-xl overflow-hidden py-2">
                      {link.dropdown.map(item => (
                        <Link key={item.name} href={item.href} className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-brand-700 transition-colors hover:pl-6">
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Mega Menu */}
                {link.hasMega && activeMega === link.name && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white border border-stone-100 shadow-2xl rounded-2xl overflow-hidden p-6">
                      <div className="flex justify-between items-end mb-4 border-b border-stone-100 pb-2">
                        <h3 className="font-serif text-lg text-stone-900">Our Categories</h3>
                        <Link href="/products" className="text-xs font-semibold text-brand-600 hover:text-brand-800 uppercase tracking-wide">View All</Link>
                      </div>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        {ProductCategories.map(cat => (
                          <Link 
                            key={cat.name} 
                            href={cat.href}
                            className="flex items-center gap-3 group/cat p-2 -mx-2 rounded-lg hover:bg-stone-50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center text-brand-700 group-hover/cat:scale-110 transition-transform">
                              <cat.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-stone-700 group-hover/cat:text-brand-800 transition-colors">
                              {cat.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link 
              href="/shop/quick-order" 
              className="hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-full transition-colors shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]"
            >
              Quick Order
            </Link>
            <button 
              className="lg:hidden p-2 text-stone-600 z-50 relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-24 px-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <nav className="flex flex-col gap-6">
            {NavigationLinks.map((link) => (
              <div key={link.name} className="flex flex-col gap-3">
                <Link 
                  href={link.href} 
                  className="text-2xl font-serif text-stone-900"
                  onClick={() => !link.hasMega && !link.dropdown && setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
                {link.dropdown && (
                  <div className="pl-4 border-l border-stone-200 flex flex-col gap-2">
                    {link.dropdown.map(item => (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className="text-lg text-stone-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
                {link.hasMega && (
                  <div className="pl-4 border-l border-stone-200 flex flex-col gap-2">
                    {ProductCategories.map(cat => (
                      <Link 
                        key={cat.name} 
                        href={cat.href}
                        className="text-lg text-stone-600 flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <cat.icon className="w-4 h-4 opacity-50" />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
