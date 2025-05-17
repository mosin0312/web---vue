import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '@/components/RegisterView.vue'
import LoginView from '@/components/LoginView.vue' 
import ForgetPasswordView from '@/components/ForgetPasswordView.vue'

const routes = [
  { path: '/', component: LoginView },
  { path: '/register', component: RegisterView }, 
  { path: '/forget-password', component: ForgetPasswordView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
