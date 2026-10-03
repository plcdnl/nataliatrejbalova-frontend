export type MediaRatio = [number, number]

export interface MediaRatioFields {
  mediaOrientation?: string | null
  mediaRatio?: string | null
  mediaRatioCustomW?: number | null
  mediaRatioCustomH?: number | null
  mediaRatioLandscape?: string | null
  mediaRatioLandscapeCustomW?: number | null
  mediaRatioLandscapeCustomH?: number | null
  mediaOrientationMobile?: string | null
  mediaRatioMobileEnabled?: boolean | null
  mediaRatioMobile?: string | null
  mediaRatioMobileCustomW?: number | null
  mediaRatioMobileCustomH?: number | null
  mediaRatioMobileLandscape?: string | null
  mediaRatioMobileLandscapeCustomW?: number | null
  mediaRatioMobileLandscapeCustomH?: number | null
}

function parseRatio(
  dropdown: string | null | undefined,
  w: number | null | undefined,
  h: number | null | undefined,
): MediaRatio | undefined {
  if (!dropdown)
    return undefined
  if (dropdown === 'custom') {
    if (w && h)
      return [w, h]
    return undefined
  }
  const parts = dropdown.split(':').map(Number)
  if (parts.length === 2 && parts.every(n => !Number.isNaN(n)))
    return parts as MediaRatio
  return undefined
}

export function mediaRatioToCss(ratio: MediaRatio | undefined): string | undefined {
  return ratio ? `${ratio[0]} / ${ratio[1]}` : undefined
}

/**
 * Proporzioni originali del file, come `--ratio-natural`: senza un ratio impostato in Craft
 * riservano comunque lo spazio prima che l'immagine (lazy) sia caricata
 */
export function mediaNaturalRatioStyle(media: { width?: number | null, height?: number | null } | null | undefined) {
  return {
    '--ratio-natural': media?.width && media?.height ? mediaRatioToCss([media.width, media.height]) : undefined,
  }
}

/**
 * Reads the CMS "media ratio" field group (mediaRatio/mediaRatioCustomW/…, and
 * their landscape + mobile counterparts) off any data object that has it, and
 * resolves it into ratio tuples and matching `--ratio` / `--ratio-mobile` CSS vars.
 * Fields that aren't present just resolve to no ratio.
 */
export function useMediaRatio(data: MaybeRefOrGetter<MediaRatioFields | null | undefined>) {
  const ratio = computed(() => {
    const fields = toValue(data)
    if (!fields)
      return undefined
    return fields.mediaOrientation === 'landscape'
      ? parseRatio(fields.mediaRatioLandscape, fields.mediaRatioLandscapeCustomW, fields.mediaRatioLandscapeCustomH)
      : parseRatio(fields.mediaRatio, fields.mediaRatioCustomW, fields.mediaRatioCustomH)
  })

  const ratioMobile = computed(() => {
    const fields = toValue(data)
    if (!fields || !fields.mediaRatioMobileEnabled)
      return undefined
    return fields.mediaOrientationMobile === 'landscape'
      ? parseRatio(fields.mediaRatioMobileLandscape, fields.mediaRatioMobileLandscapeCustomW, fields.mediaRatioMobileLandscapeCustomH)
      : parseRatio(fields.mediaRatioMobile, fields.mediaRatioMobileCustomW, fields.mediaRatioMobileCustomH)
  })

  const style = computed(() => ({
    '--ratio': mediaRatioToCss(ratio.value),
    '--ratio-mobile': mediaRatioToCss(ratioMobile.value),
  }))

  return { ratio, ratioMobile, style }
}
