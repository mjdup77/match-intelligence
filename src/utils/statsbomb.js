const BASE = 'https://raw.githubusercontent.com/statsbomb/open-data/master/data'

const cache = new Map()

async function fetchJSON(url) {
  if (cache.has(url)) return cache.get(url)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const data = await res.json()
  cache.set(url, data)
  return data
}

export async function getCompetitions() {
  const all = await fetchJSON(`${BASE}/competitions.json`)
  const grouped = {}
  for (const c of all) {
    const key = `${c.competition_id}_${c.season_id}`
    if (!grouped[key] || c.match_updated > grouped[key].match_updated) {
      grouped[key] = c
    }
  }
  return Object.values(grouped).sort((a, b) =>
    a.competition_name.localeCompare(b.competition_name)
  )
}

export async function getMatches(competitionId, seasonId) {
  const matches = await fetchJSON(`${BASE}/matches/${competitionId}/${seasonId}.json`)
  return matches.sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
}

export async function getEvents(matchId) {
  return fetchJSON(`${BASE}/events/${matchId}.json`)
}

export async function getLineups(matchId) {
  return fetchJSON(`${BASE}/lineups/${matchId}.json`)
}

export function processMatchData(events, lineups) {
  const shots = events.filter(e => e.type?.name === 'Shot')
  const passes = events.filter(e => e.type?.name === 'Pass')
  const carries = events.filter(e => e.type?.name === 'Carry')
  const pressures = events.filter(e => e.type?.name === 'Pressure')
  const defensiveActions = events.filter(e =>
    ['Interception', 'Tackle', 'Block', 'Ball Recovery'].includes(e.type?.name)
  )

  const teams = [...new Set(events.map(e => e.team?.name).filter(Boolean))]
  const homeTeam = events.find(e => e.type?.name === 'Starting XI' && e.team)?.team?.name || teams[0]
  const awayTeam = teams.find(t => t !== homeTeam) || teams[1]

  const startingXIs = {}
  events.filter(e => e.type?.name === 'Starting XI').forEach(e => {
    startingXIs[e.team.name] = e.tactics?.lineup?.map(p => ({
      id: p.player?.id,
      name: p.player?.name,
      jersey: p.jersey_number,
      position: p.position?.name
    })) || []
  })

  const formations = {}
  events.filter(e => e.type?.name === 'Starting XI').forEach(e => {
    formations[e.team.name] = e.tactics?.formation?.toString() || ''
  })

  const goals = {}
  goals[homeTeam] = shots.filter(s => s.team?.name === homeTeam && s.shot?.outcome?.name === 'Goal').length
  goals[awayTeam] = shots.filter(s => s.team?.name === awayTeam && s.shot?.outcome?.name === 'Goal').length

  return {
    teams: { home: homeTeam, away: awayTeam },
    goals,
    formations,
    startingXIs,
    shots,
    passes,
    carries,
    pressures,
    defensiveActions,
    events,
    lineups
  }
}

export function computePassingNetwork(passes, teamName, startingXI) {
  const teamPasses = passes.filter(p =>
    p.team?.name === teamName &&
    p.pass?.outcome === undefined &&
    p.period <= 2
  )

  const starterIds = new Set(startingXI.map(p => p.id))

  const positions = {}
  const pairCounts = {}

  for (const p of teamPasses) {
    const playerId = p.player?.id
    const recipientId = p.pass?.recipient?.id

    if (!playerId || !recipientId) continue
    if (!starterIds.has(playerId) || !starterIds.has(recipientId)) continue

    if (!positions[playerId]) {
      positions[playerId] = { x: 0, y: 0, count: 0, name: p.player.name }
    }
    positions[playerId].x += p.location[0]
    positions[playerId].y += p.location[1]
    positions[playerId].count++

    const key = [playerId, recipientId].sort().join('-')
    pairCounts[key] = (pairCounts[key] || 0) + 1
  }

  const avgPositions = {}
  for (const [id, pos] of Object.entries(positions)) {
    avgPositions[id] = {
      x: pos.x / pos.count,
      y: pos.y / pos.count,
      name: pos.name,
      passes: pos.count
    }
  }

  const links = Object.entries(pairCounts)
    .map(([key, count]) => {
      const [from, to] = key.split('-')
      return { from, to, count }
    })
    .filter(l => l.count >= 3)
    .sort((a, b) => b.count - a.count)

  return { nodes: avgPositions, links }
}

export function computeXGTimeline(shots, homeTeam, awayTeam) {
  const timeline = []
  let homeXG = 0
  let awayXG = 0

  timeline.push({ minute: 0, home: 0, away: 0 })

  const sorted = [...shots].sort((a, b) => {
    if (a.period !== b.period) return a.period - b.period
    return parseFloat(a.minute) - parseFloat(b.minute)
  })

  for (const s of sorted) {
    const xg = s.shot?.statsbomb_xg || 0
    const min = s.minute + (s.second || 0) / 60
    if (s.team?.name === homeTeam) homeXG += xg
    else awayXG += xg

    timeline.push({
      minute: Math.round(min),
      home: parseFloat(homeXG.toFixed(2)),
      away: parseFloat(awayXG.toFixed(2)),
      event: {
        team: s.team?.name,
        player: s.player?.name,
        xg: parseFloat(xg.toFixed(2)),
        outcome: s.shot?.outcome?.name,
        isGoal: s.shot?.outcome?.name === 'Goal'
      }
    })
  }

  timeline.push({
    minute: 95,
    home: parseFloat(homeXG.toFixed(2)),
    away: parseFloat(awayXG.toFixed(2))
  })

  return timeline
}

export function computeMatchStats(data) {
  const { passes, shots, events, teams } = data

  const possession = { home: 0, away: 0 }
  events.filter(e => e.type?.name === 'Pass' || e.type?.name === 'Carry' || e.type?.name === 'Ball Receipt*').forEach(e => {
    if (e.team?.name === teams.home) possession.home++
    else possession.away++
  })
  const total = possession.home + possession.away
  const possPct = {
    home: total ? Math.round((possession.home / total) * 100) : 50,
    away: total ? Math.round((possession.away / total) * 100) : 50
  }

  const teamShots = (team) => shots.filter(s => s.team?.name === team)
  const onTarget = (team) => shots.filter(s =>
    s.team?.name === team &&
    ['Goal', 'Saved', 'Saved to Post'].includes(s.shot?.outcome?.name)
  )

  const totalXG = (team) => shots
    .filter(s => s.team?.name === team)
    .reduce((sum, s) => sum + (s.shot?.statsbomb_xg || 0), 0)

  const teamPasses = (team) => passes.filter(p => p.team?.name === team)
  const completedPasses = (team) => passes.filter(p =>
    p.team?.name === team && p.pass?.outcome === undefined
  )

  const progressivePasses = (team) => passes.filter(p => {
    if (p.team?.name !== team || p.pass?.outcome !== undefined) return false
    if (!p.location || !p.pass?.end_location) return false
    const startDist = Math.sqrt((120 - p.location[0]) ** 2 + (40 - p.location[1]) ** 2)
    const endDist = Math.sqrt((120 - p.pass.end_location[0]) ** 2 + (40 - p.pass.end_location[1]) ** 2)
    return (startDist - endDist) >= 10
  })

  return {
    possession: possPct,
    shots: { home: teamShots(teams.home).length, away: teamShots(teams.away).length },
    shotsOnTarget: { home: onTarget(teams.home).length, away: onTarget(teams.away).length },
    xg: { home: totalXG(teams.home).toFixed(2), away: totalXG(teams.away).toFixed(2) },
    passes: { home: teamPasses(teams.home).length, away: teamPasses(teams.away).length },
    passAccuracy: {
      home: teamPasses(teams.home).length ? Math.round(completedPasses(teams.home).length / teamPasses(teams.home).length * 100) : 0,
      away: teamPasses(teams.away).length ? Math.round(completedPasses(teams.away).length / teamPasses(teams.away).length * 100) : 0,
    },
    progressivePasses: {
      home: progressivePasses(teams.home).length,
      away: progressivePasses(teams.away).length
    }
  }
}
