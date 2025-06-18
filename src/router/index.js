import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '@/components/RegisterView.vue'
import LoginView from '@/components/LoginView.vue' 
import ForgetPasswordView from '@/components/ForgetPasswordView.vue'
import ForgetAccountView from '@/components/ForgetAccountView.vue'
import ResetPasswordView from '@/components/ResetPasswordView.vue'
import Newsletter from '@/components/Newsletter.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import WebPreview from '@/components/WebPreview.vue'
import ScreenshotAnalysis from '@/components/ScreenshotAnalysis.vue'



const routes = [
  { path: '/', component: LoginView },
  { path: '/register', component: RegisterView }, 
  { path: '/forget-password', component: ForgetPasswordView },
  { path:'/forget-account',component: ForgetAccountView},
  { path:'/reset-password',component: ResetPasswordView},
  { path: '/newsletter',component: Newsletter},
  { path: '/chat', component: ChatMessage },
  { path: '/preview', component: WebPreview },
  {path: '/screenshot',component:ScreenshotAnalysis}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
