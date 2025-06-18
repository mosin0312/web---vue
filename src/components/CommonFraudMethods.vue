<template>
  <div class="main-container">
    <!-- Header -->
    <header class="header">
      <img src="@/assets/icons/header-icon.svg" alt="Logo" class="header-icon" />
      <span class="header-title">常見詐騙手法</span>
    </header>

    <!-- Button Section -->
    <section class="button-section">
      <button
        class="category-button"
        :class="{ active: selectedCategory === 'store' }"
        @click="selectedCategory = 'store'"
      >店家澄清資訊</button>
      <button
        class="category-button"
        :class="{ active: selectedCategory === '165' }"
        @click="selectedCategory = '165'"
      >165資訊公告</button>
      <button
        class="category-button"
        :class="{ active: selectedCategory === 'app' }"
        @click="selectedCategory = 'app'"
      >APP資訊公告</button>
    </section>

    <!-- News List -->
    <section class="news-list">
      <div
        class="news-item"
        v-for="(item, index) in filteredNews"
        :key="index"
      >
        <div class="news-title">{{ item.title }}</div>
        <div class="news-content">{{ item.content }}</div>
        <div class="news-footer">
          <span class="news-date">上傳時間：{{ new Date(item.date).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
            }) }}</span>
          <span class="read-more" @click="handleReadMore(item)">點擊看完整內容</span>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3 class="modal-title">{{ selectedItem.title }}</h3>
        <p class="modal-text">{{ selectedItem.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const selectedCategory = ref('store');
const showModal = ref(false);
const selectedItem = ref({});

const fallbackNews = [
  {
    title: '台灣大哥大提醒:本公司無假借合併之名發出「門號點數到期兌換活動」簡訊，請小心詐騙',
    content: '台灣大哥大提醒您！近日詐騙集團猖獗，且手法日新月異 提高警覺，慎防詐騙！...',
    date: '2023/03/30',
    category: 'store',
    link: 'https://www.taiwanmobile.com/csonline/service/ann/ann3_20240715_100021.html'
  },
  {
    title: '165防詐資訊：近期高風險詐騙手法更新',
    content: '近期165公布多起假冒政府詐騙事件，提醒民眾提高警覺。...',
    date: '2023/04/15',
    category: '165',
    link: 'https://165.npa.gov.tw/#/'
  },
  {
    title: '又見幫忙投票騙帳號手法 輸入驗證碼帳號直接被盜走!',
    content: '日前有王姓小姐反映instagram收到好友私訊，傳送名為「繪畫大公投」的網址，要求王女幫小...',
    date: '2025/03/17',
    category: 'app',
    link: 'https://www.cib.npa.gov.tw/ch/app/news/view?module=news&id=1887&serno=cafcacd1-3220-46cc-a0b2-5ef53362dbad'
  }
];

const newsItems = ref(fallbackNews);

onMounted(async () => {
  try {
    const response = await axios.get('https://example.com/api/news');
    if (Array.isArray(response.data)) {
      newsItems.value = response.data;
    }
  } catch (error) {
    console.warn('使用 fallback 資料顯示');
  }
});

const filteredNews = computed(() => {
  return newsItems.value.filter(item => item.category === selectedCategory.value);
});

const handleReadMore = (item) => {
  if (item.link) {
    window.open(item.link, '_blank');
  } else {
    selectedItem.value = item;
    showModal.value = true;
  }
};
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffcbb3, #ffffff);
  overflow-y: auto;
}

.header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 10px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-icon {
  width: 28px;
  height: 28px;
  margin-right: 10px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #000;
}

.button-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 16px 0;
}

.category-button {
  background: #e0f4ff;
  border: 2px solid #84aacf;
  border-radius: 100px;
  padding: 4px 12px;
  font-size: 14px;
  font-family: "irohamaru", sans-serif;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.category-button.active {
  background: #84aacf;
  color: white;
  font-weight: bold;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 16px 16px;
}

.news-item {
  background: white;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.news-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.news-content {
  font-size: 12px;
  color: #444;
  line-height: 1.4;
  margin-bottom: 8px;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
}

.read-more {
  color: #2053ed;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 80%;
  max-width: 400px;
  text-align: left;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

.modal-text {
  font-size: 14px;
  line-height: 1.6;
}
</style>
