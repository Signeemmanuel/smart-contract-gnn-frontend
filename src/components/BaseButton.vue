<script setup>
/**
 * Reusable button.
 * @prop {'primary'|'ghost'|'subtle'|'danger'} variant
 * @prop {'sm'|'md'} size
 * @prop {boolean} loading  shows a spinner and blocks clicks
 */
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})
</script>

<template>
  <button
    :type="type"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'is-loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2);
  border: 1px solid transparent; border-radius: var(--r-md); font-weight: 600;
  letter-spacing: 0.01em; white-space: nowrap; transition: all var(--t) var(--ease);
}
.btn--sm { padding: 6px 12px; font-size: var(--fs-sm); }
.btn--md { padding: 10px 18px; font-size: var(--fs-base); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn--primary { background: var(--signal); color: var(--signal-ink); }
.btn--primary:not(:disabled):hover { box-shadow: 0 0 0 4px rgba(45,212,191,0.18); transform: translateY(-1px); }

.btn--danger { background: var(--danger); color: #2a0a0a; }
.btn--danger:not(:disabled):hover { box-shadow: 0 0 0 4px rgba(255,107,107,0.18); }

.btn--ghost { background: transparent; border-color: var(--line); color: var(--text); }
.btn--ghost:not(:disabled):hover { border-color: var(--signal); color: var(--signal); }

.btn--subtle { background: var(--surface-2); border-color: var(--line); color: var(--text-dim); }
.btn--subtle:not(:disabled):hover { background: var(--surface-3); color: var(--text); }

.btn__spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid currentColor; border-right-color: transparent;
  animation: btn-spin 0.7s linear infinite;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }
</style>
