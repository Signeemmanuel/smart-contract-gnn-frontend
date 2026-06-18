import { createRouter, createWebHashHistory } from 'vue-router'

// Hash history: works on any static host (incl. a Hugging Face static Space)
// with no server-side rewrite rules.
const routes = [
  { path: '/', name: 'analyze', component: () => import('@/views/AnalyzeView.vue'), meta: { title: 'Analyse' } },
  { path: '/reference', name: 'reference', component: () => import('@/views/ReferenceView.vue'), meta: { title: 'Flaw reference' } },
  { path: '/status', name: 'status', component: () => import('@/views/StatusView.vue'), meta: { title: 'Service status' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({ history: createWebHashHistory(), routes, scrollBehavior: () => ({ top: 0 }) })
router.afterEach((to) => { document.title = to.meta?.title ? `SC-GNN · ${to.meta.title}` : 'SC-GNN' })

export default router
