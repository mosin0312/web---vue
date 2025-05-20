import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '@/components/RegisterView.vue'
import LoginView from '@/components/LoginView.vue' 
import ForgetPasswordView from '@/components/ForgetPasswordView.vue'
import ForgetAccountView from '@/components/ForgetAccountView.vue'
import ResetPasswordView from '@/components/ResetPasswordView.vue'



const routes = [
  { path: '/', component: LoginView },
  { path: '/register', component: RegisterView }, 
  { path: '/forget-password', component: ForgetPasswordView },
  {path:'/forget-account',component: ForgetAccountView},
  {path:'/reset-password',component: ResetPasswordView}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
