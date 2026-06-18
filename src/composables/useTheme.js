import { ref, computed, watch } from 'vue'

/**
 * Theme controller. Preference is one of 'system' | 'light' | 'dark' and is
 * persisted to localStorage; the *effective* theme ('light'|'dark') is written
 * to <html data-theme>. In 'system' mode the effective theme tracks the OS
 * setting live. The default is 'system'. An inline script in index.html applies
 * the same logic before first paint to prevent a flash.
 */
const STORAGE_KEY = 'scgnn-theme'
export const THEME_MODES = ['system', 'light', 'dark']

const mode = ref('system')
const system = ref('dark')
let initialised = false

const effective = () => (mode.value === 'system' ? system.value : mode.value)
const apply = () => { if (typeof document !== 'undefined') document.documentElement.dataset.theme = effective() }

function init() {
  if (initialised || typeof window === 'undefined') return
  initialised = true
  const saved = localStorage.getItem(STORAGE_KEY)
  if (THEME_MODES.includes(saved)) mode.value = saved
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  system.value = mq.matches ? 'dark' : 'light'
  apply()
  mq.addEventListener('change', (e) => { system.value = e.matches ? 'dark' : 'light'; if (mode.value === 'system') apply() })
  watch(mode, (m) => { localStorage.setItem(STORAGE_KEY, m); apply() })
}

export function useTheme() {
  init()
  const resolved = computed(() => effective())
  const setMode = (m) => { if (THEME_MODES.includes(m)) mode.value = m }
  const cycle = () => setMode(THEME_MODES[(THEME_MODES.indexOf(mode.value) + 1) % THEME_MODES.length])
  return { mode, resolved, setMode, cycle, THEME_MODES }
}
