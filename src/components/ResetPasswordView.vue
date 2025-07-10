<template>
  <div class="main-container">
    <!-- 頁首 -->
    <div class="title-header">
      <img src="@/assets/icons/header-icon.svg" class="header-icon" />
      <h1 class="page-title">重設密碼</h1>
    </div>

    <!-- 表單區 -->
    <form class="update-form" >
      <!-- 新密碼欄位 -->
      <div class="form-group">
        <input
          v-model="password"
          ref="passwordRef"
          type="password"
          placeholder="請輸入新密碼"
          maxlength="20"
          @blur="validatePassword"
        />
        <small :class="errors.password ? 'error-text' : 'hint-text'">
          {{ errors.password || '需含大小寫英數，12-20 位，不含特殊符號' }}
        </small>
      </div>

      <!-- 確認密碼欄位 -->
      <div class="form-group">
        <input
          v-model="confirmPassword"
          ref="confirmPasswordRef"
          type="password"
          placeholder="請再次輸入新密碼"
          maxlength="20"
          @blur="validateConfirmPassword"
        />
        <small :class="errors.confirmPassword ? 'error-text' : 'hint-text'">
          {{ errors.confirmPassword || '請再次輸入與上方一致的新密碼' }}
        </small>
      </div>

      <button @click="sendVerificationCode">發送驗證碼</button>


      <!-- 操作按鈕 -->
      <div class="button-group">
        <button type="button" class="main-button cancel" @click="goBack">取消修改</button>
        <button type="submit" class="main-button" @click="submitForm">確認修改</button>
      </div>
    </form>

    <AlertModal :visible="showModal" :message="modalMessage" @close="handleModalClose" @confirm="handleModalConfirm"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue'

const email = ref('')
const verificationCode = ref('')
const currentPassword = ref('')
const password = ref('')
const confirmPassword = ref('')

const emailRef = ref(null)
const currentPasswordRef = ref(null)
const passwordRef = ref(null)
const confirmPasswordRef = ref(null)

const errors = ref({
  email: '',
  verificationCode: '',
  currentPassword: '',
  password: '',
  confirmPassword: ''
})

const showModal = ref(false)
const modalMessage = ref('')
const shouldRedirect = ref(false)

const showAlert = (msg) => {
  modalMessage.value = msg
  showModal.value = true
}

// 驗證格式
const validatePassword = () => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,20}$/
  errors.value.password = pattern.test(password.value)
    ? ''
    : '密碼格式錯誤（需含大小寫與數字，12-20 位）'
}

const validateConfirmPassword = () => {
  errors.value.confirmPassword =
    confirmPassword.value === password.value && confirmPassword.value !== ''
      ? ''
      : '密碼不一致，請重新確認'
}

const validateRequired = () => {
  errors.value.email = email.value ? '' : '請輸入 Email'
  errors.value.currentPassword = currentPassword.value ? '' : '請輸入目前密碼'
  errors.value.verificationCode = verificationCode.value ? '' : '請輸入驗證碼'
}

const router = useRouter()

const submitForm = async () => {
  validateRequired()
  validatePassword()
  validateConfirmPassword()

  const firstErrorRef =
    errors.value.email ? emailRef :
    errors.value.currentPassword ? currentPasswordRef :
    errors.value.password ? passwordRef :
    errors.value.confirmPassword ? confirmPasswordRef :
    null

  if (firstErrorRef) {
    firstErrorRef.value?.focus()
    return
  }

  try {
    const token = localStorage.getItem('userToken')
    const response = await axios.post('/api/MemberManagement/ChangePassword', {
      ChangePassword_Email: email.value,
      ChangePassword_VerificationCode: verificationCode.value,
      CurrentPassword: currentPassword.value,
      ChangePassword_NewPassword: password.value
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data.status === 'Success') {
      showAlert(response.data.message)
      shouldRedirect.value = true  // 等待 Modal 關閉再跳轉
    } else {
      showAlert(response.data.message || '修改失敗，請稍後再試')
    }
  } catch (error) {
    const msg = error.response?.data?.message || '修改失敗，請稍後再試'
    showAlert(msg)
  }
}

const sendVerificationCode = async () => {
  if (!email.value) {
    errors.value.email = '請輸入 Email'
    emailRef.value?.focus()
    return
  }

  try {
    const token = localStorage.getItem('userToken')
    const response = await axios.post('/api/MemberManagement/VerifyChangePasswordCode', {
      sentEmail: email.value
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    showAlert(response.data.message)
  } catch (error) {
    const msg = error.response?.data?.message || '發送失敗，請稍後再試'
    showAlert(msg)
  }
}

// 處理 Modal 關閉

const handleModalClose = () => {
  showModal.value = false
}

const handleModalConfirm = () => {
  showModal.value = false
  if (shouldRedirect.value) {
    shouldRedirect.value = false
    router.push('/')
  }
}

// 取消修改 ➜ 回會員管理
const goBack = () => router.push('/member-management')
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
  align-items: center;
  gap: 10px;
  background-color: #fff;
  padding: 0 21px;
  height: 40px;
}

.header-icon {
  width: 32px;
  height: 32px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.update-form {
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
}

.error-text {
  font-size: 12px;
  color: red;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
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
</style>