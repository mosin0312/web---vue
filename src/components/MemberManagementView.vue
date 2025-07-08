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
      <button class="logout" @click="logout">登出</button>
      <button class="delete" @click="goToDeleteAccount">刪除帳號</button>
    </div>

    <section class="extra-options">
      <button class="option">黑名單查看</button>
      <button class="option">問題</button>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isGuest = ref(false)
const memberFields = ref([])

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(window.atob(base64))))
  } catch (e) {
    return null
  }
}

const fetchProfile = async () => {
  const token = localStorage.getItem('userToken')
  const payload = parseJwt(token)
  isGuest.value = payload?.Role === 'Guest'

  if (isGuest.value) return

  try {
    const response = await axios.get('/api/MemberManagement/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data.status === 'Success') {
      memberFields.value = [
  { label: '暱稱', value: response.data.nickname, editable: true, icon: require('@/assets/icons/icon.svg') },
  { label: '帳號名稱', value: response.data.accountName, editable: false },
  { label: 'Email', value: response.data.email, editable: true, icon: require('@/assets/icons/icon.svg') },
  { label: '密碼', value: '******', editable: true, icon: require('@/assets/icons/icon.svg') }
]
    }
  } catch (error) {
    console.error('取得使用者資訊失敗', error)
  }
}

onMounted(() => {
  fetchProfile()

  // 檢查 query 參數是否帶有 ?updated=true
  const query = router.currentRoute.value.query
  if (query.updated === 'true') {
    // 重新刷新會員資料
    console.log('偵測到更新，重新載入資料...')
    fetchProfile()
    
    // 清除 URL 中的 query（避免重新整理又觸發）
    router.replace({ query: {} })
  }
})

function handleEdit(label) {
  if (label === '暱稱') router.push('/modify-nickname')
  else if (label === 'Email') router.push('/update-email')
  else if (label === '密碼') router.push('/modify-password')
}

const logout = async () => {
  try {
    const token = localStorage.getItem('userToken')
    const response = await axios.post('/api/MemberManagement/Logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.data.status === 'Success') {
      localStorage.removeItem('userToken')
      router.push('/login')
    }
  } catch (error) {
    console.error('登出失敗', error)
  }
}

const goToDeleteAccount = () => {
  router.push('/delete-account')
}
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
  font-size: 15px;
  font-weight: bold;
  font-family: 'Inter', sans-serif;
}

.edit-button {
  width: 24px;
  height: 24px;
  border: 1px solid #000;
  border-radius: 8px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 15px;
  height: 15px;
  background-size: cover;
  background-position: center;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 30px 0;
}

.logout {
  width: 165px;
  height: 60px;
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background-color: #5a82d8;
  color: #fff;
  cursor: pointer;
}

.delete {
  padding: 10px 20px;
  border-radius: 20px;
  background-color: #f8d7da;
  color: #721c24;
  font-size: 18px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  font-family: 'Roboto Mono', monospace;
}

.extra-options {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.option {
  padding: 10px 20px;
  background: #d7dbfa;
  border: 2px solid #bbc3ff;
  border-radius: 30px;
  font-size: 18px;
  font-family: 'Roboto Mono', monospace;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}
</style>
