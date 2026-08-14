import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
  > {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bb-blend-bg text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] hover:brightness-105',
  secondary:
    'bg-white text-[var(--bb-ink)] border border-[var(--bb-border)] hover:bg-[#f4f6fb]',
  ghost: 'bg-transparent text-[var(--bb-muted)] hover:bg-[#eef1f8] hover:text-[var(--bb-ink)]',
  danger: 'bg-[var(--bb-danger)] text-white hover:brightness-95',
  dark: 'bg-[var(--bb-ink)] text-white hover:bg-[#1e293b]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-2xl',
  md: 'h-10 px-4 text-[14px] rounded-2xl',
  lg: 'h-11 px-5 text-[15px] rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, disabled, children, ...props },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={disabled || loading ? undefined : { scale: 1.015 }}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] transition-[filter,colors] disabled:opacity-40 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent opacity-70" />
      ) : null}
      {children}
    </motion.button>
  )
})

export const PrimaryButton = (props: ButtonProps) => <Button variant="primary" {...props} />
export const SecondaryButton = (props: ButtonProps) => <Button variant="secondary" {...props} />
