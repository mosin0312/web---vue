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
import SearchResults from '@/components/SearchResults.vue'
import AudioAnalysisView from '@/components/AudioAnalysisView.vue'
import BlacklistView from '@/components/BlacklistView.vue'

const routes = [
  { path: '/', component: LoginView },//登入
  { path: '/register', component: RegisterView }, //註冊
  { path: '/forget-password', component: ForgetPasswordView },//忘記密碼
  { path:'/forget-account',component: ForgetAccountView},//忘記帳號
  { path:'/reset-password',component: ResetPasswordView},//重設密碼
  { path: '/sms',component: Newsletter},//簡訊LIST
  { path: '/chat', component: ChatMessage },//簡訊畫面
  { path: '/preview', component: WebPreview },//點擊網址後能跳出網頁內容
  {path: '/screenshot',component:ScreenshotAnalysis},//截圖分析
  {path: '/anti-fraud-helpline',component:AntiFraudHelpline},//165 資訊與回報統計看板
  {path: '/common-fraud-methods',component:CommonFraudMethods},//常見詐騙手法
  {path: '/anti-fraud-pomption',component:AntifraudPomotion},//防詐宣導
  {path: '/member-management',component:MemberManagementView,},//會員管理
  {path: '/modify-nickname',component:ModifyNicknameView},//暱稱更改
  {path:'/delete-account',component:DeleteAccountView},//刪除帳號
  {path: '/update-email',component:UpdateEmail},//更新EMAIL
  {path: '/home',component:Home},//主頁
  {path: '/phonecard',component:PhoneCard},//通話紀錄
  {path: '/search-phone',component:SearchResults},//電話搜尋結果
  {path:'/audio-analysis',component:AudioAnalysisView},//錄音分析
  {path:'/blacklist',component:BlacklistView}//黑名單
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
