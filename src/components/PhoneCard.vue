<template>
  <div class="call-history-page">
    <header class="call-header">
      <img :src="require('@/assets/icons/header-icon.svg')" alt="Phone icon" class="header-icon" />
      <h1 class="header-title">通話記錄</h1>
    </header>

    <!-- Search -->
    <div class="search-container">
      <img src="@/assets/icons/search-icon.svg" alt="Search Icon" class="search-icon" />
      <input 
  type="text" 
  placeholder="Search..." 
  class="search-input" 
  aria-label="Search call records" 
  @focus="onFocus" 
  @blur="onBlur"
  v-model="searchQuery"
  @keyup.enter="handleSearch"
/>
    </div>

    <!-- Call List -->
    <section class="call-list">
      <article
        v-for="(entry, index) in filteredCallEntries"
        :key="index"
        class="call-entry"
      >
        <div class="call-entry-container">
          <div class="user-info">
            <div class="avatar-container">
              <img :src="require('@/assets/icons/avatar.svg')" alt="User" class="avatar" />
              <div class="status-indicator">
                <img :src="require('@/assets/icons/property-private.svg')" alt="Status" class="status-icon" />
              </div>
            </div>
            <div class="user-details">
              <h2 class="user-name">{{ entry.name || '未知來電者' }}</h2>
              <p class="user-phone">{{ entry.number }}</p>
            </div>
          </div>
          <div class="call-details">
            <time class="call-date">{{ formatDate(entry.date) }}</time>
            <div class="call-time-container">
              <time class="call-time">{{ formatTime(entry.date) }}</time>
              <img :src="getDirectionIcon(entry.type)" class="direction-icon" />
            </div>
            <div class="call-icon-container">
              <img :src="getCallIcon(entry.duration)" class="call-icon" />
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
  <AlertModal :visible="showModal" :message="modalMessage" @close="showModal = false" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue'

// Router
const router = useRouter()

// 狀態變數
const callEntries = ref([])
const searchQuery = ref('')
const showModal = ref(false)
const modalMessage = ref('')

// 警告框顯示
function showAlert(message) {
  modalMessage.value = message
  showModal.value = true
}

// 搜尋過濾
const filteredCallEntries = computed(() => {
  if (!searchQuery.value) return callEntries.value
  return callEntries.value.filter((e) =>
    e.number?.includes(searchQuery.value)
  )
})

// 日期格式化
function formatDate(timestamp) {
  const date = new Date(Number(timestamp))
  return date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
}

function formatTime(timestamp) {
  const date = new Date(Number(timestamp))
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}

// 通話方向與狀態圖示
function getDirectionIcon(type) {
  return require(`@/assets/icons/${type === '撥出' ? 'arrow-outgoing' : 'arrow-incoming'}.svg`)
}

function getCallIcon(duration) {
  return require(`@/assets/icons/${duration === '0' ? 'call-end' : 'call-received'}.svg`)
}

// 輸入框事件
function onFocus(e) {
  e.target.placeholder = ''
}
function onBlur(e) {
  if (!e.target.value) e.target.placeholder = 'Search...'
}

// 查詢電話資訊
async function handleSearch() {
  const number = searchQuery.value.trim()
  if (!number) {
    showAlert('請輸入電話號碼')
    return
  }

  try {
    const token = localStorage.getItem('userToken')
    const res = await axios.get(`/api/lookup/${number}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (res.data?.results) {
      router.push({
        path: '/search-phone',
        query: {
          number,
          data: encodeURIComponent(JSON.stringify(res.data.results))
        }
      })
    } else {
      showAlert('查無此號碼的任何資料')
    }
  } catch (err) {
    console.error('查詢失敗:', err)
    showAlert('查詢失敗，請稍後再試')
  }
}

// 初始掛載邏輯
onMounted(() => {
  window.CallLogReceiver = {
    receive: (data) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        callEntries.value = parsed
      } catch (e) {
        console.error('解析通話記錄失敗', e)
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
}

.header-icon {
  width: 39px;
  height: 33px;
}

.header-title {
  font-size: 20px;
  color: #000;
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
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar-container {
  width: 44px;
  height: 55px;
  position: relative;
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

.status-icon {
  width: 15px;
  height: 15px;
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
</style>
