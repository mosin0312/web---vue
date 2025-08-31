<template>
  <div class="main-container">
    <div class="title-menberdata">
      <div class="menberdata-image">
        <img src="@/assets/icons/comeback.svg" alt="Logo" class="header-icon" @click="goBack" />
        <span class="header-title">疑似詐騙資訊</span>
      </div>
    </div>

    <div class="frame">
      <div class="frame-1">
        <!-- 摘要 -->
        <div class="input-group">
          <label class="input-label">摘要</label>
          <input
            type="text"
            class="input-field"
            v-model="summary"
            placeholder="請輸入摘要 (最多20字元)"
            maxlength="20"
          />
        </div>

        <!-- 連結 -->
        <div class="input-group">
          <label class="input-label">連結</label>
          <input type="url" class="input-field" v-model="link" placeholder="請輸入文章連結" />
        </div>

        <!-- 圖片上傳 -->
        <div class="upload-section">
          <label class="input-label">圖片</label>
          <button class="upload-button" @click="$refs.fileInput.click()">上傳</button>
          <input id="file-upload" type="file" ref="fileInput" @change="handleUpload" accept="image/*" hidden />
        </div>

        <!-- 預覽圖 -->
        <div v-if="previewUrl" class="preview-section">
          <img :src="previewUrl" alt="預覽圖片" class="preview-image" />
        </div>

        <!-- 描述 -->
        <div class="input-group">
          <label class="input-label">描述</label>
          <textarea class="input-field textarea" v-model="description" placeholder="請描述疑似詐騙的內容"></textarea>
        </div>
      </div>

      <!-- 回報 -->
      <div class="confirm">
        <button class="confirm-button" @click="handleSubmit">回報</button>
      </div>
    </div>

    <!-- Alert Modal -->
    <AlertModal
      :visible="showModal"
      :message="modalMessage"
      @close="onModalClose"
      @confirm="onModalConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AlertModal from '@/components/AlertModal.vue'

const router = useRouter()
const goBack = () => router.back()

// 表單狀態
const summary = ref('')
const link = ref('')
const description = ref('')
const imageUrl = ref('')
const previewUrl = ref('')

// Modal 狀態
const showModal = ref(false)
const modalMessage = ref('')
const nextOnConfirm = ref(null) // 可選：按「確定」後要做的事

function showAlert(message, onConfirm = null) {
  modalMessage.value = message
  nextOnConfirm.value = typeof onConfirm === 'function' ? onConfirm : null
  showModal.value = true
}
function onModalClose() {
  showModal.value = false
  nextOnConfirm.value = null
}
function onModalConfirm() {
  try {
    if (nextOnConfirm.value) nextOnConfirm.value()
  } finally {
    showModal.value = false
    nextOnConfirm.value = null
  }
}

function clearForm() {
  summary.value = ''
  link.value = ''
  description.value = ''
  imageUrl.value = ''
  previewUrl.value = ''
}

const handleUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  // 先顯示本地預覽
  previewUrl.value = URL.createObjectURL(file)

  const formData = new FormData()
  // 後端參數名是 imageFile
  formData.append('imageFile', file)

  try {
    const token = localStorage.getItem('userToken') || ''
    const res = await fetch('/api/Test/suspiciousupload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    const raw = await res.text()
    let data = {}
    try { data = JSON.parse(raw) } catch {
      //
    }

    if (!res.ok) throw new Error(data?.message || raw || `HTTP ${res.status}`)
    imageUrl.value = data.imageUrl
    showAlert('圖片上傳成功')
  } catch (err) {
    console.error('圖片上傳失敗：', err)
    showAlert(`圖片上傳失敗：${err.message}`)
  }
}

const handleSubmit = async () => {
  // userId 數字檢查
  const userIdRaw = localStorage.getItem('userId')
  const userId = Number(userIdRaw)

  // 必填 + 清空邊界空白
  const s = summary.value.trim()
  const l = link.value.trim()
  const d = description.value.trim()

  if (!Number.isInteger(userId) || userId <= 0) {
    showAlert('userId 無效，請先登入')
    return
  }
  if (!s || !l || !d) {
    showAlert('摘要、連結、描述皆為必填')
    return
  }
  try { new URL(l) } catch { showAlert('連結格式不正確'); return }

  const dto = {
    userId,             // 數字
    summary: s,
    link: l,
    imageUrl: imageUrl.value || '',
    description: d
  }

  try {
    const token = localStorage.getItem('userToken') || ''
    const res = await fetch('/api/Test/suspiciousreport', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dto)
    })

    const raw = await res.text()
    let data = {}
    try { data = JSON.parse(raw) } catch {
      //
    }

    if (!res.ok) {
      // 409 重複；400 多半型別/驗證
      const msg = data?.message || raw || `HTTP ${res.status}`
      showAlert(`回報失敗（${res.status}）：${msg}`)
      return
    }

    // 成功：清表單或導回上一頁擇一
    showAlert('回報成功！', () => {
      clearForm()
      // 如需返回上一頁，取消註解下一行
      // router.back()
    })
  } catch (err) {
    console.error('回報失敗：', err)
    showAlert(`回報失敗：${err.message}`)
  }
}
</script>

<style scoped>
.main-container {
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, #ffcbb3, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-menberdata {
  width: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.menberdata-image {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
}

.frame {
  width: 90%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-label {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.input-field {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  margin-bottom: 8px;
}

.textarea {
  resize: vertical;
  height: 100px;
}

.upload-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upload-button {
  padding: 5px 15px;
  border: 1px solid #000;
  border-radius: 20px;
  background-color: #fff;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}

.preview-section {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #ccc;
  object-fit: contain;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.confirm {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.confirm-button {
  padding: 10px 20px;
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 20px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}
</style>
