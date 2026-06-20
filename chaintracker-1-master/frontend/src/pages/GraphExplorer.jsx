import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import { motion } from 'framer-motion'
import { Search, ZoomIn, ZoomOut, RefreshCw, Maximize, Send, Bot, Loader2 } from 'lucide-react'
import { graphApi, predictApi } from '../api'
import { cytoscapeStyles } from '../utils/cytoscapeStyles'
import { useQuery } from '@tanstack/react-query'
import RiskBadge from '../components/RiskBadge'
import axios from 'axios'

cytoscape.use(fcose)

export default function GraphExplorer() {
  const containerRef = useRef(null)
  const cyRef = useRef(null)
  const [searchId, setSearchId] = useState('230425980') // Default sample
  const [selectedNode, setSelectedNode] = useState(null)
  const [hops, setHops] = useState(2)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  const { data: graphData, refetch, isFetching } = useQuery({
    queryKey: ['graph', searchId, hops],
    queryFn: () => graphApi.getDatasetGraph(searchId, hops),
    enabled: !!searchId
  })

  const { data: nodeDetail } = useQuery({
    queryKey: ['node-predict', selectedNode],
    queryFn: () => predictApi.getDatasetTx(selectedNode),
    enabled: !!selectedNode
  })

  useEffect(() => {
    if (!containerRef.current || !graphData) return

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: graphData,
      style: cytoscapeStyles,
      layout: {
        name: 'fcose',
        animate: true,
        randomize: true,
        fit: true,
        padding: 50
      }
    })

    cyRef.current.on('tap', 'node', (evt) => {
      setSelectedNode(evt.target.id())
    })

    cyRef.current.on('tap', (evt) => {
      if (evt.target === cyRef.current) setSelectedNode(null)
    })

    return () => {
      if (cyRef.current) cyRef.current.destroy()
    }
  }, [graphData])

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit()
      cyRef.current.layout({ name: 'fcose', animate: true }).run()
    }
  }

  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }])
    const userInput = chatInput
    setChatInput('')
    setIsChatLoading(true)

    try {
      // Prepare context for the AI
      let context = 'You are an expert blockchain analyst. Explain the following in simple terms:\n'
      if (selectedNode && nodeDetail) {
        context += `- Selected transaction: ${selectedNode}\n`
        context += `- Risk probability: ${(nodeDetail.illicit_prob * 100).toFixed(2)}%\n`
        context += `- Label: ${nodeDetail.label}\n`
      }
      context += `User question: ${userInput}`

      const response = await axios.post('http://127.0.0.1:8000/api/explain', { prompt: context })
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.explanation }])
    } catch (err) {
      console.error('Chat error:', err)
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'I\'m sorry, I couldn\'t process that request right now. Let\'s try again later!' }])
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30 brightness-75"
          src="/animate_this_photo_rotoation_motion_202606202038.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.02]" />
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <div className="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-2xl font-black mb-1 tracking-tight">Graph Explorer</h2>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Dataset Mode</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Search Transaction ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && refetch()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white/30 text-white placeholder-slate-500"
                  placeholder="txid..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-slate-400">Hop Depth</label>
                <span className="text-xs font-mono text-blue-400">{hops}</span>
              </div>
              <input
                type="range" min="1" max="4" step="1"
                value={hops} onChange={(e) => setHops(parseInt(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-full bg-gradient-to-r from-white to-zinc-200 text-black py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              <span>{isFetching ? 'Loading...' : 'Update Graph'}</span>
            </button>
          </div>

          {/* Legend */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Legend</h3>
            <div className="space-y-2">
              {[
                { label: 'Licit', color: 'bg-green-500' },
                { label: 'Illicit', color: 'bg-red-500' },
                { label: 'Unknown / Predicted', color: 'bg-slate-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-xs text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Node Detail */}
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 border-t border-white/10 space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm">Node Info</h3>
                <RiskBadge level={nodeDetail?.label === 'illicit' ? 'HIGH' : 'LOW'} />
              </div>
              
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Transaction ID</p>
                <p className="font-mono text-xs text-blue-400 break-all">{selectedNode}</p>
              </div>

              {nodeDetail && (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Risk Prob</span>
                    <span className="font-mono text-blue-400">{(nodeDetail.illicit_prob * 100).toFixed(2)}%</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Top Drivers</p>
                    <div className="flex flex-wrap gap-1">
                      {nodeDetail.top_features.map(f => (
                        <span key={f} className="px-2 py-1 bg-white/10 rounded text-[9px] text-slate-300 border border-white/10">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <div ref={containerRef} className="w-full h-full relative z-10" />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-8 right-8 flex flex-col space-y-2 z-20">
            <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)} className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-black/60 text-white"><ZoomIn size={20}/></button>
            <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)} className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-black/60 text-white"><ZoomOut size={20}/></button>
            <button onClick={handleReset} className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-black/60 text-white"><Maximize size={20}/></button>
          </div>

          {isFetching && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-20">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3">
                <Loader2 className="animate-spin text-white" size={18} />
                <span className="text-sm font-medium text-white">Reconstructing Subgraph...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chatbot Panel */}
        <div className="w-96 bg-black/40 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">AI Analyst</h2>
              <p className="text-xs text-slate-400">Ask about transactions</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8">
                <p className="mb-2">Welcome!</p>
                <p className="text-xs">Select a node and ask me anything about the blockchain transaction.</p>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-white to-zinc-200 text-black' 
                    : 'bg-white/10 border border-white/10 text-white'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/10 text-white p-4 rounded-xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/30"
              placeholder="Ask about this transaction..."
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="p-3 bg-gradient-to-r from-white to-zinc-200 text-black rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
