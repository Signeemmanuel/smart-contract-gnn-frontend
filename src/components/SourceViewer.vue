<script setup>
import { computed, ref, watch, nextTick } from 'vue'

/**
 * Renders the analysed contract with line numbers and highlights the lines a
 * selected finding holds responsible (the localisation result). A scan sweep
 * plays while `scanning` is true. This linked highlight is the app's signature.
 *
 * @prop {string} source
 * @prop {number[]} highlightLines  1-based line numbers to emphasise
 * @prop {string} color             highlight colour (the active flaw's hue)
 * @prop {boolean} scanning
 */
const props = defineProps({
  source: { type: String, default: '' },
  highlightLines: { type: Array, default: () => [] },
  color: { type: String, default: 'var(--signal)' },
  scanning: { type: Boolean, default: false },
})

const lines = computed(() => props.source.replace(/\n$/, '').split('\n'))
const hlSet = computed(() => new Set(props.highlightLines))
const body = ref(null)

// When the selected finding changes, bring its first line into view.
watch(() => props.highlightLines, async (next) => {
  if (!next?.length || !body.value) return
  await nextTick()
  const row = body.value.querySelector(`[data-line="${next[0]}"]`)
  if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
})
</script>

<template>
  <div class="viewer" :style="{ '--hl': color }">
    <div class="viewer__bar">
      <span class="dot dot--r" /><span class="dot dot--y" /><span class="dot dot--g" />
      <span class="viewer__title mono">contract.sol</span>
      <span class="viewer__count mono">{{ lines.length }} lines</span>
    </div>
    <div ref="body" class="viewer__body" :class="{ scanning }">
      <div v-if="scanning" class="sweep" aria-hidden="true" />
      <div
        v-for="(line, i) in lines" :key="i" :data-line="i + 1"
        class="line" :class="{ hl: hlSet.has(i + 1) }"
      >
        <span class="line__no mono">{{ i + 1 }}</span>
        <code class="line__code mono">{{ line || ' ' }}</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewer { border: 1px solid var(--line); border-radius: var(--r-md); overflow: hidden; background: var(--ink); min-width: 0; max-width: 100%; }
.viewer__bar {
  display: flex; align-items: center; gap: 7px; padding: 9px var(--s-4);
  background: var(--surface); border-bottom: 1px solid var(--line);
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot--r { background: #ff5f57; } .dot--y { background: #febc2e; } .dot--g { background: #28c840; }
.viewer__title { margin-left: 8px; font-size: var(--fs-xs); color: var(--text-dim); }
.viewer__count { margin-left: auto; font-size: var(--fs-xs); color: var(--faint); }

.viewer__body { position: relative; max-height: 560px; overflow: auto; padding: var(--s-3) 0; min-width: 0; }
.line { display: grid; grid-template-columns: 52px 1fr; align-items: baseline; padding: 0 var(--s-4); transition: background var(--t) var(--ease); width: max-content; min-width: 100%; }
.line__no { color: var(--faint); font-size: var(--fs-xs); text-align: right; padding-right: var(--s-4); user-select: none; }
.line__code { color: var(--text-dim); font-size: var(--fs-sm); white-space: pre; tab-size: 4; }
.line.hl { background: color-mix(in srgb, var(--hl) 14%, transparent); box-shadow: inset 3px 0 0 var(--hl); }
.line.hl .line__code { color: var(--text); }
.line.hl .line__no { color: var(--hl); }

/* Scan sweep — motion that serves the subject (the model is reading the code) */
.sweep {
  position: absolute; left: 0; right: 0; top: 0; height: 64px; pointer-events: none;
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--signal) 16%, transparent), transparent);
  animation: sweep 1.8s var(--ease) infinite;
}
@keyframes sweep { 0% { transform: translateY(-64px); } 100% { transform: translateY(560px); } }
</style>
