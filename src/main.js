import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// ✅ 在 App 掛載前先設定 token
const token = localStorage.getItem('authToken')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

const app = createApp(App)
app.use(router)
app.mount('#app')
