<template>
  <section class="search-results-container">
    <header class="search-header">
      <img :src="require('@/assets/icons/header-icon.svg')" alt="搜尋結果圖示" class="header-icon" />
      <h1 class="header-title">搜尋結果</h1>
    </header>

    <main class="search-content">
      <h2 class="phone-number">{{ phoneNumber || '未知號碼' }}</h2>

      <div class="results-list">
        <!-- 📗 phone-book.tw -->
        <article class="result-item">
          <h3 class="result-title">
            {{ results.phoneBook?.reason || '無相關評論' }}
          </h3>
          <p class="result-source">
            資料來源：<a :href="results.phoneBook?.detailUrl" target="_blank">phone-book.tw</a>
          </p>
        </article>

        <!-- 📘 whosnumber.com -->
        <article class="result-item">
          <h3 class="result-title">
            {{ results.whosNumber?.comment?.content || '無評論內容' }}
          </h3>
          <p class="result-source">
            資料來源：<a :href="results.whosNumber?.detailUrl" target="_blank">whosnumber.com</a>
          </p>
        </article>

        <!-- 📙 tellows.tw -->
        <article class="result-item">
          <h3 class="result-title">
            {{ results.tellows?.callType || '無來電種類' }} -
            {{ results.tellows?.callerName || '未知來電者' }}
          </h3>
          <p class="result-source">
            資料來源：<a :href="results.tellows?.detailUrl" target="_blank">tellows.tw</a>
          </p>
        </article>
      </div>
    </main>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

// 路由參數
const route = useRoute()

// 狀態變數
const phoneNumber = ref('')
const results = ref({})

// 初始化資料
try {
  phoneNumber.value = route.query.number || '未知號碼'
  const raw = route.query.data
  if (raw) {
    results.value = JSON.parse(decodeURIComponent(raw))
  }
} catch (err) {
  console.error('解析資料失敗', err)
}
</script>


<style scoped>
.search-results-container {
  width: 100%;
  max-width: 100%;
  min-height: 100%;
  background: linear-gradient(180deg, #ffebc3 0%, #fff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.search-header {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 2px 17px;
  gap: 7px;
  background-color: #fff;
}

@media (max-width: 640px) {
  .search-header {
    padding: 2px 12px;
  }
}

.header-icon {
  width: 39px;
  height: 33px;
  flex-shrink: 0;
}

.header-title {
  color: #000;
  font-family:
    irohamaru,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  font-size: 20px;
  font-weight: 400;
  margin: 0;
}

.search-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 0;
}

@media (max-width: 100%) {
  .search-content {
    padding: 0 12px;
  }
}

.phone-number {
  color: #000;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 400;
  gap: 15px;
  margin: 0;
}

.results-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-title {
  color: #000;
  font-family: irohamaru, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 400;
  margin: 0;
}

.result-source {
  color: #000;
  font-family: irohamaru, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 15px;
  font-weight: 400;
  margin: 0;
}

.result-source a {
  color: #0d6efd;
  text-decoration: none;
}
</style>
