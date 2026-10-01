/** Stesso ordine delle classi selection in pages/index.vue (peach, blush, sky, lime) */
export const PALETTE = ['#F6E8D8', '#FCEFEF', '#E7EEF9', '#F5F6DD'] as const

export function faviconSvg(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${color}"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
