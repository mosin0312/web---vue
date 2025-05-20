<template>
  <div class="blacklist-container">
    <header class="header">
      <img class="header-icon" src="@/assets/icons/header-icon.svg" alt="icon" />
      <h2>黑名單查看</h2>
    </header>

    <div class="filters">
      <!-- 黑名單種類 -->
      <select v-model="selectedType" @click="onTypeClick" @change="onTypeChange">
        <option value="">選擇黑名單種類</option>
        <option value="公開">公開</option>
        <option value="未公開">未公開</option>
      </select>

      <!-- 原因 -->
      <select v-model="selectedReason" :disabled="filteredReasons.length === 0">
        <option value="">選擇原因</option>
        <option v-for="reason in filteredReasons" :key="reason" :value="reason">
          {{ reason }}
        </option>
      </select>
    </div>

    <!-- 黑名單列表 -->
    <div class="blacklist-card" v-for="item in filteredList" :key="item.id">
      <img src="@/assets/icons/avatar.svg" class="avatar" />
      <div class="info">
        <p class="phone">{{ item.phone }}</p>
        <p class="visibility">{{ item.isPublic ? '公開' : '未公開' }}</p>
        <p class="reason">原因：{{ item.reason }}</p>
      </div>
      <div class="actions">
        <button class="edit" @click="editItem(item)">編輯</button>
        <button class="delete" @click="deleteItem(item.id)">刪除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedType = ref('')
const selectedReason = ref('')
const lastSelectedType = ref('')

// 黑名單資料
const blacklist = ref([
  { id: 1, phone: '0912-345-678', isPublic: true, reason: '詐騙' },
  { id: 2, phone: '0987-111-111', isPublic: true, reason: '推銷或廣告' },
  { id: 3, phone: '0922-222-222', isPublic: false, reason: '舊情人' },
  { id: 4, phone: '0933-333-333', isPublic: false, reason: '語言不通無法溝通' },
  { id: 5, phone: '0966-666-666', isPublic: true, reason: '一接就掛' }
])

// 原因清單
const publicReasons = ['一接就掛', '詐騙', '推銷或廣告', '騷擾', '其他']
const privateReasons = ['舊情人', '家庭內部衝突', '語言不通無法溝通', '個人情感問題', '其他']

// 根據種類篩選對應的原因
const filteredReasons = computed(() => {
  if (selectedType.value === '公開') return publicReasons
  if (selectedType.value === '未公開') return privateReasons
  return []
})

// 下拉選單被「點擊」時也會重設原因（即使選同樣的值）
const onTypeClick = () => {
  selectedReason.value = ''
}

// 選擇完種類後更新狀態
const onTypeChange = () => {
  selectedReason.value = ''
  lastSelectedType.value = selectedType.value
}

// 過濾列表
const filteredList = computed(() => {
  return blacklist.value.filter(item => {
    const typeMatch = !selectedType.value || item.isPublic === (selectedType.value === '公開')
    const reasonMatch = !selectedReason.value || item.reason === selectedReason.value
    return typeMatch && reasonMatch
  })
})

const editItem = (item) => {
  alert(`編輯：${item.phone}`)
}

const deleteItem = (id) => {
  blacklist.value = blacklist.value.filter(item => item.id !== id)
}
</script>

<style scoped>
.blacklist-container {
  width: 100%;
  max-width: 360px;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #d4d8fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative;
  overflow-y: auto;
}

.header {
  display: flex;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
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
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #bbb;
  background-color: #fff;
  font-size: 14px;
  color: #333;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.blacklist-card {
  display: flex;
  align-items: center;
  width: 100%;
  background: #fff;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  border: 1px solid #eee;
}

.info {
  flex-grow: 1;
}

.phone {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.visibility,
.reason {
  font-size: 13px;
  color: #777;
  line-height: 1.3;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 8px;
}

.edit,
.delete {
  font-size: 13px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s ease;
}

.edit {
  background-color: #e0f0ff;
  color: #007bff;
}
.edit:hover {
  background-color: #d0e8ff;
}

.delete {
  background-color: #ffe0e0;
  color: #dc3545;
}
.delete:hover {
  background-color: #fdd0d0;
}
</style>
