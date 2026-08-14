import { cn } from '@/utils'

interface BrandLogoProps {
  className?: string
  imgClassName?: string
}

export function BrandLogo({ className, imgClassName }: BrandLogoProps) {
  return (
    <div className={cn('overflow-hidden bg-white', className)}>
      <img
        src="/best-brightness-logo.png"
        alt="Best Brightness"
        className={cn('h-full w-full object-contain', imgClassName)}
      />
    </div>
  )
}
