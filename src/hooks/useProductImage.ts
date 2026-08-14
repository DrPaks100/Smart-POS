export function useProductImage(imageUrl?: string | null, _imagePath?: string | null) {
  return { src: imageUrl || null, loading: false }
}
