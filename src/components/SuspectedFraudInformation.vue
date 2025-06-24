<template>
  <div class="main-container">
    <div class="title-menberdata">
      <div class="menberdata-image">
        <div class="ba-bcb-db"></div>
        <span class="suspected-fraud-info">疑似詐騙資訊</span>
      </div>
    </div>

    <div class="frame">
      <div class="frame-1">
        <!-- 摘要輸入區塊 -->
        <div class="input-group">
          <label class="input-label">摘要</label>
          <input type="text" class="input-field" placeholder="請輸入摘要 (最多20字元)" maxlength="20" />
        </div>

        <!-- 連結輸入區塊 -->
        <div class="input-group">
          <label class="input-label">連結</label>
          <input type="url" class="input-field" placeholder="請輸入文章連結" />
        </div>

        <!-- 圖片上傳按鈕 -->
        <div class="upload-section">
          <label class="input-label">圖片</label>
          <button class="upload-button">上傳</button>
        </div>

        <!-- 描述輸入區塊 -->
        <div class="input-group">
          <label class="input-label">描述</label>
          <textarea class="input-field textarea" placeholder="請描述疑似詐騙的內容"></textarea>
        </div>
      </div>

      <!-- 回報按鈕 -->
      <div class="confirm">
        <button class="confirm-button">回報</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 可在此處加入 v-model 綁定邏輯
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  height: 800px;
  margin: 0 auto;
  background: linear-gradient(180deg, #ffcbb3, #ffffff);
  overflow-y: auto;
  font-family: Inter, sans-serif;
}

.title-menberdata {
  width: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.menberdata-image {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ba-bcb-db {
  width: 39px;
  height: 33px;
  background: url("https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-06-19/HxXZR9bdQC.png") no-repeat center;
  background-size: contain;
}

.suspected-fraud-info {
  font-weight: 900;
  font-size: 20px;
}

.frame {
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-label {
  font-size: 16px;
  font-weight: 600;
}

.input-field {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
}

.textarea {
  resize: vertical;
  height: 100px;
}

.upload-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upload-button {
  padding: 5px 15px;
  border: 1px solid #000;
  border-radius: 20px;
  background-color: #fff;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}

.confirm {
  margin-top: 30px;
}

.confirm-button {
  padding: 10px 20px;
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 20px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}
</style>