/**
 * `_payload.json` ha solo CDN-Cache-Control: senza una cache nel browser il payload
 * precaricato da NuxtLink all'hover verrebbe riscaricato al click.
 */
const PAYLOAD_MAX_AGE = 60

export default defineEventHandler((event) => {
  if (event.path.split('?')[0]!.endsWith('/_payload.json'))
    setResponseHeader(event, 'cache-control', `private, max-age=${PAYLOAD_MAX_AGE}`)
})
