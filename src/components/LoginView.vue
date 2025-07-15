<template>
  <div class="login-container">
    <div class="modal-container">
    </div>
      <header class="login-header">
        <img src="@/assets/icons/header-icon.svg" alt="Logo" class="header-icon" />
        <h1 class="home-title">會員登入介面</h1>
      </header>
  
      <form class="login-form" @submit.prevent="submitForm">
        <div class="form-group">
          <input v-model="username" ref="usernameRef" type="text" placeholder="請輸入帳號名稱" maxlength="20" @blur="validateUsername"/>
          <small :class="errors.username ? 'error-text' : 'hint-text'">
            {{ errors.username || '帳號格式12-20 字元，包含大小寫英文與數字，不得有空白與特殊符號(@ . - _ ! ?...等)' }}
          </small>
        </div>

        
        <div class="form-group">
          <input v-model="password" ref="passwordRef" type="password" placeholder="請輸入密碼" maxlength="20" @blur="validatePassword" />
          <small :class="errors.password ? 'error-text' : 'hint-text'">
            {{ errors.password || '密碼格式12-20 字元，包含大小寫英文與數字，不得有空白與特殊符號(@ . - _ ! ?...等)' }}
          </small>
        </div>
  
        <div class="form-group email-group">
  <div class="email-row">
    <input v-model="email" ref="emailRef" type="email" placeholder="請輸入 Email" @blur="validateEmail" />
    <button type="button" class="code-button" :disabled="countdown > 0" @click="getCode">
      {{ countdown > 0 ? countdown + ' 秒後重發' : '獲取驗證碼' }}
    </button>
  </div>
  <small :class="errors.email ? 'error-text' : 'hint-text'">
    {{ errors.email || '請輸入有效的 Email 格式' }}
  </small>
</div>

        <div class="form-group">
          <input v-model="captcha" ref="captchaRef" type="text" placeholder="6 位數驗證碼" maxlength="6" @blur="validateCaptcha" />
          <small :class="errors.captcha ? 'error-text' : 'hint-text'">
            {{ errors.captcha || '請輸入 6 位數驗證碼' }}
          </small>
        </div>
  
        <div class="button-group">
          <button type="submit" class="main-button">登入</button>
          <button type="button" class="main-button" @click="goToRegister">註冊新帳號</button>
        </div>
        
        <div class="links">
          <router-link to="/forget-password">忘記密碼?</router-link>
          <router-link to="/forget-account">忘記帳號?</router-link>
          <a href="#" @click.prevent="guestLogin">訪客登入</a>
        </div>

      </form>
      <AlertModal :visible="showModal" :message="modalMessage" @confirm="handleModalClose" @close="handleModalClose"/>
      </div>
  </template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';
import AlertModal from '@/components/AlertModal.vue';

const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');
const email = ref('');
const captcha = ref('');
const errors = ref({});
const showModal = ref(false);
const modalMessage = ref('');
const shouldRedirect = ref(false);
const token = ref('');

const countdown = ref(0);
const timer = ref(null);

const usernameRef = ref(null);
const passwordRef = ref(null);
const emailRef = ref(null);
const captchaRef = ref(null);

// 顯示提示
function showAlert(message, redirect = false) {
  modalMessage.value = message;
  showModal.value = true;
  shouldRedirect.value = redirect;
}
function handleModalClose() {
  showModal.value = false;
  if (shouldRedirect.value) {
    router.push('/home');
    shouldRedirect.value = false;
  }
}

//  單欄位驗證
function validateUsername() {
  const pattern = /^(?!.*\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,20}$/;
  errors.value.username = pattern.test(username.value) ? '' : '帳號需 12-20 字元，包含大小寫英文與數字，無空白與特殊符號';
}
function validatePassword() {
  const pattern = /^(?!.*\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,20}$/;
  errors.value.password = pattern.test(password.value) ? '' : '密碼需 12-20 字元，包含大小寫英文與數字，無空白與特殊符號';
}
function validateEmail() {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  errors.value.email = pattern.test(email.value) ? '' : '請輸入有效的 Email 格式';
}
function validateCaptcha() {
  const pattern = /^\d{6}$/;
  errors.value.captcha = pattern.test(captcha.value) ? '' : '驗證碼需為 6 位數字';
}

//全欄位驗證
function validateLoginFields() {
  errors.value = {};
  validateUsername();
  if (errors.value.username) {
    usernameRef.value?.focus();
    return false;
  }

  validatePassword();
  if (errors.value.password) {
    passwordRef.value?.focus();
    return false;
  }

  validateEmail();
  if (errors.value.email) {
    emailRef.value?.focus();
    return false;
  }

  validateCaptcha();
  if (errors.value.captcha) {
    captchaRef.value?.focus();
    return false;
  }

  return true;
}

// 取得訪客 token 並儲存
async function getGuestToken() {
  try {
    const res = await api.get('/api/MemberManagement/guest-token');
    if (res.data.status === 'Success') {
      token.value = res.data.token;
      localStorage.setItem('guestToken', token.value); // ✅ 正確儲存 guest token
    } else {
      showAlert('取得訪客身份失敗');
    }
  } catch {
    showAlert('系統錯誤，請稍後再試');
  }
}

//  獲取驗證碼
async function getCode() {
  validateUsername();
  validatePassword();
  validateEmail();

  const missing = [];
  if (errors.value.username) missing.push('帳號');
  if (errors.value.password) missing.push('密碼');
  if (errors.value.email) missing.push('Email');

  if (missing.length > 0) {
    showAlert(`請先正確填寫：${missing.join('、')}`);
    return;
  }

  // 如果 token 尚未準備好，等它取得
  if (!token.value) {
    await getGuestToken();
    if (!token.value) {
      showAlert('訪客憑證取得失敗，請稍後再試');
      return;
    }
  }

  try {
    const response = await api.post('/api/MemberManagement/LoginVerificationCode',
      { sentEmail: email.value },
      { headers: { Authorization: `Bearer ${token.value}` } }
    );

    if (response.data.status === 'Success') {
      showAlert(`驗證碼已發送至 ${email.value}`);
      countdown.value = 60;
      timer.value = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) clearInterval(timer.value);
      }, 1000);
    } else {
      showAlert(response.data.message || '發送驗證碼失敗');
    }
  } catch (error) {
    const message = error.response?.data?.message;
    showAlert(message || '發送驗證碼失敗，請稍後再試');
  }
}

// 使用者登入
async function submitForm() {
  if (!validateLoginFields()) return;
  try {
    const res = await api.post('/api/MemberManagement/Login', {
      Login_AccountName: username.value,
      Login_Password: password.value,
      Login_VerificationCode: captcha.value
    }, {
      headers: { Authorization: `Bearer ${token.value}` }
    });

    if (res.data.status === 'Success') {
      localStorage.setItem('userToken', res.data.token); // 僅存 userToken
      localStorage.setItem('userRole', 'User');
      localStorage.setItem('justLoggedIn', 'true');
      localStorage.setItem('userEmail', email.value);
      showAlert('登入成功！', true);
    } else {
      showAlert(res.data.message || '登入失敗');
    }
  } catch (err) {
    showAlert(err.response?.data?.message || '登入錯誤');
  }
}

// 訪客登入流程
async function guestLogin() {
  await getGuestToken(); // 會設定 token.value 並儲存 guestToken
  localStorage.setItem('userRole', 'Guest');
  localStorage.setItem('justLoggedIn', 'true');
  showAlert('以訪客身份登入成功', true);
}

// 首頁進入後處理登出訊息
onMounted(async () => {
  if (!token.value) {
    const newToken = await getGuestToken();
    token.value = newToken;
  }

  const justLoggedIn = localStorage.getItem('justLoggedIn');
  if (route.query.loggedOut === 'true' && justLoggedIn !== 'true') {
    showAlert('您已成功登出');
  }

  // 清除 justLoggedIn 與 query
  localStorage.removeItem('justLoggedIn');
  if (route.query.loggedOut) {
    router.replace({ path: route.path });
  }
});

function goToRegister() {
  router.push('/register');
}
</script>



  <style scoped>
  .login-container {
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
    height: 39px;
  }
  
  .home-title {
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
    outline: none;
    border-color: #5a67d8;
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
  .error-text {
  color: red;
  font-size: 12px;
  padding-left: 4px;
}
.hint-text {
  color: #666;
  font-size: 12px;
  padding-left: 4px;
}

.modal-container {
 position: relative;
  width: 0;
  height: 0;
  z-index: 0;
  pointer-events: none; /* 不會擋住主畫面 */
}

  </style>
  