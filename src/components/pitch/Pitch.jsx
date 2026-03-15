const PITCH_LENGTH = 120
const PITCH_WIDTH = 80
const PADDING = 5

export default function Pitch({ children, className = '', height = 420, flip = false }) {
  const totalW = PITCH_LENGTH + PADDING * 2
  const totalH = PITCH_WIDTH + PADDING * 2

  return (
    <div className={`pitch-glow ${className}`}>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full"
        style={{ maxHeight: height }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="pitch-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a3d29" />
            <stop offset="30%" stopColor="#0d4a30" />
            <stop offset="70%" stopColor="#0d4a30" />
            <stop offset="100%" stopColor="#0a3d29" />
          </linearGradient>
          <linearGradient id="pitch-stripe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pitch background */}
        <rect x={PADDING} y={PADDING} width={PITCH_LENGTH} height={PITCH_WIDTH} fill="url(#pitch-bg)" rx="1.5" />

        {/* Mowed stripes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x={PADDING + i * 10}
            y={PADDING}
            width="10"
            height={PITCH_WIDTH}
            fill={i % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent'}
          />
        ))}

        {/* Lines */}
        <g transform={`translate(${PADDING}, ${PADDING})`} stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" fill="none">
          <rect x="0" y="0" width={PITCH_LENGTH} height={PITCH_WIDTH} rx="0.5" />
          <line x1="60" y1="0" x2="60" y2={PITCH_WIDTH} />
          <circle cx="60" cy="40" r="9.15" />
          <circle cx="60" cy="40" r="0.6" fill="rgba(255,255,255,0.35)" />

          {/* Left penalty area */}
          <rect x="0" y="18" width="18" height="44" />
          <rect x="0" y="30" width="6" height="20" />
          <circle cx="12" cy="40" r="0.5" fill="rgba(255,255,255,0.3)" />
          <path d="M 18 33.03 A 9.15 9.15 0 0 1 18 46.97" />

          {/* Right penalty area */}
          <rect x="102" y="18" width="18" height="44" />
          <rect x="114" y="30" width="6" height="20" />
          <circle cx="108" cy="40" r="0.5" fill="rgba(255,255,255,0.3)" />
          <path d="M 102 33.03 A 9.15 9.15 0 0 0 102 46.97" />

          {/* Corner arcs */}
          <path d="M 0 1 A 1 1 0 0 0 1 0" />
          <path d="M 119 0 A 1 1 0 0 0 120 1" />
          <path d="M 0 79 A 1 1 0 0 1 1 80" />
          <path d="M 120 79 A 1 1 0 0 0 119 80" />

          {/* Goals */}
          <rect x="-2.5" y="35.5" width="2.5" height="9" strokeWidth="0.25" opacity="0.25" rx="0.3" />
          <rect x="120" y="35.5" width="2.5" height="9" strokeWidth="0.25" opacity="0.25" rx="0.3" />
        </g>

        {/* Content */}
        <g transform={`translate(${PADDING}, ${PADDING})${flip ? ` scale(-1,1) translate(-${PITCH_LENGTH},0)` : ''}`}>
          {children}
        </g>
      </svg>
    </div>
  )
}

export { PITCH_LENGTH, PITCH_WIDTH, PADDING }
