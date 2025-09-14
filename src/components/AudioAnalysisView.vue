 
<template>
  <div class="viewport-fit">
    <div class="audio-container">
      <header class="header">
        <img class="icon" src="@/assets/icons/header-icon.svg" alt="icon" />
        <h1 class="header-title">錄音檔分析</h1>
      </header>

      <div class="actions">
        <input type="file" ref="fileInput" style="display: none" accept="audio/*" @change="handleUpload" />
        <button class="pill lg" @click="triggerUpload">上傳錄音檔並分析</button>

        <!-- 新增：自動錄來電 -->
        <label style="display:flex;align-items:center;gap:6px"></label>
        <!-- <input type="checkbox" v-model="autoIncoming" @change="toggleAutoIncoming" /> 自動錄來電 -->
      </div>

      <div class="recording-page">
        <!-- 儲存位置提示（保留註解） -->
        <!--
        <section class="storage-hint">
          <div class="hint-line">
            <span class="hint-title">電話錄音儲存位置</span>
            <div class="hint-path-row">
              <span class="hint-path wrap" :title="dirPath || '（錄音完成後會顯示儲存位置）'">
                {{ dirPath || '（錄音完成後會顯示儲存位置）' }}
              </span>
            </div>
          </div>
          <p class="hint-note">錄音檔僅儲存在本機裝置，不會上傳伺服器。</p>
        </section>
        -->
      </div>

      <div class="audio-list">
        <div class="audio-item" v-for="(item, index) in audioFiles" :key="item.id || index">
          <div class="left">
            <img class="play-icon" src="@/assets/icons/play.svg" alt="play" @click="playAudio(item)" />
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
              <div class="audio-player push-left" v-if="item.showPlayer">
                <audio :src="item.audioUrl" controls></audio>
              </div>

              <div class="timestamp">{{ formatDate(item.createdAt || item.uploadedAt || item.analyzedAt) }}</div>
            </div>
          </div>

          <div class="right">
            <div class="button-group">
              <button class="pill sm primary" @click.stop="showTranscription(item)">分析結果</button>
              <button class="pill ms" @click.stop="downloadAudio(item)">下載</button>
              <button class="pill ms danger" @click="removeAudio(item, index)">刪除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 文字分析 Modal（舊版） -->
      <div v-if="legacyModalVisible" class="modal-overlay" @click.self="legacyModalVisible = false">
        <div class="modal-content" @click.stop>
          <h3>分析文字</h3>
          <pre class="transcription">{{ currentTranscription }}</pre>
          <button class="pill sms" @click.stop="legacyModalVisible = false">關閉</button>
        </div>
      </div>

      <!-- 提示框 -->
      <AlertModal
        :visible="modalVisible"
        :message="modalMessage"
        :mode="modalMode"
        @confirm="onModalConfirm"
        @close="onModalClose"
      />
    </div>
  </div>
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
const dirPath = ref('')

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
  // 互斥：開 alert 前先關 legacy
  legacyModalVisible.value = false

  modalMessage.value = message
  modalMode.value = 'alert'
  modalVisible.value = true
  pendingAction.value = redirectToLogin ? (() => router.push('/')) : null
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

/* =============== 自動錄來電 =============== */

// const toggleAutoIncoming = async () => {
//   try {
//     if (!window.Android?.setAutoRecordIncoming) {
//       autoIncoming.value = false
//       return showAlert('此裝置不支援：缺少 Android.setAutoRecordIncoming')
//     }
//     window.Android.setAutoRecordIncoming(!!autoIncoming.value)
//   } catch (e) {
//     await showAlert('切換失敗：' + (e?.message || e))
//   }
// }

/* =============== Android 回拋（完成 / 額度用盡 / 上傳完成） =============== */


function attachAndroidHooks() {
  const filenameFromUri = (u) => {
    try {
      const last = u.split('/').pop() || ''
      // content://… 不一定有副檔名；保留字串即可
      return decodeURIComponent(last) || '錄音檔'
    } catch { return '錄音檔' }
  }

  const onSaved = (e) => {
    const d = e?.detail || {}
    // 顯示「電話錄音儲存位置」
    dirPath.value = d.publicDir || d.dir || 'Music/來訊有詐/records-data'

    // 把本機錄音（content:// URI）塞進現有清單
    const uris = Array.isArray(d.uris) ? d.uris : []
    const items = uris.map(u => ({
      id: null,
      fileName: filenameFromUri(u),
      originalFileName: filenameFromUri(u),
      durationSeconds: null,
      isScam: null,
      showPlayer: false,
      audioUrl: u,   // 直接保存 content://
      _local: true,  // ← 標記「本機檔」
    }))
    // 新的放最前面
    audioFiles.value.unshift(...items)
  }

  window.addEventListener('recording-saved', onSaved)
  return () => window.removeEventListener('recording-saved', onSaved)
}

onMounted(() => {
  detachHooks = attachAndroidHooks()
})
/* =============== 播放（只允許單一播放器） =============== */
// 檔名顯示：優先用 originalFileName，否則清掉 UUID 前綴
function prettifyName(name) {
  if (!name) return ''
  // 去掉開頭 32~36 字元的十六進位/連字號 UUID 與可能的空白、底線
  return name.replace(/^[0-9a-fA-F-]{32,36}\s*[_-]?\s*/,'')
}
function shortText(text, max = 10) {
  if (!text) return ''

  const dotIndex = text.lastIndexOf('.')
  const ext = dotIndex !== -1 ? text.slice(dotIndex) : ''
  const base = dotIndex !== -1 ? text.slice(0, dotIndex) : text

  if (base.length <= max) {
    return base + ext
  }
  return base.slice(0, max) + '…' + ext
}

function displayName(item) {
  const raw = item.originalFileName || item.fileName || ''
  // 這裡你就可以傳 max =5
  return shortText(prettifyName(raw), 5)
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
    // 先清理（後端新規範：應在查看列表前）
    await cleanupAudios(3)

    const res = await axios.get(`/api/Test/user/${userId}/audios`, {
      headers: authHeaders
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

// =======================
// 刪除單筆
// =======================
const removeAudio = async (item, index) => {
  const ok = await showConfirm('確定要移除此項目？')
  if (!ok) return

  try {
    await axios.delete('/api/Test/audios/delete', {
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      data: {
        id: item.id,                    // 後端需要 Id
        userId: Number(userId || 0)     // 後端要驗證 UserId
      }
    })

    audioFiles.value.splice(index, 1)
    await showAlert('刪除完成')
  } catch (err) {
    await showAlert('刪除失敗：' + getErr(err))
  }
}

/* =============== 下載最新檔案 =============== */
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(blob) // 會得到 data:xxx;base64,xxxx
  })

const downloadAudio = async (item) => {
  try {
    // 一樣先把音檔抓成 blob
    const res = await axios.get('/api/Test/download-local', {
      headers: { Authorization: `Bearer ${token}` },
      params: { fileName: item.fileName },
      responseType: 'blob'
    })
    const mime = res.data?.type || 'audio/mp4'
    const b64  = await blobToBase64(res.data)

    if (window.Android?.saveToDownloadsBase64) {
      // 丟給原生存到「下載/來訊有詐」
      window.Android.saveToDownloadsBase64(item.fileName || 'record.m4a', b64, mime)
    } else {
      // H5 後備：用 <a download>（在 WebView 未必會落到 Downloads）
      const blobUrl = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = item.fileName || 'record.m4a'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    }
  } catch (err) {
    await showAlert('下載失敗：' + getErr(err))
  }
}



/* =============== 其他功能 =============== */

// 控制「分析文字」區塊
const legacyModalVisible = ref(false)
const currentTranscription = ref('')

// 一律用同一個視窗顯示，不再呼叫 showAlert
const showTranscription = (item) => {
  // 互斥：關掉 AlertModal，避免被蓋住
  modalVisible.value = false
  modalMessage.value = ''

  const text = (item?.transcription ?? '').toString().trim()
  currentTranscription.value = text || '尚未有分析文字'
  legacyModalVisible.value = true
}

const authHeaders = { Authorization: `Bearer ${token}` }
// =======================
// 清理過期音檔（預設 3 天）
// =======================
const cleanupAudios = async (days = 3) => {
  try {
    await axios.delete('/api/Test/audios/cleanup', {
      headers: authHeaders,
      params: { days }
    })
  } catch (e) {
    // 清理失敗不阻擋後續流程，但給個提示
    console.warn('cleanupAudios failed:', getErr(e))
  }
}

const getRiskIcon = (isScam) => {
  if (isScam === true) return new URL('@/assets/icons/risk-high.svg', import.meta.url).href
  if (isScam === false) return new URL('@/assets/icons/risk-low.svg', import.meta.url).href
  return new URL('@/assets/icons/risk-unknown.svg', import.meta.url).href
}

const toLocalDate = (t) => {
  if (!t) return null
  if (typeof t === 'number') return new Date(t > 1e12 ? t : t * 1000) // 秒→毫秒
  let s = String(t).trim().replace(' ', 'T') // "YYYY-MM-DD HH:mm:ss" → ISO 風格
  // 若沒有時區資訊，視為 UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) && !/(?:[zZ]|[+-]\d{2}:\d{2})$/.test(s)) s += 'Z'
  const d = new Date(s)
  return isNaN(+d) ? null : d
}
const formatDate = (t) => {
  const d = toLocalDate(t)
  if (!d) return ''
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  const hh = String(d.getHours()).padStart(2,'0')
  const mi = String(d.getMinutes()).padStart(2,'0')
  return `${d.getFullYear()}/${mm}/${dd} ${hh}:${mi}`
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
  'http://192.168.217.153:5001' //  API 站台
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
  min-height: 100vh;
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
  gap: 3px;
  font-size: 10px;
  margin-top: 4px;
}
.risk-icon {
  width: 13px;
  height: 13px;
}
.reason {
  font-size: 10px;
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
.pill.lg{ padding: 12px 18px; font-size:13px; min-height:30px; min-width:50px; }
.pill.ms{ padding: 6px 12px; font-size:10px; min-height:30px; min-width:60px; }
.pill.sm{ padding: 6px 12px;  font-size:10px; min-height:30px; min-width:65px; }
/* 顏色開關（工具列用純白、列表中的操作用配色） */
.pill.primary{ background:#5a67d8; color:#fff; border-color:#3c4aa3; }
.pill.danger { background:#f8d7da; color:#721c24; border-color:#d3a3a7; }
.pill.sms {
  align-self: center;       /* 置中 */
  margin-top: auto;         /* 推到底部 */
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  background-color: #4c82f0;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

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
  font-size: 14px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-weight: bold;
}

/* 列表內操作按鈕列 */
.button-group{
  display:flex; gap:3px; align-items:center;
}


/* 播放鍵若想更好點，加大一點 */
.play-icon { width: 40px; height: 40px; }

/* 只把整塊往左推一點，同時補右邊空間避免被裁掉 */
.audio-item { overflow: hidden; }
.audio-player.push-left { 
  margin-top: 8px;
  margin-left: -30px; 
  padding-right: 8px; } /* -6~-12px 自行微調 */


.timestamp {
  font-size: 12px;
  margin-top: 8px;
}

.modal-overlay{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.4);
  display:flex; align-items:center; justify-content:center;
  z-index: 10000;
}
.modal-content {
  background: #fff;
  width: min(90vw, 360px);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,.18);

  display: flex;
  flex-direction: column;
  max-height: 70vh;   /* 限制高度，避免文字太長撐爆 */
}

.transcription {
  flex: 1;                  /* 撐開剩餘空間 */
  overflow-y: auto;         /* 長文字可捲動 */
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 12px;
}

.storage-hint {
  background: #f6f7fb;
  border: 1px solid #e3e6f0;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 14px;
}
.hint-line { display: flex; flex-direction: column; gap: 4px; }
.hint-path-row{
  display:flex; align-items:center; gap:.5rem; max-width:100%;
}
.hint-path{
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.hint-path.wrap{
  overflow-wrap:anywhere;   /* 長字可在任何位置換行 */
  word-break:break-all;     /* 備援：必要時強制換行 */
}
.hint-note { margin: 6px 0 0; font-size: 12px; color: #666; }

.rec-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.rec-item { border: 1px solid #eee; border-radius: 10px; padding: 10px; }
.rec-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rec-name { font-size: 14px; font-weight: 500; }
.rec-play { padding: 6px 10px; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
.rec-audio { width: 100%; margin-top: 8px; }
.recording-page{
  margin-top: 8px;
  margin-bottom: 8px;
  width: 99.5%;   /* 螢幕大時最多 900px，小螢幕吃 92% 寬 */
  margin: 8px auto;          /* 置中 */
}

</style>


