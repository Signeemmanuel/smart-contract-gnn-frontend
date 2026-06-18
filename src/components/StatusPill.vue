<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useHealth } from '@/composables/useHealth'
import BaseBadge from './BaseBadge.vue'

const { health, error, refresh } = useHealth()
let timer = null
onMounted(() => { refresh(); timer = setInterval(refresh, 20000) })
onUnmounted(() => timer && clearInterval(timer))

const state = computed(() => {
  if (error.value || !health.value) return { color: 'var(--faint)', label: 'offline' }
  const h = health.value
  if (!h.model_loaded) return { color: 'var(--danger)', label: 'not ready' }
  if (h.mock_mode) return { color: 'var(--warn)', label: 'mock mode' }
  return { color: 'var(--ok)', label: 'live' }
})
</script>

<template>
  <RouterLink to="/status" class="pill-link" :title="error || 'Service status'">
    <BaseBadge :color="state.color">{{ state.label }}</BaseBadge>
  </RouterLink>
</template>

<style scoped>
.pill-link { text-decoration: none; }
.pill-link:hover { text-decoration: none; opacity: 0.85; }
</style>
