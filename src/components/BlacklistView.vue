<template>
  <div class="blacklist-container">
    <header class="header">
      <img class="header-icon" src="@/assets/icons/header-icon.svg" alt="icon" />
      <h2>黑名單查看</h2>
    </header>

    <div class="filters">
      <select v-model="selectedType" @change="onTypeChange">
        <option value="">選擇黑名單種類</option>
        <option value="公開">公開</option>
        <option value="未公開">未公開</option>
      </select>

      <select v-model="selectedReason" :disabled="filteredReasons.length === 0">
        <option value="">選擇原因</option>
        <option v-for="reason in filteredReasons" :key="reason" :value="reason">
          {{ reason }}
        </option>
      </select>
    </div>

    <div class="blacklist-card" v-for="item in filteredList" :key="item.id">
      <img src="@/assets/icons/avatar.svg" class="avatar" />
      <div class="info">
        <p class="phone">{{ item.phone }}</p>
        <p class="visibility">{{ item.isPublic ? '公開' : '未公開' }}</p>
        <p class="reason">原因：{{ item.reason }}</p>
      </div>
      <div class="actions">
        <button class="edit" @click="openEdit(item)">編輯</button>
        <button class="delete" @click="deleteItem(item.id)">刪除</button>
      </div>
    </div>

    <!-- 編輯彈窗 -->
    <div v-if="editModalVisible" class="modal-backdrop">
      <div class="modal">
        <h3>編輯黑名單</h3>
        <!-- 顯示電話號碼 -->
        <p class="modal-phone">{{ editForm.phone }}</p>

        <label>
          類型：
          <select v-model="editForm.isPublic">
            <option :value="true">公開</option>
            <option :value="false">未公開</option>
          </select>
        </label>

        <label>
          原因：
          <select v-model="editForm.reason">
            <option v-for="reason in editReasons" :key="reason" :value="reason">{{ reason }}</option>
          </select>
        </label>

        <div class="modal-actions">
          <button class="save" @click="saveEdit">儲存</button>
          <button class="cancel" @click="editModalVisible = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const selectedType = ref('')
const selectedReason = ref('')
const editModalVisible = ref(false)
const editingItemId = ref(null)

const blacklist = ref([
  { id: 1, phone: '0912-345-678', isPublic: true, reason: '詐騙' },
  { id: 2, phone: '0987-111-111', isPublic: true, reason: '推銷或廣告' },
  { id: 3, phone: '0922-222-222', isPublic: false, reason: '舊情人' },
  { id: 4, phone: '0933-333-333', isPublic: false, reason: '語言不通無法溝通' },
  { id: 5, phone: '0966-666-666', isPublic: true, reason: '一接就掛' }
])

const publicReasons = ['一接就掛', '詐騙', '推銷或廣告', '騷擾', '其他']
const privateReasons = ['舊情人', '家庭內部衝突', '語言不通無法溝通', '個人情感問題', '其他']

const filteredReasons = computed(() => {
  if (selectedType.value === '公開') return publicReasons
  if (selectedType.value === '未公開') return privateReasons
  return []
})

const onTypeChange = () => {
  selectedReason.value = ''
}

const filteredList = computed(() => {
  return blacklist.value.filter(item => {
    const typeMatch = !selectedType.value || item.isPublic === (selectedType.value === '公開')
    const reasonMatch = !selectedReason.value || item.reason === selectedReason.value
    return typeMatch && reasonMatch
  })
})

// 編輯表單
const editForm = ref({ isPublic: true, reason: '' })

const openEdit = (item) => {
  editingItemId.value = item.id
  editForm.value = {
    phone: item.phone,
    isPublic: item.isPublic,
    reason: item.reason
  }
  editModalVisible.value = true
}

const saveEdit = () => {
  const idx = blacklist.value.findIndex(i => i.id === editingItemId.value)
  if (idx !== -1) {
    blacklist.value[idx].isPublic = editForm.value.isPublic
    blacklist.value[idx].reason = editForm.value.reason
  }
  editModalVisible.value = false
}

const deleteItem = (id) => {
  blacklist.value = blacklist.value.filter(item => item.id !== id)
}

// 根據 isPublic 切換原因選項
const editReasons = computed(() => {
  return editForm.value.isPublic ? publicReasons : privateReasons
})

watch(() => editForm.value.isPublic, () => {
  if (!editReasons.value.includes(editForm.value.reason)) {
    editForm.value.reason = ''
  }
})
</script>

<style scoped>
.blacklist-container {
  width: 100%;
  height: 100vh;
  max-width: 100%;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #d4d8fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  overflow-y: auto;
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

.header-icon {
  width: 32px;
  height: 32px;
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
.reason {
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: #fff;
  padding: 20px;
  width: 300px;
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
</style>
