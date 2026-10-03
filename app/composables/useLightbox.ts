import type { InjectionKey } from 'vue'
import type { MediaFragment } from '#graphql-operations'

export const LIGHTBOX_ID = 'project-lightbox'

export interface LightboxItem {
  media: MediaFragment
  el: HTMLElement
}

export interface LightboxContext {
  items: Readonly<Ref<LightboxItem[]>>
  index: Ref<number>
  register: (item: LightboxItem) => () => void
  open: (el: HTMLElement) => void
}

const LightboxKey: InjectionKey<LightboxContext> = Symbol('lightbox')

// ?media=3 apre il lightbox sul terzo media della pagina (1-based, per link condivisibili)
const QUERY_KEY = 'media'

/**
 * Attiva il lightbox per la pagina: i media renderizzati sotto (BlockMedia, ColumnBlockMedia)
 * si registrano e diventano cliccabili; fuori da questo contesto restano statici
 */
export function provideLightbox() {
  const items = shallowRef<LightboxItem[]>([])
  const index = ref(0)
  const { open: openModal, isActive } = useMagicModal(LIGHTBOX_ID)
  const route = useRoute()
  const router = useRouter()

  // i blocchi sono lazy e montano in ordine sparso: si tiene la lista nell'ordine del DOM
  function register(item: LightboxItem) {
    items.value = [...items.value, item].sort((a, b) =>
      a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    return () => {
      items.value = items.value.filter(i => i !== item)
    }
  }

  function open(el: HTMLElement) {
    const i = items.value.findIndex(item => item.el === el)
    if (i < 0)
      return
    index.value = i
    openModal()
  }

  // la slide corrente finisce nella query (replace: il back non scorre le foto)
  watch([isActive, index], ([active, i]) => {
    const value = active ? String(i + 1) : undefined
    if (route.query[QUERY_KEY] === value)
      return
    const { [QUERY_KEY]: _, ...query } = route.query
    router.replace({ query: value ? { ...query, [QUERY_KEY]: value } : query })
  })

  // da un link con ?media=N si apre quando i blocchi lazy hanno finito di registrarsi,
  // altrimenti un blocco montato in ritardo più in alto sposterebbe l'indice
  const target = Number(route.query[QUERY_KEY]) - 1
  if (import.meta.client && Number.isInteger(target) && target >= 0) {
    const stop = watchDebounced(items, (list) => {
      const item = list[target]
      if (!item)
        return
      stop()
      open(item.el)
    }, { debounce: 150 })
  }

  const context: LightboxContext = { items, index, register, open }
  provide(LightboxKey, context)
  return context
}

export function useLightbox() {
  return inject(LightboxKey, undefined)
}
