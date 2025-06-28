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
import AntiFraudHelpline from '@/components/AntiFraudHelpline.vue'
import CommonFraudMethods from '@/components/CommonFraudMethods.vue'
import AntifraudPomotion from '@/components/AntifraudPomotion.vue'
import MemberManagementView from '@/components/MemberManagementView.vue'
import ModifyNicknameView from '@/component/ModifyNicknameView.vue'
import ModifyPasswordView from '@/components/ModifyPasswordView.vue'

const routes = [
  { path: '/', component: LoginView },
  { path: '/register', component: RegisterView }, 
  { path: '/forget-password', component: ForgetPasswordView },
  { path:'/forget-account',component: ForgetAccountView},
  { path:'/reset-password',component: ResetPasswordView},
  { path: '/newsletter',component: Newsletter},
  { path: '/chat', component: ChatMessage },
  { path: '/preview', component: WebPreview },
  {path: '/screenshot',component:ScreenshotAnalysis},
  {path: '/anti-fraud-helpline',component:AntiFraudHelpline},
  {path: '/common-fraud-methods',component:CommonFraudMethods},
  {path: '/anti-fraud-pomption',component:AntifraudPomotion},
  {path: '/member-management',component:MemberManagementView},
  {path: '/modify-nickname',component:ModifyNicknameView},
  {path: '/modify-password',component:ModifyPasswordView}

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
