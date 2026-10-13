/**
 * Override di `createCacheTags` di layer-craft: tagga ogni entry e asset presenti nella risposta,
 * a qualsiasi profondità e per qualsiasi query (Splashscreen, Header, blocchi, relazioni…),
 * con gli stessi tag che craft-toolkit manda al purge (`DeferredPurgeCacheJob::collectTags`):
 * `entry:<id>`, `asset:<id>`, `archive:<section>` per le liste di entry, `SiteConfig` e `OrgSchema`.
 */
export function createCacheTags(operationName: string, result: any): string[] {
  const cacheTags = new Set<string>()
  const seen = new WeakSet<object>()

  function isEntry(node: any) {
    return String(node.__typename ?? '').endsWith('_Entry') || 'sectionHandle' in node
  }

  function isAsset(node: any) {
    return String(node.__typename ?? '').endsWith('_Asset') || ('kind' in node && 'url' in node)
  }

  function walk(node: any) {
    if (!node || typeof node !== 'object' || seen.has(node))
      return
    seen.add(node)

    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }

    if (node.id != null) {
      if (isEntry(node))
        cacheTags.add(`entry:${node.id}`)
      else if (isAsset(node))
        cacheTags.add(`asset:${node.id}`)
    }

    Object.values(node).forEach(walk)
  }

  walk(result?.data)

  if (operationName === 'SiteConfig' || operationName === 'OrgSchema')
    cacheTags.add(operationName)

  if (operationName === 'Entries' && Array.isArray(result?.data?.entries)) {
    result.data.entries.forEach((entry: any) => {
      if (entry?.sectionHandle || entry?.typeHandle)
        cacheTags.add(`archive:${entry.sectionHandle || entry.typeHandle}`)
    })
  }

  return [...cacheTags]
}
