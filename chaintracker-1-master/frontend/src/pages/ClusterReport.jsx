import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Users, ShieldAlert, ExternalLink, Search, Loader2, ChevronRight, LayoutGrid, X, Activity, Globe, Info } from 'lucide-react'
import { reportApi } from '../api'
import RiskBadge from '../components/RiskBadge'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const ClusterDetailOverlay = ({ cluster, onClose }) => {
  if (!cluster) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-10 bg-black/90 backdrop-blur-2xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-900/80 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-start bg-gradient-to-br from-white/5 to-transparent">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">{cluster.id}</span>
              <RiskBadge level={cluster.risk_level} />
            </div>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase">{cluster.label}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all text-zinc-500 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Summary Metrics */}
            <div className="lg:col-span-4 space-y-8">
              <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                  <Activity size={14} /> Cluster Dynamics
                </h4>
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Total Entities</span>
                    <span className="text-3xl font-black">{cluster.size} <span className="text-sm text-zinc-500">NODES</span></span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Mean Illicit Probability</span>
                    <span className="text-3xl font-black">{(cluster.avg_prob * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Connectivity Score</span>
                    <span className="text-3xl font-black">0.84 <span className="text-sm text-zinc-500">INDEX</span></span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Forensic Insight</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Topological modularity suggests high intra-cluster coordination, characteristic of automated {cluster.label.toLowerCase()} behavior. Behavioral entropy remains within predicted illicit thresholds.
                </p>
              </div>
            </div>

            {/* Right: Member Forensics */}
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Identity Signatures (Top Members)</h4>
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Showing 5 of {cluster.size}</span>
                </div>
                <div className="space-y-3">
                  {cluster.members.map((member, i) => (
                    <div 
                      key={member}
                      className="group/item flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-black text-zinc-500">
                          0{i+1}
                        </div>
                        <span className="text-xs font-mono text-zinc-300 group-hover/item:text-white transition-colors">{member}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-1 w-20 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.random() * 40 + 60}%` }}
                            className="h-full bg-white/40"
                          />
                        </div>
                        <ExternalLink size={14} className="text-zinc-700 group-hover/item:text-white cursor-pointer transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavior Analysis Chart Stub */}
              <div className="p-8 bg-black/40 rounded-3xl border border-white/5 h-48 relative overflow-hidden flex flex-col justify-end">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Globe size={160} className="animate-spin-slow" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Behavioral Entropy Profile</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Monitoring</span>
                  </div>
                  <div className="flex items-end gap-1 h-12">
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [20, Math.random() * 40 + 10, 20] }}
                        transition={{ duration: 1.5 + Math.random(), repeat: Infinity }}
                        className="flex-grow bg-white/20 rounded-t-sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Overlay Decor */}
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.02] pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};

export default function ClusterReport() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showPreloader, setShowPreloader] = useState(false)
  const [selectedCluster, setSelectedCluster] = useState(null)

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('cluster-preloader-played')
    if (!hasPlayed) {
      setShowPreloader(true)
    }
  }, [])

  const handlePreloaderEnd = () => {
    setShowPreloader(false)
    sessionStorage.setItem('cluster-preloader-played', 'true')
  }

  const { data: clusters, isLoading } = useQuery({ 
    queryKey: ['clusters'], 
    queryFn: reportApi.getAllClusters
  })

  const filteredClusters = clusters?.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.members.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <>
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
            <video
              src="/cluster-preload.mp4"
              autoPlay
              muted
              playsInline
              onEnded={handlePreloaderEnd}
              className="w-full h-full object-cover grayscale brightness-75 contrast-125"
            />
            {/* Transparent Black Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/50">Assembling Communities</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-black text-white p-6 lg:p-10 font-sans selection:bg-white selection:text-black relative overflow-x-hidden">
        {/* Animated Background Video */}
        {!showPreloader && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <video
              src="/cluster-bg.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover grayscale brightness-50"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
          </motion.div>
        )}

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
          className="max-w-[1600px] mx-auto relative z-10 space-y-10"
        >
          {/* Header */}
          <motion.div 
            variants={itemVariants}
            className="bg-zinc-900/40 border border-white/10 p-10 rounded-3xl backdrop-blur-3xl relative overflow-hidden group flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
          >
            <div className="relative z-10 flex-grow">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <LayoutGrid className="text-white" size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Graph Community Analysis</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
                Cluster <span className="text-zinc-600 italic">Forensics</span>
              </h1>
              <p className="text-zinc-400 font-medium max-w-2xl leading-relaxed text-sm lg:text-base">
                Identification of autonomous entity groups via topological modularity and behavioral heuristics within the transaction edgelist.
              </p>
            </div>

            <div className="relative z-10 w-full md:w-auto">
              <div className="flex items-center gap-4 bg-black/40 border border-white/10 p-4 rounded-2xl group-hover:border-white/30 transition-all">
                <Search size={18} className="text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="SEARCH CLUSTERS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm w-full md:w-64 text-white placeholder-zinc-700 font-mono tracking-widest"
                />
              </div>
            </div>

            {/* Technical Grid Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none z-[1]" />
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1,2,3,4,5,6].map(i => (
                <div key={i} className="h-80 bg-zinc-900/20 animate-pulse rounded-3xl border border-white/5 backdrop-blur-sm" />
              ))
            ) : filteredClusters?.length === 0 ? (
              <motion.div variants={itemVariants} className="col-span-full py-40 text-center space-y-6 bg-zinc-900/20 rounded-3xl border border-white/5">
                <Search size={48} className="mx-auto text-zinc-800" />
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">No matching clusters identified in local database.</p>
              </motion.div>
            ) : (
              filteredClusters?.map((cluster, i) => (
                <motion.div
                  key={cluster.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="bg-zinc-900/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl hover:border-white/20 transition-all group cursor-pointer relative"
                >
                  {/* Status Bar */}
                  <div className={`h-1.5 w-full ${
                    cluster.risk_level === 'HIGH' ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 
                    cluster.risk_level === 'MED' ? 'bg-zinc-400' : 'bg-zinc-700'
                  }`} />
                  
                  <div className="p-8 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] block">{cluster.id}</span>
                        <h3 className="font-black text-xl lg:text-2xl tracking-tighter uppercase group-hover:text-white transition-colors">{cluster.label}</h3>
                      </div>
                      <RiskBadge level={cluster.risk_level} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Network Size</p>
                        <div className="flex items-center gap-3">
                          <Users size={14} className="text-zinc-400" />
                          <span className="text-lg font-black tracking-tighter">{cluster.size} <span className="text-[10px] text-zinc-600">NODES</span></span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Aggregate Risk</p>
                        <div className="flex items-center gap-3">
                          <ShieldAlert size={14} className="text-zinc-400" />
                          <span className="text-lg font-black tracking-tighter">{(cluster.avg_prob * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Identity Signatures</p>
                      <div className="space-y-2">
                        {cluster.members.slice(0, 2).map(m => (
                          <div key={m} className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-black/40 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <span className="truncate">{m.slice(0, 20)}...</span>
                            <ChevronRight size={12} className="text-zinc-700 group-hover:text-white transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedCluster(cluster)}
                      className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:bg-white group-hover:text-black transition-all duration-500"
                    >
                      View Deep Report
                    </button>
                  </div>

                  {/* Technical Grid Overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.02] pointer-events-none" />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedCluster && (
          <ClusterDetailOverlay 
            cluster={selectedCluster} 
            onClose={() => setSelectedCluster(null)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}
