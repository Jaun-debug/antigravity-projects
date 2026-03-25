import Image from 'next/image';
import Link from 'next/link';
import { PackageSearch, ThumbsUp, Truck, Users, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { ProductsList } from '@/data/products';

const Categories = [
  { name: 'Beverages', link: '/products/beverages', count: '1,200+ Products', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/carousel/winebarrels.jpg' },
  { name: 'Foods (Chilled)', link: '/products/foods-chilled', count: '850+ Products', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/21101418/thumbnail/middle_Brie.jpg' },
  { name: 'Foods (Ambient)', link: '/products/foods-ambient', count: '1,400+ Products', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/carousel/olive-oil.jpg' },
  { name: 'Cleaning', link: '/products/cleaning', count: '300+ Products', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/carousel/cleaning-.jpg' },
  { name: 'Packaging', link: '/products/packaging', count: '450+ Products', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/90001664/thumbnail/middle_CARRIER_4_CUP_HOLDER.png' },
  { name: 'Appliances', link: '/products/appliances', count: '120+ Products', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/carousel/coffee-1.jpg' },
];

const Brands = [
  "https://assets.1.commercebuild.com/ff40d6843db1f3213530199ebe8660b6/contents/ckfinder/images/Logo/26508-1_DAB_Logo_Export.png",
  "https://assets.1.commercebuild.com/ff40d6843db1f3213530199ebe8660b6/contents/ckfinder/images/Logo/Kuemmerling_Logo.png",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/1280px-Freixenet_logo_svg.png",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/BHKLogo.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Bosman.png",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Buffet-Olives-Logo.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Claushaler-Web-Logo.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Darling-Cellars-wine.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/De_Krans_new_logo_colour_small_1.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Edgebaston.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/F%C3%9CRST_BISMARCK_mit_Claim_G.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Fairview-Logo.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Ferrero-logo.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Haribo.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Henkell_logo.jpg",
  "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/K%C3%BChne_logo.png",
];

export default function Home() {
  // Select some featured products to show off the carousel
  const featuredProducts = ProductsList.slice(0, 10);
  
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center pt-20 overflow-hidden bg-stone-900">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Warehouse-Packing-Distribution-African-Marketing.jpg"
            alt="African Marketing Display Banner"
            fill
            className="object-cover object-center scale-105 animate-[zoom_30s_infinite_alternate] brightness-[0.3] hover:brightness-[0.4] transition-all duration-[2000ms]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-black/20" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            <span className="text-stone-300 font-medium tracking-widest uppercase text-xs">Premium Distribution Network</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 leading-[1.1] max-w-5xl text-balance animate-fade-in-up delay-100">
            Elevating Namibia's <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100 italic font-light font-sans tracking-tight">Supply Chain</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-300 mb-12 max-w-3xl font-light leading-relaxed animate-fade-in-up delay-200">
            A meticulously curated portfolio of the world's finest foods, beverages, and hospitality supplies, delivered with unparalleled excellence since 1978.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up delay-300">
            <Link 
              href="/products" 
              className="px-10 py-5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-2xl transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-900/50 flex items-center justify-center gap-3 group"
            >
              Explore the Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/contact" 
              className="px-10 py-5 bg-white/10 hover:bg-white text-white hover:text-stone-900 font-medium rounded-2xl backdrop-blur-md border border-white/20 transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Carousel - Pop out on hover */}
      <section className="py-24 bg-stone-900 overflow-hidden border-t border-white/5 relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-900/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-5 h-5 text-brand-400" />
              <span className="text-brand-400 font-semibold tracking-widest uppercase text-sm">Curated Selection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">Featured Products</h2>
          </div>
          <Link href="/products" className="text-stone-400 hover:text-white transition-colors flex items-center gap-2 group">
            View All Catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel implementation */}
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-12 px-4 sm:px-6 lg:px-8 gap-6 md:gap-8 relative z-10">
          {featuredProducts.map((product, i) => (
            <Link 
              href={`/products/${product.category}`}
              key={product.id} 
              className="snap-center shrink-0 w-[280px] md:w-[340px] group relative focus:outline-none"
            >
              <div className="h-[400px] rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative flex flex-col backdrop-blur-sm transition-all duration-700 ease-in-out hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-brand-900/20">
                {/* Image pops out dramatically on hover! */}
                <div className="flex-1 w-full bg-white relative p-8 group-hover:bg-brand-50 transition-colors duration-700 ease-in-out overflow-visible flex items-center justify-center">
                   <div className="relative w-full h-full transform transition-all duration-700 ease-in-out group-hover:scale-125 group-hover:-translate-y-4 origin-bottom shadow-2xl group-hover:drop-shadow-2xl drop-shadow-none">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        className="object-contain" 
                      />
                   </div>
                </div>
                
                <div className="p-6 md:p-8 flex-col flex bg-stone-900/50 backdrop-blur-md absolute bottom-0 w-full transform translate-y-4 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-xs font-mono text-brand-400 mb-2 truncate">SKU: {product.sku}</span>
                  <h3 className="text-lg font-serif font-bold text-white line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-sm text-stone-400 capitalize">{product.category.replace('-', ' ')}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Modern Categories Grid */}
      <section className="py-32 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-brand-600 font-semibold tracking-wider uppercase text-sm mb-4 block">Product Ecosystem</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-6">Our Diverse Portfolio</h2>
            <p className="text-xl text-stone-500 font-light">From imported European delicacies to high-grade industrial packaging, we source exactly what your enterprise requires.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Categories.map((cat, index) => (
              <Link 
                key={cat.name} 
                href={cat.link}
                className={`group relative block rounded-[2.5rem] overflow-hidden bg-stone-200 transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl hover:shadow-stone-300/50 ${index === 0 || index === 3 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                style={{ height: '24rem' }}
              >
                <div className="absolute inset-0">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                </div>
                
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 z-10" />
                
                <div className="absolute inset-x-0 bottom-0 z-20 p-10 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <ArrowRight className="w-5 h-5 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500 delay-100" />
                  </div>
                  <span className="text-brand-300 text-sm font-semibold tracking-widest uppercase mb-2 block">
                    {cat.count}
                  </span>
                  <h3 className="text-3xl font-serif font-bold text-white leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Infinite Luxury Marquee section */}
      <section className="py-32 bg-white overflow-hidden border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl font-serif text-stone-400 italic font-light">
            Distributing the world's most <span className="text-stone-900 font-bold not-italic">prestigious</span> brands
          </h2>
        </div>
        
        <div className="relative flex overflow-x-hidden w-full group">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="py-4 animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-32 pl-16 md:pl-32">
            {Brands.map((brand, i) => (
              <div key={i} className="relative w-32 h-24 md:w-48 md:h-32 shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 hover:scale-110">
                <Image src={brand} alt={`Brand ${i}`} fill className="object-contain" />
              </div>
            ))}
            {Brands.map((brand, i) => (
              <div key={i + 10} className="relative w-32 h-24 md:w-48 md:h-32 shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 hover:scale-110">
                <Image src={brand} alt={`Brand ${i}`} fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury CTA */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8 bg-white">
        <div className="relative max-w-7xl mx-auto rounded-[3rem] bg-stone-900 text-center overflow-hidden border border-stone-800 shadow-2xl">
          <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/carousel/1744714111-rittersport_2022.png')] bg-cover bg-center" />
          <div className="absolute -top-64 -right-64 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-64 -left-64 w-[600px] h-[600px] bg-stone-600/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">Ready to elevate your supply chain?</h2>
            <p className="text-stone-300 mb-12 text-xl max-w-2xl font-light">
              Join thousands of satisfied Namibian businesses relying on the consistency and quality of African Marketing.
            </p>
            <Link 
              href="/contact" 
              className="px-12 py-6 bg-white text-stone-900 font-bold tracking-widest uppercase text-sm rounded-full transition-all duration-500 hover:scale-105 shadow-xl shadow-white/10 hover:shadow-white/20"
            >
              Start Procurement Today
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
