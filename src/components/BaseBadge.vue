<script setup>
/** Small pill with a coloured dot. @prop {string} color any CSS colour/var */
defineProps({
  color: { type: String, default: 'var(--muted)' },
  dot: { type: Boolean, default: true },
})
</script>

<template>
  <span class="badge" :style="{ '--c': color }">
    <span v-if="dot" class="badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: var(--r-pill);
  font-family: var(--font-mono); font-size: var(--fs-xs); font-weight: 500;
  color: var(--c); background: color-mix(in srgb, var(--c) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 32%, transparent);
  white-space: nowrap;
}
.badge__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); flex: none; }
</style>
