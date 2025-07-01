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
      <button class="main-button" @click="sendVerificationCode">發送驗證碼</button>
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

<script>
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue'

export default {
  components: { AlertModal },
  data() {
    return {
      step: 1, // 當前步驟（1=發送驗證碼, 2=輸入驗證碼與密碼）
      form: {
        password: '',
        verificationCode: ''
      },
      showAlert: false,
      alertMessage: ''
    }
  },
  methods: {
    async sendVerificationCode() {
      try {
        const token = localStorage.getItem('userToken')
        const res = await axios.post('/api/MemberManagement/DeleteAccountVerificationCode', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.alertMessage = res.data.message
        this.showAlert = true
        this.step = 2
      } catch (err) {
        this.alertMessage = err.response?.data?.message || '發送驗證碼失敗'
        this.showAlert = true
      }
    },
    async deleteAccount() {
      try {
        const token = localStorage.getItem('userToken')
        const res = await axios.delete('/api/MemberManagement/DeleteAccount', {
          headers: { Authorization: `Bearer ${token}` },
          data: this.form
        })
        this.alertMessage = res.data.message
        this.showAlert = true

        // 成功刪除，清除 token 並跳轉登入
        if (res.data.status === 'Success') {
          localStorage.removeItem('token')
          setTimeout(() => this.$router.replace('/login'), 1500)
        }
      } catch (err) {
        this.alertMessage = err.response?.data?.message || '刪除失敗'
        this.showAlert = true
      }
    },
    goBack() {
      this.$router.push('/member-management')
    }
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
.main-button {
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
  background: #721c24;
  color: #fff;
  cursor: pointer;
}
.main-button.cancel {
  background-color: #ccc;
}
</style>
