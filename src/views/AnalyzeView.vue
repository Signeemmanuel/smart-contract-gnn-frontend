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

const source = ref('')
const pendingSource = ref('')
const activeFlaw = ref(null)
const editing = ref(false)

onMounted(() => {
  loadFlaws(); refreshHealth()
})

function onSubmitSource(src) { editing.value = false; pendingSource.value = src; activeFlaw.value = null; analyzeSource(src) }
function onSubmitFile(file) { editing.value = false; pendingSource.value = ''; activeFlaw.value = null; analyzeFile(file) }
function editContract() { if (!source.value) source.value = result.value?.source || pendingSource.value || ''; editing.value = true; activeFlaw.value = null }
function onReset() { reset(); editing.value = false; pendingSource.value = ''; source.value = ''; activeFlaw.value = null }

// Auto-select the sole finding so its lines light up without a hover.
watch(result, (r) => {
  if (status.value === 'done' && r?.flaws?.length === 1) activeFlaw.value = r.flaws[0]
})

const hasResult = computed(() => status.value === 'done')
const showEditor = computed(() => !hasResult.value || editing.value)
const rightState = computed(() => (editing.value ? 'idle' : status.value))
const shownSource = computed(() => result.value?.source ?? pendingSource.value)
const highlightLines = computed(() => activeFlaw.value?.lines ?? [])
const highlightColor = computed(() => (activeFlaw.value ? flawColor(activeFlaw.value.type) : 'var(--signal)'))
const findingsCount = computed(() => result.value?.flaws?.length ?? 0)
const threshold = computed(() => (typeof health.value?.threshold === 'number' ? health.value.threshold : null))

const eyebrow = computed(() => (hasResult.value && !editing.value ? 'Result' : 'Graph neural network · DASP detection'))
const heading = computed(() => {
  if (editing.value) return 'Edit contract'
  if (status.value === 'done') return findingsCount.value
    ? `${findingsCount.value} ${findingsCount.value === 1 ? 'finding' : 'findings'}` : 'No flaws detected'
  if (isBusy.value) return 'Analysing…'
  if (status.value === 'failed' || status.value === 'error') return 'Analysis failed'
  return 'Read a contract the way the model does.'
})

</script>

<template>
  <div class="analyze">
    <header class="container head" v-reveal>
      <div class="head__text">
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1 class="head__title" :class="{ 'head__title--lg': status === 'idle' && !editing }">{{ heading }}</h1>
        <p v-if="status === 'idle' && !editing" class="head__sub">
          Submit Solidity and the detector returns the vulnerability classes it finds — and lights up the
          source lines it holds responsible. Hover a finding to trace it back into the code.
        </p>
      </div>
      <div v-if="status !== 'idle'" class="head__actions">
        <BaseButton v-if="hasResult && !editing" variant="ghost" size="sm" @click="editContract">Edit contract</BaseButton>
        <BaseButton variant="subtle" size="sm" @click="onReset">New analysis</BaseButton>
      </div>
    </header>

    <div class="container work" v-reveal="120">
      <!-- LEFT: contract (editor → highlighted code, in place) -->
      <div class="work__left" :class="{ 'is-pinned': !showEditor }">
        <Transition name="swap" mode="out-in">
          <ContractInput
            v-if="showEditor" key="editor" v-model:source="source" :busy="isBusy" :threshold="threshold"
            @submit-source="onSubmitSource" @submit-file="onSubmitFile" @reset="() => {}"
          />
          <div v-else key="code" class="codepane">
            <SourceViewer :source="shownSource" :highlight-lines="highlightLines" :color="highlightColor" />
            <p class="codepane__hint muted">Hover or focus a finding to highlight its lines here.</p>
          </div>
        </Transition>
      </div>

      <!-- RIGHT: result -->
      <section class="card result work__right">
        <Transition name="swap" mode="out-in">
        <div v-if="rightState === 'idle'" key="idle" class="empty">
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

        <div v-else-if="rightState !== 'done'" key="busy">
          <JobProgress :status="rightState" :elapsed-ms="elapsedMs" :error="error" />
        </div>

        <div v-else key="done" class="done">
          <div v-if="result.degraded" class="degraded" role="status">
            Analysis ran on a degraded control-flow graph — results may be less reliable.
          </div>
          <FindingsList
            v-if="findingsCount" :flaws="result.flaws" :by-type="byType" :active-flaw="activeFlaw"
            @activate="(f) => (activeFlaw = f)" @deactivate="(f) => { if (activeFlaw === f) activeFlaw = null }"
          />
          <div v-else class="clean">
            <span class="clean__check" aria-hidden="true">✓</span>
            <div>
              <p class="clean__title">No flaws detected at the current threshold.</p>
              <p class="clean__sub">Absence of a finding is not a guarantee of safety — treat this as one signal, not a verdict.</p>
            </div>
          </div>
        </div>
        </Transition>
      </section>
    </div>
  </div>
</template>

<style scoped>
.analyze { padding-bottom: var(--s-7); }

.head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--s-4); flex-wrap: wrap; padding-block: var(--s-6) var(--s-5); }
.head__title { font-size: clamp(1.5rem, 3vw, var(--fs-xl)); margin-top: var(--s-2); }
.head__title--lg { font-size: clamp(2rem, 4.5vw, var(--fs-3xl)); line-height: 1.05; max-width: 16ch; }
.head__sub { font-size: var(--fs-md); color: var(--text-dim); max-width: 60ch; margin-top: var(--s-3); }
.head__actions { display: flex; gap: var(--s-2); }

.work { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s-5); align-items: start; }
.work__left { min-width: 0; }
.work__left.is-pinned { position: sticky; top: calc(60px + var(--s-4)); align-self: start; }
.codepane { display: flex; flex-direction: column; gap: var(--s-2); min-width: 0; }
.codepane :deep(.viewer__body) { max-height: calc(100vh - 60px - 150px); }
.codepane__hint { font-size: var(--fs-xs); }

.result { padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-4); min-height: 480px; }
.work__right { min-width: 0; }
.done { display: flex; flex-direction: column; gap: var(--s-3); }

/* reveal transition when panes switch (editor <-> code, idle/busy -> findings) */
.swap-enter-active { transition: opacity .45s var(--ease), transform .45s var(--ease); }
.swap-leave-active { transition: opacity .16s var(--ease), transform .16s var(--ease); }
.swap-enter-from { opacity: 0; transform: translateY(20px) scale(0.985); }
.swap-leave-to { opacity: 0; transform: translateY(-6px); }
.empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--s-4); text-align: center; padding: var(--s-7) var(--s-4); }
.empty__text { color: var(--muted); max-width: 36ch; font-size: var(--fs-sm); }
.degraded { padding: 10px var(--s-4); border-radius: var(--r-md); background: color-mix(in srgb, var(--warn) 10%, transparent); border: 1px solid color-mix(in srgb, var(--warn) 30%, transparent); color: var(--warn); font-size: var(--fs-sm); }
.clean { display: flex; align-items: flex-start; gap: var(--s-3); padding: var(--s-4); border-radius: var(--r-md); background: color-mix(in srgb, var(--ok) 9%, transparent); border: 1px solid color-mix(in srgb, var(--ok) 28%, transparent); }
.clean__check { width: 28px; height: 28px; flex: none; display: grid; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--ok) 20%, transparent); color: var(--ok); font-weight: 700; }
.clean__title { color: var(--text); font-weight: 600; margin: 0; }
.clean__sub { color: var(--muted); font-size: var(--fs-sm); margin: 4px 0 0; }

@media (max-width: 920px) {
  .work { grid-template-columns: minmax(0, 1fr); gap: var(--s-4); }
  .work__left.is-pinned {
    position: sticky; top: calc(60px + var(--s-2)); z-index: 1;
    background: var(--ink); padding-bottom: var(--s-2);
  }
  .work__left.is-pinned :deep(.viewer__body) { max-height: 42vh; }
  .codepane__hint { display: none; }
  .result { min-height: 0; }
}
@media (max-width: 560px) {
  .result { padding: var(--s-4); }
}
@media (max-width: 560px) {
  .head__actions { width: 100%; }
  .head__actions :deep(.btn) { flex: 1; }
}
</style>