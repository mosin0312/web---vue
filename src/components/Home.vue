<template>
  <div class="main-container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <img src="@/assets/icons/header-icon.svg" alt="logo" class="header-icon" />
        <h1 class="page-title">主頁</h1>
      </div>
      <div class="header-right">
        <img src="@/assets/icons/question.svg" alt="avatar" class="avatar-icon" />
      </div>
    </header>

    <!-- Notification -->
    <section class="notification-bar">
      <img src="@/assets/icons/notification.svg" alt="通知" class="notification-icon" />
      <span class="notification-text">通知</span>
    </section>

    <!-- Carousel -->
    <section
  class="carousel" @touchstart="handleTouchStart" @touchend="handleTouchEnd" @mousedown="handleMouseDown">
  <div class="carousel-wrapper">
    <div
      class="carousel-image"
      :style="{ backgroundImage: `url(${carouselImages[currentIndex].url})` }"
    >

    <!-- 可能會刪 -->
      <div class="carousel-caption">
        {{ carouselImages[currentIndex].title }}
      </div>
<!-- 可能會刪  -->

    </div>
    <button class="arrow left" @click="prevImage">&#8249;</button>
    <button class="arrow right" @click="nextImage">&#8250;</button>
  </div>
  <div class="carousel-dots">
    <span
      v-for="(dot, i) in carouselImages.length"
      :key="i"
      class="dot"
      :class="{ active: i === currentIndex }"
      @click="currentIndex = i"
    ></span>
  </div>
</section>

    <!-- News Section -->
    <section class="news-section">
      <div class="section-header">
        <h2 class="section-title">更多相關資訊</h2>
        <div class="view-all" @click="goToAllNews">
          查看全部
        </div>
      </div>

      <div class="news-list">
  <div v-for="(item, index) in newsList.slice(0, 5)" :key="index" class="news-card">
    <img :src="item.imageUrl" class="news-image" />
    <div class="news-content">
      <div class="news-title">{{ item.title }}</div>
      <div class="news-description">{{ item.description }}</div>
      <div class="news-footer">
        <span class="news-date">{{ item.pubDate }}</span>
        <span class="news-link" @click="goToNews(item)">查看詳細內容</span>
      </div>
    </div>
  </div>
</div>
    </section>
   <!--測試跳轉用，之後刪掉 -->
<button @click="goToMember" class="test-btn">
  測試跳轉到 MemberManagementView.vue
</button>
<!--測試跳轉用，之後刪掉 -->

  <!--測試跳轉用，之後刪掉 -->
<button @click="goToPC" class="test-btn">
  測試跳轉到 phoneCard.vue
</button>
<!--測試跳轉用，之後刪掉 -->

<AlertModal
  v-if="showLoginModal"  message="請先登入會員才能使用此功能"  @close="showLoginModal = false"/>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/api'
import AlertModal from '@/components/AlertModal.vue'
import { useRouter } from 'vue-router'
import { isUserLoggedIn } from '@/router/useAuth.js'

const router = useRouter()
const showLoginModal = ref(false)

// 會員功能導向檢查
const goToMember = () => {
  if (!isUserLoggedIn()) {
    showLoginModal.value = true
    return
  }
  router.push('/member-management')
}

const goToPC = () => {
  if (!isUserLoggedIn()) {
    showLoginModal.value = true
    return
  }
  router.push('/phonecard')
}

// 輪播圖資料
const carouselImages = [
  { url: new URL("@/assets/icons/fzpic1.svg", import.meta.url).href, title: '守護你我，識破詐騙' },
  { url: new URL("@/assets/icons/fzpic2.svg", import.meta.url).href, title: '165 一鍵撥號，快速報警' },
  { url: new URL("@/assets/icons/fzpic3.svg", import.meta.url).href, title: '全民反詐，立即行動' }
]

const currentIndex = ref(0)
let intervalId = null

const prevImage = () => {
  currentIndex.value = (currentIndex.value - 1 + carouselImages.length) % carouselImages.length
}
const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % carouselImages.length
}

// 自動輪播
const startAutoPlay = () => {
  intervalId = setInterval(() => {
    nextImage()
  }, 5000)
}
const stopAutoPlay = () => {
  if (intervalId) clearInterval(intervalId)
}

// 滑動控制
let startX = 0
let isDragging = false

const handleTouchStart = (e) => {
  stopAutoPlay()
  startX = e.changedTouches[0].clientX
}
const handleTouchEnd = (e) => {
  const endX = e.changedTouches[0].clientX
  const deltaX = endX - startX
  if (deltaX > 50) prevImage()
  else if (deltaX < -50) nextImage()
  startAutoPlay()
}

const handleMouseDown = (e) => {
  stopAutoPlay()
  isDragging = true
  startX = e.clientX
}
const handleMouseUp = (e) => {
  if (!isDragging) return
  const endX = e.clientX
  const deltaX = endX - startX
  if (deltaX > 50) prevImage()
  else if (deltaX < -50) nextImage()
  isDragging = false
  startAutoPlay()
}

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
        : '/api/MemberManagement/grabnews'  // ✅ 訪客改用 grabnews

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

const goToAllNews = () => {
  // router.push('/news')
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
  startAutoPlay()
  window.addEventListener('mouseup', handleMouseUp)
  fetchNews()

  //  清除登出 query 參數避免誤判
  if (router.currentRoute.value.query.loggedOut) {
    router.replace({ query: {} })
  }
})

onUnmounted(() => {
  stopAutoPlay()
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  max-width: 100%;
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
  padding: 8px 16px; /* 修改為與 main-container 一致的 padding */
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 可加陰影區分層次 */
  
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px; 
}

.page-title {
  color: #000;
  font-family: Inter, sans-serif;
  font-size: 25px;
  font-weight: 700;
  margin: 0;
}


.header-icon {
  width: 39px;
  height: 39px;
}

.notification-bar {
  display: flex;
  align-items: center;
  background: #fff;              /* 白底 */
  border-radius: 12px;           /*  圓角 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); /*  陰影 */
  width: 100%; /* 更窄些 */
  max-width: 100%;
  height: 40px;  
  padding: 8px 12px;
  margin-bottom: 20px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  margin-right: 8px;
}

.notification-text {
  font-weight: 500;
  color: #888;
  font-size: 14px;
}

.carousel {
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-bottom: 16px;
  cursor: grab;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 12px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  transition: background-image 0.3s ease-in-out;
}
/*可能會刪*/
.carousel-caption {
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
/*可能會刪*/

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
  z-index: 2;
  border-radius: 50%;
}

.arrow.left {
  left: 8px;
}

.arrow.right {
  right: 8px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #ccc;
  border-radius: 50%;
  margin: 0 3px;
}

.dot.active {
  background: #000;
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

.news-image {
  width: 100px;
  height: 75px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.news-content {
  margin-left: 10px;
  flex: 1;
}

.news-title {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 4px;
}

.news-description {
  font-size: 20px;
  color: #555;
  margin-bottom: 6px;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: #888;
}

.news-link {
  font-size: 20px;
  color: #2053ed;
  cursor: pointer;
}

/**測試跳轉用，之後刪掉 */
.test-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
/**測試跳轉用，之後刪掉 */

</style>
