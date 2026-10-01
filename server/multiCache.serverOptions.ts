/// <reference types="vite/client" />

import { defineMultiCacheOptions } from 'nuxt-multi-cache/server-options'
import fsDriver from 'unstorage/drivers/fs'
import nullDriver from 'unstorage/drivers/null'

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
