import { ref, shallowRef } from 'vue'
import { getHealth } from '@/api/scgnn'

/**
 * Reactive wrapper over GET /health. Call refresh() to re-poll; the StatusPill
 * polls periodically while mounted.
 */
export function useHealth() {
  const health = shallowRef(/** @type {import('@/api/scgnn').Health|null} */ (null))
  const loading = ref(false)
  const error = ref(/** @type {string|null} */ (null))

  async function refresh() {
    loading.value = true
    error.value = null
    try { health.value = await getHealth() }
    catch (e) { error.value = e?.message || 'Unable to read service status.' }
    finally { loading.value = false }
  }
  return { health, loading, error, refresh }
}
