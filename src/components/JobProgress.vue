<script setup>
import { computed } from 'vue'

/**
 * Job lifecycle stepper + failure messaging.
 * @prop {string} status idle|submitting|queued|running|done|failed|error
 * @prop {number} elapsedMs
 * @prop {{code:string,message:string}|null} error
 */
const props = defineProps({
  status: { type: String, required: true },
  elapsedMs: { type: Number, default: 0 },
  error: { type: Object, default: null },
})

const STEPS = ['submitting', 'queued', 'running', 'done']
const idx = computed(() => STEPS.indexOf(props.status === 'submitting' ? 'submitting' : props.status))
const failed = computed(() => props.status === 'failed' || props.status === 'error')
const seconds = computed(() => (props.elapsedMs / 1000).toFixed(1))

function stepState(i) {
  if (failed.value) return i <= 1 ? 'done' : 'idle'
  if (idx.value < 0) return 'idle'
  if (i < idx.value) return 'done'
  if (i === idx.value) return props.status === 'done' ? 'done' : 'active'
  return 'idle'
}
const labels = { submitting: 'Submit', queued: 'Queue', running: 'Analyse', done: 'Done' }
</script>

<template>
  <div class="prog" :class="{ 'is-failed': failed }">
    <ol class="steps" v-if="!failed || status !== 'error'">
      <li v-for="(s, i) in STEPS" :key="s" :class="['step', stepState(i)]">
        <span class="step__dot" />
        <span class="step__label">{{ labels[s] }}</span>
      </li>
    </ol>

    <p v-if="status === 'running' || status === 'queued'" class="prog__note mono">
      {{ status === 'queued' ? 'Waiting for a worker' : 'Analysing on CPU' }} · {{ seconds }}s
      <span class="dim"> — full extraction + GNN + explainer can take tens of seconds.</span>
    </p>

    <div v-else-if="failed" class="prog__error" role="alert">
      <span class="prog__error-code mono">{{ error?.code || 'error' }}</span>
      <span>{{ error?.message || 'Analysis failed.' }}</span>
    </div>
  </div>
</template>

<style scoped>
.prog { display: flex; flex-direction: column; gap: var(--s-3); }
.steps { list-style: none; display: flex; align-items: center; gap: 0; padding: 0; }
.step { display: flex; align-items: center; gap: 8px; color: var(--faint); font-size: var(--fs-xs); }
.step:not(:last-child)::after {
  content: ''; width: 38px; height: 2px; margin: 0 10px; border-radius: 2px; background: var(--line);
}
.step__dot { width: 11px; height: 11px; border-radius: 50%; border: 2px solid var(--line); background: var(--surface); transition: all var(--t) var(--ease); }
.step__label { font-family: var(--font-mono); letter-spacing: 0.04em; }
.step.done { color: var(--ok); }
.step.done .step__dot { background: var(--ok); border-color: var(--ok); }
.step.done:not(:last-child)::after { background: var(--ok); }
.step.active { color: var(--signal); }
.step.active .step__dot {
  background: var(--signal); border-color: var(--signal);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--signal) 50%, transparent); animation: pulse 1.4s var(--ease) infinite;
}
@keyframes pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--signal) 45%, transparent); } 70% { box-shadow: 0 0 0 8px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
.prog__note { font-size: var(--fs-xs); color: var(--signal); }
.prog__error { display: flex; align-items: center; gap: var(--s-3); padding: var(--s-3) var(--s-4); border-radius: var(--r-md); background: color-mix(in srgb, var(--danger) 10%, transparent); border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent); font-size: var(--fs-sm); color: var(--text); }
.prog__error-code { color: var(--danger); font-size: var(--fs-xs); padding: 2px 8px; border-radius: var(--r-sm); background: color-mix(in srgb, var(--danger) 16%, transparent); flex: none; }
</style>
