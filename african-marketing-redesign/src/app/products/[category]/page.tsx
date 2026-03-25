import Image from "next/image";
import { PackageSearch, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { ProductsList } from '@/data/products';

export async function generateStaticParams() {
  return [
    { category: 'beverages' },
    { category: 'foods-ambient' },
    { category: 'foods-chilled' },
    { category: 'foods-frozen' },
    { category: 'foods-fresh' },
    { category: 'cleaning' },
    { category: 'packaging' },
    { category: 'appliances' },
  ];
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  // Format the category name for display
  const titleMap: Record<string, string> = {
    'beverages': 'Beverages',
    'foods-ambient': 'Foods (Ambient)',
    'foods-chilled': 'Foods (Chilled)',
    'foods-frozen': 'Foods (Frozen)',
    'foods-fresh': 'Foods (Fresh)',
    'cleaning': 'Cleaning',
    'packaging': 'Packaging',
    'appliances': 'Appliances'
  };

  const formattedTitle = titleMap[params.category] || params.category;
  
  // Filter products by category URL slug
  const filteredProducts = ProductsList.filter(p => p.category === params.category);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Premium Header */}
      <Link href="/products" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-12 group text-sm font-medium">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Master Catalog
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 pb-12 border-b border-stone-200">
        <div className="animate-fade-in-up">
          <span className="text-brand-600 font-semibold tracking-wider uppercase text-xs block mb-4">Master Catalog &bull; Category</span>
          <h1 className="text-5xl font-serif font-bold text-stone-900 mb-4 capitalize tracking-tight">
            {formattedTitle}
          </h1>
          <p className="text-xl text-stone-500 max-w-2xl font-light leading-relaxed">
            Explore our curated selection of premium {formattedTitle.toLowerCase()} sourced globally for true quality.
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
            <ul className="space-y-4 font-medium text-sm text-stone-600">
              <li>
                <Link href="/products" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-stone-500 hover:bg-stone-50 hover:text-stone-900 -mx-3 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300 group-hover:bg-stone-500 transition-all" />
                  All Products
                </Link>
              </li>
              {Object.entries(titleMap).map(([slug, name]) => {
                const isActive = slug === params.category;
                return (
                  <li key={slug}>
                    <Link 
                      href={`/products/${slug}`} 
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 -mx-3 group ${
                        isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-brand-500 scale-150' : 'bg-stone-300 group-hover:bg-brand-400 group-hover:scale-150'}`} />
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Premium Product Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="group relative focus:outline-none flex flex-col h-full cursor-default"
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
                    <p className="text-xs font-semibold tracking-widest uppercase text-brand-600 mb-2">{formattedTitle}</p>
                    <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-24 bg-stone-50 rounded-[2.5rem] border border-stone-100 flex flex-col items-center">
              <PackageSearch className="w-16 h-16 text-stone-300 mb-6" strokeWidth={1} />
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">No items featured yet</h3>
              <p className="text-stone-500 mb-8 max-w-md">Our procurement team is currently updating the {formattedTitle} catalog. Please check back later or contact us to direct-order.</p>
              <Link href="/products" className="px-8 py-4 bg-brand-600 text-white hover:bg-brand-500 transition-colors rounded-full font-medium shadow-lg hover:shadow-brand-900/20">
                View All Categories
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
