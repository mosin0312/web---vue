<template>
  <div class="main-container">
    <!-- Header -->
    <div class="header">
      <img class="logo" src="@/assets/icons/comeback.svg" alt="logo" @click="goBack" />
      <div class="header-info">
        <span class="sender-name">{{ displayName }}</span>
        <span class="sender-number">{{ phone }}</span>
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
          <img :src="msg.image" class="message-image" alt="圖片訊息" @click="openImage(msg.image)" />
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

        <div class="match-info" v-if="msg.matchedKeywords.length || msg.matchedScamUrls.length">
          <span v-if="msg.matchedKeywords.length">關鍵字：{{ msg.matchedKeywords.join(', ') }}</span><br />
          <span v-if="msg.matchedScamUrls.length">詐騙網址：{{ msg.matchedScamUrls.join(', ') }}</span>
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
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const phone = ref(route.query.phone || ' ')
const displayName = ref(route.query.name || ' ') //  從 query 拿到發送者名稱
const messages = ref([])
const showModal = ref(false)
const previewImg = ref(null)

const goBack = () => {
  router.go(-1)
}

const openImage = (src) => {
  previewImg.value = src
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
}

const getRiskIcon = (risk) => {
  switch (risk) {
    case 'low': return new URL('@/assets/icons/risk-low.svg', import.meta.url).href
    case 'medium': return new URL('@/assets/icons/risk-medium.svg', import.meta.url).href
    case 'high': return new URL('@/assets/icons/risk-high.svg', import.meta.url).href
    default: return new URL('@/assets/icons/risk-unknown.svg', import.meta.url).href
  }
}

const copyText = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('已複製訊息'))
    .catch(() => alert('複製失敗'))
}

const convertRisk = (level) => {
  switch (level) {
    case '高風險': return 'high'
    case '中風險': return 'medium'
    case '低風險': return 'low'
    default: return 'unknown'
  }
}

const extractLink = (text) => {
  const match = text.match(/https?:\/\/[\w.-]+(?:\/\S*)?/)
  return match ? match[0] : ''
}

onMounted(() => {
  const token = localStorage.getItem('token')
  const normalizePhone = (p) => p?.replace(/\D/g, '').replace(/^886/, '0')
  const targetPhone = normalizePhone(phone.value)

  window.addEventListener('sms-from-android', async (e) => {
    const allSms = e.detail || []
    const filtered = allSms.filter(sms => normalizePhone(sms.address) === targetPhone)

    messages.value = await Promise.all(
      filtered.map(async sms => {
        let risk = 'unknown'
        let riskText = '未知'
        let matchedKeywords = []
        let matchedScamUrls = []

        try {
          const response = await fetch('/api/MemberManagement/CheckRisk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: sms.body })
          })
          const data = await response.json()
          risk = convertRisk(data.riskLevel)
          riskText = data.riskLevel
          matchedKeywords = data.matchedKeywords || []
          matchedScamUrls = data.matchedScamUrls || []
        } catch (e) {
          console.warn('CheckRisk 失敗', e)
        }

        return {
          position: 'left',
          text: sms.body,
          link: extractLink(sms.body),
          image: sms.image || '',  // ✅ 本機 base64 圖片
          time: new Date(Number(sms.date)).toLocaleString(),
          risk,
          riskText,
          matchedKeywords,
          matchedScamUrls
        }
      })
    )
  })
})


</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #dcf5ff, #ffffff);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 10px;
}
.logo {
  width: 40px;
  height: 40px;
}
.header-info {
  display: flex;
  flex-direction: column;
}
.sender-name {
  font-weight: bold;
  font-size: 18px;
}
.sender-number {
  font-size: 15px;
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
.match-info {
  font-size: 12px;
  color: #555;
  margin-top: 6px;
  line-height: 1.4;
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
  background: white;
}
</style>