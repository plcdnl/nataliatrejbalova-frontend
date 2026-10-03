/** stato del glitch attivato dal konami code (vedi plugins/konami.client.ts) */
export function useKonami() {
  return useState('konami', () => false)
}
