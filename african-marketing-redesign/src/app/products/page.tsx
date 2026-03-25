import Image from "next/image";
import Link from "next/link";
import { PackageSearch, Filter } from 'lucide-react';

import { ProductsList } from '@/data/products';

export default function ProductsPage() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 pb-12 border-b border-stone-200">
        <div className="animate-fade-in-up">
          <span className="text-brand-600 font-semibold tracking-wider uppercase text-sm block mb-4">Master Catalog</span>
          <h1 className="text-5xl font-serif font-bold text-stone-900 mb-4 tracking-tight">Our Products</h1>
          <p className="text-xl text-stone-500 max-w-2xl font-light leading-relaxed">
            Browse our comprehensive, curated catalog of high-quality goods sourced from the world's most trusted brands.
          </p>
        </div>
        <div className="flex gap-4 animate-fade-in-up delay-100">
          <button className="flex items-center gap-3 px-6 py-3 bg-white border border-stone-200 text-stone-900 hover:border-brand-400 hover:text-brand-600 rounded-full transition-all hover:shadow-lg font-medium text-sm">
            <Filter className="w-4 h-4" /> Advanced Filter
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Luxury Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="sticky top-32">
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-8 pb-4 border-b border-stone-100">Categories</h3>
            <ul className="space-y-4 font-medium text-sm">
              <li>
                <Link href="/products" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 bg-brand-50 text-brand-700 -mx-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  All Products
                </Link>
              </li>
              {[
                { slug: 'beverages', name: 'Beverages' },
                { slug: 'foods-ambient', name: 'Foods (Ambient)' },
                { slug: 'foods-chilled', name: 'Foods (Chilled)' },
                { slug: 'foods-frozen', name: 'Foods (Frozen)' },
                { slug: 'foods-fresh', name: 'Foods (Fresh)' },
                { slug: 'cleaning', name: 'Cleaning' },
                { slug: 'packaging', name: 'Packaging' },
                { slug: 'appliances', name: 'Appliances' },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products/${cat.slug}`} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-stone-500 hover:bg-stone-50 hover:text-stone-900 -mx-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 group-hover:bg-brand-400 group-hover:scale-150 transition-all" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Premium Product Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {ProductsList.map((product) => (
            <Link 
              key={product.id}
              href={`/products/${product.category.toLowerCase().replace(' ', '-')}`}
              className="group relative focus:outline-none flex flex-col h-full"
            >
              <div className="aspect-[4/5] rounded-3xl bg-white border border-stone-100 overflow-hidden relative flex flex-col transition-all duration-700 ease-in-out hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-900/10 mb-6">
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[0.65rem] font-mono text-stone-600 font-medium shadow-sm border border-stone-100">
                    SKU: {product.sku}
                  </span>
                </div>
                
                {/* Image pops out dramatically on hover! */}
                <div className="flex-1 w-full relative p-8 group-hover:bg-stone-50 transition-colors duration-700 ease-in-out overflow-visible flex items-center justify-center">
                   <div className="relative w-full h-full transform transition-all duration-700 ease-in-out group-hover:scale-125 group-hover:-translate-y-4 origin-bottom group-hover:drop-shadow-2xl">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        className="object-contain drop-shadow-sm transiton-all duration-500" 
                      />
                   </div>
                </div>
              </div>
              
              <div className="px-2 flex flex-col flex-1">
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-600 mb-2">{product.category.replace('-', ' ')}</p>
                <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
