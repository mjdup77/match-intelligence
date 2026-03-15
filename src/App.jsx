import { useState, useCallback } from 'react'
import { getEvents, getLineups, processMatchData } from './utils/statsbomb'
import MatchSelector from './components/ui/MatchSelector'
import MatchHeader from './components/ui/MatchHeader'
import MatchStatsPanel from './components/ui/MatchStats'
import ShotMap from './components/visualizations/ShotMap'
import PassingNetwork from './components/visualizations/PassingNetwork'
import XGTimeline from './components/visualizations/XGTimeline'
import PressingMap from './components/visualizations/PressingMap'
import ProgressiveActions from './components/visualizations/ProgressiveActions'

export default function App() {
  const [match, setMatch] = useState(null)
  const [competition, setCompetition] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSelectMatch = useCallback(async (m, comp) => {
    setLoading(true)
    setError(null)
    try {
      const [events, lineups] = await Promise.all([
        getEvents(m.match_id),
        getLineups(m.match_id),
      ])
      const processed = processMatchData(events, lineups)
      setMatch(m)
      setCompetition(comp)
      setData(processed)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleBack = () => {
    setMatch(null)
    setData(null)
    setCompetition(null)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L2 10l8 8 8-8-8-8zm0 2.83L15.17 10 10 15.17 4.83 10 10 4.83z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">Match Intelligence</h1>
              <p className="text-xs text-slate-500 -mt-0.5">Powered by StatsBomb Open Data</p>
            </div>
          </div>
          {match && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              New match
            </button>
          )}
        </div>
      </header>

      <main className="pb-20">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-cyan-400/30 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-400 text-sm mt-4">Loading match data...</p>
            <p className="text-slate-600 text-xs mt-1">Fetching events from StatsBomb</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="max-w-md mx-auto mt-20 p-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center">
            <p className="text-rose-400 mb-3">{error}</p>
            <button onClick={handleBack} className="text-sm text-cyan-400 hover:underline">Go back</button>
          </div>
        )}

        {/* Match selector */}
        {!match && !loading && !error && (
          <div className="pt-12">
            <div className="text-center mb-12 px-6">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Match Intelligence<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Report</span>
              </h1>
              <p className="text-slate-400 max-w-xl mx-auto">
                Professional match analysis reports generated from StatsBomb event-level data.
                Select a competition and match to generate a full tactical intelligence briefing.
              </p>
            </div>
            <MatchSelector onSelectMatch={handleSelectMatch} />
          </div>
        )}

        {/* Match report */}
        {data && match && !loading && (
          <div className="max-w-7xl mx-auto px-6 pt-8">
            <MatchHeader match={match} competition={competition} data={data} />

            <div className="mt-8 space-y-8">
              {/* Row 1: Stats + xG Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MatchStatsPanel data={data} />
                <XGTimeline shots={data.shots} homeTeam={data.teams.home} awayTeam={data.teams.away} />
              </div>

              {/* Row 2: Shot Map */}
              <ShotMap shots={data.shots} homeTeam={data.teams.home} awayTeam={data.teams.away} />

              {/* Row 3: Passing Networks */}
              <PassingNetwork
                passes={data.passes}
                homeTeam={data.teams.home}
                awayTeam={data.teams.away}
                startingXIs={data.startingXIs}
              />

              {/* Row 4: Progressive Actions + Pressing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProgressiveActions
                  passes={data.passes}
                  carries={data.carries}
                  homeTeam={data.teams.home}
                  awayTeam={data.teams.away}
                />
                <PressingMap
                  pressures={data.pressures}
                  defensiveActions={data.defensiveActions}
                  homeTeam={data.teams.home}
                  awayTeam={data.teams.away}
                />
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-slate-800/50 text-center pb-8">
              <p className="text-xs text-slate-600">
                Data provided by <a href="https://statsbomb.com/what-we-do/hub/free-data/" target="_blank" rel="noopener" className="text-slate-500 hover:text-cyan-400 transition-colors">StatsBomb Open Data</a>.
                Built by <a href="https://www.linkedin.com/in/mjduplessis" target="_blank" rel="noopener" className="text-slate-500 hover:text-cyan-400 transition-colors">MJ du Plessis</a>.
              </p>
              <p className="text-xs text-slate-700 mt-1">
                All analysis is automated from event-level data. No manual adjustments.
              </p>
            </footer>
          </div>
        )}
      </main>
    </div>
  )
}
