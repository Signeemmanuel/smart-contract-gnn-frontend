import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import reveal from './directives/reveal'
import './assets/styles/tokens.css'
import './assets/styles/base.css'

createApp(App).use(router).directive('reveal', reveal).mount('#app')
