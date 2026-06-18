import { ref, shallowRef, computed, onUnmounted } from 'vue'
import { submitSource, submitFile, getJob } from '@/api/scgnn'
import { ApiError } from '@/api/client'
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '@/config'

/**
 * Drives the asynchronous analyse lifecycle for one panel: submit (source or
 * file) then poll GET /analyze/{id} until done/failed, with elapsed timing,
 * a single retry on 503 backpressure, a client-side ceiling above the server
 * timeout, and clean cancellation on unmount or reset.
 *
 * Exposed status: 'idle' | 'submitting' | 'queued' | 'running' | 'done' | 'failed' | 'error'
 */
export function useAnalysis() {
  const status = ref('idle')
  const jobId = ref(null)
  const result = shallowRef(null)
  const error = ref(null)          // { code, message } for surfaced failures
  const elapsedMs = ref(0)

  let controller = null
  let pollTimer = null
  let clockTimer = null
  let startedAt = 0

  const isBusy = computed(() => ['submitting', 'queued', 'running'].includes(status.value))

  function clearTimers() {
    if (pollTimer) { clearTimeout(pollTimer); pollTimer = null }
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null }
  }

  function reset() {
    if (controller) controller.abort()
    controller = null
    clearTimers()
    status.value = 'idle'; jobId.value = null; result.value = null; error.value = null; elapsedMs.value = 0
  }

  function fail(code, message) {
    clearTimers()
    error.value = { code, message }
    status.value = code === 'network' || code === 'error' ? 'error' : 'failed'
  }

  function startClock() {
    startedAt = Date.now()
    clockTimer = setInterval(() => { elapsedMs.value = Date.now() - startedAt }, 200)
  }

  async function poll() {
    if (!controller) return
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      return fail('timeout', 'The analysis is taking longer than expected. It may have stalled — try again.')
    }
    try {
      const job = await getJob(jobId.value, controller.signal)
      if (job.status === 'done') { clearTimers(); result.value = job.result; status.value = 'done'; return }
      if (job.status === 'failed') {
        clearTimers()
        const e = job.error || { code: 'failed', message: 'Analysis failed.' }
        error.value = e; status.value = 'failed'; return
      }
      status.value = job.status === 'running' ? 'running' : 'queued'
      pollTimer = setTimeout(poll, POLL_INTERVAL_MS)
    } catch (e) {
      if (e?.name === 'AbortError') return
      fail(e instanceof ApiError ? e.code : 'error', e?.message || 'Lost contact with the service while polling.')
    }
  }

  async function run(submitFn) {
    reset()
    controller = new AbortController()
    status.value = 'submitting'
    startClock()
    let submitted
    try {
      submitted = await submitFn(controller.signal)
    } catch (e) {
      if (e?.name === 'AbortError') return
      // One automatic retry on 503 (queue full), then surface it.
      if (e instanceof ApiError && e.status === 503) {
        await new Promise((r) => setTimeout(r, 1500))
        try { submitted = await submitFn(controller.signal) }
        catch (e2) { return e2?.name === 'AbortError' ? undefined : fail(e2 instanceof ApiError ? e2.code : 'error', e2?.message) }
      } else {
        return fail(e instanceof ApiError ? e.code : 'error', e?.message || 'Could not submit the contract.')
      }
    }
    jobId.value = submitted.job_id
    status.value = 'queued'
    pollTimer = setTimeout(poll, POLL_INTERVAL_MS)
  }

  const analyzeSource = (source) => run((signal) => submitSource(source, signal))
  const analyzeFile = (file) => run((signal) => submitFile(file, signal))

  onUnmounted(reset)

  return { status, jobId, result, error, elapsedMs, isBusy, analyzeSource, analyzeFile, reset }
}
