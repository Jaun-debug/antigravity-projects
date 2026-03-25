"use client";

import { useState, useEffect } from "react";
import { mockItinerary, mockRegions, mockLodges } from "@/data/mock";

// In a real app we would calculate which day is currently visible on screen.
// For this demo, we'll implement a simple IntersectionObserver logic to update the sticky image.

export default function ClientPreviewPage() {
  const itinerary = mockItinerary;
  const [activeImage, setActiveImage] = useState(mockRegions[0].heroImage);

  // In a robust implementation, use Intersection Observer to check which day is in view
  // and update `activeImage` to that day's region or lodge heroImage.
  // For the moment, we'll assume the first day's image is the fallback.

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayId = entry.target.getAttribute("data-day-id");
            const day = itinerary.days.find((d) => d.id === dayId);
            if (day) {
              const region = mockRegions.find((r) => r.id === day.regionId);
              if (region) setActiveImage(region.heroImage);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll(".day-section").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [itinerary]);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans selection:bg-stone-200">
      <div className="flex flex-col md:flex-row w-full h-[100dvh]">
        {/* LEFT SIDE: Sticky Image / Cover */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 md:sticky z-10 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-105"
            style={{ backgroundImage: `url('${activeImage}')` }}
          />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute bottom-12 left-8 md:bottom-20 md:left-20 text-white drop-shadow-lg">
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
          <div className="mb-24 max-w-xl">
            <h2 className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-6">Welcome</h2>
            <p className="text-2xl font-serif text-stone-800 leading-relaxed">
              Prepare for an unforgettable adventure. This itinerary has been hand-crafted to showcase the very best 
              of luxury safari travel, blending spectacular landscapes, exclusive wildlife encounters, and unparalleled hospitality.
            </p>
          </div>

          {/* Days Loop */}
          <div className="space-y-32">
            {itinerary.days.map((day) => {
              const region = mockRegions.find((r) => r.id === day.regionId);
              const lodge = mockLodges.find((l) => l.id === day.lodgeId);

              return (
                <section
                  key={day.id}
                  data-day-id={day.id}
                  className="day-section max-w-xl"
                >
                  <div className="flex items-baseline space-x-4 mb-8">
                    <span className="text-5xl font-serif text-stone-300">
                      {String(day.dayNumber).padStart(2, "0")}
                    </span>
                    <div className="w-full h-px bg-stone-200" />
                  </div>

                  <h3 className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-2">
                    {region?.name} — {lodge?.name}
                  </h3>
                  <h2 className="text-3xl font-serif text-stone-900 mb-6">
                    {day.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-stone-600 mb-8 font-light">
                    {day.description}
                  </p>

                  <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-stone-100">
                    <h4 className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-4 font-semibold">
                      Today's Activities
                    </h4>
                    <ul className="space-y-4">
                      {day.activities.map((act, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-3 mt-1 w-1.5 h-1.5 bg-stone-300 rounded-full flex-shrink-0" />
                          <span className="text-stone-700">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {day.notes && (
                    <div className="mt-6 pl-4 border-l-2 border-stone-200">
                      <p className="text-sm italic text-stone-500">{day.notes}</p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          
          {/* Finishing touch */}
          <div className="mt-32 pt-16 border-t border-stone-200 text-center max-w-xl">
            <h4 className="text-2xl font-serif text-stone-800 mb-4">Your Journey Awaits</h4>
            <p className="text-stone-500 mb-8">Generated with precision and care.</p>
            <div className="w-16 h-px bg-stone-300 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
