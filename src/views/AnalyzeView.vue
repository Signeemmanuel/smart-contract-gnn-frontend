<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import ContractInput from '@/components/ContractInput.vue'
import JobProgress from '@/components/JobProgress.vue'
import FindingsList from '@/components/FindingsList.vue'
import SourceViewer from '@/components/SourceViewer.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useAnalysis } from '@/composables/useAnalysis'
import { useFlaws } from '@/composables/useFlaws'
import { useHealth } from '@/composables/useHealth'
import { flawColor } from '@/constants/flaws'

const { status, result, error, elapsedMs, isBusy, analyzeSource, analyzeFile, reset } = useAnalysis()
const { byType, load: loadFlaws } = useFlaws()
const { health, refresh: refreshHealth } = useHealth()

const pendingSource = ref('')
const activeFlaw = ref(null)

onMounted(() => { loadFlaws(); refreshHealth() })

function onSubmitSource(src) { pendingSource.value = src; activeFlaw.value = null; analyzeSource(src) }
function onSubmitFile(file) { pendingSource.value = ''; activeFlaw.value = null; analyzeFile(file) }
function onReset() { reset(); activeFlaw.value = null; pendingSource.value = '' }

// Auto-select the sole finding so its lines light up without a hover.
watch(result, (r) => {
  if (status.value === 'done' && r?.flaws?.length === 1) activeFlaw.value = r.flaws[0]
})

const shownSource = computed(() => result.value?.source ?? pendingSource.value)
const highlightLines = computed(() => activeFlaw.value?.lines ?? [])
const highlightColor = computed(() => (activeFlaw.value ? flawColor(activeFlaw.value.type) : 'var(--signal)'))
const isDone = computed(() => status.value === 'done')
const hasFindings = computed(() => isDone.value && (result.value?.flaws?.length ?? 0) > 0)
const isClean = computed(() => isDone.value && (result.value?.flaws?.length ?? 0) === 0)
const threshold = computed(() => (typeof health.value?.threshold === 'number' ? health.value.threshold : null))
</script>

<template>
  <div class="analyze">
    <section class="hero container">
      <p class="eyebrow">Graph neural network · DASP detection</p>
      <h1 class="hero__title">Read a contract the way the model does.</h1>
      <p class="hero__sub">
        Submit Solidity and the detector returns the vulnerability classes it finds — and lights up the
        source lines it holds responsible. Hover a finding to trace it back into the code.
      </p>
    </section>

    <div class="container grid">
      <!-- Input -->
      <ContractInput :busy="isBusy" :threshold="threshold"
        @submit-source="onSubmitSource" @submit-file="onSubmitFile" @reset="onReset" />

      <!-- Result -->
      <section class="card result">
        <header class="result__head">
          <div>
            <p class="eyebrow">Result</p>
            <h2 class="result__title">Findings</h2>
          </div>
          <BaseButton v-if="status !== 'idle'" variant="subtle" size="sm" :disabled="isBusy" @click="onReset">Clear</BaseButton>
        </header>

        <JobProgress v-if="status !== 'idle'" :status="status" :elapsed-ms="elapsedMs" :error="error" />

        <!-- Idle -->
        <div v-if="status === 'idle'" class="empty">
          <div class="empty__mark">
            <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
              <path d="M32 8 L52 19 V40 L32 51 L12 40 V19 Z" fill="none" stroke="var(--line)" stroke-width="2"/>
              <path d="M32 8 V31 M32 31 L52 19 M32 31 L12 40" stroke="var(--surface-3)" stroke-width="2"/>
              <circle cx="32" cy="8" r="3.4" fill="var(--signal)"/><circle cx="52" cy="19" r="3.4" fill="var(--violet)"/>
              <circle cx="12" cy="40" r="3.4" fill="var(--sky)"/><circle cx="32" cy="31" r="3.6" fill="var(--text-dim)"/>
            </svg>
          </div>
          <p class="empty__text">Findings will appear here. Pick a sample or paste a contract, then run the analysis.</p>
        </div>

        <!-- Clean -->
        <div v-else-if="isClean" class="clean">
          <span class="clean__check" aria-hidden="true">✓</span>
          <div>
            <p class="clean__title">No flaws detected at the current threshold.</p>
            <p class="clean__sub">Absence of a finding is not a guarantee of safety — treat this as one signal, not a verdict.</p>
          </div>
        </div>

        <!-- Findings + linked source -->
        <template v-if="hasFindings">
          <div v-if="result.degraded" class="degraded" role="status">
            Analysis ran on a degraded control-flow graph — results may be less reliable.
          </div>
          <FindingsList
            :flaws="result.flaws" :by-type="byType" :active-flaw="activeFlaw"
            @activate="(f) => (activeFlaw = f)" @deactivate="(f) => { if (activeFlaw === f) activeFlaw = null }"
          />
        </template>

        <SourceViewer v-if="shownSource"
          :source="shownSource" :highlight-lines="highlightLines" :color="highlightColor" :scanning="isBusy" />
        <p v-else-if="isBusy" class="filehint mono">Analysing uploaded file…</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.analyze { padding-bottom: var(--s-6); }
.hero { padding-block: var(--s-7) var(--s-6); max-width: 880px; }
.hero__title { font-size: clamp(2rem, 4.5vw, var(--fs-3xl)); line-height: 1.05; margin: var(--s-3) 0; }
.hero__sub { font-size: var(--fs-md); color: var(--text-dim); max-width: 60ch; }
.grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: var(--s-5); align-items: start; }
.result { padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-4); min-height: 480px; }
.result__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-3); }
.result__title { font-size: var(--fs-lg); margin-top: 2px; }

.empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--s-4); text-align: center; padding: var(--s-7) var(--s-4); }
.empty__text { color: var(--muted); max-width: 36ch; font-size: var(--fs-sm); }

.clean { display: flex; align-items: flex-start; gap: var(--s-3); padding: var(--s-4); border-radius: var(--r-md); background: color-mix(in srgb, var(--ok) 9%, transparent); border: 1px solid color-mix(in srgb, var(--ok) 28%, transparent); }
.clean__check { width: 28px; height: 28px; flex: none; display: grid; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--ok) 20%, transparent); color: var(--ok); font-weight: 700; }
.clean__title { color: var(--text); font-weight: 600; margin: 0; }
.clean__sub { color: var(--muted); font-size: var(--fs-sm); margin: 4px 0 0; }

.degraded { padding: 10px var(--s-4); border-radius: var(--r-md); background: color-mix(in srgb, var(--warn) 10%, transparent); border: 1px solid color-mix(in srgb, var(--warn) 30%, transparent); color: var(--warn); font-size: var(--fs-sm); }
.filehint { color: var(--muted); font-size: var(--fs-sm); padding: var(--s-3) 0; }

@media (max-width: 920px) { .grid { grid-template-columns: 1fr; } }
</style>
