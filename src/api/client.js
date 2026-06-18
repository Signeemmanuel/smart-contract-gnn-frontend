/**
 * Low-level HTTP client for the smart-contract-gnn-api backend.
 *
 * Wraps fetch with JSON handling, an AbortSignal passthrough, and a single
 * typed error shape (ApiError) so callers can branch on `status`/`code` without
 * re-parsing responses. Friendly messages are derived from the backend's known
 * status codes (422 / 413 / 404 / 503); the raw server detail is preserved.
 */
import { API_BASE_URL } from '@/config'

export class ApiError extends Error {
  /** @param {number} status @param {string} message @param {string} [code] @param {*} [detail] */
  constructor(status, message, code = 'error', detail = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.detail = detail
  }
}

const FRIENDLY = {
  413: 'That contract is too large for the service limit.',
  422: 'The contract could not be accepted — check it is non-empty Solidity (a .sol file for uploads).',
  503: 'The service is busy right now. Retry in a moment.',
  404: 'Not found.',
}

/**
 * @param {string} path  e.g. '/analyze'
 * @param {{ method?: string, body?: any, signal?: AbortSignal, isForm?: boolean }} [opts]
 * @returns {Promise<any>} parsed JSON (or null for empty bodies)
 */
export async function request(path, { method = 'GET', body, signal, isForm = false } = {}) {
  const headers = {}
  let payload
  if (body !== undefined) {
    if (isForm) { payload = body }
    else { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
  }

  let res
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload, signal })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError(0, 'Cannot reach the analysis service. Check your connection or the API URL.', 'network')
  }

  const text = await res.text()
  let data = null
  if (text) { try { data = JSON.parse(text) } catch { data = text } }

  if (!res.ok) {
    const serverDetail = data && typeof data === 'object' ? data.detail : data
    const message = FRIENDLY[res.status] || (typeof serverDetail === 'string' ? serverDetail : `Request failed (${res.status}).`)
    throw new ApiError(res.status, message, String(res.status), serverDetail)
  }
  return data
}
