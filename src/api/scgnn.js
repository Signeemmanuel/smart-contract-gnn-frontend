/**
 * Typed methods for every smart-contract-gnn-api endpoint. This is the only
 * module that knows the backend's route shapes; UI code calls these.
 *
 * @typedef {Object} Health
 * @property {string} status @property {boolean} model_loaded @property {boolean} mock_mode
 * @property {string} device @property {string} repo_id @property {string} configured_revision
 * @property {string|null} resolved_sha @property {number} threshold
 * @property {boolean} hf_token_present @property {string|null} error
 *
 * @typedef {Object} FlawMeta @property {string} type @property {string} name @property {number} dasp
 * @typedef {Object} Flaw @property {string} type @property {number} confidence @property {number[]} lines
 * @typedef {Object} AnalysisResult @property {string} source @property {Flaw[]} flaws @property {boolean} degraded
 * @typedef {Object} JobView
 * @property {string} job_id @property {'queued'|'running'|'done'|'failed'} status
 * @property {AnalysisResult|null} result @property {{code:string,message:string}|null} error
 */
import { request } from './client'

/** @returns {Promise<Health>} */
export const getHealth = (signal) => request('/health', { signal })

/** @returns {Promise<FlawMeta[]>} */
export const getFlaws = (signal) => request('/flaws', { signal })

/** Submit raw source. @returns {Promise<{job_id:string,status:string}>} */
export const submitSource = (source, signal) => request('/analyze', { method: 'POST', body: { source }, signal })

/** Submit a .sol File/Blob. @returns {Promise<{job_id:string,status:string}>} */
export function submitFile(file, signal) {
  const form = new FormData()
  form.append('file', file)
  return request('/analyze/file', { method: 'POST', body: form, isForm: true, signal })
}

/** Poll a job. @returns {Promise<JobView>} */
export const getJob = (jobId, signal) => request(`/analyze/${encodeURIComponent(jobId)}`, { signal })
