import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface AppModalProps {
  open: boolean
  onClose?: () => void
  labelledBy?: string
  children: ReactNode
  panelClassName?: string
}

export function AppModal({ open, onClose, labelledBy, children, panelClassName }: AppModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={labelledBy}
            initial={{ y: 14, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className={
              panelClassName ??
              'relative z-[1] w-full max-w-[360px] max-h-[min(92vh,640px)] overflow-y-auto rounded-[1.25rem] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)] ring-1 ring-black/5'
            }
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
