<script setup>
import { computed, ref, onMounted } from 'vue'
/** @prop {number} value 0..1 @prop {string} color */
const props = defineProps({
  value: { type: Number, required: true },
  color: { type: String, default: 'var(--signal)' },
})
const pct = computed(() => Math.round(Math.min(1, Math.max(0, props.value)) * 100))
const shown = ref(0)
onMounted(() => { requestAnimationFrame(() => requestAnimationFrame(() => { shown.value = pct.value })) })
</script>

<template>
  <div class="meter" :style="{ '--c': color }">
    <div class="meter__track">
      <div class="meter__fill" :style="{ width: shown + '%' }" />
    </div>
    <span class="meter__val mono">{{ pct }}%</span>
  </div>
</template>

<style scoped>
.meter { display: flex; align-items: center; gap: var(--s-3); }
.meter__track { flex: 1; height: 6px; border-radius: var(--r-pill); background: var(--surface-3); overflow: hidden; }
.meter__fill {
  height: 100%; border-radius: inherit;
  background: linear-gradient(90deg, color-mix(in srgb, var(--c) 55%, var(--surface-3)), var(--c));
  transition: width 0.9s var(--ease) 0.12s;
}
.meter__val { font-size: var(--fs-sm); color: var(--c); font-weight: 700; min-width: 38px; text-align: right; }
</style>
