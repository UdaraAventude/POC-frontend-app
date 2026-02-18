import { useDataWorker } from './hooks/useDataWorker'
import './index.css'

function App() {
  const { data, isLoading, error } = useDataWorker(50000);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent mb-2">
          High-Performance Virtualization POC
        </h1>
        <p className="text-slate-400 text-lg">
          Rendering 50,000 items with React-Window and Web Workers.
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-primary-400 font-medium animate-pulse">Generating 50,000 data items...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-red-400">
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <h2 className="text-xl font-semibold">Data Stream</h2>
              <div className="text-sm px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full border border-primary-500/20">
                {data.length.toLocaleString()} Items Loaded
              </div>
            </div>

            <div className="h-[600px] w-full flex items-center justify-center text-slate-500">
              {/* Dev B and Dev C will fill this section with the ListContainer and Row components */}
              <div className="text-center p-12">
                <p className="mb-4">Data is ready in the main thread.</p>
                <div className="bg-slate-800/50 p-4 rounded-lg text-xs font-mono text-slate-400 inline-block text-left">
                  <pre>{JSON.stringify(data.slice(0, 1), null, 2)}</pre>
                </div>
                <p className="mt-6 text-sm italic">Waiting for Dev B to implement ListContainer...</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
