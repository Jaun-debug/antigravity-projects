"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Code2, MonitorPlay, History, Play, CheckCircle2, CircleDashed, ServerCog } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { CodeViewer } from "@/components/CodeViewer";
import { PreviewWindow } from "@/components/PreviewWindow";
import { AgentWorkflow } from "@/components/AgentWorkflow";

export type AgentTask = {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'done' | 'error';
  log: string;
};

const INITIAL_AGENTS: AgentTask[] = [
  { id: '1', name: 'Project Orchestrator', status: 'pending', log: '' },
  { id: '2', name: 'Research Agent', status: 'pending', log: '' },
  { id: '3', name: 'Design Agent', status: 'pending', log: '' },
  { id: '4', name: 'Build Engineer', status: 'pending', log: '' },
  { id: '5', name: 'QA / Debug Agent', status: 'pending', log: '' },
  { id: '6', name: 'Deployment Agent', status: 'pending', log: '' },
];

export default function BuilderSpace() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full bg-[#05080e] items-center justify-center">
        <CircleDashed size={32} className="animate-spin text-primary" />
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") || "";
  
  const [agents, setAgents] = useState<AgentTask[]>(INITIAL_AGENTS);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'logs'>('code');
  const [isBuilding, setIsBuilding] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>("// Code will appear here once generated...");
  const [deployedUrl, setDeployedUrl] = useState<string>("");

  useEffect(() => {
    if (prompt) startBuildWorkflow();
  }, [prompt]);

  const startBuildWorkflow = async () => {
    setIsBuilding(true);
    setAgents(INITIAL_AGENTS.map(a => ({ ...a, log: '' })));
    
    // Simulating the agent workflow via SSE or async progression.
    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleAgentUpdate(data);
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error("Workflow failed", error);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleAgentUpdate = (data: any) => {
    setAgents(prev => prev.map(a => {
      if (a.id === data.agentId) {
        return { ...a, status: data.status, log: data.log || a.log };
      }
      return a;
    }));

    if (data.code) {
      setGeneratedCode(data.code);
    }
    if (data.url) {
      setDeployedUrl(data.url);
      setActiveTab('preview');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#05080e] overflow-hidden font-sans text-gray-200">
      
      {/* Sidebar: Agents & Workflow */}
      <Sidebar prompt={prompt} agents={agents} isBuilding={isBuilding} />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 border-l border-white/5">
        
        {/* Workspace Toolbar */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0f16]">
          <div className="flex items-center gap-1 bg-[#151a23] p-1 rounded-lg border border-white/5">
            <TabButton icon={<Code2 size={16}/>} label="Code" active={activeTab === 'code'} onClick={() => setActiveTab('code')} />
            <TabButton icon={<MonitorPlay size={16}/>} label="Preview" active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} />
            <TabButton icon={<History size={16}/>} label="Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          </div>

          <div className="flex items-center gap-4">
            {deployedUrl && (
              <a href={deployedUrl} target="_blank" className="text-sm text-green-400 hover:text-green-300 transition flex items-center gap-2">
                <CheckCircle2 size={16}/> Live Deployment
              </a>
            )}
            <button 
              onClick={startBuildWorkflow} 
              disabled={isBuilding}
              className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 transition rounded text-sm font-medium flex items-center gap-2 text-white shadow-lg shadow-primary/20"
            >
              {isBuilding ? <CircleDashed size={16} className="animate-spin" /> : <Play size={16} />}
              {isBuilding ? "Processing..." : "Rebuild"}
            </button>
          </div>
        </header>

        {/* Workspace Content */}
        <div className="flex-1 overflow-hidden relative bg-[#0d1218]">
          {activeTab === 'code' && <CodeViewer code={generatedCode} />}
          {activeTab === 'preview' && <PreviewWindow code={generatedCode} isBuilding={isBuilding} />}
          {activeTab === 'logs' && <AgentWorkflow agents={agents} />}
        </div>
      </main>
      
    </div>
  );
}

const TabButton = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${active ? 'bg-[#2a303c] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
  >
    {icon} {label}
  </button>
);
