<template>
  <div class="main-container">
    <!-- Header -->
    <header class="header">
      <img src="@/assets/icons/header-icon.svg" alt="Logo" class="header-icon" />
      <span class="title">簡訊</span>
    </header>

    <!-- 分類按鈕 -->
    <div class="sms-category-options">
      <button :class="['button-sms-category', selectedCategory === 'general' ? 'active' : '']" @click="changeCategory('general')">通訊錄簡訊</button>
      <button :class="['button-sms-category', selectedCategory === 'strange' ? 'active' : '']" @click="changeCategory('strange')">非通訊錄簡訊</button>
      <button :class="['button-sms-category', selectedCategory === 'screenshot' ? 'active' : '']" @click="changeCategory('screenshot')">截圖分析</button>
    </div>
    
    <!-- 無簡訊提示 -->
    <div v-if="filteredSmsList.length === 0" class="no-sms">尚無簡訊</div>

    <!-- 簡訊列表 + 下拉刷新 -->
    <div
      v-else
      ref="scroller"
      class="newsletter-logs"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- 下拉刷新指示器 -->
      <div class="refresh-indicator" :style="{ height: pullDistance + 'px' }">
        <div class="indicator-text">
          {{ refreshState === 'loading'
              ? '更新中…'
              : (refreshState === 'release' ? '放開以刷新' : '下拉以刷新') }}
        </div>
        <div v-if="refreshState === 'loading'" class="spinner"></div>
      </div>

      <!-- 簡訊卡片 -->
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
              </div>
            </div>
            <span class="message">{{ sms.message }}</span>
          </div>
        </div>

        <div class="sms-right">
          <div class="meta">
            <span class="date">{{ formatDate(sms.date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AlertModal v-if="modalVisible" :message="modalMessage" @close="handleModalClose" />
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
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
  if (shouldRedirect.value) router.push('/login')
}

/* ---------------- Utils ---------------- */
const normalizePhone = (phone) => {
  if (!phone) return ''
  if (!/^[\d+]/.test(phone)) return phone
  return phone.replace(/\s|-|\+/g, '').replace(/^886/, '0')
}
function generateSmsId(sms) {
  // 後端/Android 若未提供 id，就用組合 id（電話 + 內文 + 時間）
  return `${normalizePhone(sms.address)}_${sms.body}_${sms.date}`
}
const convertRiskLevel = (riskLevel) => {
  switch (riskLevel) {
    case '高風險': return 'high'
    case '中風險': return 'medium'
    case '低風險': return 'low'
    default: return 'unknown'
  }
}
const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString() + '\n' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ---------------- Contacts map & display name ---------------- */
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

/* ---------------- Pull to refresh state ---------------- */
const scroller = ref(null)
const pullDistance = ref(0)
const refreshState = ref('idle') // 'idle' | 'pull' | 'release' | 'loading'
let startY = 0
let canPullFromTop = false
const THRESHOLD = 70
const MAX_PULL = 120
const refreshInProgress = ref(false)
let refreshPending = 0
let refreshFallbackTimer = null

function onTouchStart(e) {
  if (!scroller.value) return
  canPullFromTop = scroller.value.scrollTop <= 0
  startY = e.touches[0].clientY
  pullDistance.value = 0
  if (canPullFromTop && refreshState.value !== 'loading') {
    refreshState.value = 'pull'
  }
}
function onTouchMove(e) {
  if (!canPullFromTop || refreshState.value === 'loading') return
  const dy = e.touches[0].clientY - startY
  if (dy > 0) {
    pullDistance.value = Math.min(MAX_PULL, dy * 0.5)
    refreshState.value = pullDistance.value >= THRESHOLD ? 'release' : 'pull'
  }
}
function onTouchEnd() {
  if (!canPullFromTop || refreshState.value === 'loading') return resetPull()
  if (refreshState.value === 'release') triggerRefresh()
  else resetPull()
}
function resetPull() {
  refreshState.value = 'idle'
  pullDistance.value = 0
  canPullFromTop = false
}
function triggerRefresh() {
  refreshState.value = 'loading'
  pullDistance.value = THRESHOLD
  refreshInProgress.value = true
  refreshPending = 2
  window.Android?.getContacts?.()
  window.Android?.getSmsInbox?.()
  clearTimeout(refreshFallbackTimer)
  refreshFallbackTimer = setTimeout(endRefresh, 4000)
}
function endRefresh() {
  refreshInProgress.value = false
  clearTimeout(refreshFallbackTimer)
  resetPull()
}

/* ---------------- Sync loop & first load ---------------- */
let syncInterval = null

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

  // 週期同步（可自行調整）
  syncInterval = setInterval(() => {
    window.Android?.getSmsInbox?.()
    window.Android?.getContacts?.()
  }, 60000)
})

onBeforeUnmount(() => { if (syncInterval) clearInterval(syncInterval) })

/* ---------------- Core: ingest & reconcile ---------------- */
/**
 * 將 Android 推來的訊息合併進前端狀態
 * @param {Array} smsArray 來源資料
 * @param {'sms'|'mms'|'rcs'} source
 * @param {boolean} fullSync 這批是否為完整同步（true 時會先剔除同來源但不在此批的舊資料）
 */
const dispatchSmsProcessing = async (smsArray, source = 'sms', fullSync = false) => {
  const token = localStorage.getItem('userToken')

  const incomingIds = new Set((smsArray || []).map(s => s.id || generateSmsId(s)))

  // ✅ 完整同步：剔除同來源但不在本次清單中的舊資料（解決「刪了還存在」）
  if (fullSync) {
    smsList.value = smsList.value.filter(item => item.source !== source || incomingIds.has(item.id))
  }

  const existingMap = new Map(smsList.value.map(s => [s.id, s]))

  const analyzedList = await Promise.all(
    (smsArray || []).map(async (sms) => {
      const phone = normalizePhone(sms.address)
      const isContact = contactMap.value.has(phone)
      const id = sms.id || generateSmsId(sms)

      // 已存在就更新讀取狀態等，避免重跑分析
      if (existingMap.has(id)) {
        existingMap.get(id).read = sms.read
        return null
      }

      try {
        const res = await api.post(
          '/api/MemberManagement/Test',
          { message: sms.body },
          { headers: { Authorization: `Bearer ${token}` }, timeout: 3000 }
        )
        const data = res.data
        return {
          id,
          source,
          phone,
          message: sms.body,
          date: new Date(Number(sms.date)).toISOString(),
          read: sms.read,
          image: '',
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
          source,
          phone,
          message: sms.body,
          date: new Date(Number(sms.date)).toISOString(),
          read: sms.read,
          image: '',
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

  const filteredNewList = analyzedList.filter(Boolean)
  smsList.value = [...smsList.value, ...filteredNewList]
  updateDisplayNames()

  // （可選）對通知型資料設 TTL，避免永遠留著
  const now = Date.now()
  const TTL_MS = 30 * 24 * 60 * 60 * 1000
  smsList.value = smsList.value.filter(item =>
    item.source !== 'rcs' || (now - new Date(item.date).getTime()) < TTL_MS
  )

  const smsToStore = smsList.value.map(sms => {
    const copy = { ...sms }
    delete copy.image
    delete copy.readCount
    return copy
  })
  localStorage.setItem('smsList', JSON.stringify(smsToStore))
}

/* ---------------- Events (整合刷新收斂) ---------------- */
window.addEventListener('contacts-from-android', (e) => {
  contacts.value = e.detail.map(c => ({ name: c.name, phone: normalizePhone(c.phone) }))

  if (refreshInProgress.value) {
    refreshPending -= 1
    if (refreshPending <= 0) endRefresh()
  }
})

const _dispatchSmsProcessing = dispatchSmsProcessing

window.addEventListener('sms-from-android', (e) => {
  // 完整同步：會剔除同來源已刪除的項目
  Promise
    .resolve(_dispatchSmsProcessing(e.detail, 'sms', true))
    .finally(() => {
      if (refreshInProgress.value) {
        refreshPending -= 1
        if (refreshPending <= 0) endRefresh()
      }
    })
})

window.addEventListener('mms-from-android', (e) => {
  const mmsMessages = (e.detail || []).map(s => ({ ...s, read: 1 }))
  // 完整同步
  _dispatchSmsProcessing(mmsMessages, 'mms', true)
})

window.addEventListener('sms-from-notification', (e) => {
  const notificationSms = (e.detail || []).map(s => ({ ...s, read: 1 }))
  // 通知資料為增量，非完整同步
  _dispatchSmsProcessing(notificationSms, 'rcs', false)
})

/* ---------------- View helpers ---------------- */
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
      })
    }
  }
  return Array.from(map.values())
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

/* 下拉刷新 */
.refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: height 0.15s ease;
  color: #666;
  font-size: 12px;
}

.indicator-text {
  margin-right: 8px;
  user-select: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0,0,0,0.15);
  border-top-color: rgba(0,0,0,0.55);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
