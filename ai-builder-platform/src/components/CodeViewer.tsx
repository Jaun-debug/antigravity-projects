export function CodeViewer({ code }: { code: string }) {
  return (
    <div className="flex-1 h-full w-full overflow-auto bg-[#0d1218] p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-emerald-400">
      {code}
    </div>
  );
}
