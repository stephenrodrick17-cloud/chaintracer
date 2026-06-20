export default function RiskBadge({ level }) {
  const styles = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/50',
    MED: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    LOW: 'bg-green-500/20 text-green-400 border-green-500/50',
    UNKNOWN: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  }

  const label = level?.toUpperCase() || 'UNKNOWN'
  const currentStyle = styles[label] || styles.UNKNOWN

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentStyle}`}>
      {label}
    </span>
  )
}
