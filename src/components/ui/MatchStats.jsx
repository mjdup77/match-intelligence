import { computeMatchStats } from '../../utils/statsbomb'

function StatBar({ label, home, away, format = 'number' }) {
  const homeVal = parseFloat(home)
  const awayVal = parseFloat(away)
  const total = homeVal + awayVal || 1
  const homeWidth = (homeVal / total) * 100
  const awayWidth = (awayVal / total) * 100
  const display = format === 'percent' ? [`${home}%`, `${away}%`] : [home, away]
  const homeLeads = homeVal > awayVal
  const awayLeads = awayVal > homeVal

  return (
    <div className="py-3 group">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[13px] font-mono font-semibold tabular-nums transition-colors ${homeLeads ? 'text-cyan-300' : 'text-slate-300'}`}>
          {display[0]}
        </span>
        <span className="text-[11px] text-slate-500 uppercase tracking-[0.1em] font-medium">{label}</span>
        <span className={`text-[13px] font-mono font-semibold tabular-nums transition-colors ${awayLeads ? 'text-rose-300' : 'text-slate-300'}`}>
          {display[1]}
        </span>
      </div>
      <div className="flex gap-1.5 h-[5px]">
        <div className="flex-1 rounded-full bg-white/[0.04] overflow-hidden flex justify-end">
          <div
            className="h-full rounded-full stat-bar-fill transition-all duration-1000 ease-out"
            style={{
              width: `${homeWidth}%`,
              background: homeLeads
                ? 'linear-gradient(90deg, rgba(34,211,238,0.3), rgba(34,211,238,0.7))'
                : 'linear-gradient(90deg, rgba(148,163,184,0.15), rgba(148,163,184,0.3))'
            }}
          />
        </div>
        <div className="flex-1 rounded-full bg-white/[0.04] overflow-hidden">
          <div
            className="h-full rounded-full stat-bar-fill transition-all duration-1000 ease-out"
            style={{
              width: `${awayWidth}%`,
              background: awayLeads
                ? 'linear-gradient(90deg, rgba(251,113,133,0.7), rgba(251,113,133,0.3))'
                : 'linear-gradient(90deg, rgba(148,163,184,0.3), rgba(148,163,184,0.15))'
            }}
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
    <div className="glass rounded-2xl p-7 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-semibold text-white tracking-tight">Match Statistics</h3>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-500">{data.teams.home.split(' ').pop()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-500">{data.teams.away.split(' ').pop()}</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/[0.03]">
        <StatBar label="Possession" home={stats.possession.home} away={stats.possession.away} format="percent" />
        <StatBar label="xG" home={stats.xg.home} away={stats.xg.away} />
        <StatBar label="Shots" home={stats.shots.home} away={stats.shots.away} />
        <StatBar label="On Target" home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} />
        <StatBar label="Passes" home={stats.passes.home} away={stats.passes.away} />
        <StatBar label="Pass Accuracy" home={stats.passAccuracy.home} away={stats.passAccuracy.away} format="percent" />
        <StatBar label="Progressive" home={stats.progressivePasses.home} away={stats.progressivePasses.away} />
      </div>
    </div>
  )
}
