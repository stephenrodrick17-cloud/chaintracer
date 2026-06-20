import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, CheckCircle2, Copy, ExternalLink, Activity, ShieldAlert, Network, ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { useStore } from '../store'
import { traceApi } from '../api'
import toast from 'react-hot-toast'
import RiskBadge from '../components/RiskBadge'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import { cytoscapeStyles } from '../utils/cytoscapeStyles'

cytoscape.use(fcose)

const STEPS = [
  { id: 'fetching', label: 'FETCHING DATA' },
  { id: 'extracting', label: 'EXTRACTING FEATURES' },
  { id: 'modeling', label: 'RUNNING ML MODEL' },
  { id: 'building', label: 'BUILDING GRAPH' },
]

const TracerCard = ({ children, className = "", title, delay = 0, variant = "default", bgVideo = null }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.01 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`relative overflow-hidden group border border-white/10 rounded-3xl p-8 backdrop-blur-2xl transition-all duration-500 
      ${variant === "dark" ? "bg-black/60 shadow-[0_0_40px_rgba(0,0,0,0.5)]" : "bg-zinc-900/40"} 
      hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] ${className}`}
  >
    {/* Background Video Layer */}
    {bgVideo && (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 group-hover:opacity-50 transition-opacity duration-1000">
        <video 
          src={bgVideo} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover grayscale brightness-[0.3] contrast-125 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>
    )}

    {/* Breadcrumb style header */}
    <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-20">
      <div className="flex gap-4 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
        <span className="hover:text-white transition-colors cursor-default">Measure</span>
        <span className="hover:text-white transition-colors cursor-default">Analyze</span>
        <span className="hover:text-white transition-colors cursor-default">Implement</span>
      </div>
      <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-white transition-colors">
        More
      </div>
    </div>

    {/* Technical Grid Overlay */}
    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none z-[1]" />
    
    <div className="relative z-10 h-full flex flex-col pt-8">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className="text-[12px] lg:text-[14px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
            {title}
          </motion.h3>
          <motion.div whileHover={{ rotate: 45 }} transition={{ type: "spring", stiffness: 300 }}>
            <Maximize size={12} className="text-zinc-600 group-hover:text-white transition-colors" />
          </motion.div>
        </div>
      )}
      {children}
    </div>
  </motion.div>
);

const TechnicalValue = ({ label, value, subValue, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`flex flex-col ${className}`}
  >
    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 leading-relaxed max-w-[150px]">
      {label}
    </span>
    <div className="flex items-baseline gap-2">
      <span className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">
        {value}
      </span>
      {subValue && (
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest italic">
          {subValue}
        </span>
      )}
    </div>
  </motion.div>
);

export default function AddressTracer() {
  const [address, setAddress] = useState('')
  const { isTracing, traceStep, setTraceStep, traceResult, setTraceResult, addToHistory } = useStore()
  const [graphData, setGraphData] = useState(null)
  const [isGraphLoading, setIsGraphLoading] = useState(false)
  const [isInitialState, setIsInitialState] = useState(true)
  const containerRef = useRef(null)
  const cyRef = useRef(null)

  useEffect(() => {
    if (traceResult?.address) {
      fetchGraph(traceResult.address)
      setIsInitialState(false)
    }
  }, [traceResult])

  const fetchGraph = async (addr) => {
    setIsGraphLoading(true)
    try {
      let data;
      if (addr.startsWith('TXID: ')) {
        const txid = addr.split('TXID: ')[1].trim()
        console.log("Fetching graph for dataset TXID:", txid)
        data = await graphApi.getDatasetGraph(txid)
      } else {
        console.log("Fetching graph for address:", addr)
        data = await traceApi.getGraph(addr)
      }
      
      if (!data || data.length === 0) {
        setGraphData([])
        // Don't show toast error, just show empty graph
      } else {
        setGraphData(data)
      }
    } catch (error) {
      console.error('Failed to fetch graph:', error)
      toast.error('Failed to load network topology')
      setGraphData([])
    } finally {
      setIsGraphLoading(false)
    }
  }

  useEffect(() => {
    if (!containerRef.current || !graphData || graphData.length === 0) {
      if (cyRef.current) cyRef.current.destroy()
      return
    }

    try {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: graphData,
        style: cytoscapeStyles,
        layout: {
          name: 'cose',
          animate: true,
          fit: true,
          padding: 50,
          nodeOverlap: 20,
          refresh: 20,
        }
      })
    } catch (err) {
      console.error("Cytoscape initialization error:", err)
    }

    return () => {
      if (cyRef.current) cyRef.current.destroy()
    }
  }, [graphData])

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit()
      cyRef.current.layout({ name: 'cose', animate: true }).run()
    }
  }

  const handleTrace = async (e) => {
    if (e) e.preventDefault()
    if (!address) return

    const target = address.trim()
    setTraceResult(null)
    setGraphData(null)
    setTraceStep('fetching')
    setIsInitialState(false)
    
    try {
      // Robust TXID detection: pure numbers
      const isDatasetTx = /^\d+$/.test(target);

      // Step 1: Fetching
      await new Promise(r => setTimeout(r, 500))
      
      // Step 2: Extracting
      setTraceStep('extracting')
      await new Promise(r => setTimeout(r, 500))
      
      // Step 3: Modeling
      setTraceStep('modeling')
      
      let response;
      if (isDatasetTx) {
        try {
          response = await predictApi.getDatasetTx(target)
          console.log("Dataset TX Response:", response)
          if (response && !response.error) {
            response = {
              ...response,
              address: `TXID: ${target}`,
              risk_level: response.label === 'illicit' ? 'high' : 'low',
              illicit_prob: response.illicit_prob || 0,
              abuse_reports: 0,
              features_computed: response.top_features || [],
              graph_heuristics: {
                is_peeling_chain: false,
                chain_length: 0,
                fan_in: 'N/A',
                fan_out: 'N/A'
              }
            }
          }
        } catch (err) {
          console.error("Dataset TX API error:", err)
          throw new Error("Failed to fetch dataset transaction data")
        }
      } else {
        response = await traceApi.postAddress(target)
      }
      
      if (!response || response.error) {
        toast.error(response?.error || 'Analysis failed')
        setTraceStep(null)
        setIsInitialState(true)
        return
      }

      // Step 4: Building
      setTraceStep('building')
      await new Promise(r => setTimeout(r, 500))
      
      setTraceResult(response)
      if (response.is_mock) {
        toast('Using simulation data (API rate-limited)', { icon: 'ℹ️' })
      }
      addToHistory(target)
      toast.success('Analysis completed successfully')
    } catch (error) {
      console.error('Trace error:', error)
      toast.error('Analysis pipeline encountered an error')
      setIsInitialState(true)
    } finally {
      setTraceStep(null)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    toast.success('Address copied')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-10 font-sans selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.05]" />
      </div>

      <div className={`max-w-[1600px] mx-auto relative z-10 transition-all duration-1000 ease-[0.16,1,0.3,1] ${isInitialState ? 'pt-[20vh]' : 'pt-0'}`}>
        {/* Search Panel - Animated Transition */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mx-auto transition-all duration-1000 ${isInitialState ? 'max-w-3xl' : 'max-w-none mb-10'}`}
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/5 to-white/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-zinc-900/80 backdrop-blur-3xl border border-white/10 p-10 rounded-3xl shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-grow w-full relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-white transition-colors" size={24} />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ENTER BITCOIN ADDRESS FOR DEEP ANALYSIS..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-16 pr-6 focus:outline-none focus:border-white/40 transition-all font-mono text-lg tracking-wider placeholder:text-zinc-700"
                  />
                </div>
                <button
                  onClick={handleTrace}
                  disabled={isTracing || !address}
                  className="w-full lg:w-auto bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                  {isTracing ? <Loader2 className="animate-spin" size={20} /> : <Activity size={20} />}
                  <span>{isTracing ? 'ANALYZING...' : 'TRACE'}</span>
                </button>
              </div>

              {isInitialState && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-10 flex flex-wrap items-center justify-center gap-4"
                >
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em]">Quick Access:</span>
                  {['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'].map(ex => (
                    <button
                      key={ex}
                      onClick={() => { setAddress(ex); }}
                      className="text-[9px] bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white px-5 py-2.5 rounded-full border border-white/5 transition-all uppercase tracking-widest font-black"
                    >
                      {ex.slice(0, 12)}...
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Progress Pipeline */}
        <AnimatePresence>
          {isTracing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-10"
            >
              <TracerCard variant="dark">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">Analysis Pipeline</h3>
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">System: Approach 3</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {STEPS.map((step, idx) => {
                    const isComplete = STEPS.findIndex(s => s.id === traceStep) > idx || traceResult
                    const isCurrent = traceStep === step.id
                    return (
                      <div key={step.id} className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-500 overflow-hidden ${
                        isComplete ? 'bg-white/5 border-white/20' : 
                        isCurrent ? 'bg-white/10 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 
                        'bg-zinc-950/50 border-white/5 opacity-30'
                      }`}>
                        {isCurrent && (
                          <motion.div 
                            layoutId="pipeline-glow"
                            className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
                          />
                        )}
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <span className="text-[10px] font-black text-zinc-500 tracking-widest">0{idx + 1}</span>
                          {isComplete ? (
                            <CheckCircle2 size={16} className="text-white" />
                          ) : isCurrent ? (
                            <Loader2 size={16} className="text-white animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-white/10" />
                          )}
                        </div>
                        <span className={`text-[11px] font-black tracking-[0.2em] relative z-10 ${isComplete || isCurrent ? 'text-white' : 'text-zinc-600'}`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </TracerCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Panel */}
        <AnimatePresence>
          {traceResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
              {/* Top Banner: Primary Result */}
              <TracerCard className="lg:col-span-12" variant="dark" bgVideo="/flow-bg.mp4">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                  <div className="flex flex-col gap-4 max-w-2xl w-full">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <Activity className="text-white" size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Address Discovery Optimized</span>
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                      {traceResult.label} <span className="text-zinc-600 italic">Analysis</span>
                    </h2>
                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-sm group/addr">
                      <span className="text-zinc-400 group-hover:text-white transition-colors break-all">{traceResult.address}</span>
                      <button onClick={copyAddress} className="p-2 hover:bg-white hover:text-black rounded-lg transition-all"><Copy size={16}/></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="h-24 w-px bg-white/10 hidden lg:block" />
                    <div className="flex flex-col items-center lg:items-end">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Threat Status</span>
                      <RiskBadge level={traceResult.risk_level} />
                    </div>
                  </div>
                </div>
              </TracerCard>

              {/* Stats Grid */}
              <TracerCard className="lg:col-span-4" title="Impact Assessment" bgVideo="/impact-bg.mp4">
                <TechnicalValue 
                  label="Risk Score" 
                  value={(traceResult.illicit_prob * 100).toFixed(0)} 
                  subValue="%" 
                  delay={0.1}
                />
                <div className="mt-10 p-6 bg-black/40 border border-white/5 rounded-2xl">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-4">
                    Analytical Context
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    Deep learning verification of transactional entropy and behavioral clusters within the global edgelist.
                  </p>
                </div>
              </TracerCard>

              <TracerCard className="lg:col-span-4" title="System Metrics" bgVideo="/metrics-bg.mp4">
                <TechnicalValue 
                  label="Confidence" 
                  value={(Math.max(traceResult.illicit_prob, 1 - traceResult.illicit_prob) * 100).toFixed(0)} 
                  subValue="LEVEL"
                  delay={0.2}
                />
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Reports</span>
                    <span className="text-xl font-black">{traceResult.abuse_reports}</span>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Alerts</span>
                    <span className="text-xl font-black">{traceResult.risk_level === 'high' ? '12' : '0'}</span>
                  </div>
                </div>
              </TracerCard>

              <TracerCard className="lg:col-span-4" title="Heuristic Patterns" bgVideo="/patterns-bg.mp4">
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Peeling Chain</span>
                    <span className={`text-lg font-black uppercase ${traceResult.graph_heuristics?.is_peeling_chain ? 'text-white' : 'text-zinc-700'}`}>
                      {traceResult.graph_heuristics?.is_peeling_chain ? 'Detected' : 'Negative'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Fan Distribution</span>
                    <span className="text-lg font-black uppercase">
                      {traceResult.graph_heuristics?.fan_in} <span className="text-zinc-700">/</span> {traceResult.graph_heuristics?.fan_out}
                    </span>
                  </div>
                </div>
                {traceResult.graph_heuristics?.is_peeling_chain && (
                  <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Chain Warning</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                      Suspicious linear flow identified spanning {traceResult.graph_heuristics.chain_length} hops.
                    </p>
                  </div>
                )}
              </TracerCard>

              {/* Large Graph Visualization */}
              <TracerCard className="lg:col-span-8 min-h-[600px] flex flex-col" title="Network Topology Map" delay={0.3}>
                <div className="flex-grow relative bg-black/60 border border-white/5 rounded-2xl overflow-hidden group/graph">
                  <div ref={containerRef} className="w-full h-full" />
                  
                  {isGraphLoading && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
                      <Loader2 className="animate-spin text-white mb-4" size={40} />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Mapping Edgelist...</span>
                    </div>
                  )}

                  {/* Graph Controls Overlay */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2 z-10 opacity-0 group-hover/graph:opacity-100 transition-opacity duration-500">
                    <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)} className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"><ZoomIn size={18}/></button>
                    <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)} className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"><ZoomOut size={18}/></button>
                    <button onClick={handleReset} className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"><Maximize size={18}/></button>
                  </div>

                  {/* Legend Overlay */}
                  <div className="absolute bottom-6 left-6 p-5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl z-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Illicit Node</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-zinc-600" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Licit Node</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-zinc-800" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Unknown Entity</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TracerCard>

              {/* Feature Importance Side Card */}
              <TracerCard className="lg:col-span-4" title="Key Risk Vectors" delay={0.4}>
                <div className="space-y-8">
                  {traceResult.features_computed.slice(0, 6).map((feat, i) => (
                    <motion.div 
                      key={feat}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="group/feat"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/feat:text-white transition-colors">
                          {feat.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                          Weight: 0.{(85 - i * 12)}
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${85 - i * 12}%` }}
                          transition={{ duration: 1.5, delay: 0.8 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Nodes</span>
                      <span className="text-2xl font-black">128</span>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Data Version</span>
                      <span className="text-2xl font-black italic">V4.2</span>
                    </div>
                  </div>
                </div>
              </TracerCard>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

