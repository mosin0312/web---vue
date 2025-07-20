<template>
  <div class="search-result-page">
    <h1>查詢結果</h1>
    <div class="result-box">
      <p><strong>電話：</strong>{{ phone }}</p>
      <p><strong>理由：</strong>{{ reason }}</p>
      <p><strong>資料來源：</strong>{{ source }}</p>
    </div>
    <button @click="$router.back()">返回</button>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const phone = route.query.phone || '無資料'
const reason = route.query.reason || '無資料'
const source = route.query.source || '無資料'
</script>

<style scoped>
.search-result-page {
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
.result-box {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
