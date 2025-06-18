<template>
  <div class="fraud-container">
    <!-- 標題區塊 -->
    <div class="title-section">
      <img src="@/assets/icons/header-icon.svg" alt="Logo" class="header-icon" />
      <span class="title-text">防詐宣導</span>
    </div>

    <!-- 防詐項目 -->
    <div class="icon-list">
      <div class="icon-row">
        <img src="@/assets/icons/Anti-fraud hotline.svg" class="icon-image" alt="防詐專線" />
        <span class="icon-label">防詐專線</span>
      </div>
      <div class="icon-row">
        <img src="@/assets/icons/Common fraud methods.svg" class="icon-image" alt="常見詐騙手法" />
        <span class="icon-label">常見詐騙手法</span>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.fraud-container {
  width: 100%;
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, #ffcbb3, #ffffff);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
  padding-top: 60px; /* 避免標題遮住內容 */
  padding-top: 16px;
  box-sizing: border-box;
}

/* 標題區塊 */
.title-section {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 8px 16px;
  width: 100%;
  box-sizing: border-box;
  gap: 10px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}

.header-icon {
  width: 39px;
  height: 33px;
  object-fit: contain;
}

.title-text {
  font-size: 20px;
  font-weight: 900;
  color: #000;
}

/* 圖示卡片區塊 */
.icon-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  align-items: center;
  margin-top: 48px;
}

.icon-row {
  display: flex;
  align-items: center;
  background: #d7dbfa;
  border: 1.5px solid #6187af;
  border-radius: 50px;
  padding: 16px 24px;
  width: 320px;
  box-sizing: border-box;
  gap: 20px;
}

.icon-image {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
}

.icon-label {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  font-family: "irohamaru", sans-serif;
}
</style>
