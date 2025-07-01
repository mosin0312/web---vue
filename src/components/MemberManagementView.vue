<template>
  <div class="scale-wrapper">
   <div class="title-header">
  <img src="@/assets/icons/header-icon.svg" class="header-icon" />
  <h1 class="page-title">會員登入介面</h1>
</div>

    <div class="account-box">
    <h2 class="account-title">帳號資訊</h2>
      <AccountItem title="暱稱" :value="nickname" @edit="goToModifyNickname" />
      <AccountItem title="帳號名稱" :value="account" :editable="false" />
      <AccountItem title="Email" :value="email" @edit="goToModifyEmail" />
      <AccountItem title="密碼" :value="passwordDisplay" @edit="goToModifyPassword" />
    </div>

    <div class="button-group">
      <button class="btn" @click="logout">登出</button>
      <button class="btn delete" @click="goToDeleteAccount">刪除帳號</button>
    </div>

    <div class="extra-actions">
      <button class="tag">黑名單查看</button>
      <button class="tag">問題</button>
    </div>
    <AlertModal v-if="showModal" :message="modalMessage" @close="showModal = false" @confirm="handleConfirm"/>
  </div>
  
</template>


<script setup>
import AlertModal from '@/components/AlertModal.vue'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AccountItem from './AccountItem.vue'

const router = useRouter()
const nickname = ref('') // 從 API 取得
const account = ref('')
const email = ref('')
const passwordDisplay = ref('********')
const pendingRedirect = ref(false)

const showModal = ref(false)
const modalMessage = ref('')

const showAlert = (message, redirect = false) => {
  modalMessage.value = message
  showModal.value = true
  pendingRedirect.value = redirect
}

const handleConfirm = () => {
  if (pendingRedirect.value) {
    router.push('/login')
  }
  showModal.value = false
}


const goToModifyNickname = () => router.push('/modify-nickname')
const goToModifyEmail = () => router.push('/update-email')
const goToModifyPassword = () => router.push('/modify-password')
const goToDeleteAccount = () => {
  console.log('點擊了刪除帳號按鈕')
  router.push('/delete-account')
}

const logout = async () => {
  console.log('使用者點擊了登出')
  const token = localStorage.getItem('userToken')
  if (!token) {
    showAlert('您尚未登入')
    return
  }

  try {
    const res = await axios.post('/api/MemberManagement/Logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (res.data.status === 'Success') {
      localStorage.removeItem('userToken')
      showAlert('登出成功，返回登入畫面', true)
    } else {
      showAlert('登出失敗，請稍後再試')
    }
  } catch (err) {
    console.error('登出錯誤:', err)
    showAlert('伺服器錯誤，登出失敗')
  }
}

const fetchUserProfile = async () => {
  const token = localStorage.getItem('userToken')
  if (!token) {
  showAlert('請先登入', true) 
  return
}

  try {
    const res = await axios.get('/api/MemberManagement/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (res.data.status === 'Success') {
      // 從 JWT payload 解碼出帳號資訊
      const payload = JSON.parse(atob(token.split('.')[1]))
      nickname.value = payload.Nickname || '使用者'
      account.value = payload.sub || '帳號'
      email.value = payload.Email || '未知'
    } else {
      showAlert('找不到使用者資料', true)
    }
  } catch (err) {
    console.error('取得會員資料失敗:', err)
    showAlert('取得會員資料失敗，請重新登入', true)
  }
}

onMounted(() => {
  fetchUserProfile()
})

onBeforeUnmount(() => {

})
</script>

<style scoped>
.scale-wrapper{
  width: 100%;
  height: 100vh;
  max-width: 100%;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #d4d8fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative;
}
.title-header {
  display: flex;
  width: 100%;
  height: 40px;
  padding: 0 21px;
  justify-content: flex-start; /*調整標題文字位置*/
  align-items: center;
  gap: 10px;
  background-color: #fff;
}

.header-icon {
  width: 32px;
  height: 32px;
}

.page-title {
  color: #000;
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}
.account-box {
  position: relative;  /* 絕對定位以它為基準 */
  padding-top: 40px;   /* 給標題留一點空間 */
  padding-left: 20px;  /* 控制內容內縮 */
  padding-right: 20px;
  padding-bottom: 20px;
  background: #fff;
  border-radius: 15px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.account-title {
  position: absolute;
  top: 12px;
  left: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}
.btn {
  width: 165px;               
  height: 60px; 
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background: #5a67d8;
  color: #fff;
  cursor: pointer;
}
.btn.delete {
  background-color: #f8d7da;
  color: #721c24;
}
.extra-actions {
  display: flex;
  justify-content: space-evenly;
  margin-top: 40px;
  gap: 20px;/*黑名單間距*/
}
.tag {
  width: 120px;                  
  height: 50px;                  
  background: #8d9afc;
  border: 2px solid #bbc3ff;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);

  display: flex;  /* 讓文字置中 */
  align-items: center;
  justify-content: center;
}

</style>  
