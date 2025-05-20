<template>
  <div class="main-container">
    <!-- Header -->
    <header class="header">
      <div class="home-section">
        <img src="@/assets/icons/header-icon.svg" alt="icon" class="header-icon" />
        <h1 class="home-title">修改Email</h1>
      </div>
    </header>

    <!-- 現在設定的Email -->
    <section class="form-content">
      <div class="form-group">
        <input type="text" :value="currentEmail" readonly />
        <small>目前設定的Email</small>
      </div>

      <!-- 新 Email -->
      <div class="form-group">
        <input v-model="form.newEmail" type="email" placeholder="請輸入新Email" />
        <small>請填寫有效Email</small>
      </div>

      <!-- 驗證碼 -->
<div class="form-group">
  <div class="email-row">
    <input
      v-model="form.code"
      type="text"
      placeholder="驗證碼"
      maxlength="6"
      class="code-input"
    />
    <button class="code-button" @click="sendCode">獲取驗證碼</button>
  </div>
  <small>6 位數字</small>
</div>

      <!-- 密碼 -->
      <div class="form-group">
        <input v-model="form.password" type="password" placeholder="請輸入密碼" />
        <small>12-20字元，含英文大小寫與數字，無空白與特殊符號</small>
      </div>

      <!-- 按鈕區 -->
      <div class="button-row">
        <button class="submit-btn cancel" @click="cancel">取消修改</button>
        <button class="submit-btn" @click="confirm">確認修改</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentEmail = ref('a1234567890@gmail.com')
const form = ref({
  newEmail: '',
  code: '',
  password: ''
})

const emailPattern = /^[\w.-]+@[\w.-]+\.\w{2,}$/
const codePattern = /^\d{6}$/
const passwordPattern = /^(?!.*\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,20}$/

function sendCode() {
  if (!form.value.newEmail) {
    alert('請輸入新Email')
    return
  }
  if (!emailPattern.test(form.value.newEmail)) {
    alert('Email格式錯誤')
    return
  }
  alert('驗證碼已發送到 ' + form.value.newEmail)
}

function cancel() {
  alert('取消修改')
}

function confirm() {
  if (!form.value.newEmail || !form.value.code || !form.value.password) {
    alert('請填寫完整資訊')
    return
  }
  if (!emailPattern.test(form.value.newEmail)) {
    alert('Email格式錯誤')
    return
  }
  if (!codePattern.test(form.value.code)) {
    alert('驗證碼必須是6位數字')
    return
  }
  if (!passwordPattern.test(form.value.password)) {
    alert('密碼需12-20位且包含大小寫字母及數字，不得有特殊字元或空白')
    return
  }
  alert('已確認修改！')
}
</script>

<style scoped>
.main-container {
  width: 100%;
  max-width: 360px;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #d4d8fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.header {
  display: flex;
  width: 100%;
  height: 40px;
  padding: 0 21px;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  background-color: #fff;
}

.home-section {
  display: flex;
  align-items: center;
  gap: 7px;
}

.header-icon {
  width: 39px;
  height: 33px;
}

.home-title {
  color: #000;
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.form-content {
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
  outline: none;
  border-color: #888;
}

small {
  font-size: 12px;
  color: #666;
  padding-left: 4px;
}

.email-row {
  display: flex;
  gap: 10px;
  align-items: center;
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

.submit-btn {
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

.submit-btn.cancel {
  background: #ff3535;
  color: #ffffff;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.code-input {
  width: 60%;
  max-width: 200px;
}
</style>