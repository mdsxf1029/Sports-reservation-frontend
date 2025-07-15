import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import App from './App.vue'

// 引入你写好的路由
import router from './utils/router'

const app = createApp(App)

// 挂载 router
app.use(router)

app.mount('#app')
