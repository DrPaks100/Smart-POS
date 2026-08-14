const MAX_EDGE = 420
const JPEG_QUALITY = 0.7
const MAX_BYTES = 90_000

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read the photo.'))
    reader.readAsDataURL(blob)
  })
}

async function compressToJpeg(file: File, edge: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not prepare the photo.')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  )
  if (!blob) throw new Error('Could not compress the photo.')
  return blob
}

export async function uploadProductImage(input: {
  storeId?: string
  file: File
  productKey?: string
}) {
  if (!input.file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.')
  }

  let edge = MAX_EDGE
  let quality = JPEG_QUALITY
  let blob: Blob | null = null

  try {
    for (let i = 0; i < 5; i++) {
      blob = await compressToJpeg(input.file, edge, quality)
      if (blob.size <= MAX_BYTES) break
      edge = Math.max(220, Math.round(edge * 0.82))
      quality = Math.max(0.48, quality - 0.08)
    }
  } catch {
    blob = input.file
  }

  if (!blob) {
    throw new Error('Could not process that photo. Try another image.')
  }

  const downloadURL = await blobToDataUrl(blob)
  if (downloadURL.length > 700_000) {
    throw new Error('Photo is still too large. Try a clearer, closer shot.')
  }

  return { downloadURL, path: null as string | null }
}

export async function deleteStoragePath(_path: string | undefined) {
  /* Photos live on the product in Firestore — nothing to delete in Storage. */
}
