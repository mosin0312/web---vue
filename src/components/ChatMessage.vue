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
          <img :src="msg.image" loading="lazy" class="message-image" alt="" @click="openImage(msg.image)" />
        </div>

        <div v-if="msg.text" class="message-bubble" :class="{ 'from-self': msg.position === 'right' }" @contextmenu.prevent="copyText(msg.text)" >
          <p class="message-text">  {{ msg.text }}
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
      <div ref="messageEndRef"></div>
    </div>

    <!-- Modal Image Preview -->
    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <img :src="previewImg" class="modal-image" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const phone = ref(route.query.phone || ' ')
const displayName = ref(route.query.name || ' ')
const messages = ref([])
const showModal = ref(false)
const previewImg = ref(null)
const messageEndRef = ref(null)

const goBack = () => router.go(-1)
const openImage = (src) => {
  previewImg.value = src
  showModal.value = true
}
const closeModal = () => showModal.value = false

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

const normalizePhone = (phone) =>
  phone?.replace(/\D/g, '').replace(/^886/, '0')

const analyzeMessages = async (smsArray) => {
  const token = localStorage.getItem('userToken')  
  const targetPhone = normalizePhone(phone.value)

  const filtered = smsArray.filter(sms =>
    normalizePhone(sms.address) === targetPhone &&
    (sms.body || sms.image)
  )

  const analyzed = await Promise.all(filtered.map(async sms => {
  let risk = 'unknown'
  let riskText = '未知'
  let matchedKeywords = []
  let matchedScamUrls = []

  try {
    const response = await api.post(
      '/api/Test',
      { message: sms.body },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = response.data
    console.log('📦 CheckRisk 回傳資料：', data)

    risk = convertRisk(data.riskLevel)
    riskText = data.riskLevel
    matchedKeywords = data.matchedKeywords || []
    matchedScamUrls = data.matchedScamUrls || []

  } catch (e) {
    console.warn('❌ CheckRisk API 錯誤：', e)
  }

  const isSelf = sms.type === 2 || sms.fromMe

  return {
    position: isSelf ? 'right' : 'left',
    text: sms.body,
    link: extractLink(sms.body),
    image: sms.image || '',
    time: new Date(Number(sms.date)).toISOString(),
    risk,
    riskText,
    matchedKeywords,
    matchedScamUrls
  }
}))


  const existingKeys = new Set(messages.value.map(
    m => `${m.text}-${m.time}-${m.image?.length || 0}`
  ))

  const uniqueNew = analyzed.filter(m =>
    !existingKeys.has(`${m.text}-${m.time}-${m.image?.length || 0}`)
  )

  messages.value = [...messages.value, ...uniqueNew].sort(
    (a, b) => new Date(a.time) - new Date(b.time)
  )
}

watch(messages, () => {
  nextTick(() => {
    messageEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
})

onMounted(() => {
  const targetPhone = normalizePhone(route.query.phone)
  const cached = localStorage.getItem('smsList')
  if (!cached) return

  const list = JSON.parse(cached)
  let updated = false

  for (const sms of list) {
    if (normalizePhone(sms.phone) === targetPhone && sms.read === 0) {
      sms.read = 1
      updated = true
    }
  }

  if (updated) {
    localStorage.setItem('smsList', JSON.stringify(list))
    console.log('✅ 已將簡訊標記為已讀')
  }

  window.addEventListener('sms-from-android', (e) => analyzeMessages(e.detail || []))
  window.addEventListener('sms-from-notification', (e) => analyzeMessages(e.detail || []))
  window.addEventListener('mms-from-android', (e) => analyzeMessages(e.detail || []))
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
  z-index: 10; /* 確保在其他區塊上層 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 陰影區分層次 */
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
.sender-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}
.message-bubble {
  background: white;
  border-radius: 20px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  cursor: pointer;
}
.message-bubble.from-self {
  background: #4af66a;
}

.message-bubble.from-self .message-text {
  text-align: left;

}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  white-space: pre-wrap;       /* 保留換行 + 自動換行 */
  word-break: break-all;       /* 長網址/單字會自動斷行 */
  overflow-wrap: break-word;   /* 備援處理斷行 */
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

