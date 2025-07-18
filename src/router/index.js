import { createRouter, createWebHashHistory } from 'vue-router'
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
import ModifyNicknameView from '@/components/ModifyNicknameView.vue'
import UpdateEmail from '@/components/UpdateEmail.vue'
import DeleteAccountView from '@/components/DeleteAccountView.vue'
import Home from '@/components/Home.vue'
import PhoneCard from '@/components/PhoneCard.vue'

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
  {path: '/member-management',component:MemberManagementView,},
  {path: '/modify-nickname',component:ModifyNicknameView},
  {path:'/delete-account',component:DeleteAccountView},
  {path: '/update-email',component:UpdateEmail},
  {path: '/home',component:Home},
  {path: '/phonecard',component:PhoneCard},
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
