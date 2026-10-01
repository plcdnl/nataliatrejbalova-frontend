<script setup lang="ts">
import type { CraftImageProps } from '@studio-fes/layer-craft/app/components/CraftImage.vue'
import type { CraftVideoProps } from '@studio-fes/layer-craft/app/components/CraftVideo.vue'
import type { MediaInterfaceFragment } from '@studio-fes/layer-craft/app/types/graphql-operations'
import type { MediaFragment } from '#graphql-operations'

export interface MediaRollerProps {
  media: MediaFragment[]
  /** Velocità di scorrimento in px/s */
  speed?: number
  /** Durata della pausa su ogni manifesto, in secondi */
  hold?: number
  /** Raggio dei rulli in frazione dell'altezza (più basso = curva più stretta) */
  rollRadius?: number
  /** Spazio (px) di nastro tra un manifesto e l'altro */
  gap?: number
  /** px di ripartenza dolce */
  restartDistance?: number
  /** px percorsi durante lo scattino */
  snapDistance?: number
  /** secondi dello scattino */
  snapDuration?: number
  snapEase?: string
  /** Colore del nastro tra un manifesto e l'altro */
  bandColor?: string
  /** Intensità massima dell'ombra sui rulli (0-1) */
  shadeOpacity?: number
  paused?: boolean
  /** Altezza del nastro (qualsiasi valore CSS) */
  height?: string
  label?: string
  imgProps?: CraftImageProps
  videoProps?: CraftVideoProps
}

const props = withDefaults(defineProps<MediaRollerProps>(), {
  speed: 90,
  height: '100svh',
  hold: 3,
  rollRadius: 0.17,
  gap: 24,
  restartDistance: 60,
  snapDistance: 44,
  snapDuration: 0.5,
  snapEase: 'back.out(2)',
  bandColor: '#000000',
  shadeOpacity: 0.92,
  paused: false,
  label: 'Nastro pubblicitario che scorre dal basso verso l\'alto tra due rulli',
})

const emit = defineEmits<{
  /** Un manifesto si è fermato al centro */
  change: [index: number]
  moving: [moving: boolean]
}>()

interface Geometry {
  W: number
  VH: number
  P: number
  r: number
  F: number
  arc: number
  Hp: number
  step: number
  L: number
}

/** Un media renderizzato da CraftMedia e usato come texture */
interface Source {
  el: HTMLImageElement | HTMLVideoElement | null
  tex: WebGLTexture | null
  key: string
  w: number
  h: number
  failed: boolean
}

type MediaWithFocus = MediaFragment & { focalPoint?: (number | null)[] | null }

// Il nastro è una striscia piegata intorno a due rulli: tratto piatto davanti e due quarti di giro
// che arrivano esattamente ai bordi. Tutto ciò che sta dietro viene schiacciato sul bordo e scartato
// (vVis = 0): altrimenti i triangoli tra il bordo alto e quello basso coprirebbero lo schermo.
const VERTEX = /* glsl */ `
attribute vec2 aPos;
uniform float uTop, uLen, uPos, uL, uF, uR, uArc, uP, uVH;
uniform vec4 uUv;
varying vec2 vUv;
varying float vShade;
varying float vVis;
const float PI = 3.14159265;
void main() {
  float u = mod(uTop - aPos.y * uLen + uPos, uL);
  float uf = uF + uArc * 0.5;
  float ub = uL - uArc * 0.5;
  vVis = 1.0;
  if (u > uf && u < ub) {
    u = (u - uf < ub - u) ? uf : ub;
    vVis = 0.0;
  }
  float y; float z; float a = 0.0;
  if (u <= uF) {
    y = uF * 0.5 - u; z = 0.0;
  } else if (u <= uf) {
    a = (u - uF) / uR;
    y = -uF * 0.5 - uR * sin(a); z = -uR + uR * cos(a);
  } else {
    float b = (u - (uL - uArc)) / uR;
    y = uF * 0.5 + uR * sin(b); z = -uR - uR * cos(b);
    a = PI - b;
  }
  vShade = 1.0 - cos(a);
  vUv = uUv.xy + vec2(aPos.x + 0.5, aPos.y) * uUv.zw;
  gl_Position = vec4(2.0 * aPos.x, -2.0 * y / uVH, 0.0, (uP - z) / uP);
}`

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform sampler2D uTex;
uniform float uHasTex, uShadeOpacity;
uniform vec3 uColor, uShadeColor;
varying vec2 vUv;
varying float vShade;
varying float vVis;
void main() {
  if (vVis < 0.999) discard;
  vec3 c = uColor;
  if (uHasTex > 0.5) {
    vec4 t = texture2D(uTex, vUv);
    c = mix(uColor, t.rgb, t.a);
  }
  gl_FragColor = vec4(mix(c, uShadeColor, uShadeOpacity * vShade), 1.0);
}`

const UNIFORMS = ['uTop', 'uLen', 'uPos', 'uL', 'uF', 'uR', 'uArc', 'uP', 'uVH', 'uUv', 'uTex', 'uHasTex', 'uShadeOpacity', 'uColor', 'uShadeColor'] as const
const SHADE_COLOR = [6 / 255, 10 / 255, 16 / 255] as const
const SEGMENT = 6 // px di nastro per ogni segmento della mesh

const stageEl = useTemplateRef<HTMLElement>('stage')
const canvasEl = useTemplateRef<HTMLCanvasElement>('canvas')
const geo = shallowRef<Geometry | null>(null)
const glFailed = ref(false)
const current = ref(0)
/** Il primo manifesto è pronto: il nastro compare in dissolvenza e parte */
const ready = ref(false)

const state = { pos: 0 }
const sourceEls: HTMLElement[] = []
let sources: Source[] = []
let tl: gsap.core.Timeline | null = null
let gl: WebGLRenderingContext | null = null
let uniforms = {} as Record<typeof UNIFORMS[number], WebGLUniformLocation | null>
let vertexCount = 0
let dirty = true

const mergedImgProps = computed<CraftImageProps>(() => ({
  sizes: '1024px lg:100vw',
  // passa dal proxy del server: l'immagine arriva dallo stesso dominio e si può usare come texture
  provider: 'mediaProxy',
  ...props.imgProps,
}))

// la riproduzione la gestisce il nastro: parte solo quando il manifesto è in vista
const mergedVideoProps = computed<CraftVideoProps>(() => ({
  autoplay: false,
  muted: true,
  loop: true,
  pauseOnLeave: false,
  ...props.videoProps,
}))

// anche i video passano dal proxy, per lo stesso motivo
const sourceMedia = computed(() => props.media.map(item =>
  item.kind === 'video' ? { ...item, url: mediaProxyUrl(item.url) } : item,
))

const bandRgb = computed(() => {
  if (!import.meta.client)
    return [0, 0, 0]
  const ctx = document.createElement('canvas').getContext('2d')!
  ctx.fillStyle = props.bandColor
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r! / 255, g! / 255, b! / 255]
})

function measure() {
  const el = stageEl.value
  if (!el)
    return
  const W = el.clientWidth
  const VH = el.clientHeight
  const prev = geo.value
  // ignora i piccoli resize in altezza (barra degli indirizzi su mobile)
  if (!W || !VH || (prev && Math.abs(W - prev.W) <= 2 && Math.abs(VH - prev.VH) <= 40))
    return

  const P = VH * 6 // prospettiva morbida
  const r = VH * props.rollRadius
  // lunghezza del tratto piatto: le curve arrivano esattamente ai bordi
  const F = VH * (P + r) / P - 2 * r
  const arc = Math.PI * r // due quarti di giro visibili
  const Hp = F + arc // altezza del manifesto sul nastro
  const step = Hp + props.gap
  const L = Math.max(props.media.length, 1) * step

  geo.value = { W, VH, P, r, F, arc, Hp, step, L }
}

// --- WebGL ---

function initGL() {
  const canvas = canvasEl.value
  const ctx = canvas?.getContext('webgl', { alpha: false, antialias: true, premultipliedAlpha: false })
  if (!ctx) {
    glFailed.value = true
    return
  }

  const compile = (type: number, src: string) => {
    const shader = ctx.createShader(type)!
    ctx.shaderSource(shader, src)
    ctx.compileShader(shader)
    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS))
      throw new Error(ctx.getShaderInfoLog(shader) ?? 'shader')
    return shader
  }

  try {
    const program = ctx.createProgram()!
    ctx.attachShader(program, compile(ctx.VERTEX_SHADER, VERTEX))
    ctx.attachShader(program, compile(ctx.FRAGMENT_SHADER, FRAGMENT))
    ctx.linkProgram(program)
    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS))
      throw new Error(ctx.getProgramInfoLog(program) ?? 'program')
    ctx.useProgram(program)

    uniforms = Object.fromEntries(UNIFORMS.map(name => [name, ctx.getUniformLocation(program, name)])) as typeof uniforms
    ctx.bindBuffer(ctx.ARRAY_BUFFER, ctx.createBuffer())
    const aPos = ctx.getAttribLocation(program, 'aPos')
    ctx.enableVertexAttribArray(aPos)
    ctx.vertexAttribPointer(aPos, 2, ctx.FLOAT, false, 0, 0)
    ctx.uniform1i(uniforms.uTex, 0)
  }
  catch (error) {
    console.error('[MediaRoller]', error)
    glFailed.value = true
    return
  }

  gl = ctx
  // le texture vanno ricaricate su un contesto nuovo
  sources = []
  resizeGL()
}

function resizeGL() {
  const g = geo.value
  const canvas = canvasEl.value
  if (!gl || !g || !canvas)
    return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(g.W * dpr)
  canvas.height = Math.round(g.VH * dpr)
  gl.viewport(0, 0, canvas.width, canvas.height)

  // una striscia suddivisa in segmenti: x in [-0.5, 0.5], v in [0, 1] dall'alto
  const segments = Math.max(8, Math.ceil(g.Hp / SEGMENT))
  const data = new Float32Array((segments + 1) * 4)
  for (let i = 0; i <= segments; i++)
    data.set([-0.5, i / segments, 0.5, i / segments], i * 4)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  vertexCount = (segments + 1) * 2
  dirty = true
}

function createTexture(ctx: WebGLRenderingContext) {
  const tex = ctx.createTexture()
  ctx.bindTexture(ctx.TEXTURE_2D, tex)
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE)
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE)
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR)
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR)
  return tex
}

function upload(s: Source, el: TexImageSource, w: number, h: number) {
  if (!gl)
    return
  s.tex ??= createTexture(gl)
  gl.bindTexture(gl.TEXTURE_2D, s.tex)
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)
    s.w = w
    s.h = h
    dirty = true
  }
  catch (error) {
    // tipicamente un media di un altro dominio che non è passato dal proxy
    s.failed = true
    console.error('[MediaRoller]', error)
  }
}

/** Il manifesto p si trova (anche in parte) nel tratto visibile del nastro */
function isPosterVisible(p: number) {
  const g = geo.value!
  const start = (((-g.arc / 2 - p * g.step + state.pos) % g.L) + g.L) % g.L
  const d = (((start - (g.L - g.arc / 2)) % g.L) + g.L) % g.L
  return d < g.Hp || d > g.L - g.Hp
}

// Aggancia gli <img>/<video> renderizzati da CraftMedia e aggiorna le texture quando cambiano
function syncSources() {
  props.media.forEach((_, p) => {
    const s = (sources[p] ??= { el: null, tex: null, key: '', w: 0, h: 0, failed: false })
    if (s.failed)
      return

    if (!s.el?.isConnected) {
      const host = sourceEls[p]?.querySelector('img, video, hls-video') as (HTMLElement & { nativeEl?: HTMLVideoElement }) | null
      s.el = (host?.nativeEl ?? host) as Source['el']
      s.key = ''
    }

    const el = s.el
    if (el instanceof HTMLImageElement) {
      // currentSrc cambia quando il browser sceglie un'altra risoluzione dal srcset
      if (el.complete && el.naturalWidth && el.currentSrc !== s.key) {
        s.key = el.currentSrc
        upload(s, el, el.naturalWidth, el.naturalHeight)
      }
    }
    else if (el instanceof HTMLVideoElement) {
      const visible = isPosterVisible(p)
      if (visible && el.paused)
        el.play().catch(() => {})
      else if (!visible && !el.paused)
        el.pause()

      const key = `${el.currentSrc}#${el.currentTime}`
      if (el.readyState >= 2 && el.videoWidth && key !== s.key) {
        s.key = key
        upload(s, el, el.videoWidth, el.videoHeight)
      }
    }
  })

  const first = sources[0]
  if (!ready.value && first && (first.w || first.failed))
    ready.value = true
}

// Ritaglio "cover" della texture, centrato sul punto focale di Craft se c'è
function coverRect(s: Source, item: MediaWithFocus): [number, number, number, number] {
  const g = geo.value!
  const scale = Math.max(g.W / s.w, g.Hp / s.h)
  const sx = g.W / (s.w * scale)
  const sy = g.Hp / (s.h * scale)
  const fx = item.focalPoint?.[0] ?? 0.5
  const fy = item.focalPoint?.[1] ?? 0.5
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max)
  return [clamp(fx - sx / 2, 1 - sx), clamp(fy - sy / 2, 1 - sy), sx, sy]
}

function drawBand(top: number, length: number, s?: Source, item?: MediaFragment) {
  const ctx = gl!
  const ready = !!(s?.tex && s.w && item)
  ctx.uniform1f(uniforms.uTop, top)
  ctx.uniform1f(uniforms.uLen, length)
  ctx.uniform1f(uniforms.uHasTex, ready ? 1 : 0)
  if (ready) {
    ctx.bindTexture(ctx.TEXTURE_2D, s!.tex)
    ctx.uniform4fv(uniforms.uUv, coverRect(s!, item!))
  }
  ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, vertexCount)
}

function draw() {
  const g = geo.value!
  const ctx = gl!
  const [r, gr, b] = bandRgb.value as [number, number, number]
  ctx.clearColor(r, gr, b, 1)
  ctx.clear(ctx.COLOR_BUFFER_BIT)

  ctx.uniform1f(uniforms.uPos, state.pos % g.L)
  ctx.uniform1f(uniforms.uL, g.L)
  ctx.uniform1f(uniforms.uF, g.F)
  ctx.uniform1f(uniforms.uR, g.r)
  ctx.uniform1f(uniforms.uArc, g.arc)
  ctx.uniform1f(uniforms.uP, g.P)
  ctx.uniform1f(uniforms.uVH, g.VH)
  ctx.uniform1f(uniforms.uShadeOpacity, props.shadeOpacity)
  ctx.uniform3f(uniforms.uColor, r, gr, b)
  ctx.uniform3f(uniforms.uShadeColor, ...SHADE_COLOR)

  props.media.forEach((item, p) => {
    const top = -g.arc / 2 - p * g.step // il manifesto p arriva al centro dopo p scatti
    drawBand(top + g.Hp, g.Hp, sources[p], item)
    if (props.gap > 0)
      drawBand(top, props.gap) // nastro scuro sotto al manifesto, così si ombreggia anche lui
  })
}

function frame() {
  if (!gl || !geo.value || gl.isContextLost())
    return
  syncSources()
  if (!dirty)
    return
  dirty = false
  draw()
}

// --- Timeline: ripartenza dolce, cammino costante, scattino, pausa ---

function build() {
  tl?.kill()
  tl = null
  state.pos = 0
  current.value = 0
  dirty = true

  const g = geo.value
  const N = props.media.length
  if (!g || !N)
    return

  const restartTime = (2 * props.restartDistance) / props.speed // con power1.in la velocità finale = speed
  const drift = g.step - props.restartDistance - props.snapDistance
  const driftTime = drift / props.speed

  tl = gsap.timeline({
    repeat: -1,
    paused: true,
    onUpdate: () => {
      dirty = true
    },
  })

  let cur = 0
  for (let i = 0; i < N; i++) {
    const lab = `step${i}`
    const snap = `snap${i}`
    const next = (i + 1) % N
    tl.addLabel(lab)
      .call(() => emit('moving', true), [], lab)
      .fromTo(state, { pos: cur }, { pos: cur + props.restartDistance, duration: restartTime, ease: 'power1.in', immediateRender: false }, lab)
      .fromTo(state, { pos: cur + props.restartDistance }, { pos: cur + props.restartDistance + drift, duration: driftTime, ease: 'none', immediateRender: false })
      .addLabel(snap)
      .fromTo(state, { pos: cur + props.restartDistance + drift }, { pos: cur + g.step, duration: props.snapDuration, ease: props.snapEase, immediateRender: false }, snap)
      .call(() => {
        current.value = next
        emit('moving', false)
        emit('change', next)
      }, [], `${snap}+=${props.snapDuration}`)
      .to({}, { duration: props.hold })
    cur += g.step
  }

  syncPlayback()
}

const visibility = useDocumentVisibility()

function syncPlayback() {
  if (!tl)
    return
  if (!ready.value || props.paused || visibility.value === 'hidden')
    tl.pause()
  else
    tl.resume()
}

function setSourceRef(p: number, el: unknown) {
  if (el)
    sourceEls[p] = el as HTMLElement
}

function onContextLost(event: Event) {
  event.preventDefault()
  gl = null
}

useResizeObserver(stageEl, useDebounceFn(measure, 300))
useEventListener(canvasEl, 'webglcontextlost', onContextLost)
useEventListener(canvasEl, 'webglcontextrestored', initGL)

watch(
  () => [props.rollRadius, props.gap, props.media.length],
  () => {
    geo.value = null
    sources = []
    measure()
  },
)

watch(geo, resizeGL)

watch(
  [geo, () => props.speed, () => props.hold, () => props.restartDistance, () => props.snapDistance, () => props.snapDuration, () => props.snapEase],
  build,
)

watch([() => props.bandColor, () => props.shadeOpacity], () => {
  dirty = true
})

watch([ready, () => props.paused, visibility], syncPlayback)

watch(glFailed, (failed) => {
  if (failed)
    ready.value = true
})

onMounted(() => {
  initGL()
  measure()
  gsap.ticker.add(frame)
})

onBeforeUnmount(() => {
  gsap.ticker.remove(frame)
  tl?.kill()
  tl = null
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  gl = null
})
</script>

<template>
  <div
    ref="stage"
    class="w-full relative overflow-hidden"
    :style="{ background: bandColor, height }"
    role="img"
    :aria-label="label"
  >
    <!-- Ogni media è renderizzato una sola volta da CraftMedia e fa da texture per il nastro.
         Se WebGL non è disponibile resta visibile il manifesto corrente. -->
    <div
      class="pointer-events-none inset-0 absolute"
      :class="{ 'opacity-0': !glFailed }"
      aria-hidden="true"
    >
      <div
        v-for="(item, p) in sourceMedia"
        v-show="!glFailed || p === current"
        :key="item.id ?? p"
        :ref="el => setSourceRef(p, el)"
        class="size-full left-0 top-0 absolute overflow-hidden"
        :style="geo && !glFailed ? { width: `${geo.W}px`, height: `${geo.Hp}px` } : undefined"
      >
        <CraftMedia
          class="size-full object-cover"
          :media="(item as MediaInterfaceFragment)"
          :img-props="mergedImgProps"
          :video-props="mergedVideoProps"
        />
      </div>
    </div>
    <canvas
      v-show="!glFailed"
      ref="canvas"
      class="motion-natural size-full inset-0 absolute"
      :class="{ 'opacity-0': !ready }"
      aria-hidden="true"
    />
  </div>
</template>
