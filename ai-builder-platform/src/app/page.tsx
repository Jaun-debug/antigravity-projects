'use client';

import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";

// Helper for generating deterministic random values for static elements
const random = (min: number, max: number, seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
};

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  // Generate particles client-side to prevent hydration mismatches
  useEffect(() => {
    const newParticles: any[] = [];
    
    // Create 3 massive rings
    const ringCenters = [
      { cx: 0, cy: -15 }, // Top center
      { cx: -25, cy: 30 }, // Bottom Left
      { cx: 25, cy: 30 }   // Bottom Right
    ];

    ringCenters.forEach((center, ringIdx) => {
      // 200 particles per ring
      for (let i = 0; i < 200; i++) {
        const offset = i + ringIdx * 200;
        const baseRadius = 15; // Base radius in VW
        const thickness = random(-3, 3, offset); // Thickness of the ring
        const angle = random(0, Math.PI * 2, offset + 100);
        
        // Final starting position calculation (torus projection)
        const radius = baseRadius + thickness;
        const startX = center.cx + Math.cos(angle) * radius;
        const startY = center.cy + Math.sin(angle) * (radius * 1.5); // Oval projection for 3D perspective

        newParticles.push({
          id: offset,
          ringIdx,
          angle,
          radius,
          thickness,
          x: startX,
          y: startY,
          scale: random(0.5, 1.5, offset + 200),
          baseDuration: random(8, 15, offset + 300), // Very slow majestic morph
          delay: random(0, -5, offset + 400),
          // Gradient of Google blues exactly like screenshot
          color: ['#8AB4F8', '#669DF6', '#4285F4', '#1A73E8', '#e8f0fe'][Math.floor(random(0, 5, offset + 500))]
        });
      }
    });
    setParticles(newParticles);
  }, []);

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsInitializing(true);
    router.push(`/builder?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <main className="flex flex-col min-h-screen bg-white overflow-hidden relative font-sans text-gray-900 selection:bg-blue-100">
      
      {/* Top Navbar matched to layout */}
      <header className="absolute top-0 w-full p-4 md:px-8 py-5 flex justify-between items-center z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-xl tracking-tight text-gray-900 flex items-center gap-1">Aura <span className="font-light text-gray-500">FlowState</span></span>
        </div>
        
        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-gray-900 transition flex items-center gap-1">Product</a>
          <a href="#" className="hover:text-gray-900 transition flex items-center gap-1">Use Cases</a>
          <a href="#" className="hover:text-gray-900 transition flex items-center gap-1">Pricing</a>
          <a href="#" className="hover:text-gray-900 transition flex items-center gap-1">Resources</a>
        </nav>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-semibold text-gray-700 hover:text-black transition">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8' } }} />
          </SignedIn>
          <button className="hidden sm:flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg">
            Initialize Engine
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 max-w-5xl mx-auto w-full z-10 text-center">
        
        {/* Morphing 3D Torus Particle System */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center mix-blend-multiply opacity-90">
          
          {/* Black scattered background dots from screenshot */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]"></div>

          {particles.map((p) => {
            // Calculate orbital motion morphing path specifically for that ring
            const orbitX = Math.cos(p.angle + Math.PI / 4) * (p.radius + (p.thickness * 1.5));
            const orbitY = Math.sin(p.angle + Math.PI / 4) * (p.radius * 1.5); // keep oval perspective

            const center = p.ringIdx === 0 ? { cx: 0, cy: -15 } : p.ringIdx === 1 ? { cx: -25, cy: 30 } : { cx: 25, cy: 30 };

            return (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: `${p.scale * 3}px`,
                  height: `${p.scale * 3}px`,
                  backgroundColor: p.color,
                  left: `calc(50% + ${p.x}vw)`,
                  top: `calc(50% + ${p.y}vh)`,
                }}
                animate={{
                  // Create a slow, breathing orbital drift morph
                  x: [0, (orbitX - Math.cos(p.angle) * p.radius) * 0.4, 0],
                  y: [0, (orbitY - Math.sin(p.angle) * p.radius * 1.5) * 0.4, 0],
                  opacity: [0.1, 0.9, 0.1],
                  scale: [1, p.scale * 1.8, 1],
                  rotateZ: [0, p.angle * 10, 0]
                }}
                transition={{
                  duration: p.baseDuration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <Sparkles className="w-7 h-7 text-blue-600" />
            <span className="font-semibold text-2xl tracking-tight text-gray-900 flex items-center gap-2">Aura <span className="font-light text-gray-500">FlowState</span></span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl md:text-[84px] leading-[1.05] font-semibold text-gray-900 tracking-tight"
          >
            Experience liftoff with the next-generation IDE
          </motion.h1>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#1a1a1a] hover:bg-black text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)]">
              <Code2 size={20} />
              Download for MacOS
            </button>
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 px-8 py-4 rounded-full text-lg font-medium transition-all">
              Explore capabilities
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Search Input Bar (Anchored at bottom like Google style or floating) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative z-30 max-w-3xl mx-auto w-full px-6 pb-24"
      >
        <form onSubmit={handleInitialize} className="relative group shadow-2xl rounded-full">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-white border border-gray-200 rounded-full flex items-center p-2 shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all">
            <div className="pl-6 pr-4">
              <Code2 className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Deploy a luxury travel landing page..."
              className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none py-4 text-lg font-medium"
              disabled={isInitializing}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isInitializing}
              className="ml-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full px-8 py-4 font-semibold text-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {isInitializing ? (
                <>Initializing <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Code2 className="w-5 h-5" /></motion.div></>
              ) : (
                <>Launch Platform</>
              )}
            </button>
          </div>
        </form>
      </motion.div>

    </main>
  );
}
