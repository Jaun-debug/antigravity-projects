import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero */}
      <div className="bg-stone-900 text-center py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 animate-fade-in-up">About Us</h1>
        <p className="text-stone-300 max-w-2xl mx-auto text-lg font-light leading-relaxed animate-fade-in-up delay-100">
          Proudly Namibian owned. African Marketing is one of Namibia's longest and most trusted suppliers of premium products since 1978.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
             <Image 
                src="https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/carousel/1745825333-wuma.jpg" 
                alt="African Marketing Display"
                fill
                className="object-cover"
             />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6">Our Roots</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              Establishment dates back to 1978. Throughout our history, African Marketing has grown to become the leading food and beverage importer and distributor all over Namibia. Our network spans from corner shops to hypermarkets, ensuring consistent quality and availability.
            </p>
            <p className="text-stone-600 leading-relaxed mb-8">
              We employ a dynamic, hardworking team dedicated to excellence. With delivery routes extending from Windhoek to Walvis Bay and beyond, we ensure your business receives exactly what it needs, when it needs it.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-stone-200">
              <div>
                <span className="block text-3xl font-serif font-bold text-brand-600 mb-1">1978</span>
                <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Year Founded</span>
              </div>
              <div>
                <span className="block text-3xl font-serif font-bold text-brand-600 mb-1">2</span>
                <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Main Hubs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
