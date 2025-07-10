import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import api from '@/api' 

// 在 App 掛載前先設定 token 到封裝好的 api 實例
const token = localStorage.getItem('authToken') || localStorage.getItem('userToken') || localStorage.getItem('guestToken')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

const app = createApp(App)
app.use(router)
app.mount('#app')
