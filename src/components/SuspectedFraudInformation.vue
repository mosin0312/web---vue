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
        <!-- 摘要輸入區塊 -->
        <div class="input-group">
          <label class="input-label">摘要</label>
          <input type="text" class="input-field" v-model="summary" placeholder="請輸入摘要 (最多20字元)" maxlength="20" />
        </div>

        <!-- 連結輸入區塊 -->
        <div class="input-group">
          <label class="input-label">連結</label>
          <input type="url" class="input-field" v-model="link" placeholder="請輸入文章連結" />
        </div>

        <!-- 圖片上傳按鈕 -->
        <div class="upload-section">
          <label class="input-label">圖片</label>
          <button class="upload-button" @click="$refs.fileInput.click()">上傳</button>
          <input id="file-upload" type="file" ref="fileInput" @change="handleUpload" accept="image/*" hidden />
        </div>
        <!-- 預覽圖 -->
<div v-if="previewUrl" class="preview-section">
  <img :src="previewUrl" alt="預覽圖片" class="preview-image" />
</div>

        <!-- 描述輸入區塊 -->
        <div class="input-group">
          <label class="input-label">描述</label>
          <textarea class="input-field textarea" v-model="description" placeholder="請描述疑似詐騙的內容"></textarea>
        </div>
      </div>

      <!-- 回報按鈕 -->
      <div class="confirm">
        <button class="confirm-button" @click="handleSubmit">回報</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.back()

const summary = ref('')
const link = ref('')
const description = ref('')
const imageUrl = ref('')
const previewUrl = ref('')

const handleUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  previewUrl.value = URL.createObjectURL(file)

  const formData = new FormData()
  // ⚠️ 後端參數名是 imageFile
  formData.append("imageFile", file)

  try {
    const token = localStorage.getItem("userToken") || ""
    const res = await fetch("/api/Test/suspiciousupload", {
      method: "POST",
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
    alert("圖片上傳成功")
  } catch (err) {
    console.error("圖片上傳失敗：", err)
    alert(`圖片上傳失敗：${err.message}`)
  }
}

const handleSubmit = async () => {
  // 1) 把 userId 轉成數字（int），避免 400
  const userIdRaw = localStorage.getItem("userId")
  const userId = Number(userIdRaw)

  // 2) 前端必填驗證 + 清除空白
  const s = summary.value.trim()
  const l = link.value.trim()
  const d = description.value.trim()

  if (!Number.isInteger(userId) || userId <= 0) {
    alert("userId 無效，請確認是否登入")
    return
  }
  if (!s || !l || !d) {
    alert("摘要、連結、描述皆為必填")
    return
  }
  // 3) URL 基本檢查
  try { new URL(l) } catch { alert("連結格式不正確"); return }

  const dto = {
    userId,            // ✅ 數字
    summary: s,
    link: l,
    imageUrl: imageUrl.value || "", // 後端沒強制，但給空字串也可
    description: d,
  }

  try {
    const token = localStorage.getItem("userToken") || ""
    const res = await fetch("/api/Test/suspiciousreport", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dto)
    })

    const raw = await res.text()
    let data = {}
    try { data = JSON.parse(raw) } catch {
      //
    }

    if (!res.ok) {
      // 409：連結重覆；400：多半是型別/驗證失敗；其餘狀態也顯示伺服器訊息
      const msg = data?.message || raw || `HTTP ${res.status}`
      alert(`回報失敗（${res.status}）：${msg}`)
      return
    }

    alert("回報成功！")
    // 清空表單
    summary.value = ""
    link.value = ""
    description.value = ""
    imageUrl.value = ""
    previewUrl.value = ""
  } catch (err) {
    console.error("回報失敗：", err)
    alert(`回報失敗：${err.message}`)
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
  max-width: 100%; /* 設定最大寬度 */
  margin: 0 auto;    /* 水平置中，確保左右間距一致 */
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
  justify-content: center; /* 水平置中 */
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