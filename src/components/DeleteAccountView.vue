<template>
  <div class="main-container">
    <!-- Header -->
    <div class="title-header">
      <img src="@/assets/icons/header-icon.svg" class="header-icon" />
      <h1 class="page-title">刪除帳號</h1>
    </div>

    <!-- 發送驗證碼 -->
    <div v-if="step === 1" class="form-content">
      <p class="tip-text">系統將發送驗證碼至您的註冊 Email。</p>
      <div class="button-group">
      <button class="main-button-code" @click="sendVerificationCode">發送驗證碼</button>
      <button class="main-button-cancel" @click="goBack">返回會員管理</button>
      </div>
    </div>

    <!-- 輸入驗證碼與密碼 -->
    <div v-else class="form-content">
      <div class="form-group">
        <input v-model="form.password" type="password" placeholder="請輸入密碼" />
      </div>

      <div class="form-group">
        <input v-model="form.verificationCode" type="text" placeholder="請輸入驗證碼" maxlength="6" />
      </div>

      <p class="warning-text">⚠ 此操作將永久刪除您的帳號，且無法復原。</p>

      <div class="button-group">
        <button class="main-button delete" @click="deleteAccount">確認刪除</button>
        <button class="main-button cancel" @click="goBack">取消</button>
      </div>
    </div>

    <!-- 提示框 -->
    <AlertModal :visible="showAlert" :message="alertMessage" @close="showAlert = false" @confirm="handleConfirm"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import AlertModal from '@/components/AlertModal.vue'

const router = useRouter()

const step = ref(1)
const showAlert = ref(false)
const alertMessage = ref('')

// 刪除表單資料
const form = ref({
  password: '',
  verificationCode: ''
})

// 發送驗證碼
const sendVerificationCode = async () => {
  try {
    const token = localStorage.getItem('userToken')
    const res = await api.post(
      '/api/MemberManagement/DeleteAccountVerificationCode',
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    alertMessage.value = res.data.message
    showAlert.value = true
    step.value = 2
  } catch (err) {
    alertMessage.value =
      err.response?.data?.message || '發送驗證碼失敗'
    showAlert.value = true
  }
}

// 刪除帳號
const deleteAccount = async () => {
  try {
    const token = localStorage.getItem('userToken')
    const res = await api.delete('/api/MemberManagement/DeleteAccount', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        password: form.value.password,
        verificationCode: form.value.verificationCode
      }
    })
    alertMessage.value = res.data.message
    showAlert.value = true

    if (res.data.status === 'Success') {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userEmail')
      setTimeout(() => {
        router.replace('/')
      }, 1500)
    }
  } catch (err) {
    alertMessage.value =
      err.response?.data?.message || '刪除帳號失敗'
    showAlert.value = true
  }
}

const goBack = () => {
  router.push('/member-management')
}
</script>

<style scoped>
.main-container {
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
.tip-text, .warning-text {
  margin: 10px 0;
  font-size: 30px;
  color: #444;
}
.warning-text {
  color: red;
  font-weight: bold;
}
.form-content {
  margin-top: 20px;
}
.form-group {
  margin-bottom: 16px;
}
input {
  width: 100%;
  padding: 10px;
  font-size: 14px;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}
.main-button-cancel {
  width: 165px;               
  height: 60px;
  padding: 10px 20px;
  font-size: 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: red;
  color: #fff;
}
.main-button-code {
  width: 165px;               
  height: 60px;
  padding: 10px 20px;
  font-size: 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #5a67d8;
  color: #fff;
}
.main-button.delete {
  width: 165px;               
  height: 60px; 
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background: red;
  color: #fff;
  cursor: pointer;
}
.main-button.cancel {
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
</style>
