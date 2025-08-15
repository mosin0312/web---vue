<template>
  <div class="call-history-page">
    <!-- Header -->
    <div class="call-header">
      <img src="@/assets/icons/header-icon.svg" alt="icon" class="header-icon" />
      <h1 class="header-title">通話紀錄</h1>
    </div>

    <!-- Search -->
    <div class="search-container">
      <img
        src="@/assets/icons/search-icon.svg"
        alt="search"
        class="search-icon"
        @click="searchPhone($event)"
      />
      <input
        type="text"
        class="search-input"
        placeholder="Search..."
        maxlength="10"
        v-model="searchQuery"
        @keyup.enter="searchPhone($event)"
      />
    </div>

    <!-- Call List -->
    <div class="call-list">
      <!-- 上層：頭像、聯絡人、時間 -->
      <div
        v-for="entry in filteredCallEntries"
        :key="entry.number + entry.date"
        class="call-entry"
        @mousedown="onPressStart($event, entry)"
        @touchstart="onPressStart($event, entry)"
        @mouseup="onPressEnd"
        @mouseleave="onPressEnd"
        @touchend="onPressEnd"
        @touchcancel="onPressEnd"
      >
        <div class="call-entry-container">
          <!-- 左：頭像 -->
          <div class="avatar-container">
            <img src="@/assets/icons/avatar.svg" alt="avatar" class="avatar" />
          </div>

          <!-- 中：聯絡人 -->
          <div class="caller-info">
            <!-- 聯絡人名稱：純文字不加連結 -->
            <div class="caller-name">{{ entry.name || "未知來電" }}</div>

            <!-- 號碼：只有這段可以點擊撥號 -->
            <div
              class="caller-number dialable"
              v-if="entry.name && entry.name !== entry.number"
              @click="dial(entry.number)"
            >
              {{ entry.number }}
            </div>

            <!-- 沒姓名時，讓號碼可點擊 -->
            <div
              class="caller-name dialable"
              v-if="!entry.name"
              @click="dial(entry.number)"
            >
              {{ entry.number }}
            </div>
          </div>

          <!-- 右：時間與通話圖示 -->
          <div class="call-details" v-if="entry?.date">
            <div class="call-date">{{ formatDate(entry.date) }}</div>
            <div class="call-time-container">
              <div class="call-time">{{ formatTime(entry.date) }}</div>
              <img :src="getDirectionIcon(entry.type)" class="direction-icon" />
            </div>
            <div class="call-icon-container">
              <img :src="getCallIcon(entry.duration)" class="call-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 黑名單彈窗 -->
    <BlacklistModal
      :visible="showBlacklist"
      :incoming="selectedEntry"
      @close="showBlacklist = false"
      @confirm="handleBlacklistConfirm"
    />

    <AlertModal
  :visible="showModal"
  :message="modalMessage"
  @confirm="onModalConfirm"
  @close="handleModalClose"
/>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue'
import BlacklistModal from '@/components/BlacklistModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const callEntries = ref([])
const searchQuery = ref('')
const riskMap = ref({})

// ===== Modal 狀態（支援 await）=====
const showModal = ref(false)
const modalMessage = ref('')
const shouldRedirect = ref(false)
const modalMode = ref('alert')         // 'alert' | 'confirm'
const pendingResolve = ref(null)       // 用來 resolve Promise

// alert：只有「確定」，關閉也算 true。第二參數保留相容舊寫法(布林)。
function showAlert(message, redirectToHomeOrOptions = false) {
  const redirectToHome = typeof redirectToHomeOrOptions === 'boolean'
    ? redirectToHomeOrOptions
    : !!redirectToHomeOrOptions?.redirectToHome

  modalMessage.value = message
  modalMode.value = 'alert'
  showModal.value = true
  shouldRedirect.value = redirectToHome

  return new Promise((resolve) => { pendingResolve.value = resolve })
}

// 按「確定」
function onModalConfirm() {
  showModal.value = false
  const r = pendingResolve.value; pendingResolve.value = null
  r?.(true)

  if (shouldRedirect.value) {
    router.push({ path: '/', query: {}, replace: true })
    shouldRedirect.value = false
  }
}

// 關閉（點背景 / X / 子元件自動 close）
function handleModalClose() {
  showModal.value = false
  const r = pendingResolve.value; pendingResolve.value = null
  // alert 視同已讀(true)；confirm 視為取消(false)
  r?.(modalMode.value === 'alert')

  if (shouldRedirect.value) {
    router.push({ path: '/', query: {}, replace: true })
    shouldRedirect.value = false
  }
}

// 公開/非公開 → 理由 → TypeCode 對照
const TYPE_CODE = {
  '公開': {
    '一接就掛': 101,
    '詐騙': 102,
    '推銷/廣告': 103,
    '騷擾': 104,
    '其他': 199 },
  '非公開': {
    '舊情人': 201,
    '家庭內部衝突': 202,
    '語言不通無法溝通': 203,
    '個人情感問題': 204,
    '其他': 299 },
}

function getUserIdFromLocalOrToken() {
  const stored = localStorage.getItem('userId') ?? localStorage.getItem('UserId')
  if (stored && Number.isFinite(+stored)) return +stored

  const t = localStorage.getItem('userToken')
  if (!t) return null
  try {
    const b64url = t.split('.')[1]
    if (!b64url) return null
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '='))
    const payload = JSON.parse(json)
    const id = payload.userId ?? payload.UserId
    return Number.isFinite(+id) ? +id : null
  } catch { return null }
}

// ===== 黑名單：長按狀態 =====
const pressTimer = ref(null)
const pressThreshold = 600 // 毫秒（長按判定）
const showBlacklist = ref(false)
const selectedEntry = ref({ number: '', name: '' })

const filteredCallEntries = computed(() => {
  return callEntries.value
    ?.filter((e) => e && e.number && e.date)
    ?.filter((e) => e.number.includes(searchQuery.value || '')) || []
})

function formatDate(timestamp) {
  if (!timestamp) return '無日期'
  const date = new Date(Number(timestamp))
  return date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
}
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(Number(timestamp))
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}
function getDirectionIcon(type) {
  return require(`@/assets/icons/${type === '撥出' ? 'arrow-outgoing' : 'arrow-incoming'}.svg`)
}
function getCallIcon(duration) {
  return require(`@/assets/icons/${duration === '0' ? 'call-end' : 'call-received'}.svg`)
}
function dial(number) {
  if (window.Android?.dialNumber) {
    window.Android.dialNumber(number)
  } else {
    showAlert('目前無法撥打電話')
  }
}

// ====== 查風險 ======
async function searchPhone(event) {
  if (event?.preventDefault) event.preventDefault()
  const raw = searchQuery.value?.trim()
  const phone = raw?.replace(/[^0-9]/g, '')
  if (!phone) return showAlert('請輸入要查詢的電話號碼')

  const token = localStorage.getItem('userToken')
  if (!token) return showAlert('請先登入才能查詢電話風險', true)

  try {
    const res = await axios.get(`/api/MemberManagement/lookuptest/${phone}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const results = res.data?.results
    if (!results || Object.keys(results).length === 0) return showAlert('查無資料')

    const phoneBook = results.phoneBook || {}
    const whosNumber = results.whosNumber || {}
    const tellows = results.tellows || {}
    sessionStorage.setItem('searchData', JSON.stringify({ phone, phoneBook, whosNumber, tellows }))
    router.push({ path: '/search-phone' })
  } catch (err) {
    console.error('查詢失敗:', err)
    showAlert('查詢電話風險時發生錯誤')
  }
}

// ====== 長按行為（開啟黑名單） ======
function onPressStart(e, entry) {
  clearTimeout(pressTimer.value)
  pressTimer.value = setTimeout(() => {
    selectedEntry.value = { number: entry.number, name: entry.name || '' }
    showBlacklist.value = true
  }, pressThreshold)
}
function onPressEnd() {
  clearTimeout(pressTimer.value)
}

// 本地黑名單 upsert：若已存在該號碼→覆蓋（保留舊 createdAt），否則新增
function upsertLocalBlacklist({ phone, name, scope, reason, note }) {
  const key = 'blacklist'
  const list = JSON.parse(localStorage.getItem(key) || '[]')
  const idx = list.findIndex(x => x.number === phone)
  const now = Date.now()

  if (idx >= 0) {
    const old = list[idx]
    list[idx] = {
      number: phone,
      name: name || old.name || '',
      scope,                                  // '公開' | '非公開'
      reason: reason || '其他',
      note: (note || '').trim(),
      createdAt: old.createdAt || now         // 保留原時間
    }
  } else {
    list.unshift({
      number: phone,
      name: name || '', scope, reason: reason || '其他',
      note: (note || '').trim(),
      createdAt: now
    })
  }

  localStorage.setItem(key, JSON.stringify(list))
}

// ====== 黑名單確認：儲存（create），已存在就改成更新（update） ======
async function handleBlacklistConfirm(payload) {
  // payload = { scope: '公開' | '非公開', reason: '...', note: '...' }
  const phone = selectedEntry.value.number
  const name = selectedEntry.value.name || ''

  // 1) 取得並驗證 userId / token
  const userId = getUserIdFromLocalOrToken()
  if (!Number.isFinite(userId)) {
    await showAlert('找不到使用者資訊或格式錯誤（需要整數 ID），請重新登入', true)
    return
  }
  const token = localStorage.getItem('userToken')
  if (!token) {
    await showAlert('請先登入', true)
    return
  }

  // 2) 轉換 TypeCode（後端目前是 string）
  const codeTable = TYPE_CODE[payload.scope] || {}
  const typeCode = String(codeTable[payload.reason] ?? codeTable['其他'] ?? 999)
  const extraText = (payload.note || '').trim() || payload.reason || ''

  try {
    // 3) 先嘗試建立
    const body = {
      UserId: userId,                // int
      PhoneNumber: phone,
      TypeCode: typeCode, ExtraText: extraText }

    await axios.post('/api/Test/create', body, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })

    // 建立成功 → 同步本地、關閉黑名單、提示
    upsertLocalBlacklist({ phone, name, scope: payload.scope,
      reason: payload.reason,
      note: payload.note
    })
    showBlacklist.value = false
    await showAlert('成功儲存')
  } catch (err) {
    const status = err?.response?.status
    const msg = err?.response?.data?.message || ''

    // 已存在 → 更新
    if (status === 400 && /已經儲存過/.test(msg)) {
      try {
        const updateBody = {
          UserId: userId,
          PhoneNumber: phone, TypeCode: typeCode, ExtraText: extraText }
        await axios.post('/api/Test/UpdatePhone', updateBody, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        })

        upsertLocalBlacklist({ phone, name, scope: payload.scope, reason: payload.reason, note: payload.note })
        showBlacklist.value = false
        await showAlert('你已回報過此號碼，已更新為最新理由')
      } catch (err2) {
        console.error('更新失敗', err2)
        const s2 = err2?.response?.status
        if (s2 === 401) return void await showAlert('登入已失效，請重新登入', true)
        if (s2 === 404) return void await showAlert('找不到資料（後端），請稍後再試或重新整理')
        const m2 = err2?.response?.data?.message || '更新失敗，請稍後再試'
        await showAlert(m2)
      }
      return
    }

    // 其他常見錯誤
    if (status === 401) return void await showAlert('登入已失效，請重新登入', true)
    if (status === 400) {
      const errors = err?.response?.data?.errors
      if (errors && typeof errors === 'object') {
        const msgs = []
        for (const k of Object.keys(errors)) {
          const arr = errors[k]
          if (Array.isArray(arr)) msgs.push(...arr)
        }
        if (msgs.length) return void await showAlert(`送出資料有誤：\n- ${msgs.join('\n- ')}`)
      }
      return void await showAlert('送出資料有誤，請檢查欄位內容')
    }
    if (status === 500) return void await showAlert('資料庫錯誤，請稍後再試')

    console.error('建立黑名單失敗', err)
    await showAlert('儲存失敗，請稍後再試')
  }
}




onMounted(() => {
  searchQuery.value = ''

  // 驗證 Token 與角色
  const token = localStorage.getItem('userToken')
  const role = localStorage.getItem('userRole')
  if (!token || role !== 'User') {
    showAlert('請先登入', true) // 等使用者按「確定」再跳轉
  return
  }

  // 清除 ?loggedOut
  if (router.currentRoute.value.query.loggedOut === 'true') {
    router.replace({ query: {} })
  }

  // Android 與 CallLogReceiver 初始化
  window.CallLogReceiver = {
    receive: async (data) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        callEntries.value = parsed

        for (const entry of parsed) {
          const phone = entry.number
          if (!phone) continue
          try {
            const res = await axios.get(`/api/MemberManagement/lookuptest/${phone}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            const results = res.data?.results
            if (results) {
              // 優先取 phoneBook，其次 whosNumber，再次 tellows
              riskMap.value[phone] = results.phoneBook || results.whosNumber || results.tellows || {}
            }
          } catch (err) {
            console.warn(`查詢 ${phone} 風險失敗`, err)
          }
        }
      } catch (e) {
        console.error('解析通話記錄失敗', e)
        showAlert('無法載入通話記錄')
      }
    }
  }

  if (window.Android?.getCallLogs) {
    window.Android.getCallLogs()
  } else {
    console.warn('Android 通話記錄橋接尚未就緒')
  }
})
</script>




<style scoped>
.call-history-page {
  width: 100%;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #ffebc3 0%, #fff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative; 
}
.call-header { 
  width: 100%; 
  height: 40px; 
  padding: 2px 17px; 
  display: flex; 
  align-items: center; 
  gap: 7px; 
  background-color: #fff; position: sticky; top: 0; z-index: 10; /* 確保在其他區塊上層 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 陰影區分層次 */
}

.header-icon { 
  width: 39px; 
  height: 39px; }

.header-title { 
  font-size: 20px; 
  color: #000; 
  font-weight: 700; 
  margin: 0; }

.search-container {
  width: 100%;
  padding: 10px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  background-color: #fff;
  margin: 10px 0 20px; }
.search-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.search-input {
  font-size: 20px;
  color: #a49f9f;
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
}

.call-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-bottom: 10px;
}

.call-entry {
  height: 72px;
  padding: 8px;
  border-radius: 14px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.call-entry-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.user-info {
  display: flex;
  gap: 14px;
  align-items: center; }
.avatar-container {
  flex-shrink: 0;
  margin-right: 8px; }
.caller-info {
  flex-grow: 1;
}

.call-details {
  text-align: right;
  min-width: 90px; }
.priority-container {
  display: flex;
  align-items: center;
  margin-left: 48px; /* 對齊 caller-info 開頭 */
  margin-top: 4px;
  gap: 4px; }
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%; }
.status-indicator {
  position: absolute;
  left: 26px;
  top: 37px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #ffeaea;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.user-name {
  font-size: 16px;
  color: #333;
  margin: 0;
}

.user-phone {
  font-size: 14px;
  color: #acacac;
}

.priority-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.priority-icon {
  width: 16px;
  height: 16px;
}

.priority-label {
  font-size: 8px;
  color: #000;
}

.call-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.call-date {
  font-size: 10px;
}

.call-time-container {
  display: flex;
  align-items: center;
  gap: 2px;
}

.call-time {
  font-size: 8px;
}

.direction-icon {
  width: 7px;
  height: 8px;
}

.call-icon-container {
  margin-top: 2px;
}

.call-icon {
  width: 24px;
  height: 24px;
}

@media (max-width: 640px) {
  .user-details {
    max-width: 150px;
  }
}

.dialable {
  cursor: pointer;
  color: #1e88e5;
  text-decoration: underline;
}
.dialable:hover {
  color: #0d47a1;
}
</style>
