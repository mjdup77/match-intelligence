import { useState } from 'react'
import Pitch from '../pitch/Pitch'
import Section from '../ui/Section'
import Toggle from '../ui/Toggle'

const OUTCOMES = {
  Goal: { color: '#34d399', glow: 'rgba(52,211,153,0.4)' },
  Saved: { color: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
  'Saved to Post': { color: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
  Blocked: { color: '#fb923c', glow: 'rgba(251,146,60,0.3)' },
  Off_T: { color: '#fb7185', glow: 'rgba(251,113,133,0.3)' },
  Wayward: { color: '#fb7185', glow: 'rgba(251,113,133,0.3)' },
  Post: { color: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
}

function getOutcome(name) {
  return OUTCOMES[name] || { color: '#64748b', glow: 'rgba(100,116,139,0.3)' }
}

export default function ShotMap({ shots, homeTeam, awayTeam }) {
  const [activeTeam, setActiveTeam] = useState('both')
  const [hoveredShot, setHoveredShot] = useState(null)

  const filtered = activeTeam === 'both'
    ? shots
    : shots.filter(s => s.team?.name === (activeTeam === 'home' ? homeTeam : awayTeam))

  const xg = (team) => shots.filter(s => s.team?.name === team).reduce((s, sh) => s + (sh.shot?.statsbomb_xg || 0), 0)

  return (
    <Section
      title="Shot Map"
      subtitle="Shot positions sized by xG value, coloured by outcome"
      actions={
        <Toggle
          options={[
            { key: 'both', label: 'Both' },
            { key: 'home', label: homeTeam?.split(' ').pop() },
            { key: 'away', label: awayTeam?.split(' ').pop() },
          ]}
          active={activeTeam}
          onChange={setActiveTeam}
        />
      }
    >
      <Pitch height={380}>
        {filtered.map((s, i) => {
          const x = s.location?.[0]
          const y = s.location?.[1]
          if (!x || !y) return null

          const xgVal = s.shot?.statsbomb_xg || 0.02
          const r = Math.max(1.2, Math.sqrt(xgVal) * 4.5)
          const isGoal = s.shot?.outcome?.name === 'Goal'
          const { color, glow } = getOutcome(s.shot?.outcome?.name)
          const isHovered = hoveredShot === s

          return (
            <g key={i}
              onMouseEnter={() => setHoveredShot(s)}
              onMouseLeave={() => setHoveredShot(null)}
              style={{ cursor: 'pointer' }}
            >
              {isGoal && (
                <>
                  <circle cx={x} cy={y} r={r + 2} fill="none" stroke={color} strokeWidth="0.3" opacity="0.3">
                    <animate attributeName="r" from={r + 1.5} to={r + 4} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.3" to="0" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              <circle
                cx={x} cy={y} r={isHovered ? r + 0.8 : r}
                fill={color}
                opacity={isGoal ? 0.9 : 0.65}
                stroke={isGoal ? 'rgba(255,255,255,0.6)' : isHovered ? 'rgba(255,255,255,0.3)' : 'none'}
                strokeWidth={isGoal ? 0.5 : 0.3}
                style={{ transition: 'r 0.2s ease, opacity 0.2s ease' }}
              />
            </g>
          )
        })}
      </Pitch>

      {/* Hover tooltip */}
      {hoveredShot && (
        <div className="mt-4 flex items-center gap-4 px-5 py-3 glass rounded-xl text-[13px] animate-fade-in">
          <span className="text-white font-semibold">{hoveredShot.player?.name}</span>
          <span className="text-slate-500 font-mono text-[12px]">{hoveredShot.minute}'</span>
          <span className="font-mono text-cyan-400 font-semibold">xG {(hoveredShot.shot?.statsbomb_xg || 0).toFixed(2)}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            hoveredShot.shot?.outcome?.name === 'Goal'
              ? 'bg-emerald-400/10 text-emerald-400'
              : 'bg-white/[0.04] text-slate-400'
          }`}>
            {hoveredShot.shot?.outcome?.name}
          </span>
          <span className="text-slate-600 text-[11px]">{hoveredShot.shot?.body_part?.name}</span>
        </div>
      )}

      {/* xG summary */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        {[
          { team: homeTeam, val: xg(homeTeam), color: 'cyan' },
          { team: awayTeam, val: xg(awayTeam), color: 'rose' },
        ].map(({ team, val, color }) => (
          <div key={team} className="bg-white/[0.02] rounded-xl p-4 text-center border border-white/[0.03]">
            <div className="text-[11px] text-slate-500 mb-1.5 tracking-wide">{team}</div>
            <div className={`text-2xl font-bold font-mono ${color === 'cyan' ? 'text-cyan-300' : 'text-rose-300'}`}>
              {val.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5 uppercase tracking-wider">xG</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {[
          { label: 'Goal', color: '#34d399' },
          { label: 'Saved', color: '#fbbf24' },
          { label: 'Blocked', color: '#fb923c' },
          { label: 'Off Target', color: '#fb7185' },
          { label: 'Post', color: '#a78bfa' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color, opacity: 0.8 }} />
            {l.label}
          </div>
        ))}
      </div>
    </Section>
  )
}
