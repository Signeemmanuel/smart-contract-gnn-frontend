<script setup>
import { onMounted } from 'vue'
import { useFlaws } from '@/composables/useFlaws'
import { FLAW_PRESENTATION, flawColor } from '@/constants/flaws'
import BaseBadge from '@/components/BaseBadge.vue'

const { flaws, loading, error, load } = useFlaws()
onMounted(load)
</script>

<template>
  <div class="container ref">
    <header class="ref__head">
      <p class="eyebrow">Reference</p>
      <h1 class="ref__title">The five flaw classes</h1>
      <p class="ref__sub">
        The detector classifies a contract against the DASP Top-10 categories below. Each finding
        carries a confidence and the source lines the model attributes it to.
      </p>
    </header>

    <p v-if="loading" class="muted">Loading the catalogue…</p>
    <p v-else-if="error" class="ref__error">{{ error }}</p>

    <div class="cards">
      <article v-for="f in flaws" :key="f.type" class="rcard" :style="{ '--c': flawColor(f.type) }">
        <div class="rcard__top">
          <h2 class="rcard__name">{{ f.name }}</h2>
          <BaseBadge :color="flawColor(f.type)">DASP-{{ f.dasp }}</BaseBadge>
        </div>
        <code class="rcard__type mono">{{ f.type }}</code>
        <p class="rcard__blurb">{{ FLAW_PRESENTATION[f.type]?.blurb }}</p>
      </article>
    </div>

    <section class="how card">
      <h2 class="how__title">How a contract is read</h2>
      <ol class="how__steps">
        <li><strong>Compile &amp; parse.</strong> The contract is compiled with the matching solc and its syntax tree and control-flow graph are extracted.</li>
        <li><strong>Embed.</strong> Tokens are embedded with CodeBERT and reduced with a fitted PCA.</li>
        <li><strong>Classify.</strong> A dual-graph GNN scores the contract against the five classes at a fixed decision threshold.</li>
        <li><strong>Localise.</strong> An explainer ranks the source lines most responsible for each finding — the lines you see highlighted.</li>
      </ol>
      <p class="how__note muted">
        Localisation is approximate and can be empty; detection is stronger on some classes than others.
        Treat results as decision support, not proof.
      </p>
    </section>
  </div>
</template>

<style scoped>
.ref { padding-block: var(--s-7) var(--s-6); }
.ref__head { max-width: 760px; margin-bottom: var(--s-6); }
.ref__title { font-size: clamp(1.8rem, 4vw, var(--fs-2xl)); margin: var(--s-3) 0; }
.ref__sub { color: var(--text-dim); }
.ref__error { color: var(--danger); }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--s-4); margin-bottom: var(--s-6); }
.rcard { border: 1px solid var(--line); border-top: 3px solid var(--c); border-radius: var(--r-md); background: var(--surface); padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-2); }
.rcard__top { display: flex; align-items: center; justify-content: space-between; gap: var(--s-2); }
.rcard__name { font-size: var(--fs-md); }
.rcard__type { font-size: var(--fs-xs); color: var(--c); }
.rcard__blurb { font-size: var(--fs-sm); color: var(--muted); margin: 4px 0 0; }
.how { padding: var(--s-5); }
.how__title { font-size: var(--fs-lg); margin-bottom: var(--s-3); }
.how__steps { margin: 0 0 var(--s-3); padding-left: var(--s-5); display: flex; flex-direction: column; gap: var(--s-2); color: var(--text-dim); font-size: var(--fs-sm); }
.how__steps strong { color: var(--text); font-weight: 600; }
.how__note { font-size: var(--fs-sm); }
</style>
