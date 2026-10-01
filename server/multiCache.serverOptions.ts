/// <reference types="vite/client" />

import { defineMultiCacheOptions } from 'nuxt-multi-cache/server-options'
// import cloudflareKVBindingDriver from 'unstorage/drivers/cloudflare-kv-binding'
import fsDriver from 'unstorage/drivers/fs'
import nullDriver from 'unstorage/drivers/null'

/** const isDev = import.meta.dev */
export default defineMultiCacheOptions(() => {
  const config = useRuntimeConfig()
  const { multiCacheEnabled } = config

  const driver = multiCacheEnabled
    ? fsDriver({ base: '.nuxt-multi-cache' })
    : nullDriver()

  return {
    data: {
      storage: {
        driver,
      },
    },
  }
})
