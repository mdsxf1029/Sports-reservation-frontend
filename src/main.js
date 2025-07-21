import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from './utils/router.js'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')