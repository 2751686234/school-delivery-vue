import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'

import { ElMessage } from 'element-plus'
ElMessage.success = (options) => {
  return ElMessage({
    ...options,
    type: 'success',
    max: 2,
    duration: 1000,
  })
}

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')