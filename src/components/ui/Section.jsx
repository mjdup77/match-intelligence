export default function Section({ title, subtitle, children, actions }) {
  return (
    <div className="glass rounded-2xl p-7">
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
