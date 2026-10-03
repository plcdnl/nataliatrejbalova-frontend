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

/**
 * Attiva il lightbox per la pagina: i media renderizzati sotto (BlockMedia, ColumnBlockMedia)
 * si registrano e diventano cliccabili; fuori da questo contesto restano statici
 */
export function provideLightbox() {
  const items = shallowRef<LightboxItem[]>([])
  const index = ref(0)
  const { open: openModal } = useMagicModal(LIGHTBOX_ID)

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

  const context: LightboxContext = { items, index, register, open }
  provide(LightboxKey, context)
  return context
}

export function useLightbox() {
  return inject(LightboxKey, undefined)
}
