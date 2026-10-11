/// <reference types="vite/client" />

import { defineMultiCacheOptions } from 'nuxt-multi-cache/server-options'
import fsDriver from 'unstorage/drivers/fs'
import nullDriver from 'unstorage/drivers/null'
import redisDriver from 'unstorage/drivers/redis'

export default defineMultiCacheOptions(() => {
  const config = useRuntimeConfig()
  const { multiCacheEnabled, redisUrl } = config

  // con NUXT_REDIS_URL la cache è sempre attiva su Redis, condivisa tra le istanze
  const driver = redisUrl
    ? redisDriver({ url: redisUrl })
    : multiCacheEnabled
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
