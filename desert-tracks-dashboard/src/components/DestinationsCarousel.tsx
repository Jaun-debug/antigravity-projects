"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming they have this utility from earlier apps

// Replace these with your actual OneDrive image URLs once you integrate this component
const DESTINATIONS = [
    {
        name: "SELF-DRIVE SAFARIS",
        image: "/destinations/namibia.jpg",
        link: "https://desert-tracks.com/namibia-self-drive-safaris/",
        description: "Discover Southern Africa with the freedom of self-drive. Navigate epic landscapes at your own pace."
    },
    {
        name: "FLY-IN SAFARIS",
        image: "/destinations/botswana.jpg",
        link: "https://desert-tracks.com/namibia-fly-in-safaris/",
        description: "Fly by light aircraft, enjoy stunning aerial views and save time travelling between remote luxury camps."
    },
    {
        name: "GUIDED SAFARIS",
        image: "/destinations/zambia.jpg",
        link: "https://desert-tracks.com/namibia-guided-safaris/",
        description: "Travel with an expert guide for deeper safari experiences, incredible tracking, and local cultural insights."
    },
    {
        name: "LUXURY SAFARIS",
        image: "/destinations/south_africa.jpg",
        link: "https://desert-tracks.com/namibia-luxury-safaris/",
        description: "Safaris curated especially for the esteemed luxury traveller. Opulent lodges and exclusive wildlife encounters."
    }
];

export default function WildernessCarousel() {
    const [activeIndex, setActiveIndex] = useState(2); // Start on Rwanda like the screenshot
    const [isAnimating, setIsAnimating] = useState(false);

    const handlePrev = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setActiveIndex((prev) => (prev === 0 ? DESTINATIONS.length - 1 : prev - 1));
        setTimeout(() => setIsAnimating(false), 500); // match transition duration
    }, [isAnimating]);

    const handleNext = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setActiveIndex((prev) => (prev === DESTINATIONS.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsAnimating(false), 500);
    }, [isAnimating]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrev, handleNext]);

    const setSpecificIndex = (index: number) => {
        if (isAnimating || index === activeIndex) return;
        setIsAnimating(true);
        setActiveIndex(index);
        setTimeout(() => setIsAnimating(false), 500);
    };

    return (
        <div className="relative w-full overflow-hidden bg-[#bfa182] font-sans antialiased min-h-screen py-20 flex flex-col justify-center">

            {/* Top Header Section */}
            <div className="w-full max-w-7xl mx-auto px-6 mb-12 text-center">
                <p className="text-[#ebe6df] text-lg md:text-xl font-light tracking-[0.2em] uppercase mb-8">
                    CHOOSE HOW YOU WANT TO TRAVEL
                </p>

                {/* Navigation Bar */}
                <div className="hidden md:flex flex-wrap justify-center items-center gap-x-8 gap-y-4 bg-black/10 backdrop-blur-sm p-6 rounded-sm max-w-5xl mx-auto">
                    {DESTINATIONS.map((dest, i) => (
                        <button
                            key={dest.name}
                            onClick={() => setSpecificIndex(i)}
                            className={cn(
                                "text-xs md:text-sm font-bold tracking-widest uppercase transition-all duration-300 outline-none",
                                activeIndex === i ? "text-white" : "text-white/60 hover:text-white"
                            )}
                        >
                            {dest.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hero Carousel Section */}
            <div className="relative w-full h-[55vh] md:h-[65vh] flex items-center justify-center overflow-hidden perspective-1000">

                <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                    {DESTINATIONS.map((dest, index) => {

                        // Calculate relative position (-1 is left, 0 is center, 1 is right)
                        let relativeIndex = index - activeIndex;
                        // Handle wrap-around
                        if (relativeIndex > DESTINATIONS.length / 2) relativeIndex -= DESTINATIONS.length;
                        if (relativeIndex < -DESTINATIONS.length / 2) relativeIndex += DESTINATIONS.length;

                        const isCenter = relativeIndex === 0;
                        const isLeft = relativeIndex === -1;
                        const isRight = relativeIndex === 1;

                        // Hide items that aren't adjacent
                        if (!isCenter && !isLeft && !isRight) return null;

                        // Positioning calculations
                        const translateX = relativeIndex * 85; // Move left/right by 85% of container
                        const scale = isCenter ? 1 : 0.85; // Scale down side images slightly
                        const opacity = isCenter ? 1 : 0.5;
                        const zIndex = isCenter ? 20 : 10;

                        return (
                            <div
                                key={dest.name}
                                className="absolute top-0 w-[85%] md:w-[70%] h-full transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer overflow-hidden shadow-2xl"
                                style={{
                                    transform: `translateX(${translateX}%) scale(${scale})`,
                                    opacity,
                                    zIndex,
                                }}
                                onClick={() => {
                                    if (isLeft) handlePrev();
                                    else if (isRight) handleNext();
                                    else if (isCenter) window.location.href = dest.link;
                                }}
                            >
                                {/* Background Image */}
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out object-center"
                                    style={{ transform: isCenter ? 'scale(1.05)' : 'scale(1)' }}
                                />

                                {/* Dark Overlay for better text contrast */}
                                <div className="absolute inset-0 bg-black/20" />

                                {/* Country Name Overlaid */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <h2
                                        className="text-white font-serif tracking-[0.2em] uppercase drop-shadow-2xl whitespace-pre-line text-center leading-[1.1]"
                                        style={{
                                            fontSize: 'clamp(2.5rem, 8vw, 6rem)', // Responsive font size adjusted for 2 lines
                                            transform: isCenter ? 'translateY(0)' : (isLeft ? 'translateX(30%)' : 'translateX(-30%)'),
                                            transition: 'all 600ms cubic-bezier(0.25, 1, 0.5, 1)',
                                            opacity: isCenter ? 1 : 0.6
                                        }}
                                    >
                                        {dest.name.replace(' ', '\n')}
                                    </h2>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Description and Controls */}
            <div className="w-full max-w-[70%] mx-auto mt-8 flex flex-col md:flex-row items-center justify-between px-4 gap-6">

                {/* Animated Description Box */}
                <div className="max-w-md w-full relative h-[100px] overflow-hidden">
                    {DESTINATIONS.map((dest, i) => (
                        <div
                            key={`desc-${i}`}
                            className={cn(
                                "absolute inset-0 transition-all duration-500",
                                activeIndex === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                        >
                            <p className="text-white/80 font-light text-base md:text-lg leading-relaxed">
                                {dest.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center gap-4 border-b border-[#a88d71] pb-2">
                    <button
                        onClick={handlePrev}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-[#d87a4d] transition-colors"
                        aria-label="Previous destination"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-[#d87a4d] transition-colors"
                        aria-label="Next destination"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
