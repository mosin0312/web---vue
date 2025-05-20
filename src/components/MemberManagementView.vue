<template>
  <div class="main-container">
    <div class="title-header">
      <img src="@/assets/icons/header-icon.svg" class="header-icon" />
      <h1 class="page-title">會員管理</h1>
    </div>

    <div class="account-box">
    <h2 class="account-title">帳號資訊</h2>
      <AccountItem title="暱稱" :value="nickname" @edit="goToModifyNickname" />
      <AccountItem title="帳號名稱" :value="account" :editable="false" />
      <AccountItem title="Email" :value="email" @edit="goToModifyEmail" />
      <AccountItem title="密碼" :value="passwordDisplay" @edit="goToModifyPassword" />
    </div>

    <div class="button-group">
      <button class="btn" @click="logout">登出</button>
      <button class="btn delete" @click="goToDeleteAccount">刪除帳號</button>
    </div>

    <div class="extra-actions">
      <button class="tag">黑名單查看</button>
      <button class="tag">問題</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import AccountItem from './AccountItem.vue'

const router = useRouter()
const nickname = ref('Nickname')
const account = ref('AccountName')
const email = ref('test@example.com')
const passwordDisplay = ref('********')

const goToModifyNickname = () => router.push('/modify-nickname')
const goToModifyEmail = () => router.push('/modify-email')
const goToModifyPassword = () => router.push('/modify-password')
const goToDeleteAccount = () => router.push('/delete-account')
const logout = () => router.push('/login')
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
  color: #000000;
  margin: 0;
}
.account-box {
  position: relative;  /* 為了讓子項目的絕對定位以它為基準 */
  padding-top: 40px;   /* 給標題留一點空間 */
  padding-left: 20px;  /* 控制內容內縮 */
  padding-right: 20px;
  padding-bottom: 20px;
  background: #fff;
  border-radius: 15px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.account-title {
  position: absolute;
  top: 12px;
  left: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}
.btn {
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
.btn.delete {
  background-color: #f8d7da;
  color: #721c24;
}
.extra-actions {
  display: flex;
  justify-content: space-evenly;
  margin-top: 40px;
  gap: 20px;/*黑名單間距*/
}
.tag {
  width: 120px;                  
  height: 50px;                  
  background: #8d9afc;
  border: 2px solid #bbc3ff;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);

  display: flex;                /* ✅ 使用 flex 讓文字置中 */
  align-items: center;
  justify-content: center;
}
</style>  
