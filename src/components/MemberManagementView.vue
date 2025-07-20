<template>
  <div class="main-container">
    <header class="title-member-data">
      <img src="@/assets/icons/header-icon.svg" alt="Logo" class="header-icon" />
      <span class="header-title">會員管理</span>
    </header>

    <section class="account-section" v-if="!isGuest">
      <div class="section-title">帳號資訊</div>
      <div class="account-item" v-for="(item, index) in memberFields" :key="index">
        <div class="label">{{ item.label }}</div>
        <div class="value">{{ item.value }}</div>
        <div class="edit-button" v-if="item.editable">
          <div class="icon" :style="{ backgroundImage: `url(${item.icon})` }" @click="handleEdit(item.label)"></div>
        </div>
      </div>
    </section>

    <div class="action-buttons" v-if="!isGuest">
      <button class="logout" @click="askLogout">登出</button>
      <button class="delete" @click="goToDeleteAccount">刪除帳號</button>
    </div>

    <section class="extra-options">
      <button class="option-blacklist">黑名單查看</button>
      <button class="option-question">查看問題回報</button>
    </section>
  </div>

   <AlertModal :visible="modalVisible" :message="modalMessage"  @confirm="handleModalConfirm" @close="handleModalCancel"  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue'

const router = useRouter()

// ──────────────── AlertModal 控制 ────────────────
const modalVisible = ref(false)
const modalMessage = ref('')
const pendingAction = ref(null) // 紀錄用戶按下確認後要執行的動作（如 logout）

// ──────────────── 個人資料狀態 ────────────────
const isGuest = ref(false)
const memberFields = ref([])
const userId = ref(null)
const tokenIssuedAt = ref(null)

// ──────────────── JWT 工具 ────────────────
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(atob(base64))))
  } catch {
    return null
  }
}

// ──────────────── AlertModal 控制方法 ────────────────
const showAlert = (msg, confirmToLogin = false) => {
  modalMessage.value = msg
  pendingAction.value = confirmToLogin ? 'toLogin' : null
  modalVisible.value = true
}

const confirmDialog = (msg, actionKey) => {
  modalMessage.value = msg
  pendingAction.value = actionKey
  modalVisible.value = true
}

const handleModalConfirm = async () => {
  if (pendingAction.value === 'logout') {
    await doLogout()
  } else if (pendingAction.value === 'toLogin') {
    router.push('/')
  }
  modalVisible.value = false
  pendingAction.value = null
}

const handleModalCancel = () => {
  modalVisible.value = false
  pendingAction.value = null
}

// ──────────────── 登出功能 ────────────────
const askLogout = () => confirmDialog('確定要登出？', 'logout')

const doLogout = async () => {
  try {
    const token = localStorage.getItem('userToken')
    const { data } = await axios.post('/api/MemberManagement/Logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (data.status === 'Success') {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('nickname')
      localStorage.removeItem('accountName')
      router.push({ path: '/', query: { loggedOut: 'true' } })
    } else {
      showAlert(data.message || '登出失敗')
    }
  } catch (err) {
    console.error('登出發生錯誤', err)
    showAlert('登出失敗，請稍後再試')
  }
}

// ──────────────── 取得會員資料 ────────────────
const fetchProfile = async () => {
  const token = localStorage.getItem('userToken')
  if (!token) {
    router.push('/')
    return
  }

  const payload = parseJwt(token)
  isGuest.value = payload?.Role === 'Guest'
  if (isGuest.value) return

  try {
    const { data } = await axios.get('/api/MemberManagement/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (data.userStatus === 'Logout') {
      localStorage.removeItem('userToken')
      router.push({ path: '/', query: { loggedOut: 'true' } })
      return
    }

    if (data.status === 'Success') {
      userId.value = data.userId
      tokenIssuedAt.value = data.tokenIssuedAt

      memberFields.value = [
        { label: '暱稱', value: data.nickname, editable: true, icon: require('@/assets/icons/icon.svg') },
        { label: '帳號名稱', value: data.accountName, editable: false },
        { label: 'Email', value: data.email, editable: true, icon: require('@/assets/icons/icon.svg') },
        { label: '密碼', value: '******', editable: true, icon: require('@/assets/icons/icon.svg') }
      ]
    }
  } catch (err) {
    console.error('取得使用者資訊失敗', err)
    showAlert('無法取得會員資料，請重新登入', true)
    router.push('/')
  }
}

// ──────────────── 編輯與導頁 ────────────────
function handleEdit(label) {
  if (label === '暱稱') router.push('/modify-nickname')
  else if (label === 'Email') router.push('/update-email')
  else if (label === '密碼') router.push('/reset-password')
}

const goToDeleteAccount = () => router.push('/delete-account')

// ──────────────── 初始化驗證 ────────────────
onMounted(() => {
  const token = localStorage.getItem('userToken')
  const role = localStorage.getItem('userRole')

  // ✅ 驗證 Token 與角色是否合法
  if (!token || role !== 'User') {
    showAlert('請先登入', true)
    return
  }

  // ✅ 處理 ?loggedOut=true 清除 query
  const query = router.currentRoute.value.query
  if (query.loggedOut === 'true') {
    router.replace({ query: {} })
  }

  fetchProfile()
})
</script>



<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #d4d8fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative; 
}

.title-member-data {
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 20px;
}

.header-icon {
  width: 39px;
  height: 39px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
}

.account-section {
  width: 90%;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  max-width: 100%;
  padding: 0 16px;
  margin-top: 20px;
}

.section-title {
  font-size: 25px;
  font-weight: 500;
  margin-top: 20px;
  margin-bottom: 20px;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.label {
  font-size: 20px;
  width: 90px;
  font-family: 'Roboto Mono', monospace;
}

.value {
  flex-grow: 1;
  margin-right: 10px;
  padding: 6px 10px;
  border: 1px dashed #000;
  border-radius: 10px;
  font-size: 20x;
  font-weight: bold;
  font-family: 'Inter', sans-serif;
}

.edit-button {
  width: 30px;
  height: 30px;
  border: 1px solid #000;
  border-radius: 8px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 20px;
  height: 20px;
  background-size: cover;
  background-position: center;
}

.action-buttons {
  width: 100%;
  max-width: 90%; 
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 30px 0;
}

.logout {
  padding: 16px 24px; 
  font-size: 18px;      
  flex: 1;
  padding: 14px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background: #5a67d8;
  color: #ffffff;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.delete {
  padding: 16px 24px;
  font-size: 18px;
  flex: 1;
  padding: 14px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background-color: #f8d7da;
  color: #721c24;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.extra-options {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.option-blacklist {
  padding: 14px 28px;        
  font-size: 15px;           
  border-radius: 40px;       
  background: #faf7d7;
  border: 2px solid #ffecbb;
  font-family: 'Roboto Mono', monospace;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}

.option-question {
  padding: 14px 28px;        
  font-size: 15px;           
  border-radius: 40px;       
  background: #faf7d7;
  border: 2px solid #ffecbb;
  font-family: 'Roboto Mono', monospace;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}
</style>
