import { useCallback, useRef, useState, type KeyboardEvent } from 'react'
import { Camera, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SimpleBarcodeScanner } from '@/components/pos/SimpleBarcodeScanner'
import { generateStoreBarcode } from '@/services/productService'

interface BarcodeCaptureFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function BarcodeCaptureField({
  value,
  onChange,
  error,
  disabled,
}: BarcodeCaptureFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.preventDefault()
  }, [])

  return (
    <div>
      <div className="flex items-end gap-2">
        <Input
          ref={inputRef}
          name="barcode"
          label="Barcode"
          placeholder="Scan or type"
          value={value}
          disabled={disabled}
          error={error}
          autoComplete="off"
          inputMode="numeric"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 font-mono text-[13px] tracking-wide"
        />
        <Button
          type="button"
          size="sm"
          className="h-9 shrink-0"
          disabled={disabled}
          onClick={() => setShowBarcodeScanner(true)}
        >
          <Camera className="h-3.5 w-3.5" />
          Scan
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-9 shrink-0 px-2.5"
          disabled={disabled}
          onClick={() => {
            onChange(generateStoreBarcode())
            inputRef.current?.focus()
          }}
          title="Generate store barcode"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </div>

      {showBarcodeScanner ? (
        <SimpleBarcodeScanner
          onBarcodeScanned={(code) => {
            onChange(code)
            setShowBarcodeScanner(false)
          }}
          onClose={() => setShowBarcodeScanner(false)}
        />
      ) : null}
    </div>
  )
}
