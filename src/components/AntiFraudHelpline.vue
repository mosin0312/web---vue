<template>
  <div class="main-container">
    <header class="title-header sticky-header">
      <img src="@/assets/icons/comeback.svg" alt="Logo" class="header-icon" @click="goBack" />
      <span class="header-title">165資訊與回報統計看板</span>
    </header>

    <div class="category-buttons">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="currentTab = tab"
        :class="['category', { active: currentTab === tab }]"
      >
        {{ tab }}
      </button>
    </div>

    <section class="content-section">
      <!-- 動態載入目前分頁對應的元件 -->
      <component :is="tabComponents[currentTab]" />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Hotline165 from './Hotline165.vue'
import APPInformation from './APPInformation.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()

// 分頁標籤
const tabs = ['165資訊', '回報統計看板']
const currentTab = ref('165資訊')

// 分頁對應元件
const tabComponents = {
  '165': Hotline165,
  'APP資訊': APPInformation,
}

// ✅ 補上 fallbackStores，避免未定義錯誤（可自行放入預設資料）
const fallbackStores = []

// 若子元件需要，可透過 props / provide/inject 傳遞；此處先保留載入與備援邏輯
const stores = ref(fallbackStores)

onMounted(async () => {
  try {
    const response = await axios.get('/api/stores')
    if (Array.isArray(response.data)) {
      stores.value = response.data
    }
  } catch (error) {
    console.warn('載入 API 資料失敗，使用 fallback 資料')
  }
})
</script>


<style scoped>
.main-container {
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, #ffcbb3, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  z-index: 10;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
}

.header-icon {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
}

.category-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;              /* 稍微加大間距 */
  flex-wrap: wrap;
  margin-top: 10px;
  padding: 0 12px;        /* 讓大按鈕不會緊貼邊緣 */
}

.category {
  padding: 12px 24px;     /* 加大內距 */
  min-height: 48px;       /* 提升可點擊面積（無障礙 44px+） */
  border: 2px solid #fbaf8b;
  border-radius: 999px;   /* 更圓的膠囊外觀 */
  background: #fff;
  font-size: clamp(15px, 3.5vw, 18px); /* 小螢幕自動縮放 */
  line-height: 1;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  cursor: pointer;
  flex: 0 1 auto;         /* 內容決定寬度 */
}

.category.active {
  background-color: #fbaf8b;
  color: #fff;
}

.content-section {
  padding: 0 4px;
}

.store-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  padding: 12px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.store-name {
  font-weight: 600;
  font-size: 16px;
  color: #000;
}

.store-contact {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.label {
  font-weight: 500;
  color: #555;
}

.value {
  color: #222;
  text-decoration: none;
}
</style>
