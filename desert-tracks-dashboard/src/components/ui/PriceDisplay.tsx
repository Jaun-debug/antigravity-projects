"use client";

import React, { useEffect, useState } from 'react';

// Hardcoded Exchange Rates against EUR
const rates: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  ZAR: 20.5,
  NAD: 20.5
};

const symbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  ZAR: "R",
  NAD: "N$"
};

interface PriceDisplayProps {
  safari?: string;
  basePrice: number; // Base price in EUR
  className?: string;
}

export default function PriceDisplay({ safari, basePrice, className = "" }: PriceDisplayProps) {
  const [currency, setCurrency] = useState('EUR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // Priority 1: Timezone Check
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.startsWith("America/")) {
        setCurrency("USD");
      } else if (timezone === "Europe/London" || timezone === "Europe/Belfast") {
        setCurrency("GBP");
      } else if (timezone === "Africa/Windhoek") {
        setCurrency("NAD");
      } else if (timezone === "Africa/Johannesburg") {
        setCurrency("ZAR");
      } else if (timezone.startsWith("Europe/")) {
        setCurrency("EUR");
      } else {
        // Priority 2: Browser Locale Fallback
        const lang = navigator.language || '';
        if (lang.endsWith('GB')) setCurrency("GBP");
        else if (lang.endsWith('US')) setCurrency("USD");
        else if (lang.endsWith('ZA')) setCurrency("ZAR");
        else if (lang.endsWith('NA')) setCurrency("NAD");
        else setCurrency("EUR"); // Default
      }
    } catch (e) {
      setCurrency("EUR");
    }
  }, []);

  // Avoid hydration error
  if (!mounted) {
    return <div className={`animate-pulse h-12 w-40 bg-gray-100/50 rounded-sm mt-2 ${className}`}></div>;
  }

  // Calculate local pricing
  const convertedPrice = basePrice * (rates[currency] || 1);
  
  // Luxury rounding (round to nearest hundred)
  const roundedPrice = Math.round(convertedPrice / 100) * 100;
  
  // Format with commas (e.g. 7,200)
  const formattedPrice = roundedPrice.toLocaleString('en-US');

  return (
    <div className={`flex flex-col mt-[14px] ${className}`}>
      <div 
        className="text-[#1a1a18] text-base lg:text-[1.05rem]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
      >
        From {symbols[currency] || "€"}{formattedPrice} <span className="text-sm font-sans italic opacity-85 ml-1">per person sharing</span>
      </div>
      <div 
        className="text-[0.68rem] text-[#7a746d] mt-1 opacity-70 uppercase tracking-wide max-w-[90%]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Indicative rate based on low season, subject to availability
      </div>
    </div>
  );
}
