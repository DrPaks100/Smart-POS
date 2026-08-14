import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library'
import { AlertTriangle, Camera, SwitchCamera, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SimpleBarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void
  onClose: () => void
}

function buildReader() {
  const hints = new Map<DecodeHintType, unknown>()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.ITF,
    BarcodeFormat.CODABAR,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
  ])
  hints.set(DecodeHintType.TRY_HARDER, true)
  return new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 50,
    delayBetweenScanSuccess: 600,
    tryPlayVideoTimeout: 10_000,
  })
}

export function SimpleBarcodeScanner({
  onBarcodeScanned,
  onClose,
}: SimpleBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const handledRef = useRef(false)
  const onBarcodeScannedRef = useRef(onBarcodeScanned)
  const onCloseRef = useRef(onClose)
  const devicesRef = useRef<MediaDeviceInfo[]>([])
  const deviceIndexRef = useRef(0)

  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Starting camera…')
  const [canSwitch, setCanSwitch] = useState(false)

  onBarcodeScannedRef.current = onBarcodeScanned
  onCloseRef.current = onClose

  useEffect(() => {
    let cancelled = false
    const reader = buildReader()

    const onDecode = (result: { getText: () => string } | undefined, err?: unknown) => {
      if (cancelled || handledRef.current) return
      if (result) {
        const text = result.getText().trim()
        if (!text) return
        handledRef.current = true
        setStatus(`Got ${text}`)
        controlsRef.current?.stop()
        onBarcodeScannedRef.current(text)
        onCloseRef.current()
        return
      }
      if (err && !(err instanceof NotFoundException)) {
        const message = String((err as Error).message ?? err)
        if (!message.includes('No MultiFormat Readers') && !message.includes('NotFoundException')) {
          console.warn('Scanner:', err)
        }
      }
    }

    async function start(deviceId?: string) {
      setError(null)
      setStatus('Point the camera at the barcode')
      handledRef.current = false
      const video = videoRef.current
      if (!video) throw new Error('Camera preview is not ready.')

      controlsRef.current?.stop()
      controlsRef.current = null

      if (deviceId) {
        controlsRef.current = await reader.decodeFromVideoDevice(deviceId, video, onDecode)
        return
      }

      try {
        controlsRef.current = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } },
          video,
          onDecode,
        )
      } catch {
        controlsRef.current = await reader.decodeFromVideoDevice(undefined, video, onDecode)
      }
    }

    async function boot() {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      if (cancelled) return
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (cancelled) return
        devicesRef.current = devices
        setCanSwitch(devices.length > 1)
        const laptop = devices.find((d) => /front|user|integrated|webcam/i.test(d.label))
        const pick = laptop ?? devices[0]
        if (pick) deviceIndexRef.current = Math.max(0, devices.findIndex((d) => d.deviceId === pick.deviceId))
        await start(pick?.deviceId)
      } catch (err) {
        if (cancelled) return
        const name = (err as DOMException)?.name
        const message = (err as Error)?.message ?? ''
        if (name === 'NotAllowedError' || message.toLowerCase().includes('permission')) {
          setError('Camera permission was blocked. Allow camera access, then try Scan again.')
        } else if (name === 'NotFoundError') {
          setError('No camera was found on this device.')
        } else {
          setError('Could not start the camera. Close other apps using it, then try again.')
        }
        setStatus('Camera unavailable')
      }
    }

    void boot()

    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [])

  async function switchCamera() {
    const devices = devicesRef.current
    if (devices.length < 2) return
    deviceIndexRef.current = (deviceIndexRef.current + 1) % devices.length
    const next = devices[deviceIndexRef.current]
    if (!next) return
    setStatus('Switching camera…')
    try {
      handledRef.current = false
      const reader = buildReader()
      controlsRef.current?.stop()
      const video = videoRef.current
      if (!video) return
      controlsRef.current = await reader.decodeFromVideoDevice(next.deviceId, video, (result) => {
        if (handledRef.current || !result) return
        const text = result.getText().trim()
        if (!text) return
        handledRef.current = true
        controlsRef.current?.stop()
        onBarcodeScannedRef.current(text)
        onCloseRef.current()
      })
      setStatus('Point the camera at the barcode')
    } catch {
      setError('Could not switch camera.')
    }
  }

  function handleClose() {
    controlsRef.current?.stop()
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal
        aria-label="Scan barcode"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] overflow-hidden rounded-[1.6rem] bg-white p-5 shadow-[0_24px_60px_rgba(37,99,235,0.18)]"
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white bb-blend-bg">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.03em] text-[var(--bb-ink)]">
                Scan barcode
              </h2>
              <p className="text-[12px] font-medium text-[var(--bb-muted)]">{status}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {canSwitch ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => void switchCamera()} aria-label="Switch camera">
                <SwitchCamera className="h-4 w-4" />
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="ghost" onClick={handleClose} aria-label="Close scanner">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-[1.2rem] bg-slate-950">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-64 w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[120px] w-[240px] rounded-lg border-2 border-lime-300/90" />
          </div>
        </div>

        {error ? (
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] font-semibold text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : (
          <p className="mt-3 text-center text-[12px] font-medium text-[var(--bb-muted)]">
            Hold the barcode inside the green box. Use the switch button if this is the wrong camera.
          </p>
        )}
      </div>
    </div>,
    document.body,
  )
}
