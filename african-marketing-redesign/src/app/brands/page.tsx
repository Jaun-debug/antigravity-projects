import Image from "next/image";

const Brands = [
  { src: "https://assets.1.commercebuild.com/ff40d6843db1f3213530199ebe8660b6/contents/ckfinder/images/Logo/26508-1_DAB_Logo_Export.png", name: "DAB EXPORT" },
  { src: "https://assets.1.commercebuild.com/ff40d6843db1f3213530199ebe8660b6/contents/ckfinder/images/Logo/Kuemmerling_Logo.png", name: "KUEMMERLING" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/0007-13-07-16-13-41-08-595.jpg", name: "0007 13 07 16 13 41 08 595" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/1280px-Freixenet_logo_svg.png", name: "FREIXENET" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/1422951362.png", name: "1422951362" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/BHKLogo.jpg", name: "BHKLOGO" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Bosman.png", name: "BOSMAN" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Buffet-Olives-Logo.jpg", name: "BUFFET OLIVES" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Claushaler-Web-Logo.jpg", name: "CLAUSHALER" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Craft_Logo.png", name: "CRAFT" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Darling-Cellars-wine.jpg", name: "DARLING CELLARS WINE" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/De_Krans_new_logo_colour_small_1.jpg", name: "DE KRANS" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Edgebaston.jpg", name: "EDGEBASTON" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/F%C3%9CRST_BISMARCK_mit_Claim_G.jpg", name: "FURST BISMARCK" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Fairview-Logo.jpg", name: "FAIRVIEW" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Fairview-logo.jpg", name: "FAIRVIEW" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Ferrero-logo.jpg", name: "FERRERO" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Glen_Carlou_Logo.jpg", name: "GLEN CARLOU" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Haribo.jpg", name: "HARIBO" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Henkell_logo.jpg", name: "HENKELL" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/K%C3%BChne_logo.png", name: "KUHNE" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Landskroon.jpg", name: "LANDSKROON" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Lanzerac.jpg", name: "LANZERAC" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Lorenz_logo_blue_sRGB.png", name: "LORENZ" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Luglio_-_logo-ITA_VECT.jpg", name: "LUGLIO" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Milram-Logo.jpg", name: "MILRAM" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Monin.jpg", name: "MONIN" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Naturally-vinegar.jpg", name: "NATURALLY VINEGAR" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Oasis-logo.jpg", name: "OASIS" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Oldenburger-Logo.jpg", name: "OLDENBURGER" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Porkupine_ridge_wines.jpg", name: "PORKUPINE RIDGE WINES" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/RAUCH_Ellipse_sRGB1.jpg", name: "RAUCH" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Reyneke-Organic.jpg", name: "REYNEKE ORGANIC" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Robertson_Winery.jpg", name: "ROBERTSON WINERY" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Schladerer-logo.jpg", name: "SCHLADERER" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Scho%CC%88ffehofer.jpg", name: "SCHOFFEHOFER" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Spice_Route_Logo.jpg", name: "SPICE ROUTE" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Swartau-logo.jpg", name: "SWARTAU" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/TeeKanne-Logo.jpg", name: "TEEKANNE" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/Wodka-Gorbatschow-logo.jpg", name: "WODKA GORBATSCHOW" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/allesverloren_range_updated_logo.jpg", name: "ALLESVERLOREN" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/delba-bread-logo.jpg", name: "DELBA BREAD" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/la-capra-fairview.jpg", name: "LA CAPRA FAIRVIEW" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/logo_fat_bastard_color.jpg", name: "FAT BASTARD" },
  { src: "https://assets.3.commercebuild.com/52b4847e965496ec89e8fd0fcab5e850/contents/ckfinder/images/rz_mel_logo_rgb_17.png", name: "MELITTA" },
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
