import { useState } from 'react'
import Pitch from '../pitch/Pitch'
import Section from '../ui/Section'
import Toggle from '../ui/Toggle'
import { computePassingNetwork } from '../../utils/statsbomb'

export default function PassingNetwork({ passes, homeTeam, awayTeam, startingXIs }) {
  const [activeTeam, setActiveTeam] = useState('home')

  const teamName = activeTeam === 'home' ? homeTeam : awayTeam
  const xi = startingXIs[teamName] || []
  const network = computePassingNetwork(passes, teamName, xi)
  const maxLink = Math.max(...network.links.map(l => l.count), 1)
  const maxPasses = Math.max(...Object.values(network.nodes).map(n => n.passes), 1)
  const teamColor = activeTeam === 'home' ? '#22d3ee' : '#fb7185'

  return (
    <Section
      title="Passing Network"
      subtitle="Average positions and pass connections between starters during open play"
      actions={
        <Toggle
          options={[
            { key: 'home', label: homeTeam?.split(' ').pop() },
            { key: 'away', label: awayTeam?.split(' ').pop() },
          ]}
          active={activeTeam}
          onChange={setActiveTeam}
          color={activeTeam === 'home' ? 'cyan' : 'rose'}
        />
      }
    >
      <Pitch height={400}>
        <defs>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Links */}
        {network.links.map((link, i) => {
          const from = network.nodes[link.from]
          const to = network.nodes[link.to]
          if (!from || !to) return null
          const t = link.count / maxLink
          const thickness = 0.4 + t * 2.8
          const opacity = 0.08 + t * 0.55

          return (
            <line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={teamColor}
              strokeWidth={thickness}
              opacity={opacity}
              strokeLinecap="round"
            />
          )
        })}

        {/* Nodes */}
        {Object.entries(network.nodes).map(([id, node]) => {
          const t = node.passes / maxPasses
          const size = 1.8 + t * 2.2
          const lastName = node.name?.split(' ').pop() || ''

          return (
            <g key={id} filter="url(#node-glow)">
              <circle
                cx={node.x} cy={node.y} r={size + 0.8}
                fill={teamColor} opacity="0.12"
              />
              <circle
                cx={node.x} cy={node.y} r={size}
                fill={teamColor} opacity="0.85"
                stroke="rgba(2,6,23,0.6)" strokeWidth="0.5"
              />
              <text
                x={node.x} y={node.y - size - 1.8}
                textAnchor="middle" fill="#e2e8f0"
                fontSize="2.4" fontFamily="Inter, sans-serif" fontWeight="600" letterSpacing="0.02em"
              >
                {lastName}
              </text>
            </g>
          )
        })}
      </Pitch>

      {/* Summary stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Players', value: Object.keys(network.nodes).length },
          { label: 'Connections', value: network.links.length },
          { label: 'Strongest link', value: network.links.length > 0 ? Math.max(...network.links.map(l => l.count)) : 0, suffix: ' passes' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.02] rounded-xl p-3.5 text-center border border-white/[0.03]">
            <div className="text-lg font-bold font-mono" style={{ color: teamColor }}>
              {s.value}{s.suffix || ''}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}
