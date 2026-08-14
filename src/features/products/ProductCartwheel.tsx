import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/utils'
import { useProductImage } from '@/hooks/useProductImage'

type CartwheelSize = 'sm' | 'md' | 'lg'

const sizes: Record<CartwheelSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-14 w-14',
  lg: 'h-[72px] w-[72px]',
}

const rings: Record<CartwheelSize, string> = {
  sm: 'p-[1.5px]',
  md: 'p-[2px]',
  lg: 'p-[2px]',
}

interface ProductCartwheelProps {
  src?: string | null
  path?: string | null
  alt: string
  size?: CartwheelSize
  className?: string
}

export function ProductCartwheel({
  src,
  path,
  alt,
  size = 'lg',
  className,
}: ProductCartwheelProps) {
  const { src: resolved, loading } = useProductImage(src, path)
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    setBroken(false)
  }, [resolved])

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.1)] bb-blend-bg',
        sizes[size],
        rings[size],
        className,
      )}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
        {resolved && !broken ? (
          <img
            src={resolved}
            alt={alt}
            className="h-full w-full object-contain p-[10%]"
            onError={() => setBroken(true)}
          />
        ) : loading ? (
          <div className="h-full w-full animate-pulse bg-[#f1f5f9]" />
        ) : (
          <Package
            className={cn(
              'text-[var(--bb-muted)] opacity-35',
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6',
            )}
          />
        )}
      </div>
    </div>
  )
}
