import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { LayoutDashboard, AlertCircle, ShieldCheck, Search, TrendingUp, BarChart3, ArrowUpRight, Activity, Globe, Shield } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import StatCard from '../components/StatCard'
import RiskBadge from '../components/RiskBadge'
import { datasetApi, traceApi, predictApi } from '../api'

const COLORS = ['#ffffff', '#475569', '#1e293b', '#0f172a']

const BentoCard = ({ children, className = "", title, icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.01 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
    <div className="relative z-10 h-full flex flex-col">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <motion.h3 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"
          >
            {Icon && <Icon size={14} />}
            {title}
          </motion.h3>
          <motion.div
            whileHover={{ rotate: 45 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ArrowUpRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
          </motion.div>
        </div>
      )}
      {children}
    </div>
  </motion.div>
);

const AnimatedText = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export default function Dashboard() {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: datasetApi.getStats })
  const { data: timeline } = useQuery({ queryKey: ['timeline'], queryFn: datasetApi.getTimeline })
  const { data: history } = useQuery({ queryKey: ['history'], queryFn: traceApi.getHistory, refetchInterval: 30000 })
  const { data: unknowns } = useQuery({ 
    queryKey: ['unknowns-top'], 
    queryFn: () => predictApi.getUnknowns({ page: 1, limit: 10, min_prob: 0.5 }) 
  })

  const donutData = [
    { name: 'Licit', value: stats?.n_classes_licit || 42019 },
    { name: 'Illicit', value: stats?.n_classes_illicit || 4545 },
    { name: 'Unknown Flagged', value: 1200 },
    { name: 'Unknown Clean', value: (stats?.n_classes_unknown || 157205) - 1200 },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-10 font-sans selection:bg-white selection:text-black">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        {/* TOP SECTION: Header & Central Object */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Title Card */}
          <BentoCard className="lg:col-span-8 min-h-[400px] flex flex-col justify-end p-12" delay={0.1}>
            <div className="absolute top-12 left-12 flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <motion.span whileHover={{ color: '#fff' }} className="transition-colors cursor-default">Measure</motion.span>
              <motion.span whileHover={{ color: '#fff' }} className="transition-colors cursor-default">Analyze</motion.span>
              <motion.span whileHover={{ color: '#fff' }} className="transition-colors cursor-default">Implement</motion.span>
            </div>
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase mb-6"
            >
              CRYPTO<br />ANALYSIS<br /><span className="text-gray-500 italic">DASHBOARD</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-md text-gray-400 font-medium leading-relaxed"
            >
              Real-time cryptocurrency threat detection powered by advanced 
              machine learning and blockchain forensics.
            </motion.p>
            
            {/* Artistic Grid Overlay */}
            <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>
          </BentoCard>

          {/* Central Object Card */}
          <BentoCard className="lg:col-span-4 aspect-square lg:aspect-auto flex items-center justify-center p-0 overflow-hidden" delay={0.2}>
            <div className="w-full h-full relative group">
              {/* Glass Frame for Video */}
              <div className="absolute inset-4 z-20 border border-white/20 rounded-2xl backdrop-blur-sm bg-white/5 pointer-events-none group-hover:border-white/40 transition-colors" />
              <motion.video 
                src="/central-object.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover grayscale brightness-125 contrast-125 transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
              
              {/* Interactive Label */}
              <div className="absolute bottom-8 left-8 z-20">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Core Engine Active</span>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* MIDDLE SECTION: Stats & Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BentoCard title="Transactions" icon={Activity} delay={0.3}>
            {/* Background Logo - Filling the card and blending */}
            <img 
              src="/currency-logo.png" 
              className="absolute inset-0 w-full h-full object-cover opacity-5 grayscale invert brightness-150 group-hover:scale-105 group-hover:opacity-10 transition-all duration-1000 pointer-events-none z-0" 
              alt=""
            />
            <div className="mt-auto relative z-10">
              <AnimatedText delay={0.4}>
                <span className="text-5xl lg:text-6xl font-black tracking-tighter">
                  {stats?.n_transactions?.toLocaleString() || '203,769'}
                </span>
              </AnimatedText>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">
                <TrendingUp size={12} className="text-white" />
                <span className="text-white">+2.4%</span> Increase in 24h
              </div>
            </div>
          </BentoCard>

          <BentoCard title="Illicit Detected" icon={AlertCircle} delay={0.4}>
            {/* Background Logo - Filling the card and blending */}
            <img 
              src="/eye-logo.png" 
              className="absolute inset-0 w-full h-full object-cover opacity-5 grayscale invert brightness-150 group-hover:scale-105 group-hover:opacity-10 transition-all duration-1000 pointer-events-none z-0" 
              alt=""
            />
            <div className="mt-auto relative z-10">
              <AnimatedText delay={0.5}>
                <span className="text-5xl lg:text-6xl font-black tracking-tighter text-gray-400">
                  {stats?.n_classes_illicit?.toLocaleString() || '4,545'}
                </span>
              </AnimatedText>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">
                <Globe size={12} className="text-white" />
                <span className="text-white">Active</span> Node Monitoring
              </div>
            </div>
          </BentoCard>

          <BentoCard className="lg:col-span-2" title="Activity Timeline" icon={TrendingUp} delay={0.5}>
            <div className="flex justify-between items-end mb-2">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Illicit Avg</span>
                  <span className="text-lg font-black">{Math.round(timeline?.[0]?.illicit || 45).toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Unknown Avg</span>
                  <span className="text-lg font-black text-gray-400">{Math.round(timeline?.[0]?.unknown || 1572).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                Live Stream
              </div>
            </div>
            <div className="h-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <Line type="monotone" dataKey="illicit" stroke="#fff" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="unknown" stroke="#475569" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>
        </div>

        {/* BOTTOM SECTION: Distribution & History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <BentoCard className="lg:col-span-4" title="Risk Distribution" icon={Shield} delay={0.6}>
            <div className="flex flex-col h-full">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black uppercase tracking-tighter">Total</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {stats?.n_transactions?.toLocaleString() || '203,769'}
                  </span>
                </div>
              </div>
              
              {/* Detailed Numbers Legend */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {donutData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{item.name}</span>
                      <span className="text-sm font-black">{item.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          <BentoCard className="lg:col-span-8" title="Recent Analysis History" icon={Search} delay={0.7}>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                    <th className="px-4 pb-2">Address</th>
                    <th className="px-4 pb-2">Risk Level</th>
                    <th className="px-4 pb-2">Probability</th>
                    <th className="px-4 pb-2 text-right">Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {(history || []).slice(0, 5).map((item, i) => (
                    <motion.tr 
                      key={item?.address || i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (i * 0.1) }}
                      className="group hover:bg-white/5 transition-colors duration-300"
                    >
                      <td className="px-4 py-4 font-mono text-xs text-gray-400 group-hover:text-white">
                        {item?.address ? `${item.address.slice(0, 12)}...` : 'N/A'}
                      </td>
                      <td className="px-4 py-4">
                        <RiskBadge level={item?.risk_level} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-white/5 rounded-full h-1 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(item?.illicit_prob || 0) * 100}%` }}
                              transition={{ duration: 1, delay: 1 + (i * 0.1) }}
                              className="bg-white h-full" 
                            />
                          </div>
                          <span className="text-[10px] font-bold">{(item?.illicit_prob * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-500 group-hover:text-white">
                        {item?.abuse_reports || 0}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  )
}
