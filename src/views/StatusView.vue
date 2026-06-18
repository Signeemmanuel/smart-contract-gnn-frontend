<script setup>
import { computed, onMounted } from 'vue'
import { useHealth } from '@/composables/useHealth'
import BaseButton from '@/components/BaseButton.vue'
import BaseBadge from '@/components/BaseBadge.vue'

const { health, loading, error, refresh } = useHealth()
onMounted(refresh)

const state = computed(() => {
  if (error.value || !health.value) return { color: 'var(--faint)', label: 'Offline' }
  const h = health.value
  if (!h.model_loaded) return { color: 'var(--danger)', label: 'Not ready' }
  if (h.mock_mode) return { color: 'var(--warn)', label: 'Mock mode' }
  return { color: 'var(--ok)', label: 'Live' }
})
const shortSha = computed(() => health.value?.resolved_sha?.slice(0, 12) || '—')
const rows = computed(() => {
  const h = health.value
  if (!h) return []
  return [
    ['Engine', h.mock_mode ? 'Mock (no model)' : 'Real model'],
    ['Model loaded', h.model_loaded ? 'yes' : 'no'],
    ['Repository', h.repo_id],
    ['Configured revision', h.configured_revision],
    ['Resolved commit', h.resolved_sha || '—'],
    ['Device', h.device],
    ['Decision threshold', typeof h.threshold === 'number' ? h.threshold.toFixed(2) : '—'],
    ['Token present', h.hf_token_present ? 'yes' : 'no'],
  ]
})
</script>

<template>
  <div class="container status">
    <header class="status__head" v-reveal>
      <div>
        <p class="eyebrow">Service status</p>
        <h1 class="status__title">Backend health <BaseBadge :color="state.color">{{ state.label }}</BaseBadge></h1>
      </div>
      <BaseButton variant="ghost" size="sm" :loading="loading" @click="refresh">Refresh</BaseButton>
    </header>

    <p v-if="error" class="status__error">{{ error }} — the API may be asleep (free Spaces idle out); a refresh usually wakes it.</p>

    <div v-if="health" class="status__grid card" v-reveal="80">
      <div class="status__sha">
        <span class="muted">Serving commit</span>
        <code class="mono sha">{{ shortSha }}</code>
        <span class="muted sha__full mono">{{ health.resolved_sha }}</span>
      </div>
      <dl class="kv">
        <div v-for="[k, v] in rows" :key="k" class="kv__row">
          <dt class="kv__k">{{ k }}</dt>
          <dd class="kv__v mono">{{ v }}</dd>
        </div>
      </dl>
      <p v-if="health.error" class="status__svcerr"><strong>Reported error:</strong> {{ health.error }}</p>
    </div>
  </div>
</template>

<style scoped>
.status { padding-block: var(--s-7) var(--s-6); max-width: 860px; }
.status__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-4); margin-bottom: var(--s-5); }
.status__title { font-size: clamp(1.6rem, 3.5vw, var(--fs-xl)); display: inline-flex; align-items: center; gap: var(--s-3); margin-top: var(--s-2); flex-wrap: wrap; }
.status__error { color: var(--warn); margin-bottom: var(--s-4); font-size: var(--fs-sm); }
.status__grid { padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-4); }
.status__sha { display: flex; flex-direction: column; gap: 4px; padding-bottom: var(--s-4); border-bottom: 1px solid var(--line); }
.sha { font-size: var(--fs-lg); color: var(--signal); }
.sha__full { font-size: var(--fs-xs); word-break: break-all; }
.kv { display: grid; grid-template-columns: 1fr; gap: 0; margin: 0; }
.kv__row { display: grid; grid-template-columns: 200px 1fr; gap: var(--s-3); padding: 9px 0; border-bottom: 1px solid var(--line-soft); }
.kv__k { color: var(--muted); font-size: var(--fs-sm); }
.kv__v { color: var(--text); font-size: var(--fs-sm); word-break: break-all; }
.status__svcerr { color: var(--danger); font-size: var(--fs-sm); }
@media (max-width: 560px) { .kv__row { grid-template-columns: 1fr; gap: 2px; } }
</style>
