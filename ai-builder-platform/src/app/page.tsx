"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    // Pass the initial prompt to the builder space
    router.push(`/builder?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-20 overflow-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center text-center max-w-3xl"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-gray-300 font-medium tracking-wide">Aura AI v1.0 Multi-Agent Framework</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-6 drop-shadow-sm">
          Architect the Future.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 font-light leading-relaxed">
          Describe the application you want to build. Our multi-agent hive mind will plan, design, code, test, and deploy it for you seamlessly.
        </p>

        <form onSubmit={handleStart} className="w-full relative max-w-2xl group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-[#0d1218] border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all focus-within:border-primary/50">
            <div className="pl-6 text-gray-500">
              <Code2 className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build a premium SaaS landing page for an AI accounting tool..."
              className="w-full bg-transparent border-none py-5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-lg font-light"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="mr-2 bg-white text-black px-6 py-3 rounded-lg font-medium tracking-wide hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Initialize
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </motion.div>
    </main>
  );
}
