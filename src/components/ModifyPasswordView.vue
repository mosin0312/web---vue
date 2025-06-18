<template>
  <div class="main-container">
    <div class="title-header">
      <img src="@/assets/icons/header-icon.svg" class="header-icon" />
      <h1 class="page-title">修改密碼</h1>
    </div>

    <form class="form" @submit.prevent="submitForm">
      <!-- 原本密碼 -->
      <div class="form-group">
        <input v-model="originalPassword" type="password" placeholder="請輸入原本密碼" @blur="validateOriginalPassword" />
        <small :class="errors.originalPassword ? 'error-text' : 'hint-text'">
          {{ errors.originalPassword || '需為12-20位英文大小寫與數字，不含特殊字元' }}
        </small>
      </div>

      <!-- 新密碼 -->
      <div class="form-group">
        <input v-model="newPassword" type="password" placeholder="請輸入新密碼" @blur="validateNewPassword" />
        <small :class="errors.newPassword ? 'error-text' : 'hint-text'">
          {{ errors.newPassword || '需為12-20位英文大小寫與數字，不含特殊字元' }}
        </small>
      </div>

      <!-- 再次輸入新密碼 -->
      <div class="form-group">
        <input v-model="confirmPassword" type="password" placeholder="請再次輸入新密碼" @blur="validateConfirmPassword" />
        <small :class="errors.confirmPassword ? 'error-text' : 'hint-text'">
          {{ errors.confirmPassword || '需與新密碼一致' }}
        </small>
      </div>

      <!-- Email -->
      <div class="form-group email-group">
        <div class="email-row">
          <input v-model="email" type="email" placeholder="請輸入 Email" @blur="validateEmail" />
          <button type="button" class="code-button" :disabled="isSending" @click="sendCode">
            {{ isSending ? countdown + ' 秒' : '獲取驗證碼' }}
          </button>
        </div>
        <small :class="errors.email ? 'error-text' : 'hint-text'">
          {{ errors.email || '請輸入有效的 Email 格式' }}
        </small>
      </div>

      <!-- 驗證碼 -->
      <div class="form-group">
        <input v-model="code" type="text" maxlength="6" placeholder="請輸入6位數驗證碼" @blur="validateCode" />
        <small :class="errors.code ? 'error-text' : 'hint-text'">
          {{ errors.code || '請輸入6位數字驗證碼' }}
        </small>
      </div>

      <!-- 按鈕區塊 -->
      <div class="button-group">
        <button type="button" class="main-button cancel" @click="goBack">取消修改</button>
        <button type="submit" class="main-button">確認修改</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const originalPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const email = ref('')
const code = ref('')
const isSending = ref(false)
const countdown = ref(60)
let timer = null

const errors = ref({
  originalPassword: '',
  newPassword: '',
  confirmPassword: '',
  email: '',
  code: ''
})

const validateOriginalPassword = () => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,20}$/
  errors.value.originalPassword = pattern.test(originalPassword.value)
    ? ''
    : '原本密碼格式錯誤'
}

const validateNewPassword = () => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,20}$/
  errors.value.newPassword = pattern.test(newPassword.value)
    ? ''
    : '新密碼格式錯誤'
}

const validateConfirmPassword = () => {
  errors.value.confirmPassword = confirmPassword.value === newPassword.value
    ? ''
    : '與新密碼不一致'
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
    : '驗證碼須為6位數字'
}

const sendCode = () => {
  validateEmail()
  if (errors.value.email) return
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

const submitForm = () => {
  validateOriginalPassword()
  validateNewPassword()
  validateConfirmPassword()
  validateEmail()
  validateCode()

  const hasError = Object.values(errors.value).some(msg => msg)
  if (hasError) return

  // TODO: send API request here
  alert('修改成功')
  router.push('/')
}

const goBack = () => router.push('/')
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
  gap: 16px;
  padding-top: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.email-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.code-button {
  height: 44px;
  min-width: 100px;
  font-size: 14px;
  padding: 0 12px;
  border: 2px solid #544cbf;
  border-radius: 20px;
  background: #544cbf;
  color: #fff;
  cursor: pointer;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.main-button {
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

.main-button.cancel {
  background: #ff3535;
  color: #ffffff;
}

.hint-text {
  font-size: 12px;
  color: #666;
}

.error-text {
  font-size: 12px;
  color: red;
}
</style>
