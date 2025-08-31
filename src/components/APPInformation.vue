<template>
<div class="transparent-wrapper">
  <div class="main-container">
    <!-- 表頭 -->
    <div class="header-row">
      <div class="col">電話號碼</div>
      <div class="col">回報原因</div>
    </div>
    <div class="divider"></div>

   <!-- 資料列表 -->
<div v-if="appInfoList.length > 0">
  <div
    class="data-row"
    v-for="(item, index) in appInfoList"
    :key="index"
  >
    <div class="col">{{ item.phone }}</div>
    <div class="col">{{ item.reason }}</div>
  </div>
</div>
<div v-else class="no-data">目前沒有公開回報資料，請確認是否已登入</div>

  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// ✅ 資料列表
const appInfoList = ref([])

// ✅ 取得 Token（使用者登入後儲存在 localStorage）
const token = localStorage.getItem('userToken')

// ✅ onMounted 時呼叫 API
onMounted(async () => {
  try {
    const response = await axios.get('/api/PhoneReports/public', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // ✅ 處理資料：取出 PhoneNumber 與 ExtraText
    appInfoList.value = response.data.map(item => ({
      phone: item.phoneNumber,
      reason: item.extraText || '未提供原因'
    }))
  } catch (error) {
    console.error('取得公開電話資料失敗:', error)
  }
})
</script>


<style scoped>
.main-container {
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  font-family: 'irohamaru', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-row,
.data-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: 15px;
  line-height: 22px;
  align-items: center;
}

.header-row {
  font-weight: 600;
}

.data-row {
  background-color: #f9f9f9;
  border-radius: 4px;
}

.col {
  width: 30%;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  height: 10px;
  background: url('@/assets/icons/line.svg') no-repeat center;
  background-size: 100% 100%;
}

.transparent-wrapper {
  background-color: transparent !important;
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}
.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>
