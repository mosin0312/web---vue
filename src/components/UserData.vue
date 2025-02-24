<template>
  <div>
    <h2>User Data</h2>
    <ul>
      <li v-for="user in userdata" :key="user.phone">
        <!--user.???需與後端一致不然無法顯示資料-->
        姓名:{{ user.name }} 性別: {{ user.gender }} 年齡: {{ user.age }} 電話: {{ user.phone }}
      </li>
    </ul>
    <button @click="getUserData">發送 GET 獲得資料</button>
  </div>
</template>

<script setup>//簡潔寫法，傳統是export default 要定義 data、methods、computed
import { ref } from 'vue';//操作一些特定按鈕或方法時讓畫面會自動更新
import axios from 'axios';

const userdata = ref([]); 

// 定義 GET 方法
async function getUserData() { 

  try {
    //await是等 API 回應資料後再繼續執行下一行程式碼。
    const response = await axios.get('/get-user-data'); // 經過 Vue Proxy(代理)，在vue.config.js更改路徑，所以使用相對路徑
    console.log('獲取的資料:', response.data); // 確保資料正確
    if (Array.isArray(response.data)) {
      userdata.value = response.data; // 更新資料
    } else {
      console.error('回傳資料格式錯誤:', response.data);
    }
  } catch (error) {
    console.error('獲取使用者資料失敗', error);
  }
}

// 移除 onMounted(getUserData);讓資料不會自動輸出
</script>
