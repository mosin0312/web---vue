<template>
  <div class="call-history-page">
    <!-- Header -->
    <div class="call-header">
      <img src="@/assets/icons/header-icon.svg" alt="icon" class="header-icon" />
      <h1 class="header-title">通話紀錄</h1>
    </div>

    <!-- Search -->
    <div class="search-container">
      <img src="@/assets/icons/search-icon.svg" alt="search" class="search-icon" />
      <input
        type="text"
        class="search-input"
        placeholder="Search..."
        v-model="searchQuery"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>

    <!-- Call List -->
    <div class="call-list">
      <div v-for="entry in filteredCallEntries" :key="entry.number + entry.date" class="call-entry">
        
        <!-- 上層：頭像、聯絡人、時間 -->
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
            <!-- 若聯絡人名稱不存在，則點擊號碼本身 -->
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

        <!-- 下層：風險圖示與信賴度 -->
        <div v-if="riskMap[entry.number]" class="priority-container">
          <img
            :src="getRiskIcon(riskMap[entry.number]?.trustLevel)"
            class="priority-icon"
            alt="風險圖示"
          />
          <span class="priority-label">{{ riskMap[entry.number]?.trustLevel }}</span>
        </div>
      </div>
    </div>

    <AlertModal :visible="showModal" :message="modalMessage" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue'

const callEntries = ref([])
const searchQuery = ref('')
const riskMap = ref({})
const showModal = ref(false)
const modalMessage = ref('')

function showAlert(message) {
  modalMessage.value = message
  showModal.value = true
}

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

function getRiskIcon(trustLevel) {
  if (trustLevel?.includes('高')) return require('@/assets/icons/risk-high.svg')
  if (trustLevel?.includes('中')) return require('@/assets/icons/risk-medium.svg')
  if (trustLevel?.includes('低')) return require('@/assets/icons/risk-low.svg')
  return require('@/assets/icons/risk-unknown.svg')
}

function dial(number) {
  if (window.Android?.dialNumber) {
    window.Android.dialNumber(number)
  } else {
    showAlert('目前無法撥打電話')
  }
}

function onFocus(e) {
  e.target.placeholder = ''
}
function onBlur(e) {
  if (!e.target.value) e.target.placeholder = 'Search...'
}

onMounted(() => {
  window.CallLogReceiver = {
    receive: async (data) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        callEntries.value = parsed

        const token = localStorage.getItem('userToken')
        for (const entry of parsed) {
          const phone = entry.number
          if (!phone) continue
          try {
            const res = await axios.get(`/api/lookup/${phone}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data?.results?.length > 0) {
              riskMap.value[phone] = res.data.results[0]
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

  if (window.Android && window.Android.getCallLogs) {
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
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10; /* 確保在其他區塊上層 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 陰影區分層次 */
}

.header-icon {
  width: 39px;
  height: 39px;
}

.header-title {
  font-size: 20px;
  color: #000;
  font-weight: 700;
  margin: 0;
}

.search-container {
  width: 100%;
  padding: 10px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  background-color: #fff;
  margin: 10px 0 20px;
}

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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.call-entry-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.user-info {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar-container {
  flex-shrink: 0;
  margin-right: 8px;
}

.caller-info {
  flex-grow: 1;
}

.call-details {
  text-align: right;
  min-width: 90px;
}

.priority-container {
  display: flex;
  align-items: center;
  margin-left: 48px; /* 對齊 caller-info 開頭 */
  margin-top: 4px;
  gap: 4px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

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
