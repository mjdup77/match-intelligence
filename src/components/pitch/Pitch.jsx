const PITCH_LENGTH = 120
const PITCH_WIDTH = 80
const PADDING = 4

export default function Pitch({ children, className = '', height = 400, flip = false }) {
  const totalW = PITCH_LENGTH + PADDING * 2
  const totalH = PITCH_WIDTH + PADDING * 2

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      className={`w-full ${className}`}
      style={{ maxHeight: height }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="grass" patternUnits="userSpaceOnUse" width="10" height="10">
          <rect width="10" height="10" fill="#0c4a2f" />
          <rect width="5" height="10" fill="#0d5232" opacity="0.3" />
        </pattern>
        <linearGradient id="pitch-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f5132" />
          <stop offset="50%" stopColor="#0c4a2f" />
          <stop offset="100%" stopColor="#0f5132" />
        </linearGradient>
      </defs>

      <rect x={PADDING} y={PADDING} width={PITCH_LENGTH} height={PITCH_WIDTH} fill="url(#pitch-gradient)" rx="1" />

      <g transform={`translate(${PADDING}, ${PADDING})`} stroke="#ffffff" strokeWidth="0.3" fill="none" opacity="0.5">
        {/* Outline */}
        <rect x="0" y="0" width={PITCH_LENGTH} height={PITCH_WIDTH} />

        {/* Halfway line */}
        <line x1="60" y1="0" x2="60" y2={PITCH_WIDTH} />

        {/* Centre circle */}
        <circle cx="60" cy="40" r="9.15" />
        <circle cx="60" cy="40" r="0.5" fill="#ffffff" />

        {/* Left penalty area */}
        <rect x="0" y="18" width="18" height="44" />
        <rect x="0" y="30" width="6" height="20" />
        <circle cx="12" cy="40" r="0.5" fill="#ffffff" />
        <path d="M 18 33.03 A 9.15 9.15 0 0 1 18 46.97" />

        {/* Right penalty area */}
        <rect x="102" y="18" width="18" height="44" />
        <rect x="114" y="30" width="6" height="20" />
        <circle cx="108" cy="40" r="0.5" fill="#ffffff" />
        <path d="M 102 33.03 A 9.15 9.15 0 0 0 102 46.97" />

        {/* Corner arcs */}
        <path d="M 0 1 A 1 1 0 0 0 1 0" />
        <path d="M 119 0 A 1 1 0 0 0 120 1" />
        <path d="M 0 79 A 1 1 0 0 1 1 80" />
        <path d="M 120 79 A 1 1 0 0 0 119 80" />

        {/* Goals */}
        <rect x="-2" y="36" width="2" height="8" strokeWidth="0.2" opacity="0.3" />
        <rect x="120" y="36" width="2" height="8" strokeWidth="0.2" opacity="0.3" />
      </g>

      <g transform={`translate(${PADDING}, ${PADDING})${flip ? ` scale(-1,1) translate(-${PITCH_LENGTH},0)` : ''}`}>
        {children}
      </g>
    </svg>
  )
}

export { PITCH_LENGTH, PITCH_WIDTH, PADDING }
