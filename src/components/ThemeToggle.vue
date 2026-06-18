<script setup>
import { useTheme } from '@/composables/useTheme'

/** Segmented System / Light / Dark control bound to the shared theme state. */
const { preference, setPreference } = useTheme()
const options = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
]
</script>

<template>
  <div class="tt" role="radiogroup" aria-label="Colour mode">
    <button
      v-for="o in options" :key="o.key" type="button" class="tt__btn"
      :class="{ active: preference === o.key }" role="radio"
      :aria-checked="preference === o.key" :title="`${o.label} theme`" @click="setPreference(o.key)"
    >
      <!-- System: monitor -->
      <svg v-if="o.key === 'system'" viewBox="0 0 24 24" class="tt__icon" aria-hidden="true">
        <rect x="3" y="4" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/>
        <path d="M9 20h6M12 17v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>
      <!-- Light: sun -->
      <svg v-else-if="o.key === 'light'" viewBox="0 0 24 24" class="tt__icon" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7"/>
        <path d="M12 2.6v2.4M12 19v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.6 12h2.4M19 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"
          stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>
      <!-- Dark: moon -->
      <svg v-else viewBox="0 0 24 24" class="tt__icon" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      </svg>
      <span class="visually-hidden">{{ o.label }} theme</span>
    </button>
  </div>
</template>

<style scoped>
.tt {
  display: inline-flex; gap: 2px; padding: 3px; border-radius: var(--r-pill);
  background: var(--surface-2); border: 1px solid var(--line);
}
.tt__btn {
  display: grid; place-items: center; width: 30px; height: 28px; border-radius: var(--r-pill);
  color: var(--muted); background: transparent; border: 0; transition: all var(--t) var(--ease);
}
.tt__btn:hover { color: var(--text); }
.tt__btn.active {
  color: var(--signal); background: var(--surface);
  box-shadow: var(--shadow-soft), inset 0 0 0 1px color-mix(in srgb, var(--signal) 30%, transparent);
}
.tt__icon { width: 16px; height: 16px; }
@media (max-width: 560px) { .tt__btn { width: 26px; height: 26px; } }
</style>
