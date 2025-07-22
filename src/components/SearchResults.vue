<template>
  <div class="search-result-container">
    <div class="header">
      <img src="@/assets/icons/comeback.svg" alt="Logo" class="header-icon" @click="goBack"/>
      <h1 class="title">通話紀錄</h1>
    </div>

    <div v-if="phone">
      <!-- phoneBook -->
      <div v-if="phoneBook && Object.keys(phoneBook).length">
        <h2>查詢電話：{{ phone }}</h2>
        <h3><strong>來源：</strong>phoneBook</h3>
        <p><strong>風險說明：</strong>{{ phoneBook.reason || '無說明' }}</p>
        <p><strong>信任度：</strong>{{ phoneBook.trustLevel || '未知' }}</p>
        <a :href="phoneBook.detailUrl" target="_blank">查看更多</a>
      </div>

      <!-- whosNumber -->
<div v-if="whosNumber && Object.keys(whosNumber).length">
  <h3><strong>來源：</strong>whosNumber</h3>
  <p><strong>風險說明：</strong>{{ whosNumber.comment?.content || '無說明' }}</p>
  <p><strong>訪問次數：</strong>{{ whosNumber.visitCount || '未知' }}</p>
  <p><strong>最近訪問：</strong>{{ whosNumber.lastVisit || '未知' }}</p>

  <div v-if="whosNumber.comment && typeof whosNumber.comment === 'object'">
    <p><strong>留言：</strong>{{ whosNumber.comment.content || '無留言' }}</p>
    <p><strong>時間：</strong>{{ whosNumber.comment.time || '無時間' }}</p>
  </div>
  <a :href="whosNumber.detailUrl" target="_blank">查看更多</a>
</div>


      <!-- tellows -->
      <div v-if="tellows && Object.keys(tellows).length">
        <h3><strong>來源：</strong>tellows</h3>
        <p><strong>風險說明：</strong>{{ tellows.callType || '無說明' }}</p>
        <p><strong>來電類型：</strong>{{ tellows.callType || '未知來電' }}</p>
        <p><strong>來電者姓名：</strong>{{ tellows.callerName || '未知' }}</p>
        <a :href="tellows.detailUrl" target="_blank">查看更多</a>
      </div>
    </div>

    <div v-else>
      <p>未提供查詢參數</p>
    </div>
  </div>
</template>


<script setup>
import { useRouter } from 'vue-router'
import { onUnmounted } from 'vue'


const router = useRouter()

// 從 sessionStorage 取得資料
const searchData = JSON.parse(sessionStorage.getItem('searchData') || '{}')
const phone = searchData.phone
const phoneBook = searchData.phoneBook || {}
const whosNumber = searchData.whosNumber || {}
const tellows = searchData.tellows || {}

onUnmounted(() => {
  sessionStorage.removeItem('searchData')
})


//  回上一頁
const goBack = () => {
  router.go(-1)
}
</script>


<style scoped>
.search-result-container {
  width: 100%;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #ffebc3 0%, #fff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative;
}
.header {
  width: 100%;
  height: 40px;
  padding: 2px 17px;
  display: flex;
  align-items: center;
  gap: 7px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.header-icon {
  width: 39px;
  height: 28px;
}
.title {
  font-size: 20px;
  color: #000;
  font-weight: 700;
  margin: 0;
}
</style>
