import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight text-white leading-none block">
                AFRICAN
              </span>
              <span className="text-[0.65rem] tracking-[0.2em] font-medium text-stone-500 uppercase leading-none mt-1 block">
                Marketing
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Namibia's leading food and beverage importer and distributor since 1978. Premium products delivered to your doorstep.
            </p>
          </div>

          {/* Windhoek Location */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Windhoek</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-stone-600 shrink-0 mt-0.5" />
                <span>5 von Braun Street<br />Southern Industria<br />Windhoek</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-stone-600 shrink-0" />
                <span>+264 83 3383 800</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-stone-600 shrink-0" />
                <span className="text-xs font-mono">22°34'59.12"S 17°4'34.25"E</span>
              </li>
            </ul>
          </div>

          {/* Walvis Bay Location */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Walvis Bay</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-stone-600 shrink-0 mt-0.5" />
                <span>Corner of 12th Street<br />& Circumferential Road<br />Walvis Bay</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-stone-600 shrink-0" />
                <span>+264 83 3383 800</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-stone-600 shrink-0" />
                <span className="text-xs font-mono">22°57'02"S 14°31'04"E</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Links</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/about-us" className="hover:text-white transition-colors">Get to know us</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Shop Products</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Become a Customer</Link></li>
              <li className="mt-2 pt-2 border-t border-stone-800">
                <a href="mailto:info@african-marketing.com" className="flex items-center gap-2 text-brand-500 hover:text-brand-400 transition-colors">
                  <Mail className="w-4 h-4" />
                  info@african-marketing.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} AFRICAN MARKETING (PTY) LTD. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
