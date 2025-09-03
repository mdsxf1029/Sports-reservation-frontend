import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './utils/router.js'

import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'



const app = createApp(App)
app.use(VueVirtualScroller)

app.use(ElementPlus, {
  locale: zhCn,
})
app.use(router)
app.use(ElementPlus)
app.mount('#app')