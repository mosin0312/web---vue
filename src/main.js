import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 
import axios from 'axios';

createApp(App).use(router).mount('#app') 
const token = localStorage.getItem('authToken');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}