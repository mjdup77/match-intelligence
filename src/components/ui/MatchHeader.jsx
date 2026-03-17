export default function MatchHeader({ match, competition, data }) {
  if (!match || !data) return null
  const { teams, goals, formations } = data

  return (
    <div className="animate-fade-in-up text-center">
      {/* Competition badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-400 font-medium tracking-wide mb-8">
        {competition?.label}
        {match.competition_stage?.name && (
          <>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>{match.competition_stage.name}</span>
          </>
        )}
      </div>

      {/* Score display */}
      <div className="flex items-center justify-center gap-8 sm:gap-14 mb-6">
        <div className="text-right flex-1">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-[-0.02em] leading-tight">{teams.home}</h2>
          <div className="text-[13px] text-slate-500 mt-1.5 font-mono">{formations[teams.home] || ''}</div>
        </div>

        <div className="flex items-baseline gap-4 shrink-0">
          <span className="text-5xl sm:text-7xl font-black font-mono text-white leading-none">{goals[teams.home]}</span>
          <div className="flex flex-col items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/20" />
          </div>
          <span className="text-5xl sm:text-7xl font-black font-mono text-white leading-none">{goals[teams.away]}</span>
        </div>

        <div className="text-left flex-1">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-[-0.02em] leading-tight">{teams.away}</h2>
          <div className="text-[13px] text-slate-500 mt-1.5 font-mono">{formations[teams.away] || ''}</div>
        </div>
      </div>

      {/* Match info */}
      <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-[12px] text-slate-500">
        {match.match_date && (
          <span>{new Date(match.match_date).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}</span>
        )}
        {match.stadium?.name && (
          <>
            <span className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
            <span>{match.stadium.name}</span>
          </>
        )}
        {match.referee?.name && (
          <>
            <span className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
            <span>{match.referee.name}</span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  )
}
