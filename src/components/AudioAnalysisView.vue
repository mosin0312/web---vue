<template>
  <div class="audio-container" v-if="!modalVisible">
    <header class="header">
      <img class="icon" src="@/assets/icons/header-icon.svg" alt="icon" />
      <h1 class="header-title">錄音檔分析</h1>
    </header>

    <div class="actions">
      <input type="file" ref="fileInput" style="display: none" accept="audio/*" @change="handleUpload" />
      <button class="btn" @click="triggerUpload">上傳</button>
      <button class="btn" @click="downloadLatest">下載</button>
    </div>

    <div class="audio-list">
      <div class="audio-item" v-for="(item, index) in audioFiles" :key="item.id || index">
        <div class="left">
          <img class="play-icon" src="@/assets/icons/play.svg" alt="play" @click="playAudio(item)"/>
          <div class="info">
            <div class="title">{{ item.fileName }}</div>
            <div class="duration">{{ formatDuration(item.durationSeconds) }}</div>
            <div v-if="item.isScam !== null" class="risk">
              <img class="risk-icon" :src="getRiskIcon(item.isScam)" alt="risk" />
              <span class="reason">{{ item.isScam ? '疑似詐騙對話' : '無明顯風險' }}</span>
            </div>
            <!-- ✅ 音訊播放器：已載入才顯示 -->
      <div class="audio-player" v-if="item.audioUrl">
        <audio :src="item.audioUrl" controls></audio>
      </div>
    </div>
  </div>
        <div class="right">
          <div class="button-group">
            <button class="small" @click="showTranscription(item)">分析</button>
            <button class="small-del" @click="remove(index)">刪除</button>
          </div>
          <div class="timestamp">{{ formatDate(item.analyzedAt) }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 登入提示 Modal -->
  <div v-if="modalVisible" class="modal-overlay">
    <div class="modal-content">
      <p>{{ modalMessage }}</p>
      <button @click="confirmAlert">確定</button>
    </div>
  </div>
  <AlertModal
  :visible="modalVisible"
  :message="modalMessage"
  @confirm="onModalConfirm"
  @close="onModalClose"
/>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue'

const router = useRouter()
const fileInput = ref(null)
const audioFiles = ref([])

// ✅ 登入資訊
const token = localStorage.getItem('userToken')
const role = localStorage.getItem('userRole')
const userId = localStorage.getItem('userId')

/* =========================
 * Modal（可 await 的 alert/confirm）
 * ========================= */
const modalVisible = ref(false)
const modalMessage = ref('')
const pendingAction = ref(null)        // 舊：用來做導頁等後續動作（選用）
const modalMode = ref('alert')         // 'alert' | 'confirm'
const pendingResolve = ref(null)       // 新：回傳 Promise 用

// 只有「確定」的提示（按確定或關閉都 resolve(true)）
function showAlert(message, redirectToLogin = false) {
  modalMessage.value = message
  modalMode.value = 'alert'
  modalVisible.value = true
  pendingAction.value = redirectToLogin ? (() => router.push('/login')) : null
  return new Promise((resolve) => { pendingResolve.value = resolve })
}

// 確認（按確定 resolve(true)，關閉/點背景/X resolve(false)）
function showConfirm(message) {
  modalMessage.value = message
  modalMode.value = 'confirm'
  modalVisible.value = true
  pendingAction.value = null
  return new Promise((resolve) => { pendingResolve.value = resolve })
}

// AlertModal：按「確定」
function onModalConfirm() {
  modalVisible.value = false
  const r = pendingResolve.value; pendingResolve.value = null
  r?.(true)
  // 有設定後續動作（例如登入導頁）就執行
  if (pendingAction.value) {
    const act = pendingAction.value
    pendingAction.value = null
    act()
  }
}

// AlertModal：關閉（點背景 / X）
function onModalClose() {
  modalVisible.value = false
  const r = pendingResolve.value; pendingResolve.value = null
  // alert 視為已讀(true)；confirm 視為取消(false)
  r?.(modalMode.value === 'alert')
  if (pendingAction.value) {
    const act = pendingAction.value
    pendingAction.value = null
    act()
  }
}

/* =============== 工具 =============== */
const getErr = (err) =>
  err?.response?.data?.message ??
  (typeof err?.response?.data === 'string' ? err.response.data : null) ??
  err?.message ?? '發生未知錯誤'

/* =============== 播放（只允許單一播放器） =============== */
const playAudio = async (item) => {
  if (item.showPlayer) {
    item.showPlayer = false
    return
  }
  audioFiles.value.forEach(f => (f.showPlayer = false))

  try {
    if (!item.audioUrl) {
      const res = await axios.get('/api/Test/download-local', {
        headers: { Authorization: `Bearer ${token}` },
        params: { fileName: item.fileName },
        responseType: 'blob'
      })
      const blob = res.data
      item.audioUrl = URL.createObjectURL(blob)
    }
    item.showPlayer = true
  } catch (err) {
    await showAlert('音檔載入失敗：' + getErr(err))
  }
}

/* =============== 上傳檔案 =============== */
const triggerUpload = () => fileInput.value?.click()

const handleUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)
  formData.append('userId', userId || 0)

  try {
    await axios.post('/api/Test/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    await fetchAudioList()
    await showAlert('上傳與分析完成')
  } catch (err) {
    await showAlert('上傳失敗：' + getErr(err))
  } finally {
    // 允許同一檔名再次選取
    if (fileInput.value) fileInput.value.value = ''
  }
}

/* =============== 撈取音檔清單（新路徑） =============== */
const fetchAudioList = async () => {
  try {
    const res = await axios.get(`/api/Test/user/${userId}/audios`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    audioFiles.value = (res.data || []).map(x => ({
      ...x,
      showPlayer: false,
      audioUrl: null
    }))
  } catch (e) {
    await showAlert('沒有分析記錄')
  }
}

/* =============== 下載最新檔案 =============== */
const downloadLatest = async () => {
  if (!audioFiles.value.length) return void (await showAlert('無檔案可下載'))
  const latest = audioFiles.value[0]
  try {
    const res = await axios.get('/api/Test/download-local', {
      headers: { Authorization: `Bearer ${token}` },
      params: { fileName: latest.fileName },
      responseType: 'blob'
    })
    const blobUrl = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = latest.fileName || 'audio'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  } catch (err) {
    await showAlert('下載失敗：' + getErr(err))
  }
}

/* =============== 其他功能 =============== */
const showTranscription = async (item) => {
  await showAlert(item.transcription || '尚未有分析文字')
}
const remove = async (index) => {
  const ok = await showConfirm('確定要移除此項目？')
  if (!ok) return
  audioFiles.value.splice(index, 1)
}
const getRiskIcon = (isScam) => {
  if (isScam === true) return new URL('@/assets/icons/risk-high.svg', import.meta.url).href
  if (isScam === false) return new URL('@/assets/icons/risk-low.svg', import.meta.url).href
  return new URL('@/assets/icons/risk-unknown.svg', import.meta.url).href
}
const formatDate = (dt) => {
  if (!dt) return ''
  const d = new Date(dt)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
const formatDuration = (sec) => {
  const m = Math.floor((sec || 0) / 60)
  const s = Math.floor((sec || 0) % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* =============== 初始化 =============== */
onMounted(async () => {
  if (!token || role !== 'User') {
    await showAlert('請先登入', true) // 按「確定」後導到 /login
    return
  }
  if (router.currentRoute.value.query.loggedOut === 'true') {
    router.replace({ query: {} })
  }
  await fetchAudioList()
})
</script>





<style scoped>
.audio-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #dcf5ff, #ffffff);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative; 
  overflow-x: hidden;
}
.header {
  width: 100%;
  height: 40px;
  padding: 2px 17px;
  display: flex;
  align-items: center;
  gap: 7px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.icon {
  width: 40px;
  height: 40px;
}
.header-title {
  font-size: 20px;
  color: #000;
  font-weight: 700;
  margin: 0;
}
.actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}
.btn {
  padding: 8px 12px;
  border: 1px solid black;
  border-radius: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
.audio-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-bottom: 10px;
}
.audio-item {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
}
.left {
  display: flex;
  gap: 10px;
}
.play-icon {
  width: 40px;
  height: 40px;
}
.info {
  display: flex;
  flex-direction: column;
}
.title {
  font-weight: bold;
  font-size: 16px;
}
.duration {
  font-size: 14px;
  color: #333;
}
.risk {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-top: 4px;
}
.risk-icon {
  width: 16px;
  height: 16px;
}
.reason {
  font-size: 12px;
  color: #cc0000;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}
.button-group {
  display: flex;
  gap: 5px;
}
.small {
  padding: 6px 10px;
  border: 1px solid black;
  border-radius: 20px;
  background: #5a67d8;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}
.small-del {
  padding: 6px 10px;
  border: 1px solid black;
  border-radius: 20px;
  background-color: #f8d7da;
  color: #721c24;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}
.timestamp {
  font-size: 12px;
  margin-top: 8px;
}
</style>
