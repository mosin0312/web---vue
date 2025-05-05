import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '@/components/RegisterView.vue'
import LoginView from '@/components/LoginView.vue' 

const routes = [
  { path: '/', component: LoginView },
  { path: '/register', component: RegisterView }, 
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
