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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen relative">
      <div className="ambient-glow" />

      {/* Sticky header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-[15px] tracking-[-0.01em]">Match Intelligence</h1>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">POWERED BY STATSBOMB</p>
            </div>
          </div>
          {match && (
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 text-[13px] text-slate-400 hover:text-white transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/[0.04]"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              New analysis
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 pb-24">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/10" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-transparent border-t-violet-400/60 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            </div>
            <p className="text-white/80 text-sm font-medium mt-6 tracking-tight">Generating report</p>
            <p className="text-slate-500 text-xs mt-1.5">Fetching event data from StatsBomb</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-md mx-auto mt-24 animate-fade-in-up">
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-rose-300 text-sm mb-4">{error}</p>
              <button onClick={handleBack} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Go back</button>
            </div>
          </div>
        )}

        {/* Match selector */}
        {!match && !loading && !error && (
          <div className="pt-20 pb-8">
            <div className="text-center mb-16 px-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/[0.07] border border-cyan-500/[0.12] text-[11px] text-cyan-400 font-semibold tracking-wider uppercase mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-glow" />
                Live data from StatsBomb Open Data
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-white mb-6 leading-[1.05]">
                Match<br />
                <span className="text-gradient">Intelligence</span>
              </h1>
              <p className="text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
                Professional match analysis reports generated from event-level data.
                Select a competition and match to build a full tactical briefing.
              </p>
            </div>
            <MatchSelector onSelectMatch={handleSelectMatch} />
          </div>
        )}

        {/* Match report */}
        {data && match && !loading && (
          <div className="max-w-[1400px] mx-auto px-8 pt-10">
            <MatchHeader match={match} competition={competition} data={data} />

            <div className="mt-10 space-y-6">
              {/* Stats + xG */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="animate-fade-in-up stagger-1">
                  <MatchStatsPanel data={data} />
                </div>
                <div className="animate-fade-in-up stagger-2">
                  <XGTimeline shots={data.shots} homeTeam={data.teams.home} awayTeam={data.teams.away} />
                </div>
              </div>

              {/* Shot Map */}
              <div className="animate-fade-in-up stagger-3">
                <ShotMap shots={data.shots} homeTeam={data.teams.home} awayTeam={data.teams.away} />
              </div>

              {/* Passing Network */}
              <div className="animate-fade-in-up stagger-4">
                <PassingNetwork
                  passes={data.passes}
                  homeTeam={data.teams.home}
                  awayTeam={data.teams.away}
                  startingXIs={data.startingXIs}
                />
              </div>

              {/* Progressive + Pressing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="animate-fade-in-up stagger-5">
                  <ProgressiveActions
                    passes={data.passes}
                    carries={data.carries}
                    homeTeam={data.teams.home}
                    awayTeam={data.teams.away}
                  />
                </div>
                <div className="animate-fade-in-up stagger-6">
                  <PressingMap
                    pressures={data.pressures}
                    defensiveActions={data.defensiveActions}
                    homeTeam={data.teams.home}
                    awayTeam={data.teams.away}
                  />
                </div>
              </div>
            </div>

            <footer className="mt-20 pt-10 border-t border-white/[0.04] text-center pb-10">
              <p className="text-[11px] text-slate-600 tracking-wide">
                Data by{' '}
                <a href="https://statsbomb.com/what-we-do/hub/free-data/" target="_blank" rel="noopener" className="text-slate-500 hover:text-cyan-400 transition-colors duration-300">StatsBomb</a>
                {' · '}Built by{' '}
                <a href="https://www.linkedin.com/in/mjduplessis" target="_blank" rel="noopener" className="text-slate-500 hover:text-cyan-400 transition-colors duration-300">MJ du Plessis</a>
              </p>
            </footer>
          </div>
        )}
      </main>
    </div>
  )
}
