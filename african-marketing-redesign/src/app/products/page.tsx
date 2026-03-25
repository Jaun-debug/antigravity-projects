import Image from "next/image";
import Link from "next/link";
import { PackageSearch, Filter } from 'lucide-react';

import { ProductsList } from '@/data/products';

export default function ProductsPage() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-stone-200 pb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Our Products</h1>
          <p className="text-stone-600 max-w-xl">
            Browse our comprehensive catalog of high-quality products sourced from the world's most trusted brands.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg transition-colors font-medium text-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <h3 className="font-semibold text-stone-900 mb-6 uppercase tracking-wider text-xs">Categories</h3>
          <ul className="space-y-3 font-medium text-sm text-stone-600">
            <li>
              <Link href="/products" className="block transition-colors hover:text-brand-600 text-brand-700 font-semibold">
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
                <Link href={`/products/${cat.slug}`} className="block transition-colors hover:text-brand-600">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Product Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ProductsList.map((product) => (
            <Link 
              key={product.id}
              href={`/products/${product.category.toLowerCase().replace(' ', '-')}`}
              className="bg-white border border-stone-100 rounded-xl p-4 flex flex-col hover:shadow-xl hover:border-brand-200 transition-all duration-300 group"
            >
              <div className="bg-white w-full aspect-square rounded-lg mb-4 flex items-center justify-center relative p-4 group-hover:bg-brand-50 transition-colors">
                <Image src={product.image} alt={product.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <span className="text-[0.65rem] font-mono text-stone-400 mb-1">SKU: {product.sku}</span>
              <h3 className="text-sm font-semibold text-stone-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-stone-500 mt-auto pt-4">{product.category}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
