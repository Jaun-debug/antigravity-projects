import Image from "next/image";

const Brands = [
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/rz_mel_logo_rgb_17.png", name: "Melitta" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Robertson--SmallTown-Logo2-9de2f4046f-57d0002fbb35c.jpg", name: "Robertson" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Fairview-logo-d241e00a0c-57cffeea29a79.jpg", name: "Fairview" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/kuhne-logo.jpg", name: "Kuhne" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Safari_Logo_2.jpg", name: "Safari" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/1200px-Schwartauer_Werke_201x_logo_svg.png", name: "Schwartau" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Lorenz_logo_blue_sRGB1.png", name: "Lorenz" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/LOGO-HARIBO-TRANSPARENTE.png", name: "Haribo" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/De_Krans_logo_with_Buffalo-removebg-preview.png", name: "De Krans" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Darling-Cellars-180-084f73d2a3-57cffe5c7d60e.jpg", name: "Darling Cellars" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/Landskroon-Logo-2006-Colour-180-d938cd858c-57cfff629a87e.jpg", name: "Landskroon" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/brand/CLT_BUI_Signet_Neutral_pos.png", name: "CLT" }
];

export default function BrandsPage() {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-brand-600 font-semibold tracking-wider uppercase text-sm mb-4 block animate-fade-in-up">Trusted Partners</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-8 animate-fade-in-up delay-100">Our Brands</h1>
        <p className="text-lg text-stone-600 leading-relaxed font-light max-w-2xl mx-auto mb-16 animate-fade-in-up delay-200">
          We distribute products from the world's leading brands, ensuring top-tier quality across all categories.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Brands.map((brand, i) => (
            <div 
              key={i} 
              className="group border border-stone-100 hover:border-brand-200 p-8 rounded-2xl flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-stone-50 hover:bg-white"
            >
              <div className="relative w-full h-24 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                <Image src={brand.src} alt={brand.name} fill className="object-contain" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
