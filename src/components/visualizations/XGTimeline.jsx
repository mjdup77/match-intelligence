import Section from '../ui/Section'
import { computeXGTimeline } from '../../utils/statsbomb'

export default function XGTimeline({ shots, homeTeam, awayTeam }) {
  const timeline = computeXGTimeline(shots, homeTeam, awayTeam)
  if (timeline.length < 2) return null

  const maxXG = Math.max(...timeline.map(t => Math.max(t.home, t.away)), 0.5)
  const W = 800
  const H = 300
  const PAD = { top: 32, right: 32, bottom: 44, left: 52 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const scaleX = (min) => PAD.left + (min / 95) * plotW
  const scaleY = (val) => PAD.top + plotH - (val / (maxXG * 1.2)) * plotH

  const buildStepPath = (key) => {
    let d = ''
    for (let i = 0; i < timeline.length; i++) {
      const x = scaleX(timeline[i].minute)
      const y = scaleY(timeline[i][key])
      if (i === 0) d += `M ${x} ${y}`
      else {
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
    <Section title="xG Timeline" subtitle="Cumulative expected goals over the match">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="home-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="away-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.01" />
          </linearGradient>
          <filter id="line-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Gridlines */}
        {[0, 15, 30, 45, 60, 75, 90].map(min => (
          <g key={min}>
            <line x1={scaleX(min)} y1={PAD.top} x2={scaleX(min)} y2={PAD.top + plotH}
              stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <text x={scaleX(min)} y={H - 14} textAnchor="middle"
              fill="#475569" fontSize="10" fontFamily="Inter" fontWeight="500">{min}'</text>
          </g>
        ))}

        {/* HT line */}
        <line x1={scaleX(45)} y1={PAD.top - 4} x2={scaleX(45)} y2={PAD.top + plotH}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3,4" />
        <text x={scaleX(45)} y={PAD.top - 10} textAnchor="middle"
          fill="#475569" fontSize="9" fontFamily="Inter" fontWeight="600" letterSpacing="0.05em">HT</text>

        {/* Y-axis */}
        {Array.from({ length: Math.ceil(maxXG * 1.2 / 0.5) + 1 }, (_, i) => i * 0.5).map(val => (
          <g key={val}>
            <line x1={PAD.left} y1={scaleY(val)} x2={PAD.left + plotW} y2={scaleY(val)}
              stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <text x={PAD.left - 10} y={scaleY(val) + 3.5} textAnchor="end"
              fill="#475569" fontSize="10" fontFamily="JetBrains Mono" fontWeight="500">{val.toFixed(1)}</text>
          </g>
        ))}

        {/* Area fills */}
        <path d={buildAreaPath('home')} fill="url(#home-area)" />
        <path d={buildAreaPath('away')} fill="url(#away-area)" />

        {/* Lines */}
        <path d={buildStepPath('home')} fill="none" stroke="#22d3ee" strokeWidth="2.5" filter="url(#line-glow)" opacity="0.9" />
        <path d={buildStepPath('away')} fill="none" stroke="#fb7185" strokeWidth="2.5" filter="url(#line-glow)" opacity="0.9" />

        {/* Goal markers */}
        {goalEvents.map((t, i) => {
          const isHome = t.event.team === homeTeam
          const x = scaleX(t.minute)
          const y = scaleY(isHome ? t.home : t.away)
          const color = isHome ? '#22d3ee' : '#fb7185'
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill={color} opacity="0.1" />
              <circle cx={x} cy={y} r="5.5" fill={color} stroke="rgba(2,6,23,0.5)" strokeWidth="1.5" />
              <text x={x} y={y + 3.5} textAnchor="middle"
                fill="rgba(2,6,23,0.9)" fontSize="7" fontWeight="800" fontFamily="Inter">G</text>
            </g>
          )
        })}

        {/* End values */}
        {(() => {
          const last = timeline[timeline.length - 2]
          if (!last) return null
          return (
            <>
              <text x={W - 6} y={scaleY(last.home) + 4} textAnchor="end"
                fill="#22d3ee" fontSize="13" fontWeight="700" fontFamily="JetBrains Mono">{last.home.toFixed(2)}</text>
              <text x={W - 6} y={scaleY(last.away) - 6} textAnchor="end"
                fill="#fb7185" fontSize="13" fontWeight="700" fontFamily="JetBrains Mono">{last.away.toFixed(2)}</text>
            </>
          )
        })()}
      </svg>

      <div className="flex justify-center gap-8 mt-2">
        {[
          { team: homeTeam, color: 'bg-cyan-400' },
          { team: awayTeam, color: 'bg-rose-400' },
        ].map(l => (
          <div key={l.team} className="flex items-center gap-2 text-[12px] text-slate-400">
            <span className={`w-3 h-[2px] rounded-full ${l.color}`} />
            {l.team}
          </div>
        ))}
      </div>
    </Section>
  )
}
