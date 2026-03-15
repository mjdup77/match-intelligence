import { useState } from 'react'
import Pitch from '../pitch/Pitch'
import Section from '../ui/Section'
import Toggle from '../ui/Toggle'

export default function PressingMap({ pressures, defensiveActions, homeTeam, awayTeam }) {
  const [activeTeam, setActiveTeam] = useState('home')
  const [layer, setLayer] = useState('pressure')

  const teamName = activeTeam === 'home' ? homeTeam : awayTeam
  const data = layer === 'pressure'
    ? pressures.filter(e => e.team?.name === teamName && e.location)
    : defensiveActions.filter(e => e.team?.name === teamName && e.location)

  const zoneW = 20, zoneH = 20
  const zones = {}
  for (const e of data) {
    const key = `${Math.floor(e.location[0] / zoneW)}-${Math.floor(e.location[1] / zoneH)}`
    zones[key] = (zones[key] || 0) + 1
  }
  const maxCount = Math.max(...Object.values(zones), 1)

  const high = data.filter(e => e.location[0] >= 80).length
  const mid = data.filter(e => e.location[0] >= 40 && e.location[0] < 80).length
  const low = data.filter(e => e.location[0] < 40).length
  const zoneColor = layer === 'pressure' ? '#fbbf24' : '#fb7185'

  return (
    <Section
      title={layer === 'pressure' ? 'Pressing Zones' : 'Defensive Actions'}
      subtitle={layer === 'pressure' ? 'Where the team applies pressure' : 'Tackles, interceptions, blocks & recoveries'}
      actions={
        <div className="flex gap-2">
          <Toggle
            options={[
              { key: 'pressure', label: 'Pressing' },
              { key: 'defensive', label: 'Defensive' },
            ]}
            active={layer}
            onChange={setLayer}
            color={layer === 'pressure' ? 'amber' : 'rose'}
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
        {Object.entries(zones).map(([key, count]) => {
          const [zx, zy] = key.split('-').map(Number)
          const intensity = count / maxCount
          return (
            <rect key={key}
              x={zx * zoneW + 0.5} y={zy * zoneH + 0.5}
              width={zoneW - 1} height={zoneH - 1}
              fill={zoneColor}
              opacity={0.06 + intensity * 0.5}
              rx="1.5"
            />
          )
        })}
        {data.map((e, i) => (
          <circle key={i}
            cx={e.location[0]} cy={e.location[1]}
            r="0.7" fill={zoneColor} opacity="0.45"
          />
        ))}
      </Pitch>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Final third', value: high, color: '#fb7185' },
          { label: 'Middle third', value: mid, color: '#fbbf24' },
          { label: 'Own third', value: low, color: '#22d3ee' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.02] rounded-xl p-3.5 text-center border border-white/[0.03]">
            <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}
