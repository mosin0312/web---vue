<template>
  <div class="main-container">
    <!-- 頁首 -->
    <div class="title-header">
      <img src="@/assets/icons/header-icon.svg" class="header-icon" />
      <h1 class="page-title">忘記帳號</h1>
    </div>

<!-- 表單區 -->
<form class="form" @submit.prevent="submitForm">

  <!-- 手機欄位 -->
      <div class="form-group">
        <input
          v-model="phone"
          ref="phoneRef"
          type="tel"
          placeholder="請輸入手機號碼 Ex: 0909123456"
          maxlength="10"
          @blur="validatePhone"
        />
        <small :class="errors.phone ? 'error-text' : 'hint-text'">
          {{ errors.phone || '手機號碼須為09開頭的10位數字' }}
        </small>
      </div>

      <!-- Email 欄位 -->
      <div class="form-group email-group">
        <div class="email-row">
          <input
            v-model="email"
            ref="emailRef"
            type="email"
            placeholder="請輸入 Email"
            @blur="validateEmail"
          />
          <button
            class="code-button"
            type="button"
            :disabled="isSending"
            @click="sendCode"
          >
            {{ isSending ? countdown + ' 秒' : '獲取驗證碼' }}
          </button>
        </div>
        <small :class="errors.email ? 'error-text' : 'hint-text'">
          {{ errors.email || '請輸入有效的 Email 格式' }}
        </small>
      </div>

      <!-- 驗證碼區塊 -->
      <div class="form-group verification-group">
        <div class="verification-wrapper">
          <input
            v-model="code"
            ref="codeRef"
            type="text"
            maxlength="6"
            placeholder="請輸入驗證碼"
            @blur="validateCode"
          />
        </div>
        <small :class="errors.code ? 'error-text' : 'hint-text'">
          {{ errors.code || '請輸入 6 位數數字驗證碼' }}
        </small>
      </div>

      <!-- 送出按鈕 -->
      <div class="button-group">
        <button type="submit" class="main-button">驗證身分</button>
        <button type="button" class="main-button" @click="goToLogin">返回登入</button>
      </div>
    </form>
    <AlertModal :visible="showModal" :message="modalMessage" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue'

// 固定訪客 Token
const guestToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWVzdCIsIlJvbGUiOiJHdWVzdCIsIm5iZiI6MTczNTY4OTYwMCwiZXhwIjoyMDUxMjIyNDAwLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MDUwIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzA1MCJ9.x5hB3TvkzpZ1GNjK_2WY1tjpIL_vwCz-AG9RzLT_W0s'

const router = useRouter()
const phone = ref('')
const email = ref('')
const code = ref('')
const showModal = ref(false)
const modalMessage = ref('')
const isSending = ref(false)
const countdown = ref(60)
let timer = null

const errors = ref({
  phone: '',
  email: '',
  code: ''
})

const showAlert = (message) => {
  modalMessage.value = message
  showModal.value = true
}

const validatePhone = () => {
  const pattern = /^09\d{8}$/
  errors.value.phone = pattern.test(phone.value) ? '' : '手機號碼格式錯誤（須為09開頭的10位數）'
}

const validateEmail = () => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  errors.value.email = pattern.test(email.value) ? '' : 'Email 格式錯誤'
}

const validateCode = () => {
  const pattern = /^\d{6}$/
  errors.value.code = pattern.test(code.value) ? '' : '驗證碼須為 6 位數字'
}

// 發送驗證碼
const sendCode = async () => {
  validatePhone()
  validateEmail()

  if (errors.value.phone || errors.value.email) {
    const missing = []
    if (errors.value.phone) missing.push('手機')
    if (errors.value.email) missing.push('Email')
    showAlert(`請先正確填寫：${missing.join('、')}`)
    return
  }

  try {
    const res = await axios.post(
      '/api/MemberManagement/VerifyForgetAccountCode',
      { SentEmail: email.value },
      {
        headers: {
          Authorization: `Bearer ${guestToken}`
        }
      }
    )

    if (res.data.status === 'Success') {
      showAlert(`驗證碼已寄出至 ${email.value}`)
      isSending.value = true
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
          isSending.value = false
        }
      }, 1000)
    } else {
      showAlert(res.data.message)
    }
  } catch (err) {
    showAlert('發送驗證碼失敗，請稍後再試')
  }
}

// 驗證身分送出表單
const submitForm = async () => {
  validatePhone()
  validateEmail()
  validateCode()

  if (errors.value.phone || errors.value.email || errors.value.code) {
    const missing = []
    if (errors.value.phone) missing.push('手機')
    if (errors.value.email) missing.push('Email')
    if (errors.value.code) missing.push('驗證碼')
    showAlert(`請先正確填寫：${missing.join('、')}`)
    return
  }

  try {
    const res = await axios.post(
      '/api/MemberManagement/ForgetAccount',
      {
        forgetAccount_PhoneNumber: phone.value,
        //forgetAccount_PhoneNumber: phone.value.replace(/^09/, '9'), // 去掉前面0
        forgetAccount_Email: email.value,
        forgetAccount_VerificationCode: code.value
      },
      {
        headers: {
          Authorization: `Bearer ${guestToken}`
        }
      }
    )

    if (res.data.status === 'Success') {
      showAlert(res.data.message)
      // 如需跳轉登入頁可在這裡加入 router.push('/')
    } else {
      showAlert(res.data.message || '驗證失敗')
    }
  } catch (err) {
    showAlert('驗證失敗，請稍後再試')
  }
}

const goToLogin = () => {
  router.push('/')
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
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  background-color: #fff;
}

.header-icon {
  width: 32px;
  height: 32px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.email-group {
  width: 100%;
}

.email-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.verification-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #c5c5c5;
  border-radius: 20px;
  background-color: #fff;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus {
  border-color: #5a67d8;
  outline: none;
}

.code-button {
  height: 44px;
  min-width: 100px;
  padding: 0 12px;
  font-size: 14px;
  border: 2px solid #544cbf;
  border-radius: 20px;
  background: #544cbf;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.code-button:disabled {
  background: #eee;
  cursor: not-allowed;
  color: #999;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}

.main-button {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background: #5a67d8;
  color: #ffffff;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.hint-text {
  font-size: 12px;
  color: #666;
  margin-left: 4px;
}

.error-text {
  font-size: 12px;
  color: red;
  margin-left: 4px;
}
</style>
