import { Check, Loader2, Sparkles } from "lucide-react";

export function Sidebar({ prompt, agents, isBuilding }: { prompt: string, agents: any[], isBuilding: boolean }) {
  return (
    <aside className="w-80 flex flex-col border-r border-white/5 bg-[#0a0f16]">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 text-white">
          <Sparkles className="w-5 h-5 text-primary" />
          Aura Builder
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2">
          {prompt || "No prompt provided."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 pl-2 mb-4">
          Agent Workflow
        </div>
        
        {agents.map((agent, i) => (
          <div key={agent.id} className="relative flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition group">
            
            {/* Connection Line */}
            {i !== agents.length - 1 && (
              <div className="absolute top-10 left-[1.15rem] w-px h-8 bg-white/10 group-hover:bg-primary/20 transition-colors" />
            )}
            
            <div className={`mt-0.5 rounded-full p-1.5 flex-shrink-0 border transition-all ${
              agent.status === 'active' ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
              agent.status === 'done' ? 'bg-accent/10 border-accent text-accent' :
              agent.status === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' :
              'bg-gray-800 border-gray-700 text-gray-500'
            }`}>
              {agent.status === 'active' && <Loader2 size={14} className="animate-spin" />}
              {agent.status === 'done' && <Check size={14} />}
              {agent.status === 'pending' && <div className="w-3.5 h-3.5 rounded-full bg-gray-600" />}
              {agent.status === 'error' && <div className="w-3.5 h-3.5 rounded-full bg-red-400" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium ${agent.status === 'active' ? 'text-white font-semibold' : 'text-gray-400'}`}>
                {agent.name}
              </h3>
              {agent.log && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {agent.log}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
