import type { LocaleObject } from '@nuxtjs/i18n'

export default [
  {
    code: 'it',
    language: 'it-IT',
    name: 'Italiano',
    file: 'it.ts',
  },
  {
    code: 'en',
    language: 'en-GB',
    default: true,
    name: 'English',
    file: 'en.ts',
  },
] as LocaleObject[]
