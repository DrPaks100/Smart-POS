/** Thin pencil-style product sketches for Best Brightness retail. */
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.15,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Bottle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 64" className={className} aria-hidden>
      <path {...stroke} d="M20 8h8v8c4 2 6 6 6 12v28a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V28c0-6 2-10 6-12V8z" />
      <path {...stroke} d="M20 8c0-3 2-5 4-5s4 2 4 5" />
      <path {...stroke} d="M16 36h16" />
    </svg>
  )
}

function Mug({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 48" className={className} aria-hidden>
      <path {...stroke} d="M8 12h28v24a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8V12z" />
      <path {...stroke} d="M36 18h6a8 8 0 0 1 0 16h-6" />
      <path {...stroke} d="M14 8c2-3 6-4 10-2" />
    </svg>
  )
}

function Spatula({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 72" className={className} aria-hidden>
      <path {...stroke} d="M10 4h12v18H10z" />
      <path {...stroke} d="M14 8v10M18 8v10M22 8v10" />
      <path {...stroke} d="M16 22v42a4 4 0 0 0 0 0" />
      <path {...stroke} d="M14 64h4" />
    </svg>
  )
}

function Pan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 40" className={className} aria-hidden>
      <ellipse {...stroke} cx="28" cy="22" rx="22" ry="12" />
      <path {...stroke} d="M48 20h18a4 4 0 0 1 0 8H50" />
      <path {...stroke} d="M14 16c4-6 16-8 26-2" />
    </svg>
  )
}

function Spray({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 64" className={className} aria-hidden>
      <path {...stroke} d="M12 20h16v36a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V20z" />
      <path {...stroke} d="M16 20V12h8v8" />
      <path {...stroke} d="M20 12V6M16 8l4-4 4 4" />
      <path {...stroke} d="M14 34h12" />
    </svg>
  )
}

function Basket({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden>
      <path {...stroke} d="M10 16h44l-4 24H14L10 16z" />
      <path {...stroke} d="M8 16h48" />
      <path {...stroke} d="M20 16c0-8 8-12 12-12s12 4 12 12" />
      <path {...stroke} d="M18 28h28M16 36h32" />
    </svg>
  )
}

function Sponge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 36" className={className} aria-hidden>
      <rect {...stroke} x="6" y="8" width="44" height="22" rx="6" />
      <circle {...stroke} cx="18" cy="18" r="1.2" />
      <circle {...stroke} cx="28" cy="22" r="1.2" />
      <circle {...stroke} cx="38" cy="16" r="1.2" />
      <circle {...stroke} cx="24" cy="14" r="1.2" />
    </svg>
  )
}

function Broom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 72" className={className} aria-hidden>
      <path {...stroke} d="M18 4v40" />
      <path {...stroke} d="M8 44h20l-2 22H10L8 44z" />
      <path {...stroke} d="M12 50v12M18 50v12M24 50v12" />
    </svg>
  )
}

function Bin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" className={className} aria-hidden>
      <path {...stroke} d="M12 16h24l-2 32H14L12 16z" />
      <path {...stroke} d="M10 16h28" />
      <path {...stroke} d="M18 16V10h12v6" />
      <path {...stroke} d="M20 24v16M28 24v16" />
    </svg>
  )
}

function Whisk({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 72" className={className} aria-hidden>
      <path {...stroke} d="M18 28v40" />
      <path {...stroke} d="M18 28c-10-2-14-12-10-20 6 4 10 12 10 20z" />
      <path {...stroke} d="M18 28c10-2 14-12 10-20-6 4-10 12-10 20z" />
      <path {...stroke} d="M10 14c4 6 8 10 8 14M26 14c-4 6-8 10-8 14" />
    </svg>
  )
}

const PLACEMENTS = [
  { Comp: Bottle, className: 'left-[6%] top-[12%] w-10 rotate-[-12deg]' },
  { Comp: Mug, className: 'right-[8%] top-[14%] w-12 rotate-[8deg]' },
  { Comp: Spatula, className: 'left-[14%] top-[42%] w-7 rotate-[18deg]' },
  { Comp: Pan, className: 'right-[6%] top-[38%] w-14 rotate-[-6deg]' },
  { Comp: Spray, className: 'left-[4%] bottom-[18%] w-9 rotate-[10deg]' },
  { Comp: Basket, className: 'right-[10%] bottom-[22%] w-12 rotate-[-8deg]' },
  { Comp: Sponge, className: 'left-[22%] top-[8%] w-11 rotate-[4deg]' },
  { Comp: Broom, className: 'right-[18%] top-[48%] w-8 rotate-[-14deg]' },
  { Comp: Bin, className: 'left-[28%] bottom-[10%] w-10 rotate-[6deg]' },
  { Comp: Whisk, className: 'right-[28%] bottom-[8%] w-8 rotate-[12deg]' },
  { Comp: Bottle, className: 'left-[42%] top-[6%] w-8 rotate-[16deg]' },
  { Comp: Mug, className: 'right-[40%] top-[70%] w-10 rotate-[-10deg]' },
  { Comp: Pan, className: 'left-[48%] bottom-[16%] w-12 rotate-[14deg]' },
  { Comp: Spray, className: 'right-[48%] top-[10%] w-8 rotate-[-18deg]' },
  { Comp: Sponge, className: 'left-[70%] bottom-[40%] w-10 rotate-[9deg]' },
  { Comp: Basket, className: 'left-[8%] top-[62%] w-11 rotate-[-4deg]' },
  { Comp: Spatula, className: 'right-[12%] bottom-[42%] w-6 rotate-[22deg]' },
  { Comp: Broom, className: 'left-[58%] top-[28%] w-7 rotate-[-20deg]' },
] as const

export function LoginSketchBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden text-[#64748b]/[0.22]"
    >
      {PLACEMENTS.map(({ Comp, className }, i) => (
        <Comp key={i} className={`absolute ${className}`} />
      ))}
    </div>
  )
}
