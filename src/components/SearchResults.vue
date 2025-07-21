<template>
  <div class="search-result-container">
    <h2>查詢結果</h2>
    <div v-if="phone">
      <p><strong>電話：</strong>{{ phone }}</p>
      <p><strong>風險說明：</strong>{{ reason || '無說明' }}</p>
      <p><strong>資料來源：</strong>{{ source }}</p>
    </div>
    <div v-else>
      <p>未提供查詢參數</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const phone = computed(() => route.query.phone || '')
const reason = computed(() => route.query.reason || '')
const source = computed(() => route.query.source || '')
</script>

<style scoped>
.search-result-container {
  padding: 20px;
}
</style>


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
