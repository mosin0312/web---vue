<template>
  <div class="main-container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <img src="@/assets/icons/header-icon.svg" alt="logo" class="header-icon" />
        <h1 class="page-title">主頁</h1>
      </div>
      <div class="header-right">
        <img src="@/assets/icons/anti_fraud.svg" alt="avatar" class="anti_fraud-icon" @click="anti"/>
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

    <section class="news-section">
  <div class="section-header">
    <h2 class="section-title">相關資訊</h2>
    <div class="view-all" @click="goToAllNews">查看更多新聞</div>
  </div>

  <ul class="news-list">
    <li v-for="item in newsList.slice(0,5)" :key="item.link || item.title" class="news-item">
      <div class="news-row">
        <!-- 可選縮圖 -->
        <img v-if="item.imageUrl"  :src="item.imageUrl" :alt="item.title" class="news-thumb" loading="lazy" @error="onImgError"/>

        <div class="news-main">
          <div class="news-title" :title="item.title">{{ item.title }}</div>
          <div class="news-meta">
            <span class="news-date">{{ item.pubDateText || item.time || '' }}</span>
            <span v-if="item.source" class="news-source">・{{ item.source }}</span>
          </div>
          <div v-if="item.description" class="news-desc">{{ item.description }}</div>
        </div>

        <button class="news-action" @click="goToNews(item)">查看內容</button>
      </div>
    </li>
  </ul>
</section>

<AlertModal
  v-if="showLoginModal"  @close="showLoginModal = false"/>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/api'
import AlertModal from '@/components/AlertModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showLoginModal = ref(false)

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
        : '/api/MemberManagement/grabnews'  //  訪客用 grabnews

    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data?.news) {
      newsList.value = response.data.news
        .map(n => ({
          ...n,
          pubDateText: n.pubDate || n.time || '',       // 統一日期鍵
          imageUrl: n.imageUrl || n.image || null,      // 統一圖片鍵
          description: n.description || '',             // 有些來源可能無描述
        }))
        .sort((a, b) => new Date(b.pubDateText) - new Date(a.pubDateText))
    }
  } catch (error) {
    console.error('取得新聞失敗:', error)
  }
}



const goToNews = (item) => {
  window.open(item.link, '_blank')
}

const goToAllNews = () => {
  router.push('/common-fraud-methods')
}

const anti = () => {
  router.push("/anti-fraud-pomption")
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
/* ===== Layout base ===== */
.main-container{
  width:100%; height:100vh; font-family:'Inter',sans-serif;
  background:linear-gradient(180deg,#d4d8fa 0%,#ffffff 100%);
  display:flex; flex-direction:column; align-items:center;
  padding:0 16px; box-sizing:border-box; position:relative;
}

/* Header */
.header{
  display:flex; max-width:100%; padding:8px 16px;
  margin:0 -16px; width:calc(100% + 32px);
  justify-content:space-between; align-items:center; gap:10px;
  background:#fff; margin-bottom:20px; position:sticky; top:0; z-index:10;
  box-shadow:0 2px 6px rgba(0,0,0,.1);
}
.header-left{ display:flex; align-items:center; gap:6px; }
.page-title{ color:#000; font-family:Inter,sans-serif; font-size:20px; font-weight:700; margin:0; }
.header-icon{ width:40px; height:40px; }

/* Notification (保留) */
.notification-bar{
  display:flex; align-items:center; background:#fff; border-radius:12px;
  box-shadow:0 2px 6px rgba(0,0,0,.15); width:100%; max-width:100%;
  height:40px; padding:8px 12px; margin-bottom:20px;
}
.notification-icon{ width:40px; height:40px; margin-right:8px; }
.notification-text{ font-weight:500; color:#888; font-size:18px; }

/* Carousel (保留) */
.carousel{ position:relative; width:100%; max-width:100%; margin-bottom:16px; cursor:grab; }
.carousel-wrapper{ position:relative; width:100%; height:180px; overflow:hidden; border-radius:12px; }
.carousel-image{ width:100%; height:100%; background-size:cover; background-position:center; border-radius:12px; transition:background-image .3s ease-in-out; }
.carousel-caption{
  position:absolute; bottom:12px; left:16px; right:16px; background:rgba(0,0,0,.4);
  color:#fff; padding:6px 12px; border-radius:6px; font-size:14px; animation:fadeIn .6s ease-in-out;
}
@keyframes fadeIn{ from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }
.arrow{ position:absolute; top:50%; transform:translateY(-50%); background-color:rgba(255,255,255,.5); border:none; font-size:25px; padding:8px; cursor:pointer; z-index:2; border-radius:50%; }
.arrow.left{ left:8px; } .arrow.right{ right:8px; }
.carousel-dots{ display:flex; justify-content:center; margin-top:8px; }
.dot{ width:8px; height:8px; background:#ccc; border-radius:50%; margin:0 3px; }
.dot.active{ background:#000; }

/* ===== News section ===== */
.news-section{ margin-top:20px; width:100%; height:100%; background-size:cover; background-position:center; }
.section-header{ display:flex; justify-content:space-between; align-items:center; }
.section-title{ font-size:20px; font-weight:bold; }
.view-all{ font-size:20px; color:#0063f9; display:flex; align-items:center; cursor:pointer; }
.arrow-icon{ width:12px; height:12px; margin-left:4px; }

/* ---- UL/LI 列表版（建議使用） ---- */
.news-list{
  list-style:none; padding:0; margin:10px 0 0;
  display:flex; flex-direction:column; gap:12px;
}
.news-list > li{ list-style:none; }

.news-item{
  position:relative;
  background:#eef3ff; border-radius:10px;
  padding:12px 88px 12px 12px; /* 右側為按鈕預留空間 */
}
.news-row{ display:flex; justify-content:space-between; align-items:stretch; gap:12px; }
.news-main{ flex:1; min-width:0; }

/* 縮圖（若需要） */
.news-thumb{ width:90px; height:150px; border-radius:6px; object-fit:cover; flex-shrink:0; }

/* 兩行截斷：標題 / 描述（含舊 .news-description 別名） */
.news-title,
.news-desc,
.news-description{
  display:-webkit-box; -webkit-box-orient:vertical; box-orient:vertical;
  overflow:hidden; line-height:1.5; -webkit-line-clamp:2; line-clamp:2;
}
.news-title{ font-size:16px; font-weight:700; max-height:calc(1.5em * 2); }
.news-desc, .news-description{ margin-top:6px; font-size:14px; max-height:calc(1.5em * 2); }

.news-meta{
  margin-top:6px; font-size:12px; color:#6b7280;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}

/* 右下「查看內容」 */
.news-action{
  position:absolute; right:12px; bottom:12px;
  border:none; background:transparent; color:#2053ed;
  font-size:12px; cursor:pointer; white-space:nowrap; padding:0; line-height:1.2;
}



/* Others */
.anti_fraud-icon{ width:45px; height:45px; }

</style>

