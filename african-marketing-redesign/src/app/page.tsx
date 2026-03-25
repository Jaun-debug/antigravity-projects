import Image from 'next/image';
import Link from 'next/link';
import { PackageSearch, ThumbsUp, Truck, Users, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

const Categories = [
  { name: 'Beverages', link: '/products/beverages', count: '1,200+ Products' },
  { name: 'Foods (Chilled)', link: '/products/foods-chilled', count: '850+ Products' },
  { name: 'Foods (Ambient)', link: '/products/foods-ambient', count: '1,400+ Products' },
  { name: 'Cleaning', link: '/products/cleaning', count: '300+ Products' },
  { name: 'Packaging', link: '/products/packaging', count: '450+ Products' },
  { name: 'Appliances', link: '/products/appliances', count: '120+ Products' },
];

const Brands = [
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/rz_mel_logo_rgb_17.png",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Robertson--SmallTown-Logo2-9de2f4046f-57d0002fbb35c.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Fairview-logo-d241e00a0c-57cffeea29a79.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/kuhne-logo.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Safari_Logo_2.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/1200px-Schwartauer_Werke_201x_logo_svg.png",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Lorenz_logo_blue_sRGB1.png",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/LOGO-HARIBO-TRANSPARENTE.png",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/De_Krans_logo_with_Buffalo-removebg-preview.png",
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Warehouse-Packing-Distribution-African-Marketing.jpg"
            alt="African Marketing Display Banner"
            fill
            className="object-cover object-center scale-105 animate-[zoom_20s_infinite_alternate] brightness-50"
            priority
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="text-brand-300 font-medium tracking-widest uppercase text-xs md:text-sm mb-6 animate-fade-in-up">
            Distributing Quality Since 1978
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight max-w-4xl text-balance animate-fade-in-up delay-100">
            Namibia's Leading Food &amp; Beverage Distributor
          </h1>
          <p className="text-lg md:text-xl text-stone-200 mb-10 max-w-2xl font-light leading-relaxed animate-fade-in-up delay-200">
            We bring a comprehensive basket of quality products right to your doorstep. Proudly Namibian owned, ensuring absolute excellence in service and supply.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
            <Link 
              href="/products" 
              className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-900/20"
            >
              Browse Products
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-white hover:bg-stone-100 text-stone-900 font-medium rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Become a Customer
            </Link>
          </div>
        </div>

        {/* Scroll indicator down bottom */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-white/50">
          <span className="text-xs uppercase tracking-widest mb-2 font-medium">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-brand-600 font-semibold tracking-wider uppercase text-sm">Our Portfolio</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mt-2">Everything You Need</h2>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-stone-600 hover:text-brand-600 transition-colors font-medium">
              View Entire Range <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Categories.map((cat, index) => (
              <Link 
                key={cat.name} 
                href={cat.link}
                className="group relative block h-64 rounded-2xl overflow-hidden bg-stone-100 transition-transform duration-500 hover:-translate-y-2"
              >
                {/* Fallback pattern bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-500 z-10" />
                
                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                  <span className="text-stone-700 group-hover:text-stone-300 transition-colors text-sm font-medium mb-1">
                    {cat.count}
                  </span>
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-serif font-bold text-stone-900 group-hover:text-white transition-colors">
                      {cat.name}
                    </h3>
                    <div className="w-10 h-10 rounded-full bg-white/80 group-hover:bg-brand-600 flex items-center justify-center transition-colors backdrop-blur-sm -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-500">
                      <ArrowRight className="w-5 h-5 text-stone-900 group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use Us / About Sub */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6">Why Partner With Us?</h2>
            <p className="text-lg text-stone-600 leading-relaxed text-balance">
              Our basket is constantly adapted according to customer demand. We cater from a corner shop to a hyper market, from a cafeteria to a 5-star hotel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Truck,
                title: "Doorstep Delivery",
                desc: "We bring a comprehensive basket of quality products right to your doorstep across our delivery routes."
              },
              {
                icon: ShieldCheck,
                title: "Trusted Since 1978",
                desc: "One of Namibia's longest and most trusted suppliers, ensuring you receive only premium standard products."
              },
              {
                icon: Users,
                title: "Dynamic Team",
                desc: "Proudly Namibian owned company employing a hardworking team dedicated to giving you excellent service."
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-100 flex items-center justify-center mb-6 text-brand-600 shrink-0">
                  <feature.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Marquee section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <span className="text-brand-600 font-semibold tracking-wider uppercase text-sm block mb-2">Our Brands</span>
          <h2 className="text-3xl font-serif font-bold text-stone-900">Partnering with the world's finest</h2>
        </div>
        
        <div className="relative flex overflow-x-hidden w-full group">
          <div className="py-4 animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-24 pl-16 md:pl-24">
            {Brands.map((brand, i) => (
              <div key={i} className="relative w-32 h-24 md:w-40 md:h-32 shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <Image src={brand} alt={`Brand ${i}`} fill className="object-contain" />
              </div>
            ))}
            {Brands.map((brand, i) => (
              <div key={i + 10} className="relative w-32 h-24 md:w-40 md:h-32 shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <Image src={brand} alt={`Brand ${i}`} fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 bg-stone-900 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/carousel/1744714111-rittersport_2022.png')] bg-cover bg-center" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Ready to elevate your supply chain?</h2>
          <p className="text-stone-300 mb-10 text-lg max-w-2xl font-light">
            Join thousands of satisfied Namibian businesses. Apply for an account today and streamline your wholesale procurement.
          </p>
          <Link 
            href="/contact" 
            className="px-10 py-5 bg-white text-stone-900 font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-black/20"
          >
            Apply to Become a Customer
          </Link>
        </div>
      </section>
    </>
  );
}
