import { useState } from 'react'
import Pitch from '../pitch/Pitch'
import Section from '../ui/Section'
import Toggle from '../ui/Toggle'

function isProgressive(sx, sy, ex, ey) {
  const startD = Math.sqrt((120 - sx) ** 2 + (40 - sy) ** 2)
  const endD = Math.sqrt((120 - ex) ** 2 + (40 - ey) ** 2)
  return (startD - endD) >= 10
}

export default function ProgressiveActions({ passes, carries, homeTeam, awayTeam }) {
  const [activeTeam, setActiveTeam] = useState('home')
  const [actionType, setActionType] = useState('passes')

  const teamName = activeTeam === 'home' ? homeTeam : awayTeam

  const progressivePasses = passes.filter(p => {
    if (p.team?.name !== teamName || p.pass?.outcome !== undefined) return false
    if (!p.location || !p.pass?.end_location) return false
    return isProgressive(p.location[0], p.location[1], p.pass.end_location[0], p.pass.end_location[1])
  })

  const progressiveCarries = carries.filter(c => {
    if (c.team?.name !== teamName) return false
    if (!c.location || !c.carry?.end_location) return false
    return isProgressive(c.location[0], c.location[1], c.carry.end_location[0], c.carry.end_location[1])
  })

  const actions = actionType === 'passes' ? progressivePasses : progressiveCarries

  const topPlayers = {}
  for (const a of actions) {
    const name = a.player?.name || 'Unknown'
    topPlayers[name] = (topPlayers[name] || 0) + 1
  }
  const sorted = Object.entries(topPlayers).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxPlayerCount = sorted[0]?.[1] || 1

  return (
    <Section
      title="Progressive Actions"
      subtitle="Passes and carries moving the ball ≥10m toward goal"
      actions={
        <div className="flex gap-2">
          <Toggle
            options={[
              { key: 'passes', label: 'Passes' },
              { key: 'carries', label: 'Carries' },
            ]}
            active={actionType}
            onChange={setActionType}
            color="emerald"
          />
          <Toggle
            options={[
              { key: 'home', label: homeTeam?.split(' ').pop() },
              { key: 'away', label: awayTeam?.split(' ').pop() },
            ]}
            active={activeTeam}
            onChange={setActiveTeam}
          />
        </div>
      }
    >
      <Pitch height={380}>
        {actions.map((a, i) => {
          const start = a.location
          const end = actionType === 'passes' ? a.pass?.end_location : a.carry?.end_location
          if (!start || !end) return null
          const inFinal = end[0] >= 80
          const color = actionType === 'passes'
            ? (inFinal ? '#34d399' : 'rgba(34,211,238,0.6)')
            : (inFinal ? '#fbbf24' : 'rgba(251,146,60,0.6)')

          return (
            <g key={i}>
              <line
                x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]}
                stroke={color} strokeWidth="0.35" opacity="0.45" strokeLinecap="round"
              />
              <circle cx={end[0]} cy={end[1]} r="0.55" fill={color} opacity="0.7" />
            </g>
          )
        })}
      </Pitch>

      {/* Counts */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="bg-white/[0.02] rounded-xl p-3.5 text-center border border-white/[0.03]">
          <div className="text-lg font-bold font-mono text-emerald-400">{progressivePasses.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Prog. passes</div>
        </div>
        <div className="bg-white/[0.02] rounded-xl p-3.5 text-center border border-white/[0.03]">
          <div className="text-lg font-bold font-mono text-amber-400">{progressiveCarries.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Prog. carries</div>
        </div>
      </div>

      {/* Top contributors */}
      {sorted.length > 0 && (
        <div className="mt-5">
          <h4 className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-semibold mb-3">Top Contributors</h4>
          <div className="space-y-2">
            {sorted.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-[11px] text-slate-600 w-4 text-right font-mono">{i + 1}</span>
                <span className="text-[13px] text-slate-300 w-36 truncate font-medium">{name.split(' ').slice(-2).join(' ')}</span>
                <div className="flex-1 h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(count / maxPlayerCount) * 100}%`,
                      background: 'linear-gradient(90deg, rgba(34,211,238,0.5), rgba(52,211,153,0.7))'
                    }}
                  />
                </div>
                <span className="text-[12px] font-mono text-cyan-400 w-6 text-right font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}
