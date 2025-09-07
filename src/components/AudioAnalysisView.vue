<template>
  <div class="audio-container" v-if="!modalVisible">
    <header class="header">
      <img class="icon" src="@/assets/icons/header-icon.svg" alt="icon" />
      <h1 class="header-title">錄音檔分析</h1>
    </header>

    <div class="actions">
  <input type="file" ref="fileInput" style="display: none" accept="audio/*" @change="handleUpload" />
  <button class="pill lg" @click="triggerUpload">上傳</button>
<button class="pill lg" @click="downloadLatest">下載</button>
<!-- 新增：手動開始/停止錄音 -->
<button class="pill lg" @click="startRecording">開始錄音</button>
<button class="pill lg" @click="stopRecording">停止錄音</button>
  


  <!-- 新增：自動錄來電 -->
  <label style="display:flex;align-items:center;gap:6px">
    <input type="checkbox" v-model="autoIncoming" @change="toggleAutoIncoming" />
    自動錄來電
  </label>
</div>

    <div class="audio-list">
      <div class="audio-item" v-for="(item, index) in audioFiles" :key="item.id || index">
        <div class="left">
          <img class="play-icon" src="@/assets/icons/play.svg" alt="play" @click="playAudio(item)"/>
          <div class="info">
            <div class="title" :title="item.originalFileName || item.fileName">
  {{ displayName(item) }}
</div>
            <div class="duration">{{ formatDuration(item.durationSeconds) }}</div>
            <div v-if="item.isScam !== null" class="risk">
              <img class="risk-icon" :src="getRiskIcon(item.isScam)" alt="risk" />
              <span class="reason">{{ item.isScam ? '疑似詐騙對話' : '無明顯風險' }}</span>
            </div>
            <!-- ✅ 音訊播放器：已載入才顯示 -->
      <div class="audio-player" v-if="item.showPlayer">
  <audio :src="item.audioUrl" controls autoplay></audio>
</div>
    </div>
  </div>
        <div class="right">
          <div class="button-group">
            <button class="pill sm primary" @click="showTranscription(item)">分析</button>
            <button class="pill sm danger"  @click="remove(index)">刪除</button>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue' 

const router = useRouter()
const fileInput = ref(null)
const audioFiles = ref([])
const autoIncoming = ref(false)

// ✅ 登入資訊
const token = localStorage.getItem('userToken')
const role = localStorage.getItem('userRole')
const userId = localStorage.getItem('userId')

// 如果 API 與前端不同源，開啟這行：
// axios.defaults.baseURL = 'http://localhost:7050'

// 用來保存 hook 的清理函式
let detachHooks = null

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
    const act = pendingAction.value; pendingAction.value = null; act() }
}
function onModalClose() {
  modalVisible.value = false
  const r = pendingResolve.value; pendingResolve.value = null
  // alert 視為已讀(true)；confirm 視為取消(false)
  r?.(modalMode.value === 'alert')
  if (pendingAction.value) {
    const act = pendingAction.value; pendingAction.value = null; act() }
}

/* =============== 工具 =============== */
const getErr = (err) =>
  err?.response?.data?.message ??
  (typeof err?.response?.data === 'string' ? err.response.data : null) ??
  err?.message ?? '發生未知錯誤'

/* =============== Android 掛勾：開始/停止錄音 & 自動錄來電 =============== */
const startRecording = () => {
  try {
    if (!window.Android?.startRecording) {
      return showAlert('此裝置不支援：缺少 Android.startRecording')
    }
    // number 讓 Android 自行判斷（去電用撥號號碼、來電用 lastRingingNumber）
    window.Android.startRecording('', 3) // 第二個參數=本次最多段數，Android 端會再依剩餘額度限縮
  } catch (e) {
    showAlert('啟動錄音失敗：' + (e?.message || e))
  }
}

const stopRecording = () => {
  try {
    if (!window.Android?.stopRecording) {
      return showAlert('此裝置不支援：缺少 Android.stopRecording')
    }
    window.Android.stopRecording()
  } catch (e) {
    showAlert('停止錄音失敗：' + (e?.message || e))
  }
}

const toggleAutoIncoming = async () => {
  try {
    if (!window.Android?.setAutoRecordIncoming) {
      autoIncoming.value = false
      return showAlert('此裝置不支援：缺少 Android.setAutoRecordIncoming')
    }
    window.Android.setAutoRecordIncoming(!!autoIncoming.value)
  } catch (e) {
    await showAlert('切換失敗：' + (e?.message || e))
  }
}

/* =============== Android 回拋（完成 / 額度用盡 / 上傳完成） =============== */
function attachAndroidHooks() {
  // 錄音完成（本機檔案生成）
  window.AudioReceiver = {
    receive: async (payload) => {
      try {
        const obj = JSON.parse(payload) // { number, files: [...] }
        await showAlert(`錄音完成：${obj.files?.length || 0} 段`)
        // 這裡不一定有入庫，真正入庫後 recording-uploaded 會再觸發刷新
      } catch (e) {
        console.error('AudioReceiver payload parse error', e)
      }
    }
  }

  // 2) 額度用盡事件：Android 端 dispatchEvent('recording-no-budget')
  const onUploaded = async (e) => {
    // e.detail: { ok, fail }
    await fetchAudioList()
    if (e?.detail?.fail > 0) {
      await showAlert(`有 ${e.detail.fail} 段上傳失敗`)
    }
  }
 window.addEventListener('recording-uploaded', async (e) => {
  await fetchAudioList()
  const d = e?.detail || {}
  if (d.fail > 0) {
    // 常見狀態碼對應
    const hint =
      d.code === 401 || d.code === 403 ? '（Token 失效或未授權）' :
      d.code === 400 ? '（參數錯誤，例如檔案格式）' :
      d.code === 415 ? '（Content-Type 不支援）' :
      d.code === 502 ? '（後端呼叫 Whisper 失敗）' :
      d.code === -1  ? '（裝置無網路或連線逾時）' : ''
    await showAlert(`有 ${d.fail} 段上傳失敗，code=${d.code} ${hint}\n${(d.msg || '').slice(0,160)}`)
  }
})

  // 回傳清理函式
  return () => {
    window.removeEventListener('recording-uploaded', onUploaded)
  }
}

/* =============== 播放（只允許單一播放器） =============== */
// 友善檔名顯示：優先用 originalFileName，否則清掉 UUID 前綴
function prettifyName(name) {
  if (!name) return ''
  // 去掉開頭 32~36 字元的十六進位/連字號 UUID 與可能的空白、底線
  return name.replace(/^[0-9a-fA-F-]{32,36}\s*[_-]?\s*/,'')
}
function shortText(text) {
  if (!text) return ''

  const dotIndex = text.lastIndexOf('.')
  const ext = dotIndex !== -1 ? text.slice(dotIndex) : ''
  const base = dotIndex !== -1 ? text.slice(0, dotIndex) : text

  if (base.length <= 6) {
    return base + ext
  }
  return base.slice(0, 6) + '…' + ext
}

function displayName(item) {
  const raw = item.originalFileName || item.fileName || ''
  return shortText(prettifyName(raw))
}


const playAudio = async (item) => {
  if (item.showPlayer) {
    item.showPlayer = false; return }
  audioFiles.value.forEach(f => (f.showPlayer = false))

  try {
    if (!item.audioUrl) {
      const res = await axios.get('/api/Test/download-local', {
        headers: { Authorization: `Bearer ${token}` },
        params: { fileName: item.fileName },
        responseType: 'blob'
      })
      item.audioUrl = URL.createObjectURL(res.data)
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
    if (fileInput.value) fileInput.value.value = ''
  }
}



/* =============== 撈取音檔清單 =============== */
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
    await showAlert('請先登入', true)
    return
  }
  if (router.currentRoute.value.query.loggedOut === 'true') {
    router.replace({ query: {} })
  }

  // Android 掛勾
  if (typeof window !== 'undefined') {
    detachHooks = attachAndroidHooks()
    // 讀取「自動錄來電」開關
    try {
      autoIncoming.value = !!window.Android?.getAutoRecordIncoming?.()
    } catch {
      //
      }
    // 把登入資訊告訴原生端（供自動上傳使用）
    try {
      window.Android?.setAuth(
  localStorage.getItem('userToken') || '',
  Number(localStorage.getItem('userId') || 0),
  'http://192.168.217.131:5001'  // ← API 站台。Android 上傳錄音會打這個
)

    } catch {
      //
    }
  }

  await fetchAudioList()
})

  // ✅ 在頂層註冊 onBeforeUnmount
onBeforeUnmount(() => { detachHooks?.() })
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

.pill{
  display:inline-flex; align-items:center; justify-content:center;
  border-radius: 9999px;
  border:1px solid #1a1a1a;
  background:#fff;
  font-weight: 700;
  cursor:pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,.16);
  padding: 8px 14px;         /* 基礎尺寸 */
  font-size: 14px;
  min-height: 36px;
  min-width: 80px;
}
.pill:hover{ box-shadow: 0 3px 8px rgba(0,0,0,.18); }

/* 大小開關 */
.pill.lg{ padding: 12px 18px; font-size:16px; min-height:44px; min-width:92px; }
.pill.sm{ padding: 6px 12px;  font-size:13px; min-height:32px; min-width:68px; }

/* 顏色開關（工具列用純白、列表中的操作用配色） */
.pill.primary{ background:#5a67d8; color:#fff; border-color:#3c4aa3; }
.pill.danger { background:#f8d7da; color:#721c24; border-color:#d3a3a7; }

/* 工具列排版（小螢幕自動換行） */
.actions{
  display:flex; flex-wrap:wrap; gap:10px; margin-top:8px;
}
.actions .pill{ flex:1 1 calc(50% - 10px); } /* 兩欄自動排版 */
@media (min-width: 420px){
.actions .pill{ flex:0 0 auto; }           /* 較寬時不強制兩欄 */
}

/* 檔名過長以…顯示 */
.title{
  font-weight: 700;
  font-size: 16px;
        /* max-width: 220px;依你的版面可調 */
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-weight: bold;
}

/* 列表內操作按鈕列 */
.button-group{
  display:flex; gap:8px; align-items:center;
}

/* 播放鍵若想更好點，加大一點 */
.play-icon { width: 44px; height: 44px; }
.timestamp {
  font-size: 12px;
  margin-top: 8px;
}
</style>
