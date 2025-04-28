<template>
    <div class="registration-container">
      <header class="header">
        <div class="home-section">
          <img src="@/assets/icons/header-icon.svg" alt="icon" class="header-icon" />
          <h1 class="home-title">註冊介面</h1>
        </div>
      </header>
  
      <form @submit.prevent="submitForm" class="form-content">
        <div class="form-group">
          <input v-model="form.phone" ref="phone" type="text" placeholder="請輸入手機號碼" />
          <small class="error-text" v-if="errors.phone">{{ errors.phone }}</small>
        </div>
  
        <div class="form-group">
          <input v-model="form.nickname" ref="nickname" type="text" placeholder="請輸入暱稱" maxlength="20" />
          <small class="error-text" v-if="errors.nickname">{{ errors.nickname }}</small>
        </div>
  
        <div class="form-group">
          <input v-model="form.username" ref="username" type="text" placeholder="請輸入帳號名稱" />
          <small class="error-text" v-if="errors.username">{{ errors.username }}</small>
        </div>
  
        <div class="form-group">
          <input v-model="form.password" ref="password" type="password" placeholder="請輸入密碼" />
          <small class="error-text" v-if="errors.password">{{ errors.password }}</small>
        </div>
  
        <div class="form-group email-group">
          <div class="email-row">
            <input v-model="form.email" type="email" placeholder="請輸入Email" />
            <button
              type="button"
              class="code-button"
              :disabled="countdown > 0"
              @click="sendVerificationCode"
            >
              {{ countdown > 0 ? countdown + ' 秒後重發' : '獲取驗證碼' }}
            </button>
          </div>
          <small>不得空白</small>
        </div>
  
        <div class="form-group">
          <input v-model="form.code" type="text" placeholder="驗證碼" maxlength="6" />
          <small>驗證碼6位數字</small>
        </div>
  
        <div class="button-group">
            <button type="submit" class="main-button">註冊新帳號</button>
            <button type="button" class="main-button" @click="goLogin">返回登入</button>
        </div>
  
        <div class="terms-container">
          <label class="terms-label">
            <input type="checkbox" v-model="form.agreed" />
            <span>註冊須知/會員權益</span>
          </label>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWVzdCIsIlJvbGUiOiJHdWVzdCIsIm5iZiI6MTczNTY4OTYwMCwiZXhwIjoyMDUxMjIyNDAwLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MDUwIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzA1MCJ9.x5hB3TvkzpZ1GNjK_2WY1tjpIL_vwCz-AG9RzLT_W0s';
  
  export default {
    data() {
      return {
        form: {
          phone: '',
          nickname: '',
          username: '',
          password: '',
          email: '',
          code: '',
          agreed: false
        },
        errors: {},
        countdown: 0,
        timer: null
      };
    },
    methods: {
      validateFields() {
        this.errors = {};
        const usernamePattern = /^(?!.*\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12,20}$/;
  
        if (!/^09\d{8}$/.test(this.form.phone)) {
          this.errors.phone = '手機格式錯誤，請輸入 09 開頭的 10 碼數字';
          this.$refs.phone.focus();
          return false;
        }
        if (!this.form.nickname.trim() || this.form.nickname.length > 20) {
          this.errors.nickname = '暱稱不得為空，且最多 20 字元';
          this.$refs.nickname.focus();
          return false;
        }
        if (!usernamePattern.test(this.form.username)) {
          this.errors.username = '帳號需 12-20 字元，包含大小寫英文與數字，無空白與特殊符號';
          this.$refs.username.focus();
          return false;
        }
        if (!usernamePattern.test(this.form.password)) {
          this.errors.password = '密碼需 12-20 字元，包含大小寫英文與數字，無空白與特殊符號';
          this.$refs.password.focus();
          return false;
        }
        return true;
      },
  
      async sendVerificationCode() {
        if (!this.validateFields()) return;
  
        try {
          const res = await axios.post('/api/MemberManagement/RegisterVerificationCode', {
            sentEmail: this.form.email
          }, {
            headers: { Authorization: `Bearer ${TOKEN}` }
          });
  
          if (res.data.status === 'Success') {
            alert('驗證碼已發送至 Email');
            this.countdown = 60;
            this.timer = setInterval(() => {
              this.countdown--;
              if (this.countdown <= 0) {
                clearInterval(this.timer);
              }
            }, 1000);
          } else {
            alert(`⚠️ ${res.data.message}`);
          }
        } catch (err) {
          alert('發送失敗，請稍後再試');
          console.error(err);
        }
      },
  
      submitForm() {
        if (!this.validateFields()) return;
  
        if (!this.form.agreed) {
          alert('請勾選註冊須知/會員權益');
          return;
        }
  
        alert('✅ 所有欄位驗證通過，可以送出註冊資料！');
        // 可串接正式註冊 API
      },
  
      goToLogin() {
        this.$router.push('/login');
      }
    },
    beforeUnmount() {
      if (this.timer) clearInterval(this.timer);
    },
    goLogin() {
    this.$router.push('/login');  // 如果有設定 vue-router 登入頁路由// 或 window.location.href = '/login';  傳統跳轉
    
  },
}
  </script>  
  
  <style scoped>
  .registration-container {
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
    font-weight: 500;
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
  
  .error-text {
    color: red;
    font-size: 12px;
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
  
  .submit-btn {
    padding: 14px;
    font-size: 20px;
    font-weight: bold;
    border: none;
    border-radius: 20px;
    background: white;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    margin-top: 8px;
  }
  
  .terms-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
  
  .terms-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    white-space: nowrap;
  }
  
  .terms-label input[type="checkbox"] {
    transform: scale(1.1);
  }

  .button-group {
  width: 100%;
  display: flex;
  flex-direction: row; /* 👉 改成橫向排列 */
  justify-content: space-between; /* 👉 左右平均分開 */
  gap: 10px; /* 👉 按鈕中間留點空隙 */
  margin-top: 16px;
}

.main-button {
  flex: 1; /* 👉 兩個按鈕平分一樣寬 */
  padding: 14px;
  font-size: 20px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background: white;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
  </style>
  