<template>
  <div class="main-container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <img src="@/assets/icons/comeback.svg" alt="logo" class="header-icon" @click="goBack"/>
        <h1 class="page-title">常見詐騙手法</h1>
      </div>
    </header>

    <!-- News Section -->
    <section class="news-section">
      <div class="news-list">
  <div v-for="(item, index) in newsList.slice(0, 5)" :key="index" class="news-card">
    <div class="news-content">
      <div class="news-title">{{ item.title }}</div>
      <div class="news-description">{{ item.description }}</div>
      <div class="news-footer">
        <span class="news-date">{{ item.pubDate }}</span>
        <span class="news-link" @click="goToNews(item)">查看內容</span>
      </div>
    </div>
  </div>
</div>
    </section>

<AlertModal
  v-if="showLoginModal"  message="請先登入會員才能使用此功能"  @close="showLoginModal = false"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import AlertModal from '@/components/AlertModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showLoginModal = ref(false)


// 新聞
const newsList = ref([])

const fetchNews = async () => {
  try {
    const role = localStorage.getItem('userRole')
    const token = role === 'User'
      ? localStorage.getItem('userToken')
      : localStorage.getItem('guestToken')

    if (!token || !role) {
      console.warn('無效身份或 token，略過新聞請求')
      return
    }

    const url =
      role === 'User'
        ? '/api/MemberManagement/news'
        : '/api/MemberManagement/grabnews'  //  訪客用 grabnews

    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data?.news) {
      newsList.value = response.data.news.sort(
        (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
      )
    }
  } catch (error) {
    console.error('取得新聞失敗:', error)
  }
}



const goToNews = (item) => {
  window.open(item.link, '_blank')
}

const goBack = () => {
  router.go(-1)
}

// 可選：強化登入驗證（訪客 or 使用者）
const ensureValidSession = () => {
  const role = localStorage.getItem('userRole')
  const token = localStorage.getItem('userToken')
  const guestToken = localStorage.getItem('guestToken')

  const hasValidToken =
    (role === 'User' && !!token) ||
    (role === 'Guest' && !!guestToken)

  if (!hasValidToken) {
    router.push('/')
  }
}


// 掛載與清理
onMounted(() => {
  ensureValidSession()
  fetchNews()

  //  清除登出 query 參數避免誤判
  if (router.currentRoute.value.query.loggedOut) {
    router.replace({ query: {} })
  }
})

</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #d4d8fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative; 
}

.header {
  display: flex;
  max-width: 100%;
  padding: 8px 16px; 
  margin: 0 -16px; /* 抵消 main-container 的 padding 使 header 貼齊左右邊緣 */
  width: calc(100% + 32px); /* 讓 header 撐滿整個視圖 */
  justify-content: space-between; /*調整標題文字位置*/
  align-items: center;
  gap: 10px;
  background: #fff;              /* 白底 */
  margin-bottom: 20px;
  /*新增置頂設定 */
  position: sticky;
  top: 0;
  z-index: 10; /* 確保在其他區塊上層 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 陰影區分層次 */
  
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px; 
}

.page-title {
  color: #000;
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}


.header-icon {
  width: 40px;
  height: 40px;
}

.news-section {
  margin-top: 20px;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
}

.view-all {
  font-size: 20px;
  color: #0063f9;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.arrow-icon {
  width: 12px;
  height: 12px;
  margin-left: 4px;
}

.news-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-card {
  display: flex;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 8px;
}

.news-content {
  margin-left: 10px;
  flex: 1;
}

.news-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.news-description {
  font-size: 15px;
  color: #555;
  margin-bottom: 6px;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}

.news-link {
  font-size: 13px;
  color: #2053ed;
  cursor: pointer;
}
</style>
