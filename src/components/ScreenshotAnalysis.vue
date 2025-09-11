<template>
  <main class="screenshot-analysis">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="icon-container" @click="$router.back()">
          <img src="@/assets/icons/comeback.svg" alt="Back" class="header-icon" />
        </div>
        <h1 class="title">截圖分析</h1>
      </div>
    </header>

    <!-- Content -->
    <section class="content-container">
      <!-- ⬇⬇ 這層是滾動容器 ⬇⬇ -->
      <div class="analysis-content" ref="listRef" @scroll="onListScroll">
        <div
          class="analysis-items"
          v-for="(item, idx) in analysisItems"
          :key="idx"
        >
          <!-- 圖片 + 圖片時間（靠右） -->
          <div class="image-timestamp-row">
            <time class="timestamp">{{ item.timestamp }}</time>
            <img
              :src="item.image"
              class="image-preview"
              alt="Screenshot"
              @click="openPreview(item.image)"
            />
          </div>

          <!-- 氣泡 + 氣泡時間（靠左，並排） -->
          <div class="message-row">
            <div class="message-bubble">
              <img :src="getRiskIcon(item.risk)" class="risk-icon" />
              <span class="risk-reason">{{ item.reason || '—' }}</span>
            </div>
            <time class="message-timestamp">{{ item.timestamp }}</time>
          </div>
        </div>
      </div>
      <!-- ⬆⬆ 這層是滾動容器 ⬆⬆ -->
    </section>

    <!-- Footer -->
    <footer class="footer" >
      <label for="file-upload" >
        <img src="@/assets/icons/up-pic.svg" alt="Upload" class="footer-icon"    />
      </label>
      <input id="file-upload" type="file" @change="handleUpload" accept="image/*" hidden />
    </footer>

    <!-- 圖片預覽 Modal -->
    <div v-if="previewImage" class="modal-overlay" @click.self="closePreview">
        <div class="modal-content">
    <img :src="previewImage" class="modal-image" />
        </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue' 

const analysisItems = ref([
  { timestamp: '2025/04/17 17:50', risk: 'high',   image: require('@/assets/icons/pic.svg'), reason: '示例', riskLevelText: '高風險', riskScore: 80, text: '' },
  { timestamp: '2025/04/17 17:51', risk: 'medium', image: require('@/assets/icons/pic.svg'), reason: '示例', riskLevelText: '中風險', riskScore: 50, text: '' },
  { timestamp: '2025/04/17 17:52', risk: 'low',    image: require('@/assets/icons/pic.svg'), reason: '示例', riskLevelText: '低風險', riskScore: 20, text: '' },
])

const previewImage = ref(null)
const lastPickedBlobUrl = ref('')
let onUploadDone = null
const isUploading = ref(false)

const getRiskIcon = (level) => {
  const icons = {
    high:    require('@/assets/icons/risk-high.svg'),
    medium:  require('@/assets/icons/risk-medium.svg'),
    low:     require('@/assets/icons/risk-low.svg'),
    no:      require('@/assets/icons/risk-no.svg'),
    unknown: require('@/assets/icons/risk-unknown.svg'),
  }
  return icons[level] || icons.unknown
}

const openPreview = (url) => { previewImage.value = url }
const closePreview = () => { previewImage.value = null }

// -------- 共用：解析後端回傳，對齊最新 API --------
function normalizeApiResult(raw) {
  // 可能的欄位名（新/舊大小寫）
  const RiskScore = raw.RiskScore ?? raw.riskScore
  const RiskLevel = raw.RiskLevel ?? raw.riskLevel
  const Severity  = raw.Severity  ?? raw.severity
  const matchedKeywords = raw.MatchedKeywords ?? raw.matchedKeywords ?? []
  const matchedScamUrls = raw.MatchedScamUrls ?? raw.matchedScamUrls ?? []
  const textArray = Array.isArray(raw.extractedText) ? raw.extractedText
                   : Array.isArray(raw.text) ? raw.text
                   : []

  // 風險等級（中文顯示）與圖示 token（英文）
  let riskLevelText = RiskLevel
  let riskToken = 'no'
  if (riskLevelText) {
    if (riskLevelText.includes('高')) riskToken = 'high'
    else if (riskLevelText.includes('中')) riskToken = 'medium'
    else if (riskLevelText.includes('低')) riskToken = 'low'
    else riskToken = 'no'
  } else if (typeof RiskScore === 'number') {
    // 從分數推回等級
    riskLevelText = RiskScore >= 70 ? '高風險'
                  : RiskScore >= 40 ? '中風險'
                  : RiskScore > 0    ? '低風險'
                  : '無風險'
    riskToken = RiskScore >= 70 ? 'high'
              : RiskScore >= 40 ? 'medium'
              : RiskScore > 0   ? 'low'
              : 'no'
  } else {
    // 舊回傳：只有 isScam / matchedKeywords
    const isScam = !!raw.isScam || (Array.isArray(matchedKeywords) && matchedKeywords.length > 0)
    riskLevelText = isScam ? '低風險' : '無風險'
    riskToken = isScam ? 'low' : 'no'
  }

  // 顯示用原因：關鍵字/165 命中/嚴重度
  const kwPart = (Array.isArray(matchedKeywords) && matchedKeywords.length)
    ? `關鍵字：${matchedKeywords.join('、')}` : ''
  const urlPart = (Array.isArray(matchedScamUrls) && matchedScamUrls.length)
    ? `；165命中：${matchedScamUrls.join('、')}` : ''
  const sevPart = Severity ? `；${Severity}` : ''
  const reason = (kwPart + urlPart + sevPart) || (raw.success === false ? (raw.message || '圖片分析失敗') : '未偵測到風險')

  // 文字預覽
  const textPreview = textArray.join(' ').slice(0, 80)

  return {
    riskToken,
    riskLevelText,
    riskScore: typeof RiskScore === 'number' ? RiskScore : null,
    reason,
    textPreview,
    matchedKeywords,
    matchedScamUrls,
  }
}

// 長任務友善的 fetch（含逾時）
async function fetchWithTimeout(resource, options = {}) {
  const { timeoutMs = 5 * 60 * 1000, ...rest } = options // 預設 5 分鐘
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(resource, { ...rest, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

const handleUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const previewUrl = URL.createObjectURL(file)
  lastPickedBlobUrl.value = previewUrl

  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('userToken') || ''
  isUploading.value = true

  try {
    const res = await fetchWithTimeout('/api/Test/upload-image3', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }, // 讓瀏覽器自己帶 boundary
      body: formData,
      timeoutMs: 5 * 60 * 1000,
    })

    const rawText = await res.text()
    let data = {}
    try { data = JSON.parse(rawText) } catch { /* 保持空物件，下面丟錯 */}
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status} ${rawText}`)

    const norm = normalizeApiResult(data)

    analysisItems.value.push({
      timestamp: new Date().toLocaleString(),
      risk: norm.riskToken,           // 給圖示用：high/medium/low/no/unknown
      riskLevelText: norm.riskLevelText, // 顯示用：高/中/低/無風險
      riskScore: norm.riskScore,      // 可能為 null（舊回傳）
      image: previewUrl,
      reason: norm.reason,
      text: norm.textPreview,
      keywords: norm.matchedKeywords,
      urls: norm.matchedScamUrls,
    })
  } catch (err) {
    console.error('upload-image3 失敗：', err)
    analysisItems.value.push({
      timestamp: new Date().toLocaleString(),
      risk: 'unknown',
      riskLevelText: '辨識失敗',
      riskScore: null,
      image: previewUrl,
      reason: '圖片分析失敗',
      text: '',
      keywords: [],
      urls: [],
    })
  } finally {
    isUploading.value = false
    // 清空 input（避免同檔名無法再次觸發 change）
    if (e.target) e.target.value = ''
  }
}

// 若你在原生端會 dispatch 'upload-image3-done' 事件，也支援新欄位
onMounted(() => {
  onUploadDone = (ev) => {
    const r = ev.detail || {}
    const norm = normalizeApiResult(r)
    analysisItems.value.push({
      timestamp: new Date().toLocaleString(),
      risk: norm.riskToken,
      riskLevelText: norm.riskLevelText,
      riskScore: norm.riskScore,
      image: lastPickedBlobUrl.value || '',
      reason: norm.reason,
      text: norm.textPreview,
      keywords: norm.matchedKeywords,
      urls: norm.matchedScamUrls,
    })
    lastPickedBlobUrl.value = ''
  }
  window.addEventListener('upload-image3-done', onUploadDone)
})

onBeforeUnmount(() => {
  if (onUploadDone) window.removeEventListener('upload-image3-done', onUploadDone)
})

// ===== 自動捲底相關 =====
const listRef = ref<HTMLElement | null>(null)    // 訊息列表容器
const autoStickBottom = ref(true)                // 是否自動黏底（用戶手動往上捲時會關閉）
const BOTTOM_THRESHOLD = 40                      // 視為「靠近底部」的容忍像素

const isNearBottom = () => {
  const el = listRef.value
  if (!el) return true
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight
  return distance <= BOTTOM_THRESHOLD
}

const scrollToBottom = (smooth = true) => {
  const el = listRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
}

const onListScroll = () => {
  // 只要不在底部，就暫停自動黏底；回到底部再恢復
  autoStickBottom.value = isNearBottom()
}

// 初次掛載後捲到底（避免有預設訊息但一開始沒在底部）
onMounted(() => nextTick(() => scrollToBottom(false)))

// 只要「項目數」改變（新增一筆），就視情況捲到底
watch(
  () => analysisItems.value.length,
  async () => {
    // 若用戶目前靠近底部，或已開啟自動黏底，就捲到底
    if (autoStickBottom.value || isNearBottom()) {
      await nextTick()
      scrollToBottom(true)
    }
  }
)
</script>






<style scoped>
.screenshot-analysis {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  max-width: 100%;
  background: linear-gradient(180deg, #d3e9b8 0%, #fff 100%);
  justify-content: space-between;
  box-sizing: border-box;
}

/* Header */
.header {
  width: 100%;
  background: #fff;
}

.header-content {
  display: flex;
  padding: 8px 16px;
  align-items: center;
  gap: 8px;
}

.icon-container {
  width: 40px;
  height: 40px;
}

.header-icon {
  width: 100%;
  height: 100%;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin: 0;
}

/* Content */
.content-container {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  box-sizing: border-box;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Image */
.image-timestamp-row {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 6px;
}

.timestamp {
  font-size: 8px;
  color: #000;
  margin-bottom: 4px;
}

.image-preview {
  width: 126px;
  height: 148px;
}

/* Message Row */
.message-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 10px;
  gap: 8px;
}

/* 氣泡 */
.message-bubble {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: white;
  border-radius: 14px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  max-width: 240px;
}

.risk-icon {
  width: 16px;
  height: 16px;
}

.risk-reason {
  font-size: 12px;
  font-family: Inter, sans-serif;
  color: #000;
}

.message-timestamp {
  font-size: 8px;
  color: #000;
  font-family: Inter, sans-serif;
  white-space: nowrap;
}

/* Footer */
.footer {
  width: 100%;
  padding: 12px 0;
  background: #d3e9b8;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-icon {
  width: 24px;
  height: 24px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-content {
  background: white;
  padding: 10px;
  border-radius: 10px;
  max-width: 90%;
}
.modal-image {
  max-width: 100%;
  max-height: 80vh;
}

</style>