import { ref, computed, watch } from 'vue'

/**
 * Colour-mode controller. The user's *preference* is one of:
 *   'system' (default) | 'light' | 'dark'
 * The *resolved* theme is always a concrete 'light' | 'dark', with 'system'
 * tracking the OS setting live. The preference persists in localStorage; the
 * resolved theme is written to <html data-theme>. A matching inline script in
 * index.html applies it before first paint to prevent a flash.
 *
 * State is module-level, so every caller shares one source of truth.
 */
const KEY = 'scgnn-theme'
const PREFERENCES = ['system', 'light', 'dark']

const media = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

function readStored() {
  try { const v = localStorage.getItem(KEY); return PREFERENCES.includes(v) ? v : 'system' }
  catch { return 'system' }
}

const preference = ref(readStored())
const systemDark = ref(media ? media.matches : true)

const resolved = computed(() =>
  preference.value === 'system' ? (systemDark.value ? 'dark' : 'light') : preference.value,
)

function applyResolved() {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', resolved.value)
}

// Keep up with OS changes while the user is on 'system'.
if (media) {
  const onChange = (e) => { systemDark.value = e.matches }
  media.addEventListener ? media.addEventListener('change', onChange) : media.addListener(onChange)
}

// Persist preference + reflect any change to the DOM.
watch([preference, systemDark], () => {
  try {
    if (preference.value === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, preference.value)
  } catch { /* storage unavailable — still apply for the session */ }
  applyResolved()
}, { immediate: true })

export function useTheme() {
  function setPreference(p) { if (PREFERENCES.includes(p)) preference.value = p }
  return { preference, resolved, setPreference, PREFERENCES }
}
