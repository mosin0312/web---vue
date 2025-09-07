<template>
<div class="main-container">
    <!-- Header -->
    <header class="header">
        <img src="@/assets/icons/comeback.svg" alt="logo" class="header-icon" @click="goBack"/>
        <h1 class="page-title">問題回報</h1>
    </header>
    <!-- 兩個主按鈕 -->
    <section class="suspicious-buttons">
      <button class="suspicious-button suspicious-scam" @click="goTosuspectedfraudinfo">疑似詐騙資訊</button>
      <button class="suspicious-button report" @click="goTolookreport">查看回報</button>
    </section>
  </div>
</template>

<script setup>
// 可加上按鈕點擊事件，例如 emit 或跳轉

import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.back()
const goTosuspectedfraudinfo = () => router.push('/suspectedfraudinfo')
const goTolookreport = () => router.push('/lookreport')
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #fffcb3 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative; 
}

.header {
  width: 100%; 
  height: 40px; 
  padding: 2px 17px; 
  display: flex; 
  align-items: center; 
  gap: 7px; 
  background-color: #fff; position: sticky; top: 0; z-index: 10; /* 確保在其他區塊上層 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 陰影區分層次 */
  
}

.page-title {
  color: #000;
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}


.header-icon {
  width: 40px;
  height: 40px;
}

/* 主按鈕區 */
.suspicious-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 60px;
  width: 100%;
  padding: 0 20px;
}

.suspicious-button {
  width: 90%;
  padding: 18px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.suspicious-button:hover {
  transform: scale(1.02);
  opacity: 0.9;
}

.suspicious-scam {
  background-color: #ff5757;
}

.suspicious-wrong {
  background-color: #ffb84d;
}

.report{
  background-color: #4d9dff;
}

.transparent-wrapper {
  background-color: transparent !important;
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}
</style>
