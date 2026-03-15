export default function Toggle({ options, active, onChange, color = 'cyan' }) {
  const colors = {
    cyan: 'bg-cyan-400/10 text-cyan-400 shadow-cyan-500/10',
    emerald: 'bg-emerald-400/10 text-emerald-400 shadow-emerald-500/10',
    amber: 'bg-amber-400/10 text-amber-400 shadow-amber-500/10',
    rose: 'bg-rose-400/10 text-rose-400 shadow-rose-500/10',
  }

  return (
    <div className="flex gap-0.5 bg-white/[0.03] rounded-xl p-[3px] border border-white/[0.04]">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-300 tracking-wide ${
            active === opt.key
              ? `${colors[color]} shadow-sm`
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
