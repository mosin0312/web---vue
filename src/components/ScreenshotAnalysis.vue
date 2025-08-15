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
      <div class="analysis-content">
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
    </section>

    <!-- Footer -->
    <footer class="footer">
      <label for="file-upload">
        <img src="@/assets/icons/up-pic.svg" alt="Upload" class="footer-icon" />
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
import { ref, onMounted, onBeforeUnmount } from 'vue'

const analysisItems = ref([
  { timestamp: "2025/04/17 17:50", risk: "high", image: require("@/assets/icons/pic.svg"), reason: "示例" },
  { timestamp: "2025/04/17 17:51", risk: "medium", image: require("@/assets/icons/pic.svg"), reason: "示例" },
  { timestamp: "2025/04/17 17:52", risk: "low", image: require("@/assets/icons/pic.svg"), reason: "示例" },
])

const previewImage = ref(null)
const lastPickedBlobUrl = ref("")
let onUploadDone = null

const getRiskIcon = (level) => {
  const icons = {
    high: require("@/assets/icons/risk-high.svg"),
    medium: require("@/assets/icons/risk-medium.svg"),
    low: require("@/assets/icons/risk-low.svg"),
    no: require("@/assets/icons/risk-no.svg"),
    unknown: require("@/assets/icons/risk-unknown.svg"),
  }
  return icons[level] || icons.unknown
}

const openPreview = (url) => {
  previewImage.value = url
}
const closePreview = () => {
  previewImage.value = null
}

const handleUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const previewUrl = URL.createObjectURL(file)
  lastPickedBlobUrl.value = previewUrl

  const formData = new FormData()
  formData.append("file", file)

  try {
    const token = localStorage.getItem("userToken") || ""

    const res = await fetch("/api/Test/upload-image3", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    const raw = await res.text()
    let result = {}
    try {
      result = JSON.parse(raw)
    } catch {
      // 無法解析 JSON 時忽略錯誤，保留空物件
    }

    if (!res.ok) throw new Error(result.message || `HTTP ${res.status} ${raw}`)

    const risk = result.isScam ? "low" : "no"
    const reason = Array.isArray(result.matchedKeywords) && result.matchedKeywords.length
      ? result.matchedKeywords.join("、")
      : "未偵測到風險"

    analysisItems.value.push({
      timestamp: new Date().toLocaleString(),
      risk,
      image: previewUrl,
      reason,
    })
  } catch (err) {
    console.error("upload-image3 失敗：", err)
    analysisItems.value.push({
      timestamp: new Date().toLocaleString(),
      risk: "unknown",
      image: previewUrl,
      reason: "圖片分析失敗",
    })
  }
}

onMounted(() => {
  onUploadDone = (e) => {
    const r = e.detail || {}
    const risk =
      r.riskLevel ||
      (Array.isArray(r.matchedKeywords) && r.matchedKeywords.length ? "low" : "no")
    const reason =
      Array.isArray(r.matchedKeywords) && r.matchedKeywords.length
        ? r.matchedKeywords.join("、")
        : (r.success === false ? (r.message || "圖片分析失敗") : "未偵測到風險")

    analysisItems.value.push({
      timestamp: new Date().toLocaleString(),
      risk,
      image: lastPickedBlobUrl.value || "",
      reason,
    })
    lastPickedBlobUrl.value = ""
  }
  window.addEventListener("upload-image3-done", onUploadDone)
})

onBeforeUnmount(() => {
  if (onUploadDone) {
    window.removeEventListener("upload-image3-done", onUploadDone)
  }
})
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