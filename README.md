# Natália Trejbalová — frontend

Nuxt 4 su `@studio-fes/layer-craft`, con contenuti da Craft CMS via GraphQL.

```bash
pnpm install
pnpm dev                                   # http://localhost:3000
pnpm build && node .output/server/index.mjs  # build di produzione in locale
```

## Variabili d'ambiente

| Variabile | Quando | Note |
|---|---|---|
| `NUXT_PUBLIC_BACKEND_URL` | sempre | URL di Craft |
| `NUXT_IMAGE_PROVIDER`, `NUXT_IMAGE_CLOUDFLARE_BASE_URL` | opzionali | immagini via Cloudflare |
| `NUXT_REDIS_URL` | produzione | cache dati su Redis (runtime). Se c'è, la cache è sempre attiva |
| `NUXT_CACHE_ENABLED` | build | `"true"` attiva la cache dati su disco (`.nuxt-multi-cache`) quando non c'è Redis. A runtime: `NUXT_MULTI_CACHE_ENABLED` |

Senza cache (né Redis né `NUXT_CACHE_ENABLED`) le risposte non hanno header CDN: Cloudflare non mette in cache niente.

## Come funziona la cache

1. **Cache dati (Redis):** ogni query GraphQL a Craft viene salvata con i suoi tag (`entry:303`, `archive:project`…).
2. **Header CDN:** le query impostano `CDN-Cache-Control: max-age=300, stale-while-revalidate=86400` e `Cache-Tag`. La pagina e il suo `_payload.json` li ereditano dalle query che usano (plugin `graphql-cdn-headers`). Le risposte in anteprima o con errori sono `private`.
3. **Browser:** l'HTML non ha `Cache-Control`. `_payload.json` ha `private, max-age=60`, così il payload precaricato all'hover di un link viene riusato al click.
4. **Prefetch:** all'hover o al focus su un link, `NuxtLink` scarica i chunk e il `/<pagina>/_payload.json` con i dati di tutti gli `useAsyncData` della pagina. Al click non partono richieste. Il payload esiste solo nella build di produzione.

## Cloudflare

### 1. Mettere in cache HTML e payload

Cloudflare di default non mette in cache HTML e JSON. Serve una **Cache Rule** (Caching → Cache Rules) sul dominio del sito:

- **Cache eligibility:** Eligible for cache
- **Edge TTL:** *Use cache-control header if present, bypass cache if not*. Così finisce in cache solo quello che ha `CDN-Cache-Control` (cache attiva, niente anteprime, niente errori).
- **Browser TTL:** *Respect origin*. Altrimenti Cloudflare aggiunge un suo `Cache-Control` all'HTML e i browser tengono pagine vecchie che il purge non può raggiungere.
- **Cache key:** lasciare le query string nella chiave, perché il payload usa `?_b=<build id>` e ogni deploy deve avere URL nuovi. Non attivare *Ignore query string*.

### 2. Escludere quello che non va in cache

Una Cache Rule **Bypass cache**, messa prima di quella sopra, per:

- `/__nuxt_multi_cache/*`: le API di purge chiamate da Craft;
- `/api/*`;
- le anteprime di Craft, cioè le richieste con query `x-craft-preview`, `x-craft-live-preview` o `token`. Dovrebbero già arrivare `private`, ma è meglio non affidarsi solo a quello.

### 3. Controllare che funzioni

```bash
curl -sI https://<dominio>/works | grep -iE 'cf-cache-status|cache-tag|cdn-cache-control|^cache-control'
curl -sI "https://<dominio>/works/_payload.json" | grep -iE 'cf-cache-status|^cache-control'
```

- Alla seconda richiesta `cf-cache-status` deve essere `HIT`, sia per la pagina sia per il payload.
- La pagina non deve avere `cache-control`. Il payload deve avere `cache-control: private, max-age=60`.
- Un'anteprima di Craft deve dare `BYPASS` o `DYNAMIC`.
- Dopo 300 secondi deve dare `UPDATING`: Cloudflare serve la copia vecchia e la rigenera in background (stale-while-revalidate). Se dà `EXPIRED`, Cloudflare non sta leggendo `stale-while-revalidate` da `CDN-Cache-Control`.

### 4. Invalidazione dopo una modifica su Craft

Quando salvi un'entry o un asset, craft-toolkit (KV Cache):

1. chiama `/__nuxt_multi_cache/purge/tags`, che svuota la **cache dati di Nuxt** (Redis). multi-cache la applica dopo 3 secondi (`cacheTagInvalidationDelay: 3000`);
2. 10 secondi dopo, da un job in coda, chiede a **Cloudflare** di eliminare le pagine con gli stessi tag (`POST /zones/<zone_id>/purge_cache`). Lo svuotamento totale dal CP fa un `purge_everything`.

L'ordine conta: se Cloudflare venisse svuotato prima, riscaricherebbe dal server una pagina ancora vecchia.

Per attivare il punto 2, in Craft (non qui) servono:

```env
CLOUDFLARE_ZONE_ID="..."     # Cloudflare → dominio → Overview → Zone ID
CLOUDFLARE_API_TOKEN="..."   # API token con permesso "Zone → Cache Purge", solo su questa zona
```

Senza queste variabili le pagine su Cloudflare si aggiornano solo quando scade `max-age` (5 minuti).

Il frontend manda `Cache-Tag` separati da virgole, come vuole Cloudflare (plugin `server/plugins/cloudflare-cache-tags.ts`; nuxt-multi-cache da solo li separerebbe con spazi). Per verificarlo: modifica un'entry, aspetta circa 15 secondi, e `curl -sI` sulla pagina deve dare `cf-cache-status: MISS` e poi `HIT`.
