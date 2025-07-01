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
import ModifyNicknameView from '@/components/ModifyNicknameView.vue'
import ModifyPasswordView from '@/components/ModifyPasswordView.vue'
import UpdateEmail from '@/components/UpdateEmail.vue'
import DeleteAccountView from '@/components/DeleteAccountView.vue'
import Home from '@/components/Home.vue'

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
  {path: '/member-management',component:MemberManagementView,},//meta: { requiresAuth: true }},// 加上限制,
  {path: '/modify-nickname',component:ModifyNicknameView},
  {path:'/delete-account',component:DeleteAccountView},
  {path: '/modify-password',component:ModifyPasswordView},
  {path: '/update-email',component:UpdateEmail},
  {path: '/home',component:Home},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 加入全域導航守衛=
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('userToken')

//   if (to.meta.requiresAuth && !token) {
//     next({ path: '/' }) // 沒 token 就回登入畫面
//   } else {
//     next()
//   }
// })

export default router
