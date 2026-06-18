<script setup>
import { useTheme } from '@/composables/useTheme'

/**
 * Segmented colour-theme control: System / Light / Dark. The active segment is
 * the saved preference (System by default, which follows the OS setting live).
 */
const { mode, setMode } = useTheme()
const OPTIONS = [
  { id: 'system', title: 'Match system' },
  { id: 'light', title: 'Light' },
  { id: 'dark', title: 'Dark' },
]
</script>

<template>
  <div class="theme" role="group" aria-label="Colour theme">
    <button
      v-for="o in OPTIONS" :key="o.id" type="button"
      class="theme__seg" :class="{ active: mode === o.id }"
      :aria-pressed="mode === o.id" :aria-label="o.title" :title="o.title"
      @click="setMode(o.id)"
    >
      <svg v-if="o.id === 'system'" viewBox="0 0 24 24" class="theme__icon" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/>
        <path d="M9 20h6M12 16v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>
      <svg v-else-if="o.id === 'light'" viewBox="0 0 24 24" class="theme__icon" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7"/>
        <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19"
          stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" class="theme__icon" aria-hidden="true">
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.theme {
  display: inline-flex; align-items: center; gap: 2px; padding: 3px;
  background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--r-pill);
}
.theme__seg {
  display: inline-grid; place-items: center; width: 30px; height: 26px;
  border: 0; background: transparent; color: var(--muted); border-radius: var(--r-pill);
  transition: all var(--t) var(--ease);
}
.theme__seg:hover { color: var(--text); }
.theme__seg.active {
  color: var(--signal);
  background: color-mix(in srgb, var(--signal) 16%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--signal) 32%, transparent);
}
.theme__icon { width: 16px; height: 16px; }
</style>
