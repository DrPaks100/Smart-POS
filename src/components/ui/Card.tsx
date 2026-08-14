import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function GlassCard({ children, className, delay = 0, hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={hover ? { y: -2 } : undefined}
      className={cn('glass rounded-[var(--radius-card)] p-4', className)}
    >
      {children}
    </motion.div>
  )
}

export const Card = GlassCard

interface MetricCardProps {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  delay?: number
}

export function MetricCard({ label, value, hint, icon, delay = 0 }: MetricCardProps) {
  return (
    <GlassCard delay={delay}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-[var(--bb-muted)]">{label}</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-[1.45rem] font-bold tracking-[-0.03em] text-[var(--bb-ink)]">
            {value}
          </p>
          {hint ? <p className="mt-0.5 text-[11px] font-medium text-[var(--bb-muted)]">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_6px_16px_rgba(37,99,235,0.25)] bb-blend-bg">
            {icon}
          </div>
        ) : null}
      </div>
    </GlassCard>
  )
}
