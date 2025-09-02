<template>
  <div class="main-container">
    <div class="title-menberdata">
      <div class="menberdata-image">
        <img src="@/assets/icons/comeback.svg" alt="Logo" class="header-icon" @click="goBack" />
        <span class="header-title">詳細內容</span>
      </div>
    </div>

    <div class="frame">
      <div class="frame-1">
        <!-- 摘要 -->
        <div class="input-group">
          <label class="input-label">摘要</label>
          <input
            type="text"
            class="input-field"
            v-model="summary"
            readonly
          />
        </div>

        <!-- 連結 -->
        <div class="input-group">
          <label class="input-label">連結</label>
          <input type="url" class="input-field" v-model="link"  readonly/>
        </div>

        <div class="upload-section">
          <label class="input-label">圖片</label>
        </div>

        <!-- 預覽圖 -->
<div v-if="imageUrl" class="preview-section">
  <img :src="imageUrl" alt="預覽圖片" class="preview-image" />
</div>

        <!-- 描述 -->
        <div class="input-group">
          <label class="input-label">描述</label>
          <textarea class="input-field textarea" v-model="description" readonly></textarea>
        </div>
      </div>
    </div>

    <!-- Alert Modal -->
    <AlertModal
      :visible="showModal"
      :message="modalMessage"
      @close="onModalClose"
      @confirm="onModalConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AlertModal from '@/components/AlertModal.vue'

const router = useRouter()
const goBack = () => router.back()

// 表單狀態
const summary = ref('')
const link = ref('')
const description = ref('')
const imageUrl = ref('')

import { onMounted } from 'vue'

onMounted(() => {
  const { summary: qSummary, link: qLink, description: qDesc, imageUrl: qImage } = router.currentRoute.value.query

  if (qSummary) summary.value = qSummary
  if (qLink) link.value = qLink
  if (qDesc) description.value = qDesc
  if (qImage) imageUrl.value = qImage
})


</script>

<style scoped>
.main-container {
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, #ffcbb3, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.header-icon {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
}

.frame {
  width: 90%;
  max-width: 100%;
  margin: 0 auto;
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
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.input-field {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  margin-bottom: 8px;
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

.preview-section {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #ccc;
  object-fit: contain;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.confirm {
  margin-top: 30px;
  display: flex;
  justify-content: center;
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
