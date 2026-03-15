import { computeXGTimeline } from '../../utils/statsbomb'

export default function XGTimeline({ shots, homeTeam, awayTeam }) {
  const timeline = computeXGTimeline(shots, homeTeam, awayTeam)
  if (timeline.length < 2) return null

  const maxXG = Math.max(
    ...timeline.map(t => Math.max(t.home, t.away)),
    0.5
  )

  const W = 800
  const H = 280
  const PAD = { top: 30, right: 30, bottom: 40, left: 50 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const scaleX = (min) => PAD.left + (min / 95) * plotW
  const scaleY = (val) => PAD.top + plotH - (val / (maxXG * 1.15)) * plotH

  const buildStepPath = (key) => {
    let d = ''
    for (let i = 0; i < timeline.length; i++) {
      const x = scaleX(timeline[i].minute)
      const y = scaleY(timeline[i][key])
      if (i === 0) {
        d += `M ${x} ${y}`
      } else {
        const prevY = scaleY(timeline[i - 1][key])
        d += ` L ${x} ${prevY} L ${x} ${y}`
      }
    }
    return d
  }

  const buildAreaPath = (key) => {
    const line = buildStepPath(key)
    const lastX = scaleX(timeline[timeline.length - 1].minute)
    const firstX = scaleX(timeline[0].minute)
    const baseY = scaleY(0)
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`
  }

  const goalEvents = timeline.filter(t => t.event?.isGoal)

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">xG Timeline</h3>
        <p className="text-sm text-slate-400 mt-1">Cumulative expected goals over the match</p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Grid lines */}
        {[0, 15, 30, 45, 60, 75, 90].map(min => (
          <g key={min}>
            <line x1={scaleX(min)} y1={PAD.top} x2={scaleX(min)} y2={PAD.top + plotH} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
            <text x={scaleX(min)} y={H - 10} textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="Inter">{min}'</text>
          </g>
        ))}

        {/* Half-time marker */}
        <line x1={scaleX(45)} y1={PAD.top} x2={scaleX(45)} y2={PAD.top + plotH} stroke="#475569" strokeWidth="1" />
        <text x={scaleX(45)} y={PAD.top - 8} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter">HT</text>

        {/* Y-axis */}
        {Array.from({ length: Math.ceil(maxXG * 1.15 / 0.5) + 1 }, (_, i) => i * 0.5).map(val => (
          <g key={val}>
            <line x1={PAD.left} y1={scaleY(val)} x2={PAD.left + plotW} y2={scaleY(val)} stroke="#334155" strokeWidth="0.5" strokeDasharray="2,4" />
            <text x={PAD.left - 8} y={scaleY(val) + 4} textAnchor="end" fill="#64748b" fontSize="11" fontFamily="JetBrains Mono">{val.toFixed(1)}</text>
          </g>
        ))}

        {/* Area fills */}
        <path d={buildAreaPath('home')} fill="#22d3ee" opacity="0.08" />
        <path d={buildAreaPath('away')} fill="#f43f5e" opacity="0.08" />

        {/* Lines */}
        <path d={buildStepPath('home')} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
        <path d={buildStepPath('away')} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

        {/* Goal markers */}
        {goalEvents.map((t, i) => {
          const isHome = t.event.team === homeTeam
          const x = scaleX(t.minute)
          const y = scaleY(isHome ? t.home : t.away)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill={isHome ? '#22d3ee' : '#f43f5e'} stroke="#0f172a" strokeWidth="1.5" />
              <text x={x} y={y + 3.5} textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="700" fontFamily="Inter">G</text>
            </g>
          )
        })}

        {/* End labels */}
        <text x={W - 10} y={scaleY(timeline[timeline.length - 2]?.home || 0) + 4} textAnchor="end" fill="#22d3ee" fontSize="13" fontWeight="700" fontFamily="JetBrains Mono">
          {(timeline[timeline.length - 2]?.home || 0).toFixed(2)}
        </text>
        <text x={W - 10} y={scaleY(timeline[timeline.length - 2]?.away || 0) - 6} textAnchor="end" fill="#f43f5e" fontSize="13" fontWeight="700" fontFamily="JetBrains Mono">
          {(timeline[timeline.length - 2]?.away || 0).toFixed(2)}
        </text>
      </svg>

      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-0.5 bg-cyan-400 rounded" />
          <span className="text-slate-300">{homeTeam}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-0.5 bg-rose-500 rounded" />
          <span className="text-slate-300">{awayTeam}</span>
        </div>
      </div>
    </div>
  )
}
