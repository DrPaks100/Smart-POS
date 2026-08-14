/** Retail-safe catalogue text — blocks explicit / abusive product copy. */

const BLOCKED = [
  'porn',
  'xxx',
  'nude',
  'nudes',
  'naked',
  'sex',
  'sexy',
  'sexual',
  'erotic',
  'fetish',
  'nsfw',
  'onlyfans',
  'hentai',
  'boob',
  'boobs',
  'breast',
  'breasts',
  'penis',
  'vagina',
  'dick',
  'cock',
  'pussy',
  'asshole',
  'anal',
  'oral',
  'blowjob',
  'handjob',
  'orgasm',
  'masturbat',
  'dildo',
  'vibrator',
  'condom',
  'viagra',
  'escort',
  'hooker',
  'prostitute',
  'whore',
  'slut',
  'rape',
  'rapist',
  'incest',
  'pedo',
  'paedo',
  'child porn',
  'cp ',
  'kill',
  'murder',
  'terror',
  'bomb',
  'nigger',
  'nigga',
  'faggot',
  'retard',
  'fuck',
  'fucking',
  'shit',
  'bitch',
  'cunt',
  'damn',
]

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[@$0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function findBlockedPhrase(text: string): string | null {
  const n = normalize(text)
  if (!n) return null
  for (const word of BLOCKED) {
    if (n.includes(word)) return word.trim()
  }
  return null
}

export function assertSafeCatalogueText(label: string, text: string | undefined | null) {
  const value = (text ?? '').trim()
  if (!value) return
  const hit = findBlockedPhrase(value)
  if (hit) {
    throw new Error(
      `${label} is not allowed on this shop floor. Use a normal retail product name.`,
    )
  }
}

function isSkinTone(r: number, g: number, b: number) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return (
    r > 95 &&
    g > 40 &&
    b > 20 &&
    r > g &&
    r > b &&
    max - min > 15 &&
    Math.abs(r - g) > 15
  )
}

/**
 * Lightweight client-side photo check for retail products.
 * Rejects images that look like mostly skin / body close-ups.
 */
export async function assertSafeProductImage(file: File): Promise<void> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only product photos are allowed.')
  }
  if (file.size > 8_000_000) {
    throw new Error('Photo is too large. Use a clearer product shot under 8MB.')
  }

  const bitmap = await createImageBitmap(file)
  try {
    const sample = 96
    const canvas = document.createElement('canvas')
    canvas.width = sample
    canvas.height = sample
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.drawImage(bitmap, 0, 0, sample, sample)
    const { data } = ctx.getImageData(0, 0, sample, sample)

    let skin = 0
    let total = 0
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]!
      const g = data[i + 1]!
      const b = data[i + 2]!
      const a = data[i + 3]!
      if (a < 40) continue
      total += 1
      if (isSkinTone(r, g, b)) skin += 1
    }

    if (total > 80 && skin / total > 0.42) {
      throw new Error(
        'That photo does not look like a shop product. Upload a clear product package or bottle shot.',
      )
    }
  } finally {
    bitmap.close()
  }
}
