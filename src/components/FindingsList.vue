<script setup>
import FlawCard from './FlawCard.vue'
/**
 * Renders the findings for a result and re-emits activate/deactivate (with the
 * flaw) so the view can link highlighting to the SourceViewer.
 * @prop {Array} flaws @prop {Object} byType  flaw meta keyed by type
 * @prop {Object|null} activeFlaw
 */
defineProps({
  flaws: { type: Array, default: () => [] },
  byType: { type: Object, default: () => ({}) },
  activeFlaw: { type: Object, default: null },
})
const emit = defineEmits(['activate', 'deactivate'])
</script>

<template>
  <div class="findings">
    <FlawCard
      v-for="(f, i) in flaws" :key="`${f.type}-${i}`"
      :flaw="f" :meta="byType[f.type] || null" :active="activeFlaw === f"
      @activate="emit('activate', f)" @deactivate="emit('deactivate', f)"
    />
  </div>
</template>

<style scoped>
.findings { display: flex; flex-direction: column; gap: var(--s-3); }
</style>
