export function PreviewWindow({ url, isBuilding }: { url: string, isBuilding: boolean }) {
  if (isBuilding) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#0d1218] text-gray-500">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p>Building your immersive experience...</p>
      </div>
    );
  }

  if (url === "about:blank" || !url) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#0d1218] text-gray-500">
        <p>No preview available. Generate a build to see it here.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-white relative flex flex-col">
      <div className="h-12 w-full bg-gray-200 border-b border-gray-300 flex items-center px-4 gap-2 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="ml-4 px-3 py-1 bg-white rounded text-xs text-gray-500 font-sans shadow-sm w-96 truncate">
          {url}
        </div>
      </div>
      <iframe src={url} className="w-full flex-1 border-none" title="Live Preview" />
    </div>
  );
}
