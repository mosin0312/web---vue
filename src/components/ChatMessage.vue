<template>
  <div class="main-container">
    <!-- Header -->
    <div class="header">
      <img class="logo" src="@/assets/icons/comeback.svg" alt="logo" @click="goBack"/>
      <div class="header-info">
        <span class="sender-name">台灣大哥大</span>
        <span class="sender-number">0912-345-678</span>
      </div>
    </div>

    <!-- Message List -->
    <div class="message-list">
      <div
        class="message-item"
        v-for="(msg, index) in messages"
        :key="index"
        :class="msg.position"
      >
        <div v-if="msg.image" class="message-image-wrapper">
          <img
            :src="msg.image"
            class="message-image"
            alt="圖片訊息"
            @click="openImage(msg.image)"
          />
        </div>

        <div v-if="msg.text" class="message-bubble" @contextmenu.prevent="copyText(msg.text)">
          <p class="message-text">
            {{ msg.text }}
            <template v-if="msg.link">
              <br />
              <a class="message-link" :href="msg.link" target="_blank">{{ msg.link }}</a>
            </template>
          </p>
        </div>

        <div class="info-row">
          <span class="message-time">{{ msg.time }}</span>
          <div class="message-meta">
            <img :src="getRiskIcon(msg.risk)" class="risk-icon" :alt="msg.riskText" />
            <span class="risk-reason">{{ msg.riskText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Image Preview -->
    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <img :src="previewImg" class="modal-image" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/newsletter') // ← 確保你已在 router 中註冊對應路徑
}

const showModal = ref(false)
const previewImg = ref(null)
const messages = ref([
  {
    position: 'left',
    text: '【一起看更精彩】月付500元擁有三大影音串流平台，想看的類型全收錄，訂月再送KKBOX3個月，一起享受!',
    link: 'https://twm5g.co/af1D',
    image: '',
    time: '2025/04/17 17:50',
    risk: 'high',
    riskText: '詐騙疑慮'
  },
  {
    position: 'right',
    text: '',
    link: '',
    image: require('@/assets/icons/pic.svg'),
    time: '2025/04/17 17:51',
    risk: 'low',
    riskText: '安全'
  }
])

const openImage = (src) => {
  previewImg.value = src
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
}
const getRiskIcon = (risk) => {
  switch (risk) {
    case 'low':
      return new URL('@/assets/icons/risk-low.svg', import.meta.url).href
    case 'medium':
      return new URL('@/assets/icons/risk-medium.svg', import.meta.url).href
    case 'high':
      return new URL('@/assets/icons/risk-high.svg', import.meta.url).href
    default:
      return ''
  }
}

const copyText = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('已複製訊息'))
    .catch(() => alert('複製失敗'))
}

// 自動呼叫 API 標記風險
onMounted(async () => {
  const token = 'your_token_here' //之後補上
  for (const msg of messages.value) {
    if (msg.text) {
      try {
        const response = await fetch('http://localhost:5000/api/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sentence: msg.text })
        })
        const data = await response.json()
        msg.risk = data.risk || 'low'
        msg.riskText =
          data.risk === 'high' ? '詐騙疑慮' : data.risk === 'medium' ? '需留意' : '安全'
      } catch (error) {
        console.error('API 錯誤：', error)
      }
    }
  }
})
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: linear-gradient(to bottom, #dcf5ff, #ffffff);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.logo {
  width: 28px;
  height: 28px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.sender-name {
  font-weight: bold;
  font-size: 14px;
}

.sender-number {
  font-size: 12px;
  color: #888;
}

.message-list {
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 24px;
}

.message-item {
  display: flex;
  flex-direction: column;
  max-width: 280px;
}

.left {
  align-self: flex-start;
  text-align: left;
}

.right {
  align-self: flex-end;
  text-align: right;
}

.message-bubble {
  background: white;
  border-radius: 20px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  cursor: pointer;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 6px;
  white-space: pre-wrap;
}

.message-link {
  color: #007aff;
  text-decoration: underline;
  font-size: 14px;
}

.message-image {
  width: 160px;
  border-radius: 12px;
  object-fit: cover;
  background: #f0f0f0;
  margin-bottom: 4px;
  cursor: pointer;
}

.info-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.message-time {
  font-size: 10px;
  color: #999;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.risk-icon {
  width: 16px;
  height: 16px;
}

.risk-reason {
  font-size: 12px;
  color: #333;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: white;
}

.logo {
  width: 28px;
  height: 28px;
  cursor: pointer; /* 顯示手指游標 */
}
</style>