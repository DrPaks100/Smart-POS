import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, id, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? (
        <span className="text-[12px] font-semibold text-[var(--bb-muted)]">{label}</span>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-10 w-full rounded-2xl border border-[var(--bb-border)] bg-[#f6f7fb] px-3.5 text-[14px] font-medium text-[var(--bb-ink)] outline-none transition',
          'placeholder:font-normal placeholder:text-[var(--bb-muted)]/65',
          'focus:border-[var(--bb-blue)] focus:bg-white focus:ring-2 focus:ring-[var(--bb-blue)]/20',
          error && 'border-[var(--bb-danger)] focus:border-[var(--bb-danger)] focus:ring-[var(--bb-danger)]/20',
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs font-medium text-[var(--bb-danger)]">{error}</span>
      ) : null}
    </label>
  )
})
