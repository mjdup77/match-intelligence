import { useState, useEffect } from 'react'
import { getCompetitions, getMatches } from '../../utils/statsbomb'

const FEATURED = [
  { competitionId: 43, seasonId: 106, label: 'FIFA World Cup 2022' },
  { competitionId: 55, seasonId: 282, label: 'UEFA Euro 2024' },
  { competitionId: 43, seasonId: 3, label: 'FIFA World Cup 2018' },
  { competitionId: 55, seasonId: 43, label: 'UEFA Euro 2020' },
  { competitionId: 72, seasonId: 107, label: "FA Women's Super League 2023/24" },
  { competitionId: 11, seasonId: 90, label: 'La Liga 2019/20' },
  { competitionId: 2, seasonId: 44, label: 'Premier League 2003/04' },
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

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6">
          <p className="text-rose-400">Failed to load data: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm text-cyan-400 hover:underline">Try again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      {!selectedComp ? (
        <div className="animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Select a Competition</h2>
            <p className="text-slate-400">Choose from available StatsBomb open data competitions</p>
          </div>

          {/* Featured competitions */}
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3 px-1">Featured</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURED.map(f => (
                <button
                  key={`${f.competitionId}-${f.seasonId}`}
                  onClick={() => handleCompSelect(f.competitionId, f.seasonId, f.label)}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/30 rounded-xl p-4 text-left transition-all group"
                >
                  <div className="text-white font-medium group-hover:text-cyan-400 transition-colors">{f.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* All competitions */}
          {loadingComps ? (
            <div className="text-center py-12">
              <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm mt-3">Loading competitions...</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3 px-1">All Competitions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {competitions.map(c => (
                  <button
                    key={`${c.competition_id}-${c.season_id}`}
                    onClick={() => handleCompSelect(c.competition_id, c.season_id, `${c.competition_name} ${c.season_name}`)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg p-3 text-left transition-all text-sm"
                  >
                    <div className="text-slate-200 font-medium">{c.competition_name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{c.season_name} · {c.country_name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in">
          <button
            onClick={() => { setSelectedComp(null); setMatches([]) }}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to competitions
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedComp.label}</h2>
            <p className="text-slate-400">Select a match to analyse</p>
          </div>

          {loadingMatches ? (
            <div className="text-center py-12">
              <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm mt-3">Loading matches...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map(m => (
                <button
                  key={m.match_id}
                  onClick={() => onSelectMatch(m, selectedComp)}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 rounded-xl p-4 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-xs text-slate-500 w-20 shrink-0">{formatDate(m.match_date)}</div>
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-slate-200 font-medium text-sm text-right flex-1">{m.home_team.home_team_name}</span>
                        <span className="text-lg font-bold font-mono text-cyan-400 px-2">
                          {m.home_score} — {m.away_score}
                        </span>
                        <span className="text-slate-200 font-medium text-sm text-left flex-1">{m.away_team.away_team_name}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 ml-4 shrink-0">
                      {m.competition_stage?.name || ''}
                    </div>
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
