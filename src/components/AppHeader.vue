<script setup>
import { RouterLink } from 'vue-router'
import StatusPill from './StatusPill.vue'
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <header class="hdr">
    <div class="container hdr__inner">
      <RouterLink to="/" class="brand" aria-label="SC-GNN home">
        <svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 5 L26 10.5 V21.5 L16 27 L6 21.5 V10.5 Z" fill="none" stroke="var(--line)" stroke-width="1.4"/>
          <path d="M16 5 L16 16 M16 16 L26 10.5 M16 16 L6 21.5" stroke="var(--violet)" stroke-width="1.4"/>
          <circle cx="16" cy="5" r="2.4" fill="var(--signal)"/>
          <circle cx="26" cy="10.5" r="2.4" fill="var(--violet)"/>
          <circle cx="6" cy="21.5" r="2.4" fill="var(--sky)"/>
          <circle cx="16" cy="16" r="2.6" fill="var(--text)"/>
        </svg>
        <span class="brand__name">scgnn<span class="brand__dim">·detector</span></span>
      </RouterLink>

      <nav class="nav" aria-label="Primary">
        <RouterLink to="/" class="nav__link">Analyse</RouterLink>
        <RouterLink to="/reference" class="nav__link">Reference</RouterLink>
        <RouterLink to="/status" class="nav__link">Status</RouterLink>
      </nav>

      <div class="hdr__right">
        <ThemeToggle />
        <StatusPill />
      </div>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky; top: 0; z-index: 50;
  background: color-mix(in srgb, var(--ink) 78%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line-soft);
}
.hdr__inner { display: flex; align-items: center; gap: var(--s-5); height: 60px; }
.brand { display: inline-flex; align-items: center; gap: 10px; }
.brand:hover { text-decoration: none; }
.brand__mark { width: 28px; height: 28px; }
.brand__name { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-md); color: var(--text); letter-spacing: -0.01em; }
.brand__dim { color: var(--faint); font-weight: 500; }
.nav { display: flex; gap: var(--s-2); margin-left: auto; }
.nav__link {
  color: var(--text-dim); padding: 6px 12px; border-radius: var(--r-md);
  font-size: var(--fs-sm); font-weight: 500; transition: all var(--t) var(--ease);
}
.nav__link:hover { color: var(--text); background: var(--surface-2); text-decoration: none; }
.nav__link.router-link-exact-active { color: var(--signal); background: color-mix(in srgb, var(--signal) 12%, transparent); }
.hdr__right { display: flex; align-items: center; gap: var(--s-3); padding-left: var(--s-2); }
@media (max-width: 560px) {
  .brand__dim { display: none; }
  .nav__link { padding: 6px 8px; }
  .hdr__inner { gap: var(--s-3); }
}
</style>
