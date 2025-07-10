<template>
  <div class="main-container">
    <!-- 頁首 -->
    <div class="title-header">
      <img src="@/assets/icons/header-icon.svg" class="header-icon" />
      <h1 class="page-title">修改暱稱</h1>
    </div>

    <!-- 表單區 -->
    <form class="form" @submit.prevent="submitForm">
      <!-- 新暱稱欄位 -->
      <div class="form-group">
        <input
          v-model="nickname"
          ref="nicknameRef"
          type="text"
          maxlength="20"
          placeholder="請輸入新暱稱"
          @blur="validateNickname"
        />
        <small :class="errors.nickname ? 'error-text' : 'hint-text'">
          {{ errors.nickname || '最多 20 字元，不可為空白' }}
        </small>
      </div>

      <!-- 按鈕區 -->
      <div class="button-group">
        <button type="button" class="main-button cancel" @click="goBack">取消修改</button>
        <button type="submit" class="main-button">確認修改</button>
      </div>
    </form>

    <!-- 提示訊息 -->
    <AlertModal :visible="showModal" :message="modalMessage" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue'

const nickname = ref('')
const nicknameRef = ref(null)
const showModal = ref(false)
const modalMessage = ref('')
const errors = ref({ nickname: '' })
const router = useRouter()

const showAlert = (msg) => {
  modalMessage.value = msg
  showModal.value = true
}

// 驗證暱稱：不能為空、最多 20 個字
const validateNickname = () => {
  if (nickname.value.trim() === '') {
    errors.value.nickname = '暱稱不能為空'
  } else if (nickname.value.length > 20) {
    errors.value.nickname = '暱稱長度不可超過 20 個字'
  } else {
    errors.value.nickname = ''
  }
}

// 返回上一頁
const goBack = () => router.push('/member-management')

// 提交表單並呼叫 API
const submitForm = async () => {
  validateNickname()
  if (errors.value.nickname) {
    nicknameRef.value?.focus()
    return
  }

  try {
    const token = localStorage.getItem('userToken')
    const response = await axios.put(
      '/api/MemberManagement/update-nickname',
      { newNickname: nickname.value },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.status === 'Success') {
      showAlert('暱稱修改成功')
      setTimeout(() => router.push('/member-management'), 1500)
    } else {
      showAlert(response.data.message || '暱稱修改失敗')
    }
  } catch (error) {
    showAlert(error.response?.data?.message || '伺服器錯誤，請稍後再試')
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
  color: #ffffff;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
.main-button.cancel {
  background: #ff3535;
  color: #ffffff;
}
</style>
