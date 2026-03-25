import { useState } from 'react';
import { X, ExternalLink, Loader2, BookOpen } from 'lucide-react';

const BLOG_URLS = [
    "https://desert-tracks.com/namibia-east-africa-travel-guide/",
    "https://desert-tracks.com/travel-guide/swakopmund-activities-a-luxurious-adventure-awaits/",
    "https://desert-tracks.com/travel-guide/best-safari-lodges-in-namibia-where-luxury-meets-the-wilderness/",
    "https://desert-tracks.com/travel-guide/facts-about-leopards-namibian-leopards/",
    "https://desert-tracks.com/travel-guide/namibian-beach-holidays-a-luxurious-escape-for-any-traveler/",
    "https://desert-tracks.com/travel-guide/namibia-luxury-accommodation-the-desert-whisper/",
    "https://desert-tracks.com/travel-guide/best-skeleton-coast-map-for-travelers-navigate-namibias-shipwreck-coast/",
    "https://desert-tracks.com/travel-guide/namibia-luxury-accommodation-andbeyond-sossusvlei-desert-lodge/",
    "https://desert-tracks.com/travel-guide/namibia-luxury-accommodation-camp-kala-luxury-safaris/",
    "https://desert-tracks.com/travel-guide/namibia-luxury-accommodation-little-ongava/",
    "https://desert-tracks.com/travel-guide/namibia-luxury-lodges-little-kulala-desert-lodge/",
    "https://desert-tracks.com/travel-guide/namibia-luxury-lodges-andersons-at-ongava/",
    "https://desert-tracks.com/travel-guide/namibia-luxury-lodges-onguma-the-fort/",
    "https://desert-tracks.com/travel-guide/namibia-luxury-lodges-wilderness-desert-rhino-camp/",
    "https://desert-tracks.com/travel-guide/discover-the-magic-of-a-9-day-tanzania-safari/",
    "https://desert-tracks.com/travel-guide/9-day-kenya-circuit-safari-with-masai-mara/",
    "https://desert-tracks.com/travel-guide/the-great-wildebeest-migration-natures-most-breathtaking-show/",
    "https://desert-tracks.com/travel-guide/best-time-to-visit-zanzibar/",
    "https://desert-tracks.com/travel-guide/when-to-see-the-great-migration/",
    "https://desert-tracks.com/travel-guide/tanzania-safaris/",
    "https://desert-tracks.com/travel-guide/luxury-safari-holidays-in-namibia-for-couples/",
    "https://desert-tracks.com/travel-guide/the-weinberg-windhoek/",
    "https://desert-tracks.com/travel-guide/camelthorn-kalahari-lodge/",
    "https://desert-tracks.com/travel-guide/balloon-safaris-over-the-namib-desert-with-luxury-breakfast/",
    "https://desert-tracks.com/travel-guide/guided-hikes-and-safaris-at-fish-river-canyon-namibia/",
    "https://desert-tracks.com/travel-guide/romantic-desert-safaris-in-namibia-for-honeymooners/",
    "https://desert-tracks.com/travel-guide/best-luxury-safari-experiences-in-namibia-for-europeans/",
    "https://desert-tracks.com/travel-guide/self-drive-safari-holidays-in-namibia-with-car-rental-included/",
    "https://desert-tracks.com/travel-guide/4x4-self-drive-safaris-adventures-in-namibia/",
    "https://desert-tracks.com/travel-guide/namibia-luxury-lodges-camp-kipwe/",
    "https://desert-tracks.com/travel-guide/best-locations-for-stargazing-during-namibian-safaris/",
    "https://desert-tracks.com/travel-guide/adventure-tours-in-swakopmund-with-desert-safaris/",
    "https://desert-tracks.com/travel-guide/luxury-safari-excursions-to-the-sossusvlei-sand-dunes/",
    "https://desert-tracks.com/travel-guide/senior-friendly-safari-tours-in-namibia-with-comfort-lodging/",
    "https://desert-tracks.com/travel-guide/family-friendly-safari-holidays-in-namibia-with-kids/",
    "https://desert-tracks.com/travel-guide/luxury-safari-lodges-in-namibia-with-european-travel-deals/",
    "https://desert-tracks.com/travel-guide/discover-the-best-namibian-luxury-desert-safaris-top-exclusive-lodges-and-tours/",
    "https://desert-tracks.com/travel-guide/top-15-namibian-activities-for-adventure-seekers/",
    "https://desert-tracks.com/travel-guide/top-luxury-safaris-in-namibia-ultimate-guide-to-opulent-wildlife-adventures/",
    "https://desert-tracks.com/travel-guide/namib-animals-15-unique-species-to-spot-in-the-desert/",
    "https://desert-tracks.com/travel-guide/windhoek-luxury-suites/",
    "https://desert-tracks.com/travel-guide/kalahari-red-dunes-lodge/",
    "https://desert-tracks.com/travel-guide/the-desert-grace/",
    "https://desert-tracks.com/travel-guide/desert-whisper/",
    "https://desert-tracks.com/travel-guide/4x4-selbstfahrer-safari-abenteuer-in-namibia/",
    "https://desert-tracks.com/travel-guide/selbstfahrer-safari-urlaub-in-namibia-mit-mietwagen/",
    "https://desert-tracks.com/travel-guide/en-4x4-self-drive-safari-holidays-namibia/",
    "https://desert-tracks.com/travel-guide/beste-reisezeit-fuer-namibia/",
    "https://desert-tracks.com/travel-guide/luxusreise-namibia-die-besten-safari-routen-2026/",
    "https://desert-tracks.com/travel-guide/explore-namibias-regions-your-complete-safari-guide/",
    "https://desert-tracks.com/travel-guide/kann-man-in-namibia-leitungswasser-trinken/",
    "https://desert-tracks.com/travel-guide/ist-namibia-teuer-zu-bereisen/",
    "https://desert-tracks.com/travel-guide/ist-namibia-teurer-als-sudafrika/",
    "https://desert-tracks.com/travel-guide/walbeobachtung-namibia-giganten-an-der-skelettkuste-entdecken/",
    "https://desert-tracks.com/travel-guide/namibia-in-january-hot-days-green-landscapes-and-fewer-crowds/",
    "https://desert-tracks.com/travel-guide/namibia-in-february-hot-days-green-landscapes-and-quiet-safaris/",
    "https://desert-tracks.com/travel-guide/experience-the-wonders-of-luxury-safaris-in-namibia/",
    "https://desert-tracks.com/travel-guide/namibia-self-drive-safaris-the-ultimate-african-road-adventure/",
    "https://desert-tracks.com/travel-guide/namibia-fly-in-safaris-see-the-soul-of-the-desert-from-the-sky/",
    "https://desert-tracks.com/travel-guide/whats-the-weather-like-in-namibia-in-march/",
    "https://desert-tracks.com/travel-guide/whale-watching-in-namibia-a-guide-to-spotting-marine-giants-on-the-skeleton-coast/",
    "https://desert-tracks.com/travel-guide/is-wi-fi-in-namibia-available-during-a-safari/",
    "https://desert-tracks.com/travel-guide/top-10-luxury-lodges-to-visit-in-botswana/",
    "https://desert-tracks.com/travel-guide/what-is-the-safest-african-country-to-visit-for-safari/",
    "https://desert-tracks.com/travel-guide/luxury-safari-holidays-in-namibia/",
    "https://desert-tracks.com/travel-guide/best-time-to-visit-namibia-weather-climate-and-tips/",
    "https://desert-tracks.com/travel-guide/can-you-drink-tap-water-in-namibia/",
    "https://desert-tracks.com/travel-guide/is-namibia-expensive-to-visit/",
    "https://desert-tracks.com/travel-guide/is-namibia-more-expensive-than-south-africa/",
    "https://desert-tracks.com/travel-guide/how-to-say-hallo-in-africa/",
    "https://desert-tracks.com/travel-guide/namibia-religion/",
    "https://desert-tracks.com/travel-guide/interesting-facts-about-the-grants-golden-mole/",
    "https://desert-tracks.com/travel-guide/interesting-baby-elephant-facts/",
    "https://desert-tracks.com/travel-guide/luxury-lodges-namibia-architectural-marvels-in-design-and-wilderness-integration/",
    "https://desert-tracks.com/travel-guide/following-desert-adapted-animals-in-namibia/",
    "https://desert-tracks.com/travel-guide/desert-adapted-lions-of-namibia/",
    "https://desert-tracks.com/travel-guide/combining-desert-safari-with-close-by-delta-regions-an-epic-adventure-in-namibia/",
    "https://desert-tracks.com/travel-guide/exklusive-lodges-in-namibia-luxus-der-die-stille-feiert/",
    "https://desert-tracks.com/travel-guide/flugsafari-in-namibia-luxus-aus-der-luft/",
    "https://desert-tracks.com/travel-guide/why-choose-namibia-as-your-travel-destination/",
    "https://desert-tracks.com/travel-guide/how-to-choose-the-correct-vehicle-for-your-namibian-self-drive-safari-why-namibia-is-ideal/",
    "https://desert-tracks.com/travel-guide/what-to-expect-on-a-namibia-safari-wildlife-accommodations-and-activities/",
    "https://desert-tracks.com/travel-guide/5-hidden-gems-to-see-visiting-on-a-namibia-safari-beyond-the-usual-stops/",
    "https://desert-tracks.com/travel-guide/how-to-prepare-for-a-namibian-guided-safari-your-essential-travel-guide/",
    "https://desert-tracks.com/travel-guide/the-history-of-walvis-bay-from-early-exploration-to-modern-significance/",
    "https://desert-tracks.com/travel-guide/the-people-of-namibia/",
    "https://desert-tracks.com/travel-guide/beyond-five-stars-namibias-exclusive-wilderness/",
    "https://desert-tracks.com/travel-guide/experience-the-best-of-namibias-luxury-safaris/",
    "https://desert-tracks.com/travel-guide/discovering-the-skeleton-desert-namibia-a-guide-to-exploring-africas-most-haunting-coastline/",
    "https://desert-tracks.com/travel-guide/namibias-coastal-charms-discovering-the-beauty/",
    "https://desert-tracks.com/travel-guide/namibia-weather-in-august-what-to-expect-for-your-safari-adventure/",
    "https://desert-tracks.com/travel-guide/namibia-safari/",
    "https://desert-tracks.com/travel-guide/unleashing-the-adventure-self-drive-vs-guided-safari-in-namibia/",
    "https://desert-tracks.com/travel-guide/advantages-of-guided-safaris-in-namibia/",
    "https://desert-tracks.com/travel-guide/what-does-a-tracker-do-on-safari/",
    "https://desert-tracks.com/travel-guide/why-you-should-visit-botswana/",
    "https://desert-tracks.com/travel-guide/namibias-top-luxury-lodges-indulge-in-exquisite-comfort/",
    "https://desert-tracks.com/travel-guide/adventure-travel-on-your-namibian-safari/",
    "https://desert-tracks.com/travel-guide/how-to-choose-the-correct-namibian-dmc/",
    "https://desert-tracks.com/travel-guide/can-i-combine-a-namibia-safari-with-a-trip-to-victoria-falls/",
    "https://desert-tracks.com/travel-guide/10-amazing-facts-about-namibia/",
    "https://desert-tracks.com/travel-guide/the-herero-people/",
    "https://desert-tracks.com/travel-guide/discover-petroglyphs-in-namibia/",
    "https://desert-tracks.com/travel-guide/cultural-festivals-in-namibia/",
    "https://desert-tracks.com/travel-guide/surfing-namibia-at-skeleton-bay/",
    "https://desert-tracks.com/travel-guide/what-is-the-best-safari-in-namibia/",
    "https://desert-tracks.com/travel-guide/should-i-travel-to-namibia-or-botswana/",
    "https://desert-tracks.com/travel-guide/how-much-does-a-safari-cost-in-namibia/",
    "https://desert-tracks.com/travel-guide/whats-the-weather-like-in-namibia-in-december/",
    "https://desert-tracks.com/travel-guide/best-time-to-visit-the-okavango-delta/",
    "https://desert-tracks.com/travel-guide/namibian-traditional-food-what-to-expect-on-your-namibian-safari/",
    "https://desert-tracks.com/travel-guide/family-friendly-safaris-in-namibia-where-to-go-and-what-to-expect/",
    "https://desert-tracks.com/travel-guide/what-are-the-most-budget-friendly-safari-options-in-namibia/",
    "https://desert-tracks.com/travel-guide/travel-insurance-when-visiting-namibia-best-options-for-a-safari/",
    "https://desert-tracks.com/travel-guide/essential-namibia-self-drive-safari-safety-tips-what-every-visitor-should-know/",
    "https://desert-tracks.com/travel-guide/essential-packing-list-for-a-namibian-safari/",
    "https://desert-tracks.com/travel-guide/namibian-dmc-how-it-can-enhance-your-overall-travel-experience/",
    "https://desert-tracks.com/travel-guide/transformational-travel-in-namibia/",
    "https://desert-tracks.com/travel-guide/top-photography-tips-when-on-a-namibian-safari/",
    "https://desert-tracks.com/travel-guide/beginners-guide-to-namibia-safari-seasons-when-to-go-and-why/",
    "https://desert-tracks.com/travel-guide/namibia-weather-in-december-what-to-expect-and-how-to-prepare/",
    "https://desert-tracks.com/travel-guide/astrotourism-in-namibia-exploring-night-skies/",
    "https://desert-tracks.com/travel-guide/best-fly-in-safari-lodges-in-namibia/",
    "https://desert-tracks.com/travel-guide/combining-luxury-safaris-with-other-high-end-activities-in-namibia/",
    "https://desert-tracks.com/travel-guide/photography-gear-for-a-namibia-safari/",
    "https://desert-tracks.com/travel-guide/places-to-visit-on-your-namibia-self-drive-safari/",
    "https://desert-tracks.com/travel-guide/best-time-to-visit-namibia-as-a-safari-destination/",
    "https://desert-tracks.com/travel-guide/namib-desert-night-sky-stargazing-in-the-namibrand-nature-reserve/",
    "https://desert-tracks.com/travel-guide/namibian-romantic-safaris-intimacy-and-luxury-in-the-wilderness/",
    "https://desert-tracks.com/travel-guide/best-time-to-visit-chobe-national-park/",
    "https://desert-tracks.com/travel-guide/the-benefits-of-a-self-drive-safari-through-namibia/",
    "https://desert-tracks.com/travel-guide/namibian-fly-in-safaris-advantages-and-your-essential-travel-guide/",
    "https://desert-tracks.com/travel-guide/top-10-namibia-national-parks-your-essential-travel-guide/",
    "https://desert-tracks.com/travel-guide/the-appeal-of-namibia-as-a-safari-destination/",
    "https://desert-tracks.com/travel-guide/luxury-escapes-indulging-in-opulence/",
    "https://desert-tracks.com/travel-guide/family-friendly-adventures-in-namibia/",
    "https://desert-tracks.com/travel-guide/namibias-wildlife-conservation-efforts/",
    "https://desert-tracks.com/travel-guide/namibia-in-2024-unveiling-the-ultimate-travel/",
    "https://desert-tracks.com/travel-guide/wings-over-okavango-a-two-night-skyborne-safari/",
    "https://desert-tracks.com/travel-guide/beyond-safaris-namibias-thriving-arts-and-culture/",
    "https://desert-tracks.com/travel-guide/wings-over-namibia-experience-the-ultimate-fly-in/",
    "https://desert-tracks.com/travel-guide/namibia-on-a-shoestring-mastering-the-art-of-budget/",
    "https://desert-tracks.com/travel-guide/soaring-above-namibia-a-skyborne-safari-adventure/",
    "https://desert-tracks.com/travel-guide/wildlife-wonderland-discovering-namibias/",
    "https://desert-tracks.com/travel-guide/desert-astronomy-stargazing-in-the-namibrand-nature/",
    "https://desert-tracks.com/travel-guide/guardians-of-the-wild-africats-and-namibias-nature/",
    "https://desert-tracks.com/travel-guide/capturing-namibias-photographic-wonders/",
    "https://desert-tracks.com/travel-guide/visit-damaraland-on-your-namibia-safari/",
    "https://desert-tracks.com/travel-guide/sustainability-and-responsible-tourism-in-namibia/",
    "https://desert-tracks.com/travel-guide/namibias-treasures-the-two-world-heritage-sites/",
    "https://desert-tracks.com/travel-guide/how-to-prepare-for-your-namibian-desert-safari/",
    "https://desert-tracks.com/travel-guide/swakopmund-the-adventure-hub-on-your-namibian-safari/",
    "https://desert-tracks.com/travel-guide/unravelling-the-benefits-of-a-dmc/",
    "https://desert-tracks.com/travel-guide/dventure-beyond-safaris-thrilling-activities/",
    "https://desert-tracks.com/travel-guide/namibia-off-the-beaten-track/",
    "https://desert-tracks.com/travel-guide/navigating-namibia-your-travel-maestro/",
    "https://desert-tracks.com/travel-guide/namibia-unveiled-discover-the-mesmerising-tapestry-of-its-diverse-regions/",
    "https://desert-tracks.com/travel-guide/namibia-fly-in-safaris-what-are-they"
];

// Helper to extract title from slug
const getTitleFromUrl = (url) => {
    try {
        const parts = url.split('/').filter(p => p.length > 0);
        const slug = parts[parts.length - 1]; // "my-blog-post"

        // Handle "namibia-fly-in-safaris-what-are-they"
        // Replace dashes with spaces, capitalize
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    } catch {
        return "Blog Post";
    }
};

export default function BlogSection() {
    // State removed for direct links




    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-light text-neutral-800">Desert Tracks Blogs</h2>
                <p className="text-neutral-500 max-w-2xl mx-auto">
                    Explore our curated travel guides, tips, and stories about Namibia and beyond.
                </p>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {BLOG_URLS.map((url, index) => {
                    const title = getTitleFromUrl(url);
                    return (
                        <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-neutral-100 p-6 cursor-pointer transition-all duration-300 group flex flex-col h-full block"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                                    <BookOpen className="w-6 h-6 text-amber-600" />
                                </div>
                                <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-amber-500 transition-colors" />
                            </div>

                            <h3 className="text-lg font-medium text-neutral-900 group-hover:text-amber-700 transition-colors mb-2 line-clamp-2">
                                {title}
                            </h3>

                            <p className="text-sm text-neutral-500 line-clamp-3">
                                Read about {title} in Namibia. Discover expert tips, itineraries, and hidden gems.
                            </p>

                            <div className="mt-auto pt-4 text-xs font-semibold text-amber-600 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                                Read Article &rarr;
                            </div>
                        </a>
                    );
                })}
            </div>



            <style>{`
                /* Simple resets for the inserted blog content */
                .blog-content-renderer img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .blog-content-renderer h1, .blog-content-renderer h2, .blog-content-renderer h3 {
                    margin-top: 1.5em;
                    margin-bottom: 0.8em;
                    color: #1a1a1a;
                }
                .blog-content-renderer p {
                    margin-bottom: 1.2em;
                    line-height: 1.8;
                }
                .blog-content-renderer a {
                    color: #d97706; /* amber-600 */
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
