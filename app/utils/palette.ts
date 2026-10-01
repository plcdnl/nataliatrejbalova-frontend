/** Stesso ordine delle classi selection in pages/index.vue (peach, blush, sky, lime) */
export const PALETTE = ['#F6E8D8', '#FCEFEF', '#E7EEF9', '#F5F6DD'] as const

/** Favicon statici in public/favicons, stesso ordine di PALETTE */
export const FAVICONS = ['peach', 'blush', 'sky', 'lime'].map(name => `/favicons/${name}.svg`)
