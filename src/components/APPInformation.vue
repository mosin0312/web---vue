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

// 公開類型的 TypeCode 對照表
const PUBLIC_REASON_BY_CODE = {
  '101': '一接就掛',
  '102': '詐騙',
  '103': '推銷/廣告',
  '104': '騷擾',
  '199': '其他',
}

function decodePublicReason(typeCode, extraText) {
  const code = String(typeCode || '').trim()
  const label = PUBLIC_REASON_BY_CODE[code] || '其他'
  if (code === '199') {
    // 只有「其他」才顯示備註，沒有備註就顯示「其他」
    const note = (extraText || '').trim()
    return note ? `其他（${note}）` : '其他'
  }
  return label
}


// ✅ onMounted 時呼叫新的 API
onMounted(async () => {
  try {
    const response = await axios.get('/api/Test/public', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // ✅ 處理資料：取出 PhoneNumber 與 ExtraText
    appInfoList.value = response.data.map(item => ({
      phone: item.phoneNumber,
      reason: decodePublicReason(item.typeCode, item.extraText),
    }))
  } catch (error) {
    console.error('取得公開電話資料失敗:', error)

    if (error.response?.status === 401) {
      alert('尚未登入或登入已過期，請重新登入')
      // 可選：清空 localStorage 並導向登入頁
      // localStorage.removeItem('userToken')
      // location.href = '/login'
    }
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
