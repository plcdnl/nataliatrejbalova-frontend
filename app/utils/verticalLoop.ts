export interface VerticalLoopOptions {
  center?: boolean
  speed?: number
  paused?: boolean
  repeat?: number
  reversed?: boolean
  paddingBottom?: number
  snap?: number | boolean
  onChange?: (currentItem?: HTMLElement, currentIndex?: number) => void
}

export type VerticalLoopTimeline = gsap.core.Timeline & {
  times: number[]
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline
  next: (vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline
  previous: (vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline
  current: () => number
  closestIndex: (setCurrent?: boolean) => number
  destroy: () => void
}

export function verticalLoop(items: HTMLElement[], config: VerticalLoopOptions = {}): VerticalLoopTimeline | undefined {
  if (!Array.isArray(items) || items.length < 2) {
    console.warn('verticalLoop(): Please provide an array of at least two elements.')
    return
  }

  const loopItems = gsap.utils.toArray<HTMLElement>(items)
  const length = loopItems.length

  let tl!: VerticalLoopTimeline
  const ctx = gsap.context(() => {
    const onChange = config.onChange
    let lastIndex = 0
    tl = gsap.timeline({
      repeat: config.repeat,
      onUpdate: () => {
        if (onChange) {
          const i = tl.closestIndex()
          if (lastIndex !== i) {
            lastIndex = i
            onChange(loopItems[i], i)
          }
        }
      },
      paused: config.paused,
      defaults: { ease: 'none' },
      onReverseComplete: () => {
        tl.totalTime(tl.rawTime() + tl.duration() * 100)
      },
    }) as VerticalLoopTimeline

    const startY = loopItems[0]!.offsetTop
    const times: number[] = []
    const heights: number[] = []
    const spaceBefore: number[] = []
    const yPercents: number[] = []
    let curIndex = 0
    let indexIsDirty = false
    const pixelsPerSecond = (config.speed || 1) * 100
    const snap = config.snap === false ? (v: number) => v : gsap.utils.snap(typeof config.snap === 'number' ? config.snap : 1)
    const container = loopItems[0]!.parentNode as HTMLElement
    let totalHeight = 0
    let timeWrap: (t: number) => number

    const getTotalHeight = () => {
      const last = loopItems[length - 1]!
      return last.offsetTop
        + yPercents[length - 1]! / 100 * heights[length - 1]!
        - startY
        + spaceBefore[0]!
        + last.offsetHeight * (gsap.getProperty(last, 'scaleY') as number)
        + (Number(config.paddingBottom) || 0)
    }

    const populateHeights = () => {
      let b1 = container.getBoundingClientRect()
      loopItems.forEach((el, i) => {
        heights[i] = Number.parseFloat(String(gsap.getProperty(el, 'height', 'px')))
        yPercents[i] = snap(Number.parseFloat(String(gsap.getProperty(el, 'y', 'px'))) / heights[i]! * 100 + Number(gsap.getProperty(el, 'yPercent')))
        const b2 = el.getBoundingClientRect()
        spaceBefore[i] = b2.top - (i ? b1.bottom : b1.top)
        b1 = b2
      })
      gsap.set(loopItems, { yPercent: i => yPercents[i] || 0 })
      totalHeight = getTotalHeight()
    }

    const populateOffsets = () => {
      if (!config.center)
        return
      const timeOffset = tl.duration() * (container.offsetHeight / 2) / totalHeight
      times.forEach((_, i) => {
        times[i] = timeWrap((tl.labels[`label${i}`] || 0) + tl.duration() * heights[i]! / 2 / totalHeight - timeOffset)
      })
    }

    const getClosest = (values: number[], value: number, wrap: number) => {
      let i = values.length
      let closest = 1e10
      let index = 0
      while (i--) {
        let d = Math.abs(values[i]! - value)
        if (d > wrap / 2)
          d = wrap - d
        if (d < closest) {
          closest = d
          index = i
        }
      }
      return index
    }

    const populateTimeline = () => {
      tl.clear()
      loopItems.forEach((item, i) => {
        const curY = yPercents[i]! / 100 * heights[i]!
        const distanceToStart = item.offsetTop + curY - startY + spaceBefore[0]!
        const distanceToLoop = distanceToStart + heights[i]! * (gsap.getProperty(item, 'scaleY') as number)
        tl.to(item, {
          yPercent: snap((curY - distanceToLoop) / heights[i]! * 100),
          duration: distanceToLoop / pixelsPerSecond,
        }, 0)
          .fromTo(item, {
            yPercent: snap((curY - distanceToLoop + totalHeight) / heights[i]! * 100),
          }, {
            yPercent: yPercents[i],
            duration: (totalHeight - distanceToLoop) / pixelsPerSecond,
            immediateRender: false,
          }, distanceToLoop / pixelsPerSecond)
          .add(`label${i}`, distanceToStart / pixelsPerSecond)
        times[i] = distanceToStart / pixelsPerSecond
      })
      timeWrap = gsap.utils.wrap(0, tl.duration())
    }

    gsap.set(loopItems, { y: 0 })
    populateHeights()
    populateTimeline()
    populateOffsets()

    function toIndex(index: number, vars: gsap.TweenVars = {}) {
      vars.ease ??= 'power2.out'
      if (typeof vars.duration !== 'number')
        vars.duration = 0.4
      if (Math.abs(index - curIndex) > length / 2)
        index += index > curIndex ? -length : length
      const newIndex = gsap.utils.wrap(0, length, index)
      let time = times[newIndex]!
      if ((time > tl.time()) !== (index > curIndex) && index !== curIndex)
        time += tl.duration() * (index > curIndex ? 1 : -1)
      if (time < 0 || time > tl.duration())
        vars.modifiers = { time: timeWrap }
      curIndex = newIndex
      vars.overwrite = true
      return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars)
    }

    tl.toIndex = toIndex
    tl.closestIndex = (setCurrent) => {
      const index = getClosest(times, tl.time(), tl.duration())
      if (setCurrent) {
        curIndex = index
        indexIsDirty = false
      }
      return index
    }
    tl.current = () => indexIsDirty ? tl.closestIndex(true) : curIndex
    tl.next = vars => toIndex(tl.current() + 1, vars)
    tl.previous = vars => toIndex(tl.current() - 1, vars)
    tl.times = times
    tl.progress(1, true).progress(0, true)

    if (config.reversed) {
      tl.vars.onReverseComplete?.()
      tl.reverse()
    }

    tl.closestIndex(true)
    lastIndex = curIndex
    onChange?.(loopItems[curIndex], curIndex)
  })

  tl.destroy = () => {
    tl.kill()
    ctx.revert()
    tl.times = []
  }

  return tl
}
