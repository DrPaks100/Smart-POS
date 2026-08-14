import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-3">
      <PageHeader eyebrow="Best Brightness" title={title} />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-amber-50 via-yellow-50 to-white px-6 py-14 text-center ring-1 ring-amber-100"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500" />

        <motion.div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950 shadow-[0_10px_24px_rgba(245,158,11,0.38)]"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Construction className="h-6 w-6" strokeWidth={2.2} />
        </motion.div>

        <h2 className="mt-4 font-[family-name:var(--font-display)] text-[1.4rem] font-extrabold tracking-[-0.04em] text-amber-950">
          Under construction
        </h2>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-amber-700/80">
          In progress
        </p>

        <div className="mx-auto mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-amber-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
            initial={{ width: '18%' }}
            animate={{ width: ['18%', '72%', '42%', '72%'] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.section>
    </div>
  )
}
