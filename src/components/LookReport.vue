<template>
  <div class="main-container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <img src="@/assets/icons/comeback.svg" alt="logo" class="header-icon" @click="goBack"/>
        <h1 class="page-title">查看回報</h1>
      </div>
    </header>

    <!-- News Section -->
    <section class="news-section">
  <ul class="news-list">
    <li v-for="item in newsList" :key="item.link || item.title" class="news-item">
      <div class="news-row">
        <div class="news-main">
          <!-- 兩行截斷的標題 -->
          <div class="news-title" :title="item.title">{{ item.title }}</div>

          <!-- 第二行：日期＋來源 -->
          <div class="news-meta">
            <span class="news-date">{{ item.pubDateText || item.time || '' }}</span>
            <span v-if="item.source" class="news-source">・{{ item.source }}</span>
          </div>

          <!-- 兩行截斷的描述 -->
          <div v-if="item.description" class="news-desc">{{ item.description }}</div>
        </div>

        <!-- 右側動作 -->
        <button class="news-action" @click="goToNews(item)">查看完整內容</button>
      </div>
    </li>
  </ul>
</section>

<AlertModal
  v-if="showLoginModal"  @close="showLoginModal = false"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import AlertModal from '@/components/AlertModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showLoginModal = ref(false)

const newsList = ref([])

const fetchNews = async () => {
  try {
    const userId = localStorage.getItem('userId')  // ✅ 從 localStorage 拿 userId
    const token = localStorage.getItem('userToken') // ✅ 拿取 token

    if (!userId || !token) {
      showLoginModal.value = true
      return
    }

    const response = await api.get(`/api/Test/suspicious/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // ✅ 處理時間格式與排序
    newsList.value = response.data.map(item => ({
      ...item,
      pubDateText: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
      title: item.summary || '（無摘要）',
      link: item.link || ''
    })).sort((a, b) => toTs(b.createdAt) - toTs(a.createdAt))

  } catch (err) {
    console.error('載入回報失敗：', err)
    newsList.value = []
  }
}


/** 字串日期 -> 數字時間戳（多格式相容） */
function toTs(s) {
  if (!s) return 0
  // 先嘗試原字串
  let t = Date.parse(s)
  if (!Number.isNaN(t)) return t

  // 常見格式歸一：YYYY/MM/DD、YYYY.MM.DD、YYYY年MM月DD日 HH:mm 等
  let normalized = s.trim()
    .replace(/[年/.]/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/\s+/g, ' ')
  t = Date.parse(normalized)
  return Number.isNaN(t) ? 0 : t
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
  font-size: 22px;
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

/* 1) 移除 <ul> 的圓點與左右縮排 */
.news-list {
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 12px; 
  display: flex; flex-direction: column;
}
/* 保險起見，把 li 也關掉 */
.news-list > li { list-style: none; }

/* 2) 讓整列撐滿高度，按鈕可以貼底 */
.news-row {
  display: flex;
  justify-content: space-between;
  align-items: stretch;   /* ← 原本是 flex-start，改成 stretch 才能貼底 */
  gap: 12px;
}

/* 3) 右側「查看內容」靠右且貼底 */
.news-action {
  align-self: flex-end;   /* 貼到底部 */
  border: none;
  background: transparent;
  color: #2053ed;
  font-size: 16px;
  cursor: pointer;
  white-space: nowrap;
  padding: 0;
  line-height: 1.2;
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

.news-item {
  background: #eef3ff;
  border-radius: 10px;
  padding: 12px;
}

/* 讓 clamp 生效、文字區能縮放 */
.news-main { flex: 1; min-width: 0; }

/* 標題：兩行截斷 */
.news-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;

  /* 行數 */
  -webkit-line-clamp: 2;   /* 目前主流實作 */
  line-clamp: 2;           /* 標準屬性，修正 vendorPrefix 提示 */

  /* 可留作 Firefox 等退化高度限制 */
  line-height: 1.5;
  max-height: calc(1.5em * 2);
}

/* 日期＋來源一行 */
.news-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 描述：兩行截斷（有才顯示） */
.news-desc {
  margin-top: 6px;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;

  /* 行數 */
  -webkit-line-clamp: 2;   /* 目前主流實作 */
  line-clamp: 2;           /* 標準屬性，修正 vendorPrefix 提示 */

  /* 可留作 Firefox 等退化高度限制 */
  line-height: 1.5;
  max-height: calc(1.5em * 2);
}
</style>