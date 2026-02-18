import { useDataWorker } from './hooks/useDataWorker'
import { ListContainer } from './components/VirtualList/ListContainer'
import type { RowComponentProps } from 'react-window';
import type { ListItemData } from './types/data';
import './index.css'

// Temporary placeholder for Dev C's Row component
const PlaceholderRow = ({ index, style, data }: RowComponentProps<{ data: ListItemData[] }>) => {
  const item = data[index];
  return (
    <div style={style} className="flex items-center px-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-slate-700 mr-4 flex items-center justify-center text-xs font-bold text-slate-300">
        {item.name.charAt(0)}
      </div>
      <div>
        <div className="text-slate-200 font-medium">{item.name}</div>
        <div className="text-slate-500 text-sm">{item.email}</div>
      </div>
      <div className={`ml-auto px-2 py-0.5 rounded text-xs ${item.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
        {item.status}
      </div>
    </div>
  );
};

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

            <div className="h-[600px] w-full bg-slate-900/30">
              {/* Integrated ListContainer with PlaceholderRow */}
              <ListContainer
                data={data}
                RowComponent={PlaceholderRow}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
