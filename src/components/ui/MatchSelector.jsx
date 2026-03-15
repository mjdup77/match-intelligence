import { useState, useEffect } from 'react'
import { getCompetitions, getMatches } from '../../utils/statsbomb'

const FEATURED = [
  { competitionId: 43, seasonId: 106, label: 'FIFA World Cup 2022', emoji: '🏆' },
  { competitionId: 55, seasonId: 282, label: 'UEFA Euro 2024', emoji: '🇪🇺' },
  { competitionId: 43, seasonId: 3, label: 'FIFA World Cup 2018', emoji: '🏆' },
  { competitionId: 55, seasonId: 43, label: 'UEFA Euro 2020', emoji: '🇪🇺' },
  { competitionId: 72, seasonId: 107, label: "FA Women's Super League 23/24", emoji: '⚽' },
  { competitionId: 11, seasonId: 90, label: 'La Liga 2019/20', emoji: '🇪🇸' },
  { competitionId: 2, seasonId: 44, label: 'Premier League 2003/04', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
]

export default function MatchSelector({ onSelectMatch }) {
  const [competitions, setCompetitions] = useState([])
  const [selectedComp, setSelectedComp] = useState(null)
  const [matches, setMatches] = useState([])
  const [loadingComps, setLoadingComps] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCompetitions()
      .then(setCompetitions)
      .catch(e => setError(e.message))
      .finally(() => setLoadingComps(false))
  }, [])

  const handleCompSelect = async (compId, seasonId, label) => {
    setSelectedComp({ compId, seasonId, label })
    setLoadingMatches(true)
    setMatches([])
    try {
      const m = await getMatches(compId, seasonId)
      setMatches(m)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingMatches(false)
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-rose-300 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 font-medium">Try again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      {!selectedComp ? (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Featured */}
          <div className="mb-10">
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-4 px-1">Featured Competitions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURED.map(f => (
                <button
                  key={`${f.competitionId}-${f.seasonId}`}
                  onClick={() => handleCompSelect(f.competitionId, f.seasonId, f.label)}
                  className="group glass glow-border rounded-2xl p-5 text-left transition-all duration-300 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">{f.emoji}</span>
                    <div>
                      <div className="text-white font-semibold text-[14px] tracking-[-0.01em] group-hover:text-cyan-300 transition-colors duration-300">{f.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Click to browse matches</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* All competitions */}
          {loadingComps ? (
            <div className="text-center py-16">
              <div className="inline-block w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-slate-500 text-xs mt-4">Loading competitions...</p>
            </div>
          ) : (
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-4 px-1">All Competitions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {competitions.map(c => (
                  <button
                    key={`${c.competition_id}-${c.season_id}`}
                    onClick={() => handleCompSelect(c.competition_id, c.season_id, `${c.competition_name} ${c.season_name}`)}
                    className="group rounded-xl px-4 py-3 text-left transition-all duration-300 hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06]"
                  >
                    <div className="text-slate-200 font-medium text-[13px] group-hover:text-white transition-colors">{c.competition_name}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{c.season_name} · {c.country_name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <button
            onClick={() => { setSelectedComp(null); setMatches([]) }}
            className="group flex items-center gap-2 text-[13px] text-slate-400 hover:text-white transition-all duration-300 mb-8 px-3 py-1.5 rounded-lg hover:bg-white/[0.03]"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All competitions
          </button>

          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">{selectedComp.label}</h2>
            <p className="text-slate-500 text-sm mt-1.5">Select a match to generate the report</p>
          </div>

          {loadingMatches ? (
            <div className="text-center py-16">
              <div className="inline-block w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-slate-500 text-xs mt-4">Loading matches...</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {matches.map((m, idx) => (
                <button
                  key={m.match_id}
                  onClick={() => onSelectMatch(m, selectedComp)}
                  className="group w-full glass glow-border rounded-xl px-5 py-4 text-left transition-all duration-300 hover:bg-white/[0.03] animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-[11px] text-slate-600 font-mono w-20 shrink-0">{formatDate(m.match_date)}</div>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-[13px] text-slate-200 font-medium text-right flex-1 truncate group-hover:text-white transition-colors">
                        {m.home_team.home_team_name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-base font-bold font-mono text-white w-5 text-right">{m.home_score}</span>
                        <span className="text-slate-600 text-xs">–</span>
                        <span className="text-base font-bold font-mono text-white w-5 text-left">{m.away_score}</span>
                      </div>
                      <span className="text-[13px] text-slate-200 font-medium text-left flex-1 truncate group-hover:text-white transition-colors">
                        {m.away_team.away_team_name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 w-24 text-right shrink-0 hidden sm:block">
                      {m.competition_stage?.name || ''}
                    </div>
                    <svg className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
