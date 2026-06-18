<script setup>
import { API_BASE_URL } from '@/config'
</script>

<template>
  <footer class="ftr">
    <div class="container ftr__inner">
      <p class="muted">
        SC-GNN smart-contract flaw detector — a decision-support aid, not a guarantee.
        A clean result is not proof a contract is safe.
      </p>
      <p class="ftr__api mono">API · {{ API_BASE_URL.replace(/^https?:\/\//, '') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.ftr { border-top: 1px solid var(--line-soft); margin-top: var(--s-8); padding-block: var(--s-5); }
.ftr__inner { display: flex; justify-content: space-between; gap: var(--s-4); flex-wrap: wrap; align-items: center; }
.ftr p { font-size: var(--fs-sm); margin: 0; }
.ftr__api { color: var(--faint); font-size: var(--fs-xs); }
</style>
