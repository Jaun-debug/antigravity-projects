export function AgentWorkflow({ agents }: { agents: any[] }) {
  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#0a0f16]">
      <div className="text-xl font-semibold mb-6 text-white pb-3 border-b border-white/10">Architecture Pipeline Logs</div>
      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id} className="p-4 bg-[#121721] rounded-lg border border-white/5 shadow-md">
            <h3 className="text-primary font-medium tracking-wide flex items-center gap-2">
              {"[" + agent.name.toUpperCase() + "]"}
              <span className={`text-xs ml-auto ${agent.status === 'done' ? 'text-accent' : agent.status === 'active' ? 'text-blue-400 animate-pulse' : 'text-gray-500'}`}>
                {agent.status.toUpperCase()}
              </span>
            </h3>
            <p className="mt-2 text-sm text-gray-300 font-mono tracking-tight leading-relaxed">
              {agent.log || "Awaiting task execution..."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
