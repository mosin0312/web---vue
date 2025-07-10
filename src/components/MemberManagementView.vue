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
import api from '@/api'
import AlertModal from '@/components/AlertModal.vue' 

const router = useRouter()

// AlertModal 控制
const modalVisible   = ref(false)
const modalMessage   = ref('')
const pendingAction  = ref(null)     // 用來記住確認按鈕後要執行什麼動作

// 個人資料
const isGuest        = ref(false)
const memberFields   = ref([])       // 暱稱 、 帳號 、Email 、 密碼
const userId         = ref(null)
const tokenIssuedAt  = ref(null)

/* ─────────────────────── JWT 工具 ─────────────────────── */
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(atob(base64))))
  } catch {
    return null
  }
}

/*  AlertModal   */
const showAlert = (msg) => {
  modalMessage.value = msg
  pendingAction.value = null
  modalVisible.value = true
}

// 顯示提示對話框（用於登出）
const confirmDialog = (msg, actionKey) => {
  modalMessage.value = msg
  pendingAction.value = actionKey 
  modalVisible.value = true
}

/*  API：取得個人資料  */
const fetchProfile = async () => {
  const token = localStorage.getItem('userToken')
  if (!token) {
    router.push('/login')
    return
  }

  // 訪客就不打 profile API
  const payload = parseJwt(token)
  isGuest.value = payload?.Role === 'Guest'
  if (isGuest.value) return

  try {
    const { data } = await api.get('/api/MemberManagement/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })

    /*   後端如果幫忙把 user.Status 帶回來，可在這裡擋住  */
    if (data.userStatus === 'Logout') {
      localStorage.removeItem('userToken')
      router.push({ path: '/login', query: { loggedOut: 'true' } })
      return
    }

    if (data.status === 'Success') {
      userId.value        = data.userId
      tokenIssuedAt.value = data.tokenIssuedAt

      memberFields.value = [
        { label: '暱稱',   value: data.nickname,    editable: true,  icon: require('@/assets/icons/icon.svg') },
        { label: '帳號名稱', value: data.accountName, editable: false },
        { label: 'Email',  value: data.email,       editable: true,  icon: require('@/assets/icons/icon.svg') },
        { label: '密碼',   value: '******',         editable: true,  icon: require('@/assets/icons/icon.svg') }
      ]
    }
  } catch (err) {
    console.error('取得使用者資訊失敗', err)
    showAlert('無法取得會員資料，請重新登入')
    router.push('/login')
  }
}

/*  API：登出流程  */
const askLogout = () => confirmDialog('確定要登出？', 'logout')

// 點擊 Modal 的「確定」按鈕時
const handleModalConfirm = async () => {
  if (pendingAction.value === 'logout') {
    await doLogout()
  }
  modalVisible.value = false
  pendingAction.value = null
}

// 點擊 Modal 的「取消」按鈕時
const handleModalCancel = () => {
  modalVisible.value = false
  pendingAction.value = null
}

const doLogout = async () => {
  try {
    const token = localStorage.getItem('userToken')
    const { data } = await api.post('/api/MemberManagement/Logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (data.status === 'Success') {
      // 清除所有可能暫存資訊
      localStorage.removeItem('userToken')
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

/*  其他操作  */
function handleEdit(label) {
  if (label === '暱稱')      router.push('/modify-nickname')
  else if (label === 'Email') router.push('/update-email')
  else if (label === '密碼')  router.push('/modify-password')
}

const goToDeleteAccount = () => router.push('/delete-account')

/* ─────────────────────── mounted ─────────────────────── */
onMounted(() => {
  fetchProfile()

  // 編輯成功後用 ?updated=true 回到此頁，重新整理資料
  const query = router.currentRoute.value.query
  if (query.updated === 'true') {
    fetchProfile()
    router.replace({ query: {} })
  }
})

</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, #d4d7f9, #ffffff);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0 16px;
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
  font-size: 20px;           
  border-radius: 40px;       
  background: #faf7d7;
  border: 2px solid #ffecbb;
  font-family: 'Roboto Mono', monospace;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}

.option-question {
  padding: 14px 28px;        
  font-size: 20px;           
  border-radius: 40px;       
  background: #faf7d7;
  border: 2px solid #ffecbb;
  font-family: 'Roboto Mono', monospace;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}
</style>
