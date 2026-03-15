import { useState } from 'react'
import Pitch from '../pitch/Pitch'

export default function PressingMap({ pressures, defensiveActions, homeTeam, awayTeam }) {
  const [activeTeam, setActiveTeam] = useState('home')
  const [layer, setLayer] = useState('pressure')

  const teamName = activeTeam === 'home' ? homeTeam : awayTeam

  const data = layer === 'pressure'
    ? pressures.filter(e => e.team?.name === teamName && e.location)
    : defensiveActions.filter(e => e.team?.name === teamName && e.location)

  const zoneWidth = 20
  const zoneHeight = 20
  const zones = {}

  for (const e of data) {
    const zx = Math.floor(e.location[0] / zoneWidth)
    const zy = Math.floor(e.location[1] / zoneHeight)
    const key = `${zx}-${zy}`
    zones[key] = (zones[key] || 0) + 1
  }

  const maxCount = Math.max(...Object.values(zones), 1)

  const highPressureActions = data.filter(e => e.location[0] >= 80).length
  const midPressureActions = data.filter(e => e.location[0] >= 40 && e.location[0] < 80).length
  const lowPressureActions = data.filter(e => e.location[0] < 40).length

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {layer === 'pressure' ? 'Pressing Intensity' : 'Defensive Actions'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {layer === 'pressure' ? 'Where the team applies pressure on the ball' : 'Tackles, interceptions, blocks & recoveries'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {[
              { key: 'pressure', label: 'Pressing' },
              { key: 'defensive', label: 'Defensive' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setLayer(t.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  layer === t.key
                    ? 'bg-amber-500/20 text-amber-400'
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
        {Object.entries(zones).map(([key, count]) => {
          const [zx, zy] = key.split('-').map(Number)
          const intensity = count / maxCount
          return (
            <rect
              key={key}
              x={zx * zoneWidth}
              y={zy * zoneHeight}
              width={zoneWidth}
              height={zoneHeight}
              fill={layer === 'pressure' ? '#fbbf24' : '#f43f5e'}
              opacity={0.1 + intensity * 0.6}
              rx="1"
            />
          )
        })}

        {data.map((e, i) => (
          <circle
            key={i}
            cx={e.location[0]}
            cy={e.location[1]}
            r="0.8"
            fill={layer === 'pressure' ? '#fbbf24' : '#f43f5e'}
            opacity="0.5"
          />
        ))}
      </Pitch>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-rose-400">{highPressureActions}</div>
          <div className="text-xs text-slate-400">High (final 3rd)</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">{midPressureActions}</div>
          <div className="text-xs text-slate-400">Mid (middle 3rd)</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-cyan-400">{lowPressureActions}</div>
          <div className="text-xs text-slate-400">Low (own 3rd)</div>
        </div>
      </div>
    </div>
  )
}
