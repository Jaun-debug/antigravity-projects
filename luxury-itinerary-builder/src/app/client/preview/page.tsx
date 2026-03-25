"use client";

import { useState, useEffect } from "react";
import { mockItinerary, mockRegions, mockLodges } from "@/data/mock";

export default function ClientPreviewPage() {
  const itinerary = mockItinerary;
  
  // We use the first day's region image as the default starting image
  const defaultImage = mockRegions.find(r => r.id === itinerary.days[0]?.regionId)?.heroImage || mockRegions[0].heroImage;
  const [activeImage, setActiveImage] = useState(defaultImage);

  // Collect all possible images from the itinerary to preload them and enable smooth CSS cross-fading
  const allImages = Array.from(
    new Set([
      defaultImage,
      ...itinerary.days.map(day => mockRegions.find(r => r.id === day.regionId)?.heroImage).filter(Boolean) as string[],
      ...itinerary.days.flatMap(day => day.images || [])
    ])
  );

  useEffect(() => {
    // Intersection Observer to detect which day is currently being viewed
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When a day section enters the viewport (60% visible)
          if (entry.isIntersecting) {
            const dayId = entry.target.getAttribute("data-day-id");
            const day = itinerary.days.find((d) => d.id === dayId);
            
            if (day) {
              // Try to use the day's specific image first, fallback to region image
              const region = mockRegions.find((r) => r.id === day.regionId);
              const targetImage = (day.images && day.images.length > 0) 
                 ? day.images[0] 
                 : region?.heroImage;
                 
              if (targetImage && targetImage !== activeImage) {
                setActiveImage(targetImage);
              }
            }
          }
        });
      },
      { 
        // Trigger when 60% of the day card is in the viewport
        threshold: 0.6,
        rootMargin: "-10% 0px -10% 0px"
      }
    );

    // Observe all day sections
    document.querySelectorAll(".day-section").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [itinerary, activeImage]);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans selection:bg-stone-200">
      <div className="flex flex-col md:flex-row w-full h-[100dvh]">
        {/* LEFT SIDE: Sticky Image / Cover */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 md:sticky z-10 overflow-hidden bg-stone-900">
          
          {/* Render all images stacked on top of each other, toggle opacity for smooth crossfade */}
          {allImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-[1500ms] ease-in-out ${
                activeImage === imgUrl 
                  ? "opacity-100 scale-105" 
                  : "opacity-0 scale-100"
              }`}
              style={{ backgroundImage: `url('${imgUrl}')` }}
            />
          ))}
          
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute bottom-12 left-8 md:bottom-20 md:left-20 text-white drop-shadow-lg pr-8">
            <h4 className="text-sm uppercase tracking-[0.3em] font-medium mb-4 opacity-90">
              {itinerary.clientName}
            </h4>
            <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-tight">
              {itinerary.title}
            </h1>
            <p className="mt-4 text-lg md:text-xl font-light opacity-90">
              A bespoke journey from {itinerary.startDate} to {itinerary.endDate}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Scrollable Itinerary Days */}
        <div className="w-full md:w-1/2 overflow-y-auto px-6 py-12 md:px-20 md:py-32">
          {/* Intro Section */}
          <div className="mb-32 max-w-xl">
            <h2 className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-6 font-semibold">Welcome</h2>
            <p className="text-2xl font-serif text-stone-800 leading-relaxed">
              Prepare for an unforgettable adventure. This itinerary has been hand-crafted to showcase the very best 
              of luxury safari travel, blending spectacular landscapes, exclusive wildlife encounters, and unparalleled hospitality.
            </p>
          </div>

          {/* Days Loop */}
          <div className="space-y-40">
            {itinerary.days.map((day) => {
              const region = mockRegions.find((r) => r.id === day.regionId);
              const lodge = mockLodges.find((l) => l.id === day.lodgeId);

              return (
                <section
                  key={day.id}
                  data-day-id={day.id}
                  className="day-section max-w-xl relative group"
                >
                  <div className="flex items-baseline space-x-4 mb-8 transition-opacity duration-700">
                    <span className="text-6xl font-serif text-stone-300 group-hover:text-stone-400 transition-colors duration-500">
                      {String(day.dayNumber).padStart(2, "0")}
                    </span>
                    <div className="w-full h-[1px] bg-stone-200" />
                  </div>

                  <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3 font-semibold">
                    {region?.name} — {lodge?.name}
                  </h3>
                  <h2 className="text-4xl font-serif text-stone-900 mb-6 leading-tight">
                    {day.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-stone-600 mb-10 font-light">
                    {day.description}
                  </p>

                  <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-stone-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-shadow duration-500">
                    <h4 className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-6 font-semibold flex items-center">
                      <span className="w-4 h-[1px] bg-stone-300 mr-3"></span>
                      Today's Activities
                    </h4>
                    <ul className="space-y-5">
                      {day.activities.map((act, idx) => (
                        <li key={idx} className="flex items-start group/item">
                          <span className="mr-4 mt-2 w-1.5 h-1.5 bg-stone-300 rounded-full flex-shrink-0 group-hover/item:bg-stone-500 transition-colors" />
                          <span className="text-stone-700 leading-relaxed group-hover/item:text-stone-900 transition-colors">
                            {act}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {day.notes && (
                    <div className="mt-8 pl-5 border-l-2 border-stone-200">
                      <p className="text-sm italic text-stone-500 leading-relaxed font-serif">"{day.notes}"</p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          
          {/* Finishing touch */}
          <div className="mt-40 pt-20 border-t border-stone-200 text-center max-w-xl">
            <h4 className="text-3xl font-serif text-stone-800 mb-4">Your Journey Awaits</h4>
            <p className="text-stone-500 mb-10 tracking-wide uppercase text-xs">Generated with precision</p>
            <div className="w-16 h-[1px] bg-stone-300 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
