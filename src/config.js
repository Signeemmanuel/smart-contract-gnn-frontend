/**
 * Runtime configuration, read once from Vite env vars with safe defaults.
 * The default API base is the deployed Hugging Face Space, so the app runs
 * with no .env file at all.
 */
const DEFAULT_API = 'https://Signeemmanuel-smart-contract-gnn-api.hf.space'

export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || DEFAULT_API).replace(/\/+$/, '')
export const POLL_INTERVAL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 1000
export const POLL_TIMEOUT_MS = Number(import.meta.env.VITE_POLL_TIMEOUT_MS) || 150000
