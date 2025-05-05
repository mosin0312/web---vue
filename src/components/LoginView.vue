<template>
    <div class="login-container">
      <header class="login-header">
        <img src="@/assets/icons/header-icon.svg" alt="Logo" class="header-icon" />
        <h1 class="home-title">會員登入介面</h1>
      </header>
  
      <form class="login-form" @submit.prevent="submitForm">
        <div class="form-group">
          <input v-model="username" type="text" placeholder="請輸入帳號名稱" maxlength="20" required />
          <small>最多 20 字元，不得空白</small>
        </div>
  
        <div class="form-group">
          <input v-model="password" type="password" placeholder="請輸入密碼" required />
          <small>12-20 位英數大小寫，不含特殊符號</small>
        </div>
  
        <div class="form-group email-group">
          <div class="email-row">
            <input v-model="email" type="email" placeholder="請輸入 Email" required />
            <button type="button" class="code-button" :disabled="countdown > 0" @click="getCode">
              {{ countdown > 0 ? countdown + ' 秒後重發' : '獲取驗證碼' }}
            </button>
          </div>
        </div>
  
        <div class="form-group">
          <input v-model="captcha" type="text" placeholder="6 位數驗證碼" maxlength="6" required />
        </div>
  
        <div class="button-group">
          <button type="submit" class="main-button">登入</button>
          <button type="button" class="main-button" @click="goToRegister">註冊新帳號</button>
        </div>
  
        <div class="keep-logged-in">
        <label class="keep-logged-in"> 
        <input type="checkbox" :checked="rememberMe" @click="rememberMe = !rememberMe" />
          <span>保持登入狀態</span>
          </label>
        </div>
        
        <div class="links">
          <a href="#">忘記密碼?</a>
          <a href="#">忘記帳號?</a>
          <a href="#">訪客登入</a>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const username = ref('');
  const password = ref('');
  const email = ref('');
  const captcha = ref('');
  const rememberMe = ref(false);
  const countdown = ref(0);
  let timer = null;
  
  function getCode() {
    if (!email.value) return alert('請輸入 Email');
    alert('驗證碼已發送');
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  }
  
  function submitForm() {
    // 可加入驗證與後端邏輯
    alert('登入送出');
  }
  
  function goToRegister() {
    console.log('clicked')
    router.push('/register');
  }
  </script>
  
  <style scoped>
  .login-container {
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
  
  .login-header {
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
    width: 39px;
    height: 33px;
  }
  
  .home-title {
    color: #000;
    font-family: Inter, sans-serif;
    font-size: 20px;
    font-weight: 500;
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
    outline: none;
    border-color: #888;
  }
  
  small {
    font-size: 12px;
    color: #666;
    padding-left: 4px;
  }
  
  .email-group {
    width: 100%;
  }
  
  .email-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .email-row input[type="email"] {
    width: 60%;
    height: 44px;
    padding: 10px 12px;
    font-size: 14px;
    border: 1px solid #c5c5c5;
    border-radius: 20px;
    background-color: #fff;
    box-sizing: border-box;
  }
  
  .code-button {
    height: 44px;
    min-width: 90px;
    padding: 0 12px;
    font-size: 14px;
    border: 2px solid #000;
    border-radius: 20px;
    background: white;
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
    background: white;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
  
  .keep-logged-in {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    white-space: nowrap;
  }

  .keep-logged-in[type="checkbox"] {
    transform: scale(1.1);
  }
  
  .links {
    display: flex;
    justify-content: space-around;
    font-size: 12px;
    margin-top: 10px;
  }
  </style>
  