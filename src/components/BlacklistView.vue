<template>
  <div class="blacklist-container">
    <header class="header">
      <div class="icon-container" @click="$router.back()">
      <img class="header-icon" src="@/assets/icons/comeback.svg" alt="icon" />
    </div>
      <h2>黑名單查看</h2>
    </header>

    <div class="filters">
      <select v-model="selectedType" @change="onTypeChange">
        <option value="">選擇黑名單種類</option>
        <option value="公開">公開</option>
        <option value="非公開">非公開</option>
      </select>

      <select v-model="selectedReason" :disabled="filteredReasons.length === 0">
        <option value="">選擇原因</option>
        <option v-for="reason in filteredReasons" :key="reason" :value="reason">
          {{ reason }}
        </option>
      </select>
    </div>

    <div v-if="filteredList.length === 0" class="empty">目前沒有黑名單資料</div>

    <div class="blacklist-card" v-for="item in filteredList" :key="item.id">
      <img src="@/assets/icons/avatar.svg" class="avatar" />
      <div class="info">
        <p class="phone">{{ item.phone }}</p>
        <p class="visibility">{{ item.isPublic ? '公開' : '非公開' }}</p>
        <p class="reason"> 原因：{{ item.reason }} <span v-if="item.reason === '其他' && item.note">（{{ item.note }}）</span></p>
        <p class="name" v-if="item.name">名稱：{{ item.name }}</p>
        <p class="time">加入時間：{{ formatTime(item.id) }}</p>
      </div>
      <div class="actions">
        <button class="edit" @click="openEdit(item)">編輯</button>
        <button class="delete" @click="deleteItem(item)">刪除</button>
      </div>
    </div>

    <!-- 編輯彈窗 -->
    <div v-if="editModalVisible" class="modal-backdrop">
      <div class="modal">
        <h3>編輯黑名單</h3>
        <p class="modal-phone">{{ editForm.phone }}</p>

        <label>
          類型：
          <select v-model="editForm.isPublic">
            <option :value="true">公開</option>
            <option :value="false">非公開</option>
          </select>
        </label>

        <label>
  原因：
  <select v-model="editForm.reason">
    <option v-for="reason in editReasons" :key="reason" :value="reason">
      {{ reason }}
    </option>
  </select>
</label>

<label :class="{ disabled: editForm.reason !== OTHER_LABEL }">
  補充說明（最多 30 字）：
  <input
    v-model="editForm.note"
    :maxlength="30"
    :disabled="editForm.reason !== OTHER_LABEL"
    :placeholder="editForm.reason === OTHER_LABEL ? '請輸入補充說明' : '僅選「其他」可填寫'"
  />
</label>
        <div class="modal-actions">
          <button class="save" @click="saveEdit">儲存</button>
          <button class="cancel" @click="editModalVisible = false">取消</button>
        </div>
      </div>
    </div>
  </div>
  <AlertModal
  :visible="showModal"
  :message="modalMessage"
  @confirm="onModalConfirm"
  @close="onModalClose"
/>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import AlertModal from '@/components/AlertModal.vue' // ← 用現有元件

/** ========= 內建可 await 的 Alert / Confirm（不改 AlertModal.vue） ========= */
const OTHER_LABEL = '其他'
const showModal = ref(false)
const modalMessage = ref('')
const modalMode = ref('alert') // 'alert' | 'confirm'
const pendingResolve = ref(null)
const shouldRedirect = ref(false)

function showAlert(message, { redirectToHome = false } = {}) {
  modalMessage.value = message
  modalMode.value = 'alert'
  showModal.value = true
  shouldRedirect.value = redirectToHome
  return new Promise((resolve) => { pendingResolve.value = resolve })
}

function showConfirm(message) {
  modalMessage.value = message
  modalMode.value = 'confirm'
  showModal.value = true
  return new Promise((resolve) => { pendingResolve.value = resolve })
}

// AlertModal 事件：按「確定」
function onModalConfirm() {
  showModal.value = false
  if (pendingResolve.value) {
    pendingResolve.value(true)
    pendingResolve.value = null
  }
  if (shouldRedirect.value) {
    // 若這頁也有 router，可在此導頁；否則移除這段
    // router.push({ path: '/', query: {}, replace: true })
    shouldRedirect.value = false
  }
}

// AlertModal 事件：關閉（點背景 / X / 自動 close）
function onModalClose() {
  showModal.value = false
  if (pendingResolve.value) {
    // alert 視為同意（true），confirm 視為取消（false）
    const agreed = (modalMode.value === 'alert')
    pendingResolve.value(agreed)
    pendingResolve.value = null
  }
  if (shouldRedirect.value) {
    // router.push({ path: '/', query: {}, replace: true })
    shouldRedirect.value = false
  }
}

/** =========================================
 *  1) 公開/非公開 → TypeCode 對照 + 反查表
 *  ========================================= */
const TYPE_CODE = {
  '公開': {
    '一接就掛': 101,
    '詐騙': 102,
    '推銷/廣告': 103,
    '騷擾': 104,
    '其他': 199,
  },
  '非公開': {
    '舊情人': 201,
    '家庭內部衝突': 202,
    '語言不通無法溝通': 203,
    '個人情感問題': 204,
    '其他': 299,
  },
}
const REVERSE_CODE = (() => {
  const map = {}
  for (const scope of Object.keys(TYPE_CODE)) {
    for (const [reason, code] of Object.entries(TYPE_CODE[scope])) {
      map[String(code)] = { scope, reason }
    }
  }
  return map
})()

/** =========================================
 *  2) 篩選條件 & 清單
 *  ========================================= */
const selectedType = ref('')
const selectedReason = ref('')
const blacklist = ref([])

const publicReasons = ['一接就掛', '詐騙', '推銷/廣告', '騷擾', '其他']
const privateReasons = ['舊情人', '家庭內部衝突', '語言不通無法溝通', '個人情感問題', '其他']

/** =========================================
 *  3) 抓 userId（JWT: {"userId": 整數}）
 *  ========================================= */
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
  } catch {
    return null
  }
}

// isPublic + reason 算出 TypeCode（字串）
function typeCodeFrom(isPublic, reason) {
  const scope = isPublic ? '公開' : '非公開'
  const code = TYPE_CODE[scope]?.[reason] ?? TYPE_CODE[scope]?.['其他'] ?? 999
  return String(code)
}

/** =========================================
 *  4) localStorage 讀寫（離線/編輯）
 *  ========================================= */
function loadListFromLocal() {
  const raw = JSON.parse(localStorage.getItem('blacklist') || '[]')
  blacklist.value = raw
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map((x) => ({
      id: x.createdAt || Date.now(),
      phone: x.number || '',
      isPublic: (x.scope || '') === '公開',
      reason: x.reason || '',
      note: x.note || '',
      name: x.name || ''
    }))
}

function persist() {
  const back = blacklist.value.map((x) => ({
    number: x.phone,
    name: x.name || '',
    scope: x.isPublic ? '公開' : '非公開',
    reason: x.reason,
    note: x.note || '',
    createdAt: x.id
  }))
  localStorage.setItem('blacklist', JSON.stringify(back))
}

/** =========================================
 *  5) 從 API 載入：/api/Test/user/{userId}
 *     成功 → 映射成 ViewModel → 寫回 localStorage
 *     404 → 顯示空清單（或退回 localStorage）
 *     其他錯誤 → fallback 到 localStorage
 *  ========================================= */
function toTimestamp(v) {
  const n = Date.parse(v)
  return Number.isFinite(n) ? n : Date.now()
}

async function loadFromApi() {
  const token = localStorage.getItem('userToken')
  const userId = getUserIdFromLocalOrToken()

  if (!token || !Number.isFinite(userId)) {
    loadListFromLocal()
    return
  }

  try {
    const res = await axios.get(`/api/Test/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const reports = Array.isArray(res.data) ? res.data : []

    const mapped = reports.map((r) => {
      const code = String(r.TypeCode ?? r.typeCode ?? '')
      const match = REVERSE_CODE[code] || { scope: '公開', reason: '其他' }
      const createdTs =
        (r.UpdatedAt && toTimestamp(r.UpdatedAt)) ||
        (r.updatedAt && toTimestamp(r.updatedAt)) ||
        (r.CreatedAt && toTimestamp(r.CreatedAt)) ||
        (r.createdAt && toTimestamp(r.createdAt)) ||
        Date.now()

      return {
        id: createdTs,                              // 用於顯示「加入時間」
        phone: r.PhoneNumber ?? r.phoneNumber ?? '',
        isPublic: match.scope === '公開',
        reason: match.reason,
        note: r.ExtraText ?? r.extraText ?? '',
        name: ''                                    // 後端目前沒提供名稱，就先留空
      }
    })

    // 最新在上
    mapped.sort((a, b) => b.id - a.id)
    blacklist.value = mapped

    // 同步到 localStorage，保留目前編輯/刪除流程
    persist()
  } catch (err) {
    if (err?.response?.status === 404) {
      // 後端明確回「查無資料」
      blacklist.value = []
      persist()
    } else {
      loadListFromLocal()
      console.warn('讀取 API 失敗，已改用本地資料', err)
    }
  }
}

onMounted(loadFromApi)

/** =========================================
 *  7) 篩選/編輯
 *  ========================================= */
const filteredReasons = computed(() => {
  if (selectedType.value === '公開') return publicReasons
  if (selectedType.value === '非公開') return privateReasons
  return []
})
const onTypeChange = () => {
  selectedReason.value = ''
}

const filteredList = computed(() => {
  return blacklist.value.filter((item) => {
    const typeMatch =
      !selectedType.value ||
      (item.isPublic ? '公開' : '非公開') === selectedType.value
    const reasonMatch = !selectedReason.value || item.reason === selectedReason.value
    return typeMatch && reasonMatch
  })
})

const editModalVisible = ref(false)
const editingItemId = ref(null)
const editForm = ref({ phone: '', isPublic: true, reason: '', note: '' })

const openEdit = (item) => {
  editingItemId.value = item.id
  editForm.value = {
    phone: item.phone,
    isPublic: item.isPublic,
    reason: item.reason,
    note: item.note || ''
  }
  editModalVisible.value = true
}

const editReasons = computed(() =>
  editForm.value.isPublic ? publicReasons : privateReasons
)

watch(
  () => editForm.value.isPublic,
  () => {
    if (!editReasons.value.includes(editForm.value.reason)) {
      editForm.value.reason = ''
    }
  }
)

// 新增：若原因不是「其他」，自動清空補充說明
watch(
  () => editForm.value.reason,
  (val) => {
    if (val !== OTHER_LABEL) {
      editForm.value.note = ''
    }
  }
)


/** ===== 儲存（/api/Test/UpdatePhone）→ 成功後 persist ===== */
const saveEdit = async () => {
  const idx = blacklist.value.findIndex((i) => i.id === editingItemId.value)
  if (idx === -1) {
    editModalVisible.value = false; return }

  const token = localStorage.getItem('userToken')
  const userId = getUserIdFromLocalOrToken()
  if (!token || !Number.isFinite(userId)) {
    await showAlert('尚未登入或 userId 無效')
    return
  }

  const typeCode = typeCodeFrom(editForm.value.isPublic, editForm.value.reason)
  // 只有原因=其他 才會帶補充說明；且選了「其他」時補充說明為必填
const extra = (editForm.value.reason === OTHER_LABEL) ? (editForm.value.note || '').trim() : ''
if (editForm.value.reason === OTHER_LABEL && !extra) {
  await showAlert('選擇「其他」時，請填寫補充說明')
  return
}


  try {
    const body = {
      UserId: userId, TypeCode: typeCode, ExtraText: extra }
    await axios.post('/api/Test/UpdatePhone', body, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // 後端 OK → 更新本地資料並同步 localStorage
    blacklist.value[idx].isPublic = editForm.value.isPublic
blacklist.value[idx].reason = editForm.value.reason
blacklist.value[idx].note   = (editForm.value.reason === OTHER_LABEL) ? extra : ''
persist()


    editModalVisible.value = false
    await showAlert('更新成功')
    // 如要更保險可：await loadFromApi()
  } catch (err) {
    console.error('更新失敗', err)
    if (err?.response?.status === 404) {
      await showAlert('找不到資料（後端）')
    } else if (err?.response?.status === 401) {
      await showAlert('未授權，請重新登入')
    } else {
      // 400/500/其他
      const msg = err?.response?.data?.message || '更新失敗，請稍後重試'
      await showAlert(msg)
    }
  }
}

/** ===== 刪除（/api/Test/DeletePhone/{phoneNumber}）→ 成功後 persist ===== */
const deleteItem = async (item) => {
  const token = localStorage.getItem('userToken')
  if (!token) {
    await showAlert('尚未登入')
    return
  }

  const ok = await showConfirm(`確定要刪除：${item.phone}？`)
  if (!ok) return

  try {
    await axios.post(`/api/Test/DeletePhone/${encodeURIComponent(item.phone)}`, null, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // 後端 OK → 從本地移除並同步 localStorage
    blacklist.value = blacklist.value.filter((x) => x.id !== item.id)
    persist()
    await showAlert('刪除成功')
  } catch (err) {
    console.error('刪除失敗', err)
    if (err?.response?.status === 404) {
      await showAlert('後端找不到資料，畫面將移除本地項目')
      // 後端說找不到，那就把本地也移掉避免殘留
      blacklist.value = blacklist.value.filter((x) => x.id !== item.id)
      persist()
    } else if (err?.response?.status === 401) {
      await showAlert('未授權，請重新登入')
    } else {
      const msg = err?.response?.data?.message || '刪除失敗，請稍後重試'
      await showAlert(msg)
    }
  }
}


// 工具：時間格式
function pad(n) { return n.toString().padStart(2, '0') }
function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(Number(ts))
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>





<style scoped>
.blacklist-container {
  height: 100vh;
  max-width: 100%;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #d4d8fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative; 
}

.header {
  display: flex;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-bottom: 1px solid #ccc;
}

.icon-container {
  width: 40px;
  height: 40px;
}

.header-icon {
  width: 40px;
  height: 40px;
}

.filters {
  display: flex;
  width: 100%;
  gap: 10px;
  margin: 16px 0;
}

.filters select {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.empty {
  width: 100%;
  text-align: center;
  color: #666;
  margin-top: 16px;
}

.blacklist-card {
  display: flex;
  align-items: center;
  width: 100%;
  background: #fff;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: 12px;
}

.info {
  flex-grow: 1;
}

.phone {
  font-size: 15px;
  font-weight: bold;
}

.visibility,
.reason,
.name,
.time {
  font-size: 13px;
  color: #555;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit, .delete {
  padding: 6px 10px;
  font-size: 13px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.edit {
  background: #e0f0ff;
  color: #007bff;
}

.delete {
  background: #ffe0e0;
  color: #d00;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: #fff;
  padding: 20px;
  width: 320px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal label {
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal input,
.modal select {
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.cancel {
  background: #ccc;
  color: #333;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.disabled {
  opacity: 0.6;
}

</style>
