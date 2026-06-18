<script setup>
import { computed } from 'vue'
import BaseBadge from './BaseBadge.vue'
import ConfidenceMeter from './ConfidenceMeter.vue'
import { flawColor, FLAW_PRESENTATION } from '@/constants/flaws'

/**
 * One detected finding. Hover/focus emits `activate` so the parent can light up
 * this finding's lines in the SourceViewer; leaving emits `deactivate`.
 *
 * @prop {{type:string,confidence:number,lines:number[]}} flaw
 * @prop {{name:string,dasp:number}|null} meta   from GET /flaws
 * @prop {boolean} active
 */
const props = defineProps({
  flaw: { type: Object, required: true },
  meta: { type: Object, default: null },
  active: { type: Boolean, default: false },
})
const emit = defineEmits(['activate', 'deactivate'])

const color = computed(() => flawColor(props.flaw.type))
const name = computed(() => props.meta?.name || props.flaw.type)
const dasp = computed(() => props.meta?.dasp ?? null)
const blurb = computed(() => FLAW_PRESENTATION[props.flaw.type]?.blurb || '')
</script>

<template>
  <article
    class="finding" :class="{ active }" :style="{ '--c': color }" tabindex="0"
    @mouseenter="emit('activate')" @mouseleave="emit('deactivate')"
    @focus="emit('activate')" @blur="emit('deactivate')"
  >
    <header class="finding__head">
      <span class="finding__name">{{ name }}</span>
      <BaseBadge v-if="dasp != null" :color="color">DASP-{{ dasp }}</BaseBadge>
    </header>

    <ConfidenceMeter :value="flaw.confidence" :color="color" />
    <p class="finding__blurb">{{ blurb }}</p>

    <div v-if="flaw.lines?.length" class="finding__lines">
      <span class="finding__lines-label">Lines</span>
      <span v-for="ln in flaw.lines" :key="ln" class="lnchip mono">{{ ln }}</span>
    </div>
  </article>
</template>

<style scoped>
.finding {
  border: 1px solid var(--line); border-left: 3px solid var(--c); border-radius: var(--r-md);
  background: var(--surface); padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-3);
  transition: all var(--t) var(--ease); cursor: default;
}
.finding:hover, .finding.active {
  background: var(--surface-2); transform: translateY(-1px);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--c) 40%, transparent), var(--shadow-soft);
}
.finding:focus-visible { outline: 2px solid var(--c); outline-offset: 2px; }
.finding__head { display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); }
.finding__name { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-md); color: var(--text); }
.finding__blurb { font-size: var(--fs-sm); color: var(--muted); margin: 0; }
.finding__lines { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.finding__lines-label { font-size: var(--fs-xs); color: var(--faint); margin-right: 2px; }
.lnchip {
  font-size: var(--fs-xs); color: var(--c); padding: 2px 8px; border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--c) 12%, transparent); border: 1px solid color-mix(in srgb, var(--c) 26%, transparent);
}
</style>
