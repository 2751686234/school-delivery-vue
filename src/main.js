import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// 全局配置 message 位置，避免被导航挡住
app.use(ElementPlus, {
  message: {
    offset: 70,    // 向下偏移，不被导航栏挡住
    duration: 1200 // 显示时长
  }
})

app.use(router)
app.mount('#app')