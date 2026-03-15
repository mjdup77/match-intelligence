import { useState } from 'react'
import Pitch from '../pitch/Pitch'
import { computePassingNetwork } from '../../utils/statsbomb'

export default function PassingNetwork({ passes, homeTeam, awayTeam, startingXIs }) {
  const [activeTeam, setActiveTeam] = useState('home')

  const teamName = activeTeam === 'home' ? homeTeam : awayTeam
  const xi = startingXIs[teamName] || []
  const network = computePassingNetwork(passes, teamName, xi)

  const maxLinkCount = Math.max(...network.links.map(l => l.count), 1)
  const maxPasses = Math.max(...Object.values(network.nodes).map(n => n.passes), 1)

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Passing Network</h3>
          <p className="text-sm text-slate-400 mt-1">Average positions &amp; pass connections (starters, open play)</p>
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

      <Pitch height={380}>
        {network.links.map((link, i) => {
          const from = network.nodes[link.from]
          const to = network.nodes[link.to]
          if (!from || !to) return null
          const thickness = 0.3 + (link.count / maxLinkCount) * 2.5
          const opacity = 0.15 + (link.count / maxLinkCount) * 0.6

          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#22d3ee"
              strokeWidth={thickness}
              opacity={opacity}
              strokeLinecap="round"
            />
          )
        })}

        {Object.entries(network.nodes).map(([id, node]) => {
          const size = 1.5 + (node.passes / maxPasses) * 2
          const firstName = node.name?.split(' ').pop() || ''
          return (
            <g key={id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={size}
                fill="#22d3ee"
                opacity="0.9"
                stroke="#0f172a"
                strokeWidth="0.4"
              />
              <text
                x={node.x}
                y={node.y - size - 1.2}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="2.2"
                fontFamily="Inter, sans-serif"
                fontWeight="500"
              >
                {firstName}
              </text>
            </g>
          )
        })}
      </Pitch>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-cyan-400">
            {Object.keys(network.nodes).length}
          </div>
          <div className="text-xs text-slate-400">Players mapped</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-cyan-400">
            {network.links.length}
          </div>
          <div className="text-xs text-slate-400">Pass connections</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-cyan-400">
            {network.links.length > 0 ? Math.max(...network.links.map(l => l.count)) : 0}
          </div>
          <div className="text-xs text-slate-400">Top link passes</div>
        </div>
      </div>
    </div>
  )
}
