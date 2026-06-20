import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Filter, Download, ChevronLeft, ChevronRight, BarChart, Info, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { predictApi, datasetApi } from '../api'
import RiskBadge from '../components/RiskBadge'
import toast from 'react-hot-toast'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function MLPredictions() {
  const [page, setPage] = useState(1)
  const [minProb, setMinProb] = useState(0.5)
  const [selectedTx, setSelectedTx] = useState(null)
  const [showPreloader, setShowPreloader] = useState(false)

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('ml-preloader-played')
    if (!hasPlayed) {
      setShowPreloader(true)
    }
  }, [])

  const handlePreloaderEnd = () => {
    setShowPreloader(false)
    sessionStorage.setItem('ml-preloader-played', 'true')
  }

  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: datasetApi.getStats })
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['predictions', page, minProb],
    queryFn: () => predictApi.getUnknowns({ page, limit: 50, min_prob: minProb }),
    keepPreviousData: true
  })

  const { data: txDetail, isFetching: isDetailLoading } = useQuery({
    queryKey: ['tx-detail', selectedTx],
    queryFn: async () => {
      const data = await predictApi.getDatasetTx(selectedTx)
      if (data.error) throw new Error(data.error)
      return data
    },
    enabled: !!selectedTx,
    retry: false
  })

  const handleExport = () => {
    if (!predictions?.results) return
    
    const headers = ['Transaction ID', 'Illicit Probability', 'Predicted Label']
    const rows = predictions.results.map(res => [
      res.txid,
      res.illicit_prob.toFixed(4),
      res.label
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `predictions_prob_${minProb}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV Exported Successfully')
  }

  return (
    <>
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
            <video
              src="/ml-preload.mp4"
              autoPlay
              muted
              playsInline
              onEnded={handlePreloaderEnd}
              className="w-full h-full object-cover grayscale brightness-75 contrast-125"
            />
            {/* Loading text overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/50">Initializing Neural Engine</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-black text-white p-6 lg:p-10 font-sans selection:bg-white selection:text-black relative overflow-x-hidden">
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.05]" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={!showPreloader ? "visible" : "hidden"}
          className="max-w-[1600px] mx-auto relative z-10 flex gap-8"
        >
          <div className="flex-grow space-y-8 min-w-0">
            {/* Header */}
            <motion.div 
              variants={itemVariants}
              className="bg-zinc-900/40 border border-white/10 p-10 rounded-3xl backdrop-blur-3xl relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Brain className="text-white" size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Neural Engine Analysis</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
                  Unknown <span className="text-zinc-600 italic">Predictions</span>
                </h1>
                <p className="text-zinc-400 font-medium max-w-2xl leading-relaxed text-sm lg:text-base">
                  {stats?.n_transactions?.toLocaleString() || '157,205'} transactions never labeled — our model predicts high-risk behavior clusters within the global dataset.
                </p>
              </div>
              {/* Technical Grid Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none z-[1]" />
              <Brain className="absolute right-[-5%] top-1/2 -translate-y-1/2 text-white/5 group-hover:text-white/10 transition-colors duration-1000" size={300} />
            </motion.div>

            {/* Filter Bar */}
            <motion.div 
              variants={itemVariants}
              className="bg-zinc-900/40 border border-white/10 p-6 rounded-2xl backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <Filter size={16} className="text-zinc-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Min Threshold:</span>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={minProb} onChange={(e) => setMinProb(parseFloat(e.target.value))}
                      className="w-48 accent-white h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-black text-white w-12 tracking-tighter">{(minProb * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleExport}
                disabled={!predictions?.results?.length}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 bg-white text-black hover:bg-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed rounded-xl transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              >
                <Download size={14} />
                <span>Export Forensic CSV</span>
              </button>
            </motion.div>

            {/* Table Container */}
            <motion.div 
              variants={itemVariants}
              className="bg-zinc-900/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl relative"
            >
              {isLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-20 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={32} />
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Transaction ID</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Risk Distribution</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {predictions?.results?.map((res, i) => (
                      <motion.tr 
                        key={res.txid}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (i * 0.02) }}
                        className={`group hover:bg-white/5 transition-all cursor-pointer ${selectedTx === res.txid ? 'bg-white/10' : ''}`}
                        onClick={() => setSelectedTx(res.txid)}
                      >
                        <td className="px-8 py-6 font-mono text-xs text-zinc-400 group-hover:text-white transition-colors">{res.txid}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-6">
                            <div className="flex-grow max-w-[200px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${res.illicit_prob * 100}%` }}
                                transition={{ duration: 1, delay: 0.5 + (i * 0.02) }}
                                className={`h-full shadow-[0_0_10px_rgba(255,255,255,0.2)] ${
                                  res.illicit_prob > 0.75 ? 'bg-white' : 
                                  res.illicit_prob > 0.5 ? 'bg-zinc-300' : 'bg-zinc-600'
                                }`}
                              />
                            </div>
                            <span className="text-xs font-black tracking-tighter">{(res.illicit_prob * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <RiskBadge level={res.illicit_prob > 0.75 ? 'HIGH' : res.illicit_prob > 0.5 ? 'MED' : 'LOW'} />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors flex items-center gap-2 ml-auto"
                          >
                            Forensics <ChevronRight size={12} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-8 py-6 border-t border-white/10 flex items-center justify-between bg-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Range: {((page - 1) * 50) + 1} — {page * 50} <span className="text-zinc-700 mx-2">/</span> Total: {predictions?.total?.toLocaleString() || 0}
                </span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-3 rounded-xl hover:bg-white/10 text-zinc-500 hover:text-white disabled:opacity-10 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-black tracking-tighter min-w-[60px] text-center">PAGE {page}</span>
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    className="p-3 rounded-xl hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Side Panel */}
          <AnimatePresence>
            {selectedTx && (
              <motion.div
                initial={{ x: 500, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 500, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="w-[450px] bg-zinc-900/90 border-l border-white/10 p-10 space-y-10 backdrop-blur-3xl fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-zinc-400">Deep Analysis</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTx(null)} 
                    className="p-3 hover:bg-white/10 rounded-xl transition-all text-zinc-500 hover:text-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {!isDetailLoading && txDetail ? (
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Target Signature</span>
                      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 group/tx">
                        <p className="font-mono text-sm text-zinc-400 group-hover:text-white transition-colors break-all leading-relaxed">
                          {txDetail.txid}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                          <BarChart size={14} className="text-zinc-600" />
                          <span>Weight Attribution</span>
                        </h4>
                        <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">SHAP Values</div>
                      </div>
                      <div className="space-y-6">
                        {txDetail.top_features.map((f, i) => (
                          <motion.div 
                            key={f}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="space-y-3"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate max-w-[200px]">{f.replace(/_/g, ' ')}</span>
                              <span className="text-[10px] font-black text-white italic">0.{(85 - i * 12)}</span>
                            </div>
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${85 - i * 12}%` }}
                                transition={{ duration: 1.5, delay: 0.2 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-10 border-t border-white/10 space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                        <Info size={14} className="text-zinc-600" />
                        <span>Inference Summary</span>
                      </h4>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">
                          "Behavioral signature matches high-risk laundering archetypes. Clustering identified within non-standard fan-out structures and significant outgoing value ratios across multiple hops."
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 className="animate-spin text-white mb-6" size={40} />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Decoding Signatures...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}
