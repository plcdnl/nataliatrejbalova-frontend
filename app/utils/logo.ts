/**
 * Static logos in /public/logo. Every variant sits in the same 1190×480 frame at the same scale,
 * so they all render at one size: the boxed SVGs come framed, the plain ones are sized into it here
 */
export const LOGO_FRAME = [1190, 480] as const
export const LOGO_SIZES = [[1080, 480], [640, 480], [730, 480], [1190, 280], [1090, 380]] as const

export function logoMask(src: string, [w, h]: readonly [number, number] = LOGO_FRAME, position = 'center') {
  const size = `${(w / LOGO_FRAME[0]) * 100}% ${(h / LOGO_FRAME[1]) * 100}%`
  return {
    aspectRatio: `${LOGO_FRAME[0]} / ${LOGO_FRAME[1]}`,
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: size,
    WebkitMaskSize: size,
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: position,
    WebkitMaskPosition: position,
  }
}
