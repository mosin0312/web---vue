<template>
  <div class="main-container">
    <header class="title-header sticky-header">
      <img src="@/assets/icons/comeback.svg" alt="Logo" class="header-icon" @click="goBack"/>
      <span class="header-title">防詐專線</span>
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
      <template v-if="currentTab === '店家資訊'">
        <div
          v-for="(store, i) in stores"
          :key="i"
          class="store-card"
        >
          <div class="store-name">{{ store.name }}</div>
          <div class="store-contact">
            <span class="label">電話:</span>
            <a class="value" :href="`tel:${store.phone}`">{{ store.phone }}</a>
          </div>
          <div class="store-contact">
            <span class="label">電子信箱:</span>
            <a class="value" :href="`mailto:${store.email}`">{{ store.email }}</a>
          </div>
        </div>
      </template>

      <component
        v-else
        :is="tabComponents[currentTab]"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Hotline165 from './Hotline165.vue'
import APPInformation from './APPInformation.vue'
import UserReports from './UserReports.vue'

import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => {
  router.back()
}

const tabs = ['店家資訊', '165', 'APP資訊', '使用者回報']
const currentTab = ref('店家資訊')

const tabComponents = {
  '165': Hotline165,
  'APP資訊': APPInformation,
  '使用者回報': UserReports
}

const fallbackStores = [
  { name: '台北便利通', phone: '02-2913-6287', email: 'tpe@example.com' },
  { name: '中壢生活家', phone: '03-456-7890', email: 'cl@example.com' },
  { name: '高雄安心店', phone: '07-123-4567', email: 'ks@example.com' },
  { name: '新竹便利網', phone: '03-123-8888', email: 'hcc@example.com' },
  { name: '台中安全店', phone: '04-999-4321', email: 'tc@example.com' },
  { name: '花蓮小站', phone: '03-987-6543', email: 'hl@example.com' },
  { name: '屏東安心通', phone: '08-222-5566', email: 'pt@example.com' },
  { name: '基隆服務站', phone: '02-123-7777', email: 'kl@example.com' },
]

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
  width: 100%;
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
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.category {
  padding: 4px 12px;
  border: 2px solid #fbaf8b;
  border-radius: 100px;
  background: #fff;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  cursor: pointer;
}

.category.active {
  background-color: #fbaf8b;
  color: white;
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
