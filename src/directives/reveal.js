/**
 * v-reveal — fades/slides an element in when it scrolls into view.
 * Usage: v-reveal  or  v-reveal="120"  (delay in ms, for staggering).
 * Respects prefers-reduced-motion (then the element just renders normally),
 * and has a timed fallback so content can never get stuck hidden.
 */
const REDUCE = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default {
  mounted(el, binding) {
    if (REDUCE || typeof IntersectionObserver === 'undefined') return
    const delay = Number(binding.value) || 0
    el.classList.add('reveal')
    el.style.setProperty('--reveal-delay', delay + 'ms')

    const show = () => { el.classList.add('is-in'); cleanup() }
    const fallback = setTimeout(show, 1500)
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) show() },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    )
    io.observe(el)
    function cleanup() { clearTimeout(fallback); io.disconnect() }
    el.__revealCleanup = cleanup
  },
  unmounted(el) { el.__revealCleanup && el.__revealCleanup() },
}
