'use client';

import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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

  // Dense tracking blob variables
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  // Extremely smooth delayed lag reaction
  const smoothMouseX = useSpring(rawMouseX, { stiffness: 20, damping: 25, mass: 1.5 });
  const smoothMouseY = useSpring(rawMouseY, { stiffness: 20, damping: 25, mass: 1.5 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window === 'undefined') return;
    // Track exact cursor location in pixels
    rawMouseX.set(e.clientX);
    rawMouseY.set(e.clientY);
  };

  // Generate dynamic tracking blob client-side
  useEffect(() => {
    // Initial center safely bounded
    if (typeof window !== 'undefined') {
      rawMouseX.set(window.innerWidth / 2);
      rawMouseY.set(window.innerHeight / 2);
    }

    const newParticles: any[] = [];
    const brightColors = [
      '#FF3366', '#20D2FF', '#FF9933', 
      '#00FF99', '#FFFF33', '#B833FF',
      '#FF33CC', '#33FFCC', '#3366FF'
    ];

    // Massive Antigravity Swirl generating math
    // 400 particles scattered across a tight radial field
    for (let i = 0; i < 400; i++) {
      // Tighter, denser viewport-relative radius
      const maxRadius = typeof window !== 'undefined' ? window.innerWidth * 0.35 : 600;
      const radius = Math.pow(random(0, 1, i), 0.5) * maxRadius; 
      const angle = random(0, Math.PI * 2, i + 100);
      
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius;

      // Calculate tangent rotation so the "slashes" form a perfect orbital vortex
      const rotationDeg = (angle * 180) / Math.PI + 90;

      newParticles.push({
        id: i,
        x: startX,
        y: startY,
        width: random(4, 18, i + 200), // Elongated slashes (Antigravity style)
        height: random(1, 3, i + 250),
        rotation: rotationDeg,
        pulseDuration: random(2, 6, i + 300), 
        delay: random(0, 3, i + 400),
        colors: [
          brightColors[Math.floor(random(0, brightColors.length, i + 500))],
          brightColors[Math.floor(random(0, brightColors.length, i + 600))],
          brightColors[Math.floor(random(0, brightColors.length, i + 700))]
        ]
      });
    }
    setParticles(newParticles);
  }, []);

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsInitializing(true);
    router.push(`/builder?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <main 
      onMouseMove={handleMouseMove}
      className="flex flex-col min-h-screen bg-white overflow-hidden relative font-sans text-gray-900 selection:bg-blue-100"
    >
      
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

      {/* Full-width continuous Blob tracking container */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-90">
        {/* Tracking Colorful Circle Blob bounded strictly to Window */}
        <motion.div
          className="absolute w-0 h-0"
          style={{ 
            left: 0, 
            top: 0,
            x: smoothMouseX, // Exact viewport cursor x offset
            y: smoothMouseY  // Exact viewport cursor y offset
          }}
          animate={{ rotateZ: 360 }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                width: `${p.width}px`,
                height: `${p.height}px`,
                left: `${p.x}px`,
                top: `${p.y}px`,
                // Teardrop shape!
                borderRadius: '50% 50% 50% 2px',
                transform: `rotate(${p.rotation}deg)`
              }}
              animate={{
                opacity: [0.1, 0.9, 0.1], // Vivid glowing
                backgroundColor: p.colors,
                // Alive floating wiggle!
                x: [0, random(-8, 8, p.id * 10), 0], 
                y: [0, random(-8, 8, p.id * 20), 0]
              }}
              transition={{
                duration: p.pulseDuration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 max-w-5xl mx-auto w-full z-10 text-center">
        
        {/* Black scattered background dots from screenshot */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]"></div>

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
