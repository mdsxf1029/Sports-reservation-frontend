import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './utils/router'

const app = createApp(App)

app.use(router)   // 这行非常重要！必须加上
app.mount('#app')
