<template>
<div class="transparent-wrapper">
  <div class="main-container">
    <!-- 兩個主按鈕 -->
    <section class="suspicious-buttons">
      <button class="suspicious-button suspicious-scam">疑似詐騙資訊</button>
      <button class="suspicious-button suspicious-wrong">疑似資訊有誤</button>
    </section>
  </div>
  </div>
</template>

<script setup>
// 可加上按鈕點擊事件，例如 emit 或跳轉
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
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

.transparent-wrapper {
  background-color: transparent !important;
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}
</style>
