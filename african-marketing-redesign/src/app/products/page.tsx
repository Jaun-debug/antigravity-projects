import Image from "next/image";
import Link from "next/link";
import { PackageSearch, Filter } from 'lucide-react';

const ProductsList = [
  { id: 1, name: 'BEER LAGER CAN 4x6x500ml *DAB', sku: '2210-0013', category: 'Beverages', link: '/products/beverages', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/rz_mel_logo_rgb_17.png' },
  { id: 2, name: 'CABERNET SAUVIGNON 750ml *DE KRANS', sku: '2200-0054', category: 'Beverages', link: '/products/beverages', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/De_Krans_logo_with_Buffalo-removebg-preview.png' },
  { id: 3, name: 'BH 38 MULTIPURPOSE CLEANER 5ltr *GEOCHEM', sku: '0700-2041', category: 'Cleaning', link: '/products/cleaning', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/kuhne-logo.jpg' },
  { id: 4, name: 'CHIPS RESTAURANT 10mm 4x2.5kg *MAESTRO', sku: '0515-0196', category: 'Foods (Frozen)', link: '/products/foods-frozen', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Safari_Logo_2.jpg' },
  { id: 5, name: 'SPARKLING WINE BRUT CHARDONNAY 750ml *JOHN B', sku: '2200-0057', category: 'Beverages', link: '/products/beverages', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Robertson--SmallTown-Logo2-9de2f4046f-57d0002fbb35c.jpg' },
  { id: 6, name: 'COFFEE MACHINE CAFFEO SOLO ORGANIC SILVER *MELITTA', sku: '0250-0452', category: 'Appliances', link: '/products/appliances', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/rz_mel_logo_rgb_17.png' },
  { id: 7, name: 'FETA BUCKET 3kg *FAIRVIEW', sku: '2110-1404', category: 'Foods (Chilled)', link: '/products/foods-chilled', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Fairview-logo-d241e00a0c-57cffeea29a79.jpg' },
  { id: 8, name: 'BIODEGRADABLE BURGER BOX SUGAR CANE 500s', sku: '9000-1540', category: 'Packaging', link: '/products/packaging', image: 'https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/CLT_BUI_Signet_Neutral_pos.png' },
];

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
              href={product.link}
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
