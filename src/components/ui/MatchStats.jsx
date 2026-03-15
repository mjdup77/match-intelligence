import { computeMatchStats } from '../../utils/statsbomb'

function StatBar({ label, home, away, format = 'number', color = 'cyan' }) {
  const homeVal = parseFloat(home)
  const awayVal = parseFloat(away)
  const total = homeVal + awayVal || 1

  const homeWidth = (homeVal / total) * 100
  const awayWidth = (awayVal / total) * 100

  const display = format === 'percent'
    ? [`${home}%`, `${away}%`]
    : [home, away]

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-mono font-semibold text-white w-12 text-left">{display[0]}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-mono font-semibold text-white w-12 text-right">{display[1]}</span>
      </div>
      <div className="flex gap-1 h-1.5">
        <div className="flex-1 bg-slate-800 rounded-full overflow-hidden flex justify-end">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-700"
            style={{ width: `${homeWidth}%` }}
          />
        </div>
        <div className="flex-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-rose-400 transition-all duration-700"
            style={{ width: `${awayWidth}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function MatchStatsPanel({ data }) {
  if (!data) return null

  const stats = computeMatchStats(data)

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 animate-fade-in">
      <h3 className="text-lg font-semibold text-white mb-4">Match Statistics</h3>

      <div className="space-y-1">
        <StatBar label="Possession" home={stats.possession.home} away={stats.possession.away} format="percent" />
        <StatBar label="xG" home={stats.xg.home} away={stats.xg.away} />
        <StatBar label="Shots" home={stats.shots.home} away={stats.shots.away} />
        <StatBar label="On Target" home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} />
        <StatBar label="Passes" home={stats.passes.home} away={stats.passes.away} />
        <StatBar label="Pass Accuracy" home={stats.passAccuracy.home} away={stats.passAccuracy.away} format="percent" />
        <StatBar label="Progressive Passes" home={stats.progressivePasses.home} away={stats.progressivePasses.away} />
      </div>
    </div>
  )
}
