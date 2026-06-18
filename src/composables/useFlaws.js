import { ref, shallowRef } from 'vue'
import { getFlaws } from '@/api/scgnn'

// Module-level cache: the flaw catalogue is static, so fetch it once per session.
const _cache = shallowRef(null)

/** Reactive wrapper over GET /flaws, with a by-type lookup map. */
export function useFlaws() {
  const flaws = shallowRef(_cache.value || [])
  const byType = ref({})
  const loading = ref(false)
  const error = ref(null)

  function index(list) {
    byType.value = Object.fromEntries(list.map((f) => [f.type, f]))
  }
  if (_cache.value) index(_cache.value)

  async function load() {
    if (_cache.value) { flaws.value = _cache.value; index(_cache.value); return }
    loading.value = true; error.value = null
    try { const list = await getFlaws(); _cache.value = list; flaws.value = list; index(list) }
    catch (e) { error.value = e?.message || 'Unable to load the flaw catalogue.' }
    finally { loading.value = false }
  }
  return { flaws, byType, loading, error, load }
}
