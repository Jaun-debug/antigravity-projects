'use client';

import { useState } from 'react';
import { Sandpack, SandpackProvider, SandpackLayout, SandpackPreview } from "@codesandbox/sandpack-react";
import { Monitor, Moon, Sun, Coffee, Cloud } from 'lucide-react';

export function PreviewWindow({ code, isBuilding }: { code: string, isBuilding: boolean }) {
  const [themeMode, setThemeMode] = useState<'black' | 'white' | 'slate' | 'blue'>('black');

  const THEMES = {
    black: '#0a0f16',
    white: '#ffffff',
    slate: '#f1f5f9',
    blue: '#eaf4fd'
  };

  const currentBg = THEMES[themeMode];

  // If there's no code or it's just the placeholder, render an empty state
  if (!code || code.includes('Code will appear here')) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1218] border-l border-white/5">
        <Monitor className="text-gray-600 mb-4 w-12 h-12" strokeWidth={1} />
        <p className="text-gray-500 font-light text-sm tracking-wide">Waiting for Neural Architecture Engine...</p>
      </div>
    );
  }

  // Inject Tailwind via CDN so the Sandpack instance dynamically processes tailwind classes!
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { 
        background-color: ${currentBg}; 
        min-height: 100vh; 
        margin: 0; 
        padding: 0; 
        transition: background-color 0.3s ease; 
        color: ${themeMode === 'black' ? 'white' : 'black'};
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
  `;

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1218]">
      
      {/* View Mode Control Bar */}
      <div className="h-14 border-b border-white/5 bg-[#0a0f16] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
          <Monitor size={14} className="text-primary" /> 
          Live Sandpack Environment
        </div>
        
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 shadow-inner">
          <button 
            onClick={() => setThemeMode('black')} 
            className={`p-2 rounded-md transition-all duration-200 ${themeMode === 'black' ? 'bg-[#2a303c] text-white shadow shadow-white/10' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`} 
            title="Dark Mode"
          >
            <Moon size={14} />
          </button>
          
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          
          <button 
            onClick={() => setThemeMode('white')} 
            className={`p-2 rounded-md transition-all duration-200 ${themeMode === 'white' ? 'bg-white text-black shadow shadow-black/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`} 
            title="Clean White"
          >
            <Sun size={14} />
          </button>
          <button 
            onClick={() => setThemeMode('slate')} 
            className={`p-2 rounded-md transition-all duration-200 ${themeMode === 'slate' ? 'bg-[#f1f5f9] text-[#475569] shadow shadow-black/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`} 
            title="Slate Chat Mode"
          >
            <Coffee size={14} />
          </button>
          <button 
            onClick={() => setThemeMode('blue')} 
            className={`p-2 rounded-md transition-all duration-200 ${themeMode === 'blue' ? 'bg-[#eaf4fd] text-[#0d47a1] shadow shadow-black/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`} 
            title="Ice Blue"
          >
            <Cloud size={14} />
          </button>
        </div>
      </div>

      {/* Actual Sandpack Renderer */}
      <div className="flex-1 w-full overflow-hidden relative" style={{ backgroundColor: currentBg }}>
        
        {isBuilding && (
          <div className="absolute inset-0 z-50 bg-[#0a0f16]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-white font-medium text-sm tracking-widest uppercase">Transpiling React AST...</span>
            </div>
          </div>
        )}

        <SandpackProvider 
          template="react-ts"
          theme="dark"
          customSetup={{
            dependencies: {
              "lucide-react": "^0.292.0",
              "framer-motion": "^10.16.4"
            }
          }}
          files={{
            "/App.tsx": code, // Feed the LLM code directly into App.js
            "/public/index.html": htmlTemplate // Attach dynamic Tailwind + Theme bg HTML
          }}
        >
          <SandpackLayout style={{ height: "100%", width: "100%", border: 'none', borderRadius: 0 }}>
            {/* We only want the PREVIEW, not the internal code editor, since we have our own CodeViewer tab */}
            <SandpackPreview style={{ height: "100%", width: "100%" }} showOpenInCodeSandbox={false} showRefreshButton={true} />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
}
