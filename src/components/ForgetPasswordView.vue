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
          {{ errors.account || '帳號格式12-20 字元，包含大小寫英文與數字，不得有空白與特殊符號(@ . - _ ! ?...等)' }}
        </small>
      </div>

      <!-- 新密碼欄位 -->
      <div class="form-group">
        <input v-model="password"  ref="passwordRef"  type="password"  placeholder="請輸入密碼"  maxlength="20"  @blur="validatePassword"/>
        <small :class="errors.password ? 'error-text' : 'hint-text'">
          {{ errors.password || '密碼格式12-20 字元，包含大小寫英文與數字，不得有空白與特殊符號(@ . - _ ! ?...等)' }}
        </small>
      </div>

      <div class="form-group">
        <input  v-model="copassword"  ref="copasswordRef"  type="password"  placeholder="請再次輸入密碼" maxlength="20" @blur="validateCoPassword"/>
        <small :class="errors.copassword ? 'error-text' : 'hint-text'">
          {{ errors.copassword || '密碼需與上述相符' }}
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
        <button type="submit" class="main-button">確認修改密碼</button>
        <button type="button" class="main-button-cancel" @click="goToLogin">返回登入</button>
      </div>
    </form>
  </div>

</template>

<script setup>
import AlertModal from '@/components/AlertModal.vue'
import api from '@/api' 
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showModal = ref(false)
const modalMessage = ref('')

// ✅ 用來儲存動態取得的 guest token
const token = ref('')

// ✅ 請求 guest token 的函式
const getGuestToken = async () => {
  try {
    const res = await api.get('/api/MemberManagement/guest-token')
    if (res.data.status === 'Success') {
      token.value = res.data.token
      localStorage.setItem('guestToken', token.value)
    } else {
      modalMessage.value = '無法取得訪客身份，請稍後再試'
      showModal.value = true
    }
  } catch {
    modalMessage.value = '訪客憑證取得失敗，請稍後再試'
    showModal.value = true
  }
}

// 執行頁面初始動作
onMounted(() => {
  getGuestToken()
})

// 導回登入頁
const goToLogin = () => router.push('/')

// 欄位資料與對應 ref
const account = ref('')
const password = ref('')
const copassword = ref('')
const email = ref('')
const code = ref('')
const accountRef = ref(null)
const passwordRef = ref(null)
const copasswordRef = ref(null)
const emailRef = ref(null)
const codeRef = ref(null)

const errors = reactive({
  account: '',
  password: '',
  copassword: '',
  email: '',
  code: ''
})

// 倒數驗證碼發送
const isSending = ref(false)
const countdown = ref(60)
let timer = null

// 欄位格式驗證
const validateAccount = () => {
  const pattern = /^[A-Za-z0-9]{12,20}$/
  errors.account = pattern.test(account.value)
    ? ''
    : '帳號格式錯誤12-20 字元，包含英文與數字'
}

const validatePassword = () => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,20}$/
  errors.password = pattern.test(password.value)
    ? ''
    : '密碼格式錯誤，須含大小寫英文與數字共 12-20 字元'
}

const validateCoPassword = () => {
  errors.copassword =
    copassword.value !== password.value ? '密碼不一致，請再次確認' : ''
}

const validateEmail = () => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  errors.email = pattern.test(email.value) ? '' : 'Email 格式錯誤'
}

const validateCode = () => {
  const pattern = /^\d{6}$/
  errors.code = pattern.test(code.value) ? '' : '請輸入6位數驗證碼'
}

// 發送驗證碼
const sendCode = async () => {
  validateAccount()
  validateEmail()

  const missing = []
  if (errors.account) missing.push('帳號')
  if (errors.email) missing.push('Email')

  if (missing.length > 0) {
    modalMessage.value = `請先正確填寫：${missing.join('、')}`
    showModal.value = true
    return
  }

  try {
    const res = await api.post(
      '/api/MemberManagement/VerifyResetPasswordCode',
      { sentEmail: email.value },
      { headers: { Authorization: `Bearer ${token.value}` } }
    )

    modalMessage.value = res.data.message || '驗證碼已發送'
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
  } catch (err) {
    modalMessage.value =
      err.response?.data?.message || '寄送驗證碼失敗，請稍後再試'
    showModal.value = true
  }
}

// 提交表單（含驗證碼與密碼變更）
const submitForm = async () => {
  validateAccount()
  validatePassword()
  validateCoPassword()
  validateEmail()
  validateCode()

  const firstError = Object.keys(errors).find(key => errors[key])
  if (firstError) {
    const refMap = {
      account: accountRef,
      password: passwordRef,
      copassword: copasswordRef,
      email: emailRef,
      code: codeRef
    }
    refMap[firstError]?.value?.focus()
    return
  }

  try {
    const res = await api.post(
      '/api/MemberManagement/ResetPassword',
      {
        resetPassword_AccountName: account.value,
        resetPassword_Email: email.value,
        resetPassword_VerificationCode: code.value,
        resetPassword_NewPassword: password.value
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      }
    )

    if (res.data.status === 'Success') {
      modalMessage.value = res.data.message || '密碼已更新，請重新登入'
      showModal.value = true
      setTimeout(() => router.push('/'), 1500)
    } else {
      modalMessage.value = res.data.message || '驗證或更新密碼失敗'
      showModal.value = true
    }
  } catch (err) {
    const errorResponse = err.response?.data
    if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
      modalMessage.value = errorResponse.errors.join('，')
    } else {
      modalMessage.value =
        errorResponse?.message || '伺服器錯誤，請稍後再試'
    }
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

.main-button-cancel {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background: #ff3535;
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
