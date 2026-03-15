import { useState } from 'react'
import Pitch from '../pitch/Pitch'

function isProgressive(startX, startY, endX, endY) {
  const startDist = Math.sqrt((120 - startX) ** 2 + (40 - startY) ** 2)
  const endDist = Math.sqrt((120 - endX) ** 2 + (40 - endY) ** 2)
  return (startDist - endDist) >= 10
}

export default function ProgressiveActions({ passes, carries, homeTeam, awayTeam }) {
  const [activeTeam, setActiveTeam] = useState('home')
  const [actionType, setActionType] = useState('passes')

  const teamName = activeTeam === 'home' ? homeTeam : awayTeam

  const progressivePasses = passes.filter(p => {
    if (p.team?.name !== teamName) return false
    if (p.pass?.outcome !== undefined) return false
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
  const sortedPlayers = Object.entries(topPlayers).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Progressive Actions</h3>
          <p className="text-sm text-slate-400 mt-1">Passes and carries that move the ball ≥10m toward goal</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {[
              { key: 'passes', label: 'Passes' },
              { key: 'carries', label: 'Carries' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActionType(t.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  actionType === t.key
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {[
              { key: 'home', label: homeTeam?.split(' ').pop() },
              { key: 'away', label: awayTeam?.split(' ').pop() },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTeam(t.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTeam === t.key
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Pitch height={360}>
        {actions.map((a, i) => {
          const start = a.location
          const end = actionType === 'passes' ? a.pass?.end_location : a.carry?.end_location
          if (!start || !end) return null

          const inFinalThird = end[0] >= 80
          const color = actionType === 'passes'
            ? (inFinalThird ? '#34d399' : '#22d3ee')
            : (inFinalThird ? '#fbbf24' : '#fb923c')

          return (
            <g key={i}>
              <line
                x1={start[0]} y1={start[1]}
                x2={end[0]} y2={end[1]}
                stroke={color}
                strokeWidth="0.4"
                opacity="0.5"
              />
              <circle cx={end[0]} cy={end[1]} r="0.6" fill={color} opacity="0.7" />
            </g>
          )
        })}
      </Pitch>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold font-mono text-emerald-400">{progressivePasses.length}</div>
          <div className="text-xs text-slate-400">Progressive passes</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold font-mono text-amber-400">{progressiveCarries.length}</div>
          <div className="text-xs text-slate-400">Progressive carries</div>
        </div>
      </div>

      {sortedPlayers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Top contributors</h4>
          <div className="space-y-1.5">
            {sortedPlayers.map(([name, count], i) => {
              const max = sortedPlayers[0][1]
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-4 text-right">{i + 1}</span>
                  <span className="text-sm text-slate-200 w-40 truncate">{name.split(' ').slice(-2).join(' ')}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-cyan-400 w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
