<script setup>
import { computed, ref } from 'vue'
import BaseButton from './BaseButton.vue'
import { SAMPLES, flawColor } from '@/constants/flaws'

/**
 * Contract entry: a code textarea (with one-click samples and drag-drop), plus
 * a direct .sol upload. The source text is v-modelled by the parent so it
 * survives switching between the compose and results layouts.
 *  - "Run analysis" submits the textarea via POST /analyze
 *  - "Upload .sol" submits the file via POST /analyze/file
 */
const props = defineProps({
  source: { type: String, default: '' },
  busy: { type: Boolean, default: false },
  threshold: { type: Number, default: null },
})
const emit = defineEmits(['update:source', 'submit-source', 'submit-file', 'reset'])

const source = computed({ get: () => props.source, set: (v) => emit('update:source', v) })
const dragOver = ref(false)
const fileInput = ref(null)

const charCount = computed(() => source.value.length)
const canRun = computed(() => source.value.trim().length > 0 && !props.busy)

function loadSample(s) { source.value = s.source; emit('reset') }
function runSource() { if (canRun.value) emit('submit-source', source.value) }

function onPickFile(e) {
  const file = e.target.files?.[0]
  if (file) emit('submit-file', file)
  e.target.value = ''
}
async function onDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  source.value = await file.text()
  emit('reset')
}
</script>

<template>
  <section class="card panel">
    <header class="panel__head">
      <div>
        <p class="eyebrow">Input</p>
        <h2 class="panel__title">Contract</h2>
      </div>
      <span v-if="threshold != null" class="policy mono" title="Server decision policy">
        threshold {{ threshold.toFixed(2) }}
      </span>
    </header>

    <div class="samples" role="group" aria-label="Sample contracts">
      <span class="samples__label">Try a sample</span>
      <button
        v-for="s in SAMPLES" :key="s.id" class="chip"
        :style="{ '--c': s.type ? flawColor(s.type) : 'var(--ok)' }"
        @click="loadSample(s)" type="button"
      >{{ s.label }}</button>
    </div>

    <div
      class="editor" :class="{ 'is-drag': dragOver }"
      @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="onDrop"
    >
      <textarea
        v-model="source" class="editor__area mono" spellcheck="false"
        placeholder="// Paste Solidity source here, drop a .sol file, or pick a sample above"
        aria-label="Solidity source"
      />
      <div v-if="dragOver" class="editor__drop">Drop .sol to load</div>
    </div>

    <footer class="panel__foot">
      <span class="count mono">{{ charCount.toLocaleString() }} chars</span>
      <div class="actions">
        <input ref="fileInput" type="file" accept=".sol" class="visually-hidden" @change="onPickFile" />
        <BaseButton variant="ghost" size="md" :disabled="busy" @click="fileInput.click()">Upload .sol</BaseButton>
        <BaseButton variant="primary" size="md" :loading="busy" :disabled="!canRun" @click="runSource">
          Run analysis
        </BaseButton>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.panel { padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-4); }
.panel__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-3); }
.panel__title { font-size: var(--fs-lg); margin-top: 2px; }
.policy {
  font-size: var(--fs-xs); color: var(--signal); padding: 4px 10px; border-radius: var(--r-pill);
  background: color-mix(in srgb, var(--signal) 12%, transparent); border: 1px solid color-mix(in srgb, var(--signal) 28%, transparent);
  white-space: nowrap;
}
.samples { display: flex; align-items: center; gap: var(--s-2); flex-wrap: wrap; }
.samples__label { font-size: var(--fs-xs); color: var(--muted); margin-right: var(--s-1); }
.chip {
  font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim);
  padding: 4px 10px; border-radius: var(--r-pill);
  background: var(--surface-2); border: 1px solid var(--line); transition: all var(--t) var(--ease);
}
.chip:hover { color: var(--c); border-color: color-mix(in srgb, var(--c) 50%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 12%, transparent); }

.editor { position: relative; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--ink); transition: border-color var(--t) var(--ease); }
.editor.is-drag { border-color: var(--signal); box-shadow: 0 0 0 3px color-mix(in srgb, var(--signal) 16%, transparent); }
.editor__area {
  width: 100%; min-height: 340px; resize: vertical; border: 0; background: transparent;
  padding: var(--s-4); font-size: var(--fs-sm); line-height: 1.6; color: var(--text); border-radius: var(--r-md);
}
.editor__area:focus { outline: none; }
.editor__area::placeholder { color: var(--faint); }
.editor__drop {
  position: absolute; inset: 0; display: grid; place-items: center; border-radius: var(--r-md);
  background: color-mix(in srgb, var(--ink) 70%, transparent); color: var(--signal);
  font-family: var(--font-mono); font-size: var(--fs-sm); pointer-events: none;
}
.panel__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); flex-wrap: wrap; }
.count { font-size: var(--fs-xs); color: var(--faint); }
.actions { display: flex; gap: var(--s-2); flex-wrap: wrap; }

@media (max-width: 560px) {
  .panel { padding: var(--s-4); }
  .editor__area { min-height: 240px; }
  .actions { flex: 1; }
  .actions :deep(.btn) { flex: 1; }
}
</style>
