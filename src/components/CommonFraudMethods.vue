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

          <!-- 兩行截斷的描述（有才顯示） -->
          <div v-if="item.description" class="news-desc">{{ item.description }}</div>
        </div>

        <!-- 右側動作 -->
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
    const role = localStorage.getItem('userRole') // "User" or "Guest"
    const token = role === 'User'
      ? localStorage.getItem('userToken')
      : localStorage.getItem('guestToken')

    if (!token || !role) {
      console.warn('無效身份或 token，略過新聞請求')
      return
    }

    // 依角色決定兩個來源端點
    const memberUrl = role === 'User'
      ? '/api/MemberManagement/news'
      : '/api/MemberManagement/grabnews'

    const npa165Url = role === 'User'
      ? '/api/Test/165_news_user'
      : '/api/Test/165_news_guest'

    const headers = { Authorization: `Bearer ${token}` }

    // 並行請求：MemberManagement + 165
    const [memberRes, npaRes] = await Promise.allSettled([
      api.get(memberUrl, { headers }),
      api.get(npa165Url, { headers })
    ])

    let merged = []

    // 來源一：/api/MemberManagement/news 或 /grabnews
    if (memberRes.status === 'fulfilled') {
      const items = memberRes.value?.data?.news ?? []
      merged.push(
        ...normalizeFromMember(items) // 轉成統一結構
      )
    } else {
      console.warn('MemberManagement 來源失敗：', memberRes.reason)
    }

    // 來源二：/api/Test/165_news_user 或 /165_news_guest（回傳為 array）
    if (npaRes.status === 'fulfilled') {
      const items = Array.isArray(npaRes.value?.data) ? npaRes.value.data : []
      merged.push(
        ...normalizeFrom165(items)
      )
    } else {
      console.warn('165 來源失敗：', npaRes.reason)
    }

    // 依 link 去重（若無 link 則用 title+日期）
    merged = dedupeBy(merged, x => x.link || `${x.title}-${x.pubDateText}`)

    // 依時間排序（新到舊）
    merged.sort((a, b) => b.ts - a.ts)

    newsList.value = merged
  } catch (err) {
    console.error('取得新聞失敗:', err)
    // 這裡可視需要加上顯示 AlertModal
  }
}

/** 將 MemberManagement 來源的資料轉成統一結構 */
function normalizeFromMember(arr) {
  // 常見欄位：title, link, pubDate, image / imageUrl ...
  return arr.map(it => {
    const pubDateText = it.pubDate || it.time || ''
    return {
      title: it.title ?? '',
      link: it.link ?? '',
      pubDateText,
      ts: toTs(pubDateText),
      image: it.image || it.imageUrl || null,
      description: it.description || ''
    }
  })
}

/** 將 165 來源的資料轉成統一結構（回傳欄位：title, time, link） */
function normalizeFrom165(arr) {
  return arr.map(it => {
    const pubDateText = it.time || ''
    return {
      title: it.title ?? '',
      link: it.link ?? '',
      pubDateText,
      ts: toTs(pubDateText),
      image: null,
      description: ''                     // ← 明確空字串，版面一致
    }
  })
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

/** 去重：keyFn 決定唯一鍵 */
function dedupeBy(arr, keyFn) {
  const seen = new Set()
  return arr.filter(x => {
    const k = keyFn(x)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
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
