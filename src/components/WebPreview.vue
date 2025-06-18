<!-- 點擊網址後能跳出網頁內容-->
<template>
  <div class="web-container">
    <button class="back-btn" @click="$router.back()">← 返回</button>
    <iframe :src="url" frameborder="0" class="web-frame"></iframe>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const url = decodeURIComponent(route.query.url)
</script>

<style scoped>
.web-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.back-btn {
  padding: 8px 16px;
  background: #007aff;
  color: white;
  border: none;
  cursor: pointer;
}

.web-frame {
  flex: 1;
  width: 100%;
}
</style>
