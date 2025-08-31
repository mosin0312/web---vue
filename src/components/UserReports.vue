<template>
<div class="transparent-wrapper">
  <div class="main-container">
    <header class="title-header sticky-header">
      <img src="@/assets/icons/comeback.svg" alt="Logo" class="header-icon" @click="goBack" />
      <span class="header-title">問題回報</span>
    </header>
    <!-- 兩個主按鈕 -->
    <section class="suspicious-buttons">
      <button class="suspicious-button suspicious-scam" @click="goTosuspectedfraudinfo">疑似詐騙資訊</button>
      <button class="suspicious-button report">查看回報</button>
    </section>
  </div>
  </div>
</template>

<script setup>
// 可加上按鈕點擊事件，例如 emit 或跳轉

import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.back()
const goTosuspectedfraudinfo = () => router.push('/suspectedfraudinfo')
</script>

<style scoped>
.main-container {
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, #fffcb3, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  z-index: 10;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
}

.header-icon {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
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
