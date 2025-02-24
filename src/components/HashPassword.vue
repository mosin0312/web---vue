<template>
  <div>
    <input type="password" v-model.trim="password" placeholder="請輸入密碼" />
    <button @click="hashPassword">發送API請求(HASH值)</button>   
    <p v-if="error">{{ error }}</p>
    
    <div v-if="responseData">
      <p>狀態: {{ responseData.status }}</p>
      <p>訊息: {{ responseData.message }}</p>
      <p>原始密碼: {{ responseData.original }}</p>
      <p>Salt: {{ responseData.salt }}</p>
      <p>演算法: {{ responseData.algorithm }}</p>
      <p>Hash 值: {{ responseData.hash }}</p>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import axios from 'axios';

const password = ref('');
const error = ref('');
const responseData = ref('');

function validatePassword(password) {//用來判斷密碼格式
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;
return passwordRegex.test(password);
}

async function hashPassword() {
if (!validatePassword(password.value)) {
  error.value = '密碼格式錯誤，請使用至少 12 個字元，包含大小寫字母及數字';
  responseData.value = '';
  return;
}

try {
  const response = await axios.post('/hash-password', { 
    password: password.value 
  });
  error.value = '';
  responseData.value = response.data;
  console.log("API 回應:", response.data);
} catch (error) {
  responseData.value = '';
  if (error.response) {
    error.value = error.response.data.detail ;
    console.error('API 錯誤:', error.response.data);
  } else {
    error.value = '無法連接到伺服器';
    console.error('請求錯誤:', error);
  }
}
}
</script>