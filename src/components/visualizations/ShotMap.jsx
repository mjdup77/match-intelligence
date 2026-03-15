import { useState } from 'react'
import Pitch from '../pitch/Pitch'

const OUTCOME_COLORS = {
  Goal: '#34d399',
  Saved: '#fbbf24',
  'Saved to Post': '#fbbf24',
  Blocked: '#fb923c',
  Off_T: '#fb7185',
  Wayward: '#fb7185',
  Post: '#a78bfa',
}

function getColor(outcome) {
  return OUTCOME_COLORS[outcome] || '#94a3b8'
}

export default function ShotMap({ shots, homeTeam, awayTeam }) {
  const [activeTeam, setActiveTeam] = useState('both')
  const [hoveredShot, setHoveredShot] = useState(null)

  const filtered = activeTeam === 'both'
    ? shots
    : shots.filter(s => s.team?.name === (activeTeam === 'home' ? homeTeam : awayTeam))

  const homeXG = shots.filter(s => s.team?.name === homeTeam).reduce((s, sh) => s + (sh.shot?.statsbomb_xg || 0), 0)
  const awayXG = shots.filter(s => s.team?.name === awayTeam).reduce((s, sh) => s + (sh.shot?.statsbomb_xg || 0), 0)

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Shot Map</h3>
          <p className="text-sm text-slate-400 mt-1">Size = xG value · Colour = outcome</p>
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {[
            { key: 'both', label: 'Both' },
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

      <Pitch height={360}>
        {/* Only show right half for shots (attacking direction) */}
        {filtered.map((s, i) => {
          const x = s.location?.[0]
          const y = s.location?.[1]
          if (!x || !y) return null

          const xg = s.shot?.statsbomb_xg || 0.02
          const r = Math.max(1, Math.sqrt(xg) * 4)
          const isGoal = s.shot?.outcome?.name === 'Goal'
          const color = getColor(s.shot?.outcome?.name)

          return (
            <g key={i}
              onMouseEnter={() => setHoveredShot(s)}
              onMouseLeave={() => setHoveredShot(null)}
              style={{ cursor: 'pointer' }}
            >
              {isGoal && (
                <circle cx={x} cy={y} r={r + 1.5} fill="none" stroke={color} strokeWidth="0.4" opacity="0.5">
                  <animate attributeName="r" from={r + 1} to={r + 3} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={color}
                opacity={isGoal ? 0.9 : 0.7}
                stroke={isGoal ? '#fff' : 'none'}
                strokeWidth={isGoal ? 0.4 : 0}
              />
            </g>
          )
        })}
      </Pitch>

      {hoveredShot && (
        <div className="mt-3 px-4 py-2 bg-slate-800 rounded-lg text-sm flex items-center gap-4">
          <span className="text-white font-medium">{hoveredShot.player?.name}</span>
          <span className="text-slate-400">{hoveredShot.minute}'</span>
          <span className="font-mono text-cyan-400">xG {(hoveredShot.shot?.statsbomb_xg || 0).toFixed(2)}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            hoveredShot.shot?.outcome?.name === 'Goal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
          }`}>
            {hoveredShot.shot?.outcome?.name}
          </span>
          <span className="text-slate-500 text-xs">{hoveredShot.shot?.body_part?.name} · {hoveredShot.shot?.technique?.name}</span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">{homeTeam}</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{homeXG.toFixed(2)}</div>
          <div className="text-xs text-slate-500">xG</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">{awayTeam}</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{awayXG.toFixed(2)}</div>
          <div className="text-xs text-slate-500">xG</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 justify-center">
        {Object.entries({ Goal: '#34d399', Saved: '#fbbf24', Blocked: '#fb923c', 'Off Target': '#fb7185', Post: '#a78bfa' }).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
