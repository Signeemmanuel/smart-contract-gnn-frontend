<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import StatusPill from './StatusPill.vue'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const menuOpen = ref(false)
watch(() => route.fullPath, () => { menuOpen.value = false }) // close on navigation
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

      <nav class="nav nav--inline" aria-label="Primary">
        <RouterLink to="/" class="nav__link">Analyse</RouterLink>
        <RouterLink to="/reference" class="nav__link">Reference</RouterLink>
        <RouterLink to="/status" class="nav__link">Status</RouterLink>
      </nav>

      <div class="hdr__right">
        <span class="theme-bar"><ThemeToggle /></span>
        <StatusPill />
        <button
          class="menu-btn" type="button" :aria-expanded="menuOpen" aria-label="Menu"
          @click="menuOpen = !menuOpen"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
            <path v-if="!menuOpen" d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path v-else d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <Transition name="drop">
      <nav v-if="menuOpen" class="nav nav--drop" aria-label="Primary mobile">
        <RouterLink to="/" class="nav__link">Analyse</RouterLink>
        <RouterLink to="/reference" class="nav__link">Reference</RouterLink>
        <RouterLink to="/status" class="nav__link">Status</RouterLink>
        <div class="drop-theme">
          <span class="drop-theme__label">Theme</span>
          <ThemeToggle />
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky; top: 0; z-index: 50;
  background: color-mix(in srgb, var(--ink) 80%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line-soft);
}
.hdr__inner { display: flex; align-items: center; gap: var(--s-4); height: 60px; animation: hdr-in 0.55s var(--ease) both; }
@keyframes hdr-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
.brand { display: inline-flex; align-items: center; gap: 10px; }
.brand:hover { text-decoration: none; }
.brand__mark { width: 28px; height: 28px; flex: none; }
.brand__name { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-md); color: var(--text); letter-spacing: -0.01em; }
.brand__dim { color: var(--faint); font-weight: 500; }

.nav--inline { display: flex; gap: var(--s-2); margin-left: auto; }
.nav__link {
  color: var(--text-dim); padding: 6px 12px; border-radius: var(--r-md);
  font-size: var(--fs-sm); font-weight: 500; transition: all var(--t) var(--ease);
}
.nav__link:hover { color: var(--text); background: var(--surface-2); text-decoration: none; }
.nav__link.router-link-exact-active { color: var(--signal); background: color-mix(in srgb, var(--signal) 12%, transparent); }

.hdr__right { display: flex; align-items: center; gap: var(--s-3); }
.theme-bar { display: inline-flex; }
.drop-theme { display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); margin-top: var(--s-2); padding: var(--s-3) 12px 0; border-top: 1px solid var(--line-soft); }
.drop-theme__label { color: var(--muted); font-size: var(--fs-sm); }
.menu-btn {
  display: none; place-items: center; width: 36px; height: 32px; border-radius: var(--r-md);
  background: var(--surface-2); border: 1px solid var(--line); color: var(--text-dim);
}
.menu-btn:hover { color: var(--text); }

/* dropdown nav */
.nav--drop {
  display: flex; flex-direction: column; gap: 2px;
  padding: var(--s-3) var(--s-5) var(--s-4);
  border-top: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--ink) 96%, transparent);
}
.nav--drop .nav__link { padding: 10px 12px; font-size: var(--fs-base); }
.drop-enter-active, .drop-leave-active { transition: opacity var(--t) var(--ease), transform var(--t) var(--ease); }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 720px) {
  .nav--inline { display: none; }
  .menu-btn { display: inline-grid; }
  .hdr__right { margin-left: auto; }
  .theme-bar { display: none; }
}
@media (min-width: 721px) {
  .nav--drop { display: none !important; }
}
@media (max-width: 420px) {
  .brand__dim { display: none; }
  .hdr__inner { gap: var(--s-3); }
}
</style>
