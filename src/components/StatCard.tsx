import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: 'violet' | 'cyan' | 'amber' | 'emerald'
}

const tones: Record<NonNullable<StatCardProps['tone']>, string> = {
  violet: 'tone-violet',
  cyan: 'tone-cyan',
  amber: 'tone-amber',
  emerald: 'tone-emerald',
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'violet' }: StatCardProps) {
  return (
    <div className="stat-card panel">
      <span className={`stat-icon ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {hint && <p className="stat-hint">{hint}</p>}
      </div>
    </div>
  )
}
