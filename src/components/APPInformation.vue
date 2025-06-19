<template>
<div class="transparent-wrapper">
  <div class="main-container">
    <!-- 表頭 -->
    <div class="header-row">
      <div class="col">電話號碼</div>
      <div class="col">回報原因</div>
      <div class="col">回報數</div>
    </div>
    <div class="divider"></div>

    <!-- 資料列表 -->
    <div
      class="data-row"
      v-for="(item, index) in appInfoList"
      :key="index"
    >
      <div class="col">{{ item.phone }}</div>
      <div class="col">{{ item.reason }}</div>
      <div class="col">{{ item.count }}</div>
    </div>
  </div>
  </div>
</template>

<script setup>
const appInfoList = [
  { phone: '0912-345-678', reason: '一接就掛', count: 17 },
  { phone: '0933-111-222', reason: '疑似詐騙', count: 25 },
  { phone: '0966-888-000', reason: '一接就掛', count: 13 },
  { phone: '0987-654-321', reason: '推銷電話', count: 9 },
  { phone: '0910-000-111', reason: '假冒親友', count: 31 },
  { phone: '0966-878-000', reason: '推銷電話', count: 13 },
  { phone: '0987-644-321', reason: '推銷電話', count: 9 },
  { phone: '0910-010-111', reason: '假冒親友', count: 31 }
]
</script>

<style scoped>
.main-container {
  width: 100%;
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
</style>
