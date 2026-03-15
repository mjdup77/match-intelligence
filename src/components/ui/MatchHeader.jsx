export default function MatchHeader({ match, competition, data }) {
  if (!match || !data) return null

  const { teams, goals, formations } = data

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400 font-medium mb-4">
          {competition?.label} · {match.competition_stage?.name || 'Match'}
        </div>

        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-4">
          <div className="text-right flex-1">
            <h2 className="text-xl sm:text-3xl font-bold text-white">{teams.home}</h2>
            <div className="text-sm text-slate-400 mt-1">{formations[teams.home] || ''}</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl font-black font-mono text-white">{goals[teams.home]}</span>
            <span className="text-2xl text-slate-600">—</span>
            <span className="text-4xl sm:text-5xl font-black font-mono text-white">{goals[teams.away]}</span>
          </div>

          <div className="text-left flex-1">
            <h2 className="text-xl sm:text-3xl font-bold text-white">{teams.away}</h2>
            <div className="text-sm text-slate-400 mt-1">{formations[teams.away] || ''}</div>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          {match.match_date && new Date(match.match_date).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
          {match.stadium?.name && <span> · {match.stadium.name}</span>}
          {match.referee?.name && <span> · Ref: {match.referee.name}</span>}
        </div>
      </div>
    </div>
  )
}
