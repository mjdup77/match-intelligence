# Match Intelligence Report

Professional match analysis reports generated from [StatsBomb Open Data](https://github.com/statsbomb/open-data). Select any available match and get a full tactical intelligence briefing with interactive visualisations.

## What it does

- **xG Timeline** — cumulative expected goals over the match with goal markers
- **Shot Map** — all shots plotted on pitch, sized by xG, coloured by outcome
- **Passing Network** — average player positions and pass connections for starting XIs
- **Progressive Actions** — passes and carries that advance the ball ≥10m toward goal
- **Pressing Intensity** — heatmap of where each team applies pressure
- **Defensive Actions** — tackles, interceptions, blocks and ball recoveries
- **Match Statistics** — possession, pass accuracy, shots on target, and more

## Data

All data is fetched live from the [StatsBomb Open Data](https://github.com/statsbomb/open-data) repository. Available competitions include FIFA World Cup, UEFA Euros, La Liga, FA Women's Super League, and more.

## Tech Stack

- React + Vite
- Tailwind CSS v4
- Custom SVG pitch rendering (no external charting library)
- StatsBomb Open Data (fetched at runtime from GitHub)

## Getting Started

```bash
npm install
npm run dev
```

## Author

**MJ du Plessis**
[LinkedIn](https://www.linkedin.com/in/mjduplessis) · [GitHub](https://github.com/mjdup77)
