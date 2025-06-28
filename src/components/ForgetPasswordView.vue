<template>
  <div class="main-container">
    <div class="modal-container">
      <AlertModal
        :visible="showModal"
        :message="modalMessage"
        @close="showModal = false"
      />
    </div>

    <!-- 頁首區 -->
    <div class="title-header">
      <img src="@/assets/icons/header-icon.svg" class="header-icon" />
      <h1 class="page-title">忘記密碼</h1>
    </div>

    <!-- 表單區 -->
    <form class="login-form" @submit.prevent="submitForm">
      <!-- 帳號欄位 -->
      <div class="form-group">
        <input
          v-model="account" ref="accountRef" type="text" placeholder="請輸入帳號名稱"  maxlength="20" @blur="validateAccount" />
        <small :class="errors.account ? 'error-text' : 'hint-text'">
          {{ errors.account || '需含大小寫英數，12-20 位，不含特殊符號' }}
        </small>
      </div>

      <!-- 新密碼欄位 -->
      <div class="form-group">
        <input
          v-model="password"
          ref="passwordRef"
          type="password"
          placeholder="請輸入密碼"
          maxlength="20"
          @blur="validatePassword"
        />
        <small :class="errors.password ? 'error-text' : 'hint-text'">
          {{ errors.password || '需含大小寫英數，12-20 位，不含特殊符號' }}
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
            placeholder="請輸入6位數驗證碼"
            @blur="validateCode"
          />
        </div>
        <small :class="errors.code ? 'error-text' : 'hint-text'">
          {{ errors.code || '請輸入6位數數字驗證碼' }}
        </small>
      </div>

      <!-- 送出按鈕 -->
      <div class="button-group">
        <button type="submit" class="main-button">驗證身分</button>
        <button type="button" class="main-button" @click="goToLogin">返回登入</button>
      </div>
    </form>
  </div>

</template>

<script setup>
import AlertModal from '@/components/AlertModal.vue'
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showModal = ref(false)
const modalMessage = ref('')

// 固定訪客 Token
const guestToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWVzdCIsIlJvbGUiOiJHdWVzdCIsIm5iZiI6MTczNTY4OTYwMCwiZXhwIjoyMDUxMjIyNDAwLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MDUwIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzA1MCJ9.x5hB3TvkzpZ1GNjK_2WY1tjpIL_vwCz-AG9RzLT_W0s'

const goToLogin = () => {
  router.push('/')
}

// 欄位資料
const account = ref('')
const password = ref('')
const email = ref('')
const code = ref('')

// 輸入欄位 ref
const accountRef = ref(null)
const passwordRef = ref(null)
const emailRef = ref(null)
const codeRef = ref(null)

// 錯誤訊息
const errors = ref({
  account: '',
  password: '',
  email: '',
  code: ''
})

// 倒數邏輯
const isSending = ref(false)
const countdown = ref(60)
let timer = null

// 驗證函式
const validateAccount = () => {
  const pattern = /^[A-Za-z0-9]{12,20}$/
  errors.value.account = pattern.test(account.value)
    ? ''
    : '帳號格式錯誤（12-20 位英數）'
}

const validatePassword = () => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,20}$/
  errors.value.password = pattern.test(password.value)
    ? ''
    : '密碼需含大小寫英文與數字'
}

const validateEmail = () => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  errors.value.email = pattern.test(email.value)
    ? ''
    : 'Email 格式錯誤'
}

const validateCode = () => {
  const pattern = /^\d{6}$/
  errors.value.code = pattern.test(code.value)
    ? ''
    : '請輸入6位數字驗證碼'
}

// 發送驗證碼
const sendCode = async () => {
  validateAccount()
  validatePassword()
  validateEmail()

  let missing = []
  if (errors.value.account) missing.push('帳號')
  if (errors.value.password) missing.push('密碼')
  if (errors.value.email) missing.push('Email')

  if (missing.length > 0) {
    modalMessage.value = `請先正確填寫：${missing.join('、')}`
    showModal.value = true
    return
  }

  try {
    const res = await axios.post(
      '/api/MemberManagement/VerifyResetPasswordCode',
      { SentEmail: email.value },
      {
        headers: {
          Authorization: `Bearer ${guestToken}`
        }
      }
    )
    modalMessage.value = res.data.message || '驗證碼已寄出'
  } catch (err) {
    modalMessage.value = err.response?.data?.message || '驗證失敗，請稍後再試'
  } finally {
    showModal.value = true
    isSending.value = true
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        isSending.value = false
      }
    }, 1000)
  }
}

// 送出表單
const submitForm = async () => {
  validateAccount()
  validatePassword()
  validateEmail()
  validateCode()

  const firstError = Object.keys(errors.value).find(key => errors.value[key])
  if (firstError) {
    const refMap = {
      account: accountRef,
      password: passwordRef,
      email: emailRef,
      code: codeRef
    }
    refMap[firstError].value?.focus()
    return
  }

  try {
    const res = await axios.post(
      '/api/MemberManagement/ResetPassword',
      {
        resetPassword_AccountName: account.value,
        resetPassword_Email: email.value,
        resetPassword_VerificationCode: code.value,
        resetPassword_NewPassword: password.value
      },
      {
        headers: {
          Authorization: `Bearer ${guestToken}`
        }
      }
    )

    // ✅ 若成功，導頁到 ResetPasswordView（例如路徑為 /reset-password）
    if (res.data.status === 'Success') {
      router.push('/reset-password') // <<== 你可以改成你實際的路由名稱
    } else {
      modalMessage.value = res.data.message || '驗證失敗'
      showModal.value = true
    }
  } catch (err) {
    modalMessage.value = err.response?.data?.message || '伺服器錯誤，請稍後再試'
    showModal.value = true
  }
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
  position: absolute;
  inset: 0;
  z-index: 30;
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

.login-form {
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

.hint-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.error-text {
  font-size: 12px;
  color: red;
  margin-top: 4px;
}

.verification-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
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

.email-group {
  width: 100%;
}

.email-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.email-row input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #c5c5c5;
  border-radius: 20px;
  background-color: #fff;
  font-size: 14px;
  box-sizing: border-box;
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
</style>
