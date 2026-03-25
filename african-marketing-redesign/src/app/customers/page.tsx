export default function CustomersPage() {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-8">Our Customers</h1>
        <p className="text-xl font-serif text-stone-500 max-w-2xl mx-auto mb-16 italic">
          From coffee shops to high-end restaurants, bed & breakfasts to 5-star hotels, and lodges in the remotest areas of Namibia.
        </p>

        <div className="grid md:grid-cols-2 gap-12 text-left">
          <div className="bg-stone-50 p-10 rounded-2xl border border-stone-100 shadow-lg">
            <h3 className="text-2xl font-serif text-brand-700 font-bold mb-6">Key Accounts & Retail</h3>
            <ul className="space-y-4 text-stone-600 text-lg">
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span> Pick ‘n Pay</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span> Sentra & Megasave</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span> OK Grocers & Shield</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span> Shoprite, Checkers & Usave</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span> Spar & Metro</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span> Woermann Brock (Namibia)</li>
            </ul>
          </div>
          
          <div className="bg-stone-800 text-stone-100 p-10 rounded-2xl shadow-lg border border-stone-700 flex flex-col justify-center">
            <h3 className="text-2xl font-serif font-bold mb-6 text-brand-400">Independent Supply</h3>
            <p className="text-lg leading-relaxed text-stone-300">
              We proudly distribute to massive networks of independent wholesalers and retailers nationwide. Because our basket is constantly adapted according to customer demand, we cater as smoothly to corner shops as we do hyper-markets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
