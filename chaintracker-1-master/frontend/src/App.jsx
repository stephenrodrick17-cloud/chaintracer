import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import AddressTracer from './pages/AddressTracer'
import GraphExplorer from './pages/GraphExplorer'
import MLPredictions from './pages/MLPredictions'
import ClusterReport from './pages/ClusterReport'
import MultiAgentFraudDetector from './pages/MultiAgentFraudDetector'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trace" element={<AddressTracer />} />
              <Route path="/explorer" element={<GraphExplorer />} />
              <Route path="/predictions" element={<MLPredictions />} />
              <Route path="/clusters" element={<ClusterReport />} />
              <Route path="/multi-agent" element={<MultiAgentFraudDetector />} />
            </Routes>
          </main>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155'
            }
          }} />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
