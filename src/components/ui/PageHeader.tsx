import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] bb-blend-text">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-0.5 font-[family-name:var(--font-display)] text-[1.7rem] font-extrabold tracking-[-0.035em] text-[var(--bb-ink)] md:text-[1.85rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-xl text-[13px] font-medium leading-snug text-[var(--bb-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </header>
  )
}
