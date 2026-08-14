import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/utils'

interface ProductImageDropzoneProps {
  previewUrl?: string | null
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

export function ProductImageDropzone({
  previewUrl,
  file,
  onFileChange,
  disabled,
}: ProductImageDropzoneProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setLocalPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setLocalPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onDrop = useCallback(
    (accepted: File[]) => {
      const next = accepted[0]
      if (next) onFileChange(next)
    },
    [onFileChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled,
    multiple: false,
  })

  const shown = localPreview || previewUrl || null

  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <button
        type="button"
        {...getRootProps()}
        disabled={disabled}
        className={cn(
          'relative flex h-[72px] w-[72px] cursor-pointer items-center justify-center overflow-hidden rounded-full p-[2px] transition bb-blend-bg',
          isDragActive ? 'brightness-110' : 'hover:brightness-105',
          disabled && 'pointer-events-none opacity-50',
        )}
        aria-label="Add product photo"
      >
        <input {...getInputProps()} />
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
          {shown ? (
            <img src={shown} alt="Product" className="h-full w-full object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center gap-0.5 text-[var(--bb-muted)]">
              <ImagePlus className="h-4 w-4" />
              <span className="text-[9px] font-bold uppercase tracking-wide">Photo</span>
            </div>
          )}
        </div>
      </button>
      {shown ? (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onFileChange(null)
          }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[var(--bb-ink)] shadow"
          aria-label="Remove image"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  )
}
