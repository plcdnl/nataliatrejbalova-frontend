import type { NuxtI18nOptions } from '@nuxtjs/i18n'

import localesConfig from './locales'

export const defaultLocale = (localesConfig.find(entry => entry.default)?.code || localesConfig[0]?.code || 'en') as NuxtI18nOptions['defaultLocale']
export const locales = localesConfig.map(({ code, file, language, name }) => ({ code, file, language, name }))
