<template>
  <div class="main-container">
    <!-- Header -->
    <header class="header">
      <img src="@/assets/icons/header-icon.svg" alt="Logo" class="header-icon" />
      <span class="title">簡訊</span>
    </header>

    <!-- 分類按鈕 -->
    <div class="sms-category-options">
      <button :class="['button-sms-category', selectedCategory === 'general' ? 'active' : '']" @click="changeCategory('general')">一般簡訊</button>
      <button :class="['button-sms-category', selectedCategory === 'strange' ? 'active' : '']" @click="changeCategory('strange')">陌生簡訊</button>
      <button :class="['button-sms-category', selectedCategory === 'screenshot' ? 'active' : '']" @click="changeCategory('screenshot')">截圖分析</button>
    </div>
    
    <!-- 無簡訊提示 -->
    <div v-if="filteredSmsList.length === 0" class="no-sms">尚無簡訊</div>

    <!-- 簡訊列表 -->
    <div v-else class="newsletter-logs">
      <div
        v-for="(sms, index) in filteredSmsList"
        :key="index"
        :class="['sms-card', sms.readCount === 0 ? 'unread' : 'read']"
        @click="markAsReadAndNavigate(sms.phone)"
      >
        <div class="sms-left">
          <div class="avatar" :style="{ backgroundImage: `url(${sms.avatarUrl})` }"></div>
          <div class="text-block">
            <div class="phone-risk">
              <span class="phone">{{ sms.displayName }}</span>
              <div class="risk-inline">
                <img class="risk-icon" :src="getRiskIcon(sms.risk)" :alt="sms.risk" />
                <span class="risk-reason">{{ sms.riskText }}</span>
              </div>
            </div>
            <span class="message">{{ sms.message }}</span>
          </div>
        </div>

        <div class="sms-right">
  <div class="meta">
  <span class="date">{{ formatDate(sms.date) }}</span>
  <span v-if="sms.readCount > 0" class="badge">{{ sms.readCount }}</span>
</div>
</div>
      </div>
    </div>
  </div>
  <AlertModal  v-if="modalVisible"  :message="modalMessage"  @close="handleModalClose"/>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { logout } from '@/router/useAuth'

const router = useRouter()
const selectedCategory = ref('general')
const smsList = ref([])
const contacts = ref([])

const modalVisible = ref(false)
const modalMessage = ref('')
const shouldRedirect = ref(false)

function showAlert(message, redirect = false) {
  modalMessage.value = message
  modalVisible.value = true
  shouldRedirect.value = redirect
}

function handleModalClose() {
  modalVisible.value = false
  if (shouldRedirect.value) {
    router.push('/login')
  }
}

onMounted(() => {
  const token = localStorage.getItem('userToken')
  const role = localStorage.getItem('userRole')

  if (!token || role !== 'User') {
    showAlert('請先登入', true)
    return
  }

  if (router.currentRoute.value.query.loggedOut === 'true') {
    logout()
    router.replace({ query: {} })
  }

  const cached = localStorage.getItem('smsList')
  if (cached) {
    smsList.value = JSON.parse(cached)
    updateDisplayNames()
  }

  setTimeout(() => {
    window.Android?.getSmsInbox?.()
    window.Android?.getContacts?.()
  }, 1000)

  syncInterval = setInterval(() => {
    window.Android?.getSmsInbox?.()
    window.Android?.getContacts?.()
  }, 60000)
})
let syncInterval = null

const normalizePhone = (phone) => {
  if (!phone) return ''
  if (!/^[\d+]/.test(phone)) return phone
  return phone.replace(/\s|-|\+/g, '').replace(/^886/, '0')
}

const contactMap = computed(() => {
  const map = new Map()
  for (const c of contacts.value) {
    const phone = normalizePhone(c.phone)
    if (phone) map.set(phone, c.name)
  }
  return map
})

const updateDisplayNames = () => {
  smsList.value = smsList.value.map(sms => ({
    ...sms,
    displayName: contactMap.value.get(normalizePhone(sms.phone)) || normalizePhone(sms.phone)
  }))
}

// 產生唯一ID（避免重複）
function generateSmsId(sms) {
  return `${normalizePhone(sms.address)}_${sms.body}_${sms.date}`
}

const dispatchSmsProcessing = async (smsArray) => {
  const token = localStorage.getItem('token')
  const existingMap = new Map(smsList.value.map(s => [s.id, s]))

  const analyzedList = await Promise.all(
    smsArray.map(async (sms) => {
      const phone = normalizePhone(sms.address)
      const isContact = contactMap.value.has(phone)
      const id = sms.id || generateSmsId(sms)

      // 若已存在，更新已讀狀態
      if (existingMap.has(id)) {
        existingMap.get(id).read = sms.read
        return null
      }

      try {
        const res = await api.post(
          '/api/MemberManagement/CheckRisk',
          { message: sms.body },
          { headers: { Authorization: `Bearer ${token}` }, timeout: 3000 }
        )
        const data = res.data
        return {
          id,
          phone,
          message: sms.body,
          date: new Date(Number(sms.date)).toISOString(),
          read: sms.read,
          image: sms.image || '',
          avatarUrl: require('@/assets/icons/avatar.svg'),
          category: isContact ? 'general' : 'strange',
          risk: convertRiskLevel(data.riskLevel),
          riskText: data.riskLevel,
          severity: data.severity,
          riskScore: data.riskScore,
          matchedKeywords: data.matchedKeywords || [],
          matchedScamUrls: data.matchedScamUrls || []
        }
      } catch {
        return {
          id,
          phone,
          message: sms.body,
          date: new Date(Number(sms.date)).toISOString(),
          read: sms.read,
          image: sms.image || '',
          avatarUrl: require('@/assets/icons/avatar.svg'),
          category: isContact ? 'general' : 'strange',
          risk: 'unknown',
          riskText: '未知',
          severity: '無法分析',
          riskScore: -1,
          matchedKeywords: [],
          matchedScamUrls: []
        }
      }
    })
  )

  const filteredNewList = analyzedList.filter(s => s !== null)
  smsList.value = [...smsList.value, ...filteredNewList]
  updateDisplayNames()

  const smsToStore = smsList.value.map(({ image, ...rest }) => rest)
  localStorage.setItem('smsList', JSON.stringify(smsToStore))
}

const convertRiskLevel = (riskLevel) => {
  switch (riskLevel) {
    case '高風險': return 'high'
    case '中風險': return 'medium'
    case '低風險': return 'low'
    default: return 'unknown'
  }
}

const getRiskIcon = (risk) => {
  switch (risk) {
    case 'low': return require('@/assets/icons/risk-low.svg')
    case 'medium': return require('@/assets/icons/risk-medium.svg')
    case 'high': return require('@/assets/icons/risk-high.svg')
    default: return require('@/assets/icons/risk-unknown.svg')
  }
}

const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString() + '\n' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const changeCategory = (category) => {
  selectedCategory.value = category
  if (category === 'screenshot') router.push('/screenshot')
}

const markAsReadAndNavigate = (phone) => {
  const normalized = normalizePhone(phone)
  router.push(`/chat?phone=${normalized}`)
}

const filteredSmsList = computed(() => {
  const map = new Map()

  for (const sms of smsList.value) {
    if (sms.category !== selectedCategory.value) continue
    const normalized = normalizePhone(sms.phone || 'unknown')
    const current = map.get(normalized)

    if (!current || new Date(sms.date) > new Date(current.date)) {
      map.set(normalized, {
        ...sms,
        phone: normalized,
        displayName: contactMap.value.get(normalized) || normalized,
        readCount: 0
      })
    }

    if (sms.read === 0) {
      const updated = map.get(normalized)
      updated.readCount = (updated.readCount || 0) + 1
      map.set(normalized, updated)
    }
  }

  return Array.from(map.values())
})

let receivedContacts = false
let receivedSms = false
let latestSmsJson = null

onMounted(() => {
  const cached = localStorage.getItem('smsList')
  if (cached) {
    smsList.value = JSON.parse(cached)
    updateDisplayNames()
  }

  setTimeout(() => {
    window.Android?.getSmsInbox?.()
    window.Android?.getContacts?.()
  }, 1000)

  syncInterval = setInterval(() => {
    window.Android?.getSmsInbox?.()
    window.Android?.getContacts?.()
  }, 5000)
})

onBeforeUnmount(() => {
  if (syncInterval) clearInterval(syncInterval)
})

window.addEventListener('contacts-from-android', (e) => {
  contacts.value = e.detail.map(c => ({
    name: c.name,
    phone: normalizePhone(c.phone)
  }))
  receivedContacts = true

  if (receivedSms && latestSmsJson) dispatchSmsProcessing(latestSmsJson)
})

window.addEventListener('sms-from-android', (e) => {
  latestSmsJson = e.detail
  receivedSms = true
  if (receivedContacts) dispatchSmsProcessing(latestSmsJson)
})

window.addEventListener('sms-from-notification', (e) => {
  const notificationSms = (e.detail || []).map(s => ({ ...s, read: 1 }))
  dispatchSmsProcessing(notificationSms)
})

window.addEventListener('mms-from-android', (e) => {
  const mmsMessages = (e.detail || []).map(s => ({ ...s, read: 1 }))
  dispatchSmsProcessing(mmsMessages)
})
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #f9d4e0, #ffffff);
  display: flex;
  flex-direction: column;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 10px;
}
.header-icon {
  width: 28px;
  height: 28px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
.sms-category-options {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 10px 0;
}
.button-sms-category {
  padding: 6px 14px;
  border-radius: 100px;
  border: 2px solid #84aacf;
  background: #e0f2ff;
  color: #333;
  font-weight: 500;
  font-family: "irohamaru", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}
.button-sms-category.active {
  background: #84aacf;
  color: white;
  border-color: #3e6c9e;
}
.newsletter-logs {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sms-card {
  background: white;
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
}
.sms-left {
  display: flex;
  gap: 8px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}
.icon img {
  width: 18px;
  height: 18px;
  margin-top: 4px;
}
.text-block {
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 160px);
}
.phone-risk {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.risk-inline {
  display: flex;
  align-items: center;
  gap: 4px;
}
.risk-icon {
  width: 16px;
  height: 16px;
}
.risk-reason {
  font-size: 10px;
  color: #666;
}
.phone {
  font-weight: bold;
  font-size: 14px;
}
.message {
  font-size: 10px;
  color: #333;
  word-break: break-word;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sms-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 64px;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.date {
  font-size: 12px;
  color: #888;
  white-space: pre-line;
  text-align: right;
}

.badge {
  background-color: red;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: bold;
}

.no-sms {
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
  color: #999;}

.sms-list {
  max-height: 100%;
  overflow-y: auto;
}

</style>
