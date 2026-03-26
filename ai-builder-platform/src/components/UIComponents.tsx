export function CodeViewer({ code }: { code: string }) {
  return (
    <div className="flex-1 h-full w-full overflow-auto bg-[#0d1218] p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-emerald-400">
      {code}
    </div>
  );
}

export function PreviewWindow({ url, isBuilding }: { url: string, isBuilding: boolean }) {
  if (isBuilding) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#0d1218] text-gray-500">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p>Building your immersive experience...</p>
      </div>
    );
  }

  if (url === "about:blank") {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#0d1218] text-gray-500">
        <p>No preview available. Generate a build to see it here.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full w-full bg-white relative">
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-200 border-b border-gray-300 flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="ml-4 px-3 py-1 bg-white rounded text-xs text-gray-500 font-sans shadow-sm w-96 truncate">
          {url}
        </div>
      </div>
      <iframe src={url} className="w-full h-full mt-8 border-none" title="Live Preview" />
    </div>
  );
}

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
