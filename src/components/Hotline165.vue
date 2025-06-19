<template>
<div class="transparent-wrapper">
  <div class="main-container">
    <section class="title-section">
      <h1 class="title">165LINE@</h1>
    </section>

    <div class="image-section">
      <img
        class="screenshot"
        src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-06-19/LBBJtdTwCk.png"
        alt="LINE 165 宣導圖片"
        @click="showModal = true"
      />
    </div>

    <section class="info-section">
      <p class="info-title">165全民防騙FB</p>
      <p><span class="label">連結: </span><a href="https://www.facebook.com/" class="link" target="_blank">Facebook</a></p>
      <p><span class="label">內政部警政署全球資訊網連結: </span><a href="https://www.npa.gov.tw/" class="link" target="_blank">內政部警政署全球資訊網</a></p>
      <p><span class="label">刑事局官網連結: </span><a href="https://www.cib.gov.tw/" class="link" target="_blank">內政部警政署刑事警察局全球資訊網</a></p>
    </section>

    <!-- Modal 預覽圖片 -->
    <div class="modal-overlay" v-if="showModal" @click="showModal = false">
      <img
        class="modal-image"
        src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-06-19/LBBJtdTwCk.png"
        alt="放大圖片"
      />
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>

<style scoped>
.main-container {
  width: 300px;
  margin: 0 auto;
  font-family: irohamaru, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-section {
  text-align: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

.image-section {
  display: flex;
  justify-content: center;
}

.screenshot {
  width: 150px;
  height: 188px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}
.screenshot:hover {
  transform: scale(1.02);
}

.info-section {
  font-size: 14px;
  line-height: 1.6;
  color: #000;
}

.info-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.label {
  font-weight: 500;
}

.link {
  color: #2053ed;
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  cursor: zoom-out;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
}

.transparent-wrapper {
  background-color: transparent !important;
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}
</style>
