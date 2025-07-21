<template>
  <div class="main-container">
    <header class="header">
      <img src="@/assets/icons/header-icon.svg" alt="Logo" class="header-icon" />
      <span class="title">簡訊</span>
    </header>

    <!-- 分類按鈕 -->
    <div class="sms-category-options">
      <button
        :class="['button-sms-category', selectedCategory === 'general' ? 'active' : '']"
        @click="changeCategory('general')"
      >
        一般簡訊
      </button>
      <button
        :class="['button-sms-category', selectedCategory === 'strange' ? 'active' : '']"
        @click="changeCategory('strange')"
      >
        陌生簡訊
      </button>
      <button
        :class="['button-sms-category', selectedCategory === 'screenshot' ? 'active' : '']"
        @click="changeCategory('screenshot')"
      >
        截圖分析
      </button>
    </div>

    <!-- 簡訊列表 -->
    <div class="newsletter-logs">
      <div
        v-for="(sms, index) in filteredSmsList"
        :key="index"
        :class="['sms-card', sms.read ? 'read' : 'unread']"
        @click="markAsReadAndNavigate(sms.phone)"
      >
        <div class="sms-left">
          <div class="avatar" :style="{ backgroundImage: `url(${sms.avatarUrl})` }"></div>
          <div class="icon">
            <img :src="sms.iconUrl" alt="icon" />
          </div>
          <div class="text-block">
            <div class="phone-risk">
              <span class="phone">{{ sms.phone }}</span>
              <div class="risk-inline">
                <img class="risk-icon" :src="getRiskIcon(sms.risk)" :alt="sms.risk" />
                <span class="risk-reason">{{ sms.riskText }}</span>
              </div>
            </div>
            <span class="message">{{ sms.message }}</span>
          </div>
        </div>

        <div class="sms-right">
          <div class="meta">
            <span class="date">{{ sms.date }}</span>
            <span v-if="isUnread(sms.phone)" class="badge">1</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const selectedCategory = ref('general')
const readPhones = ref(JSON.parse(localStorage.getItem('readPhones') || '[]'))
const smsList = ref([])

onMounted(() => {
  const token = localStorage.getItem('token')

  window.addEventListener('sms-from-android', async (e) => {
    const smsArray = e.detail

    const analyzedList = await Promise.all(
      smsArray.map(async (sms) => {
        try {
          const res = await api.post(
            '/api/MemberManagement/CheckRisk',
            { message: sms.body },
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 3000
            }
          )

          const data = res.data
          return {
            phone: sms.address,
            message: sms.body,
            date: new Date(Number(sms.date)).toLocaleDateString(),
            avatarUrl: require('@/assets/icons/avatar.svg'),
            iconUrl: require('@/assets/icons/property-user.svg'),
            category: 'strange',
            read: readPhones.value.includes(sms.address),
            risk: convertRiskLevel(data.riskLevel),
            riskText: data.riskLevel,
            severity: data.severity
          }
        } catch (e) {
          return {
            phone: sms.address,
            message: sms.body,
            date: new Date(Number(sms.date)).toLocaleDateString(),
            avatarUrl: require('@/assets/icons/avatar.svg'),
            iconUrl: require('@/assets/icons/property-user.svg'),
            category: 'strange',
            read: readPhones.value.includes(sms.address),
            risk: 'unknown',
            riskText: '未知',
            severity: '無法分析'
          }
        }
      })
    )

    smsList.value = analyzedList
  })
})

const convertRiskLevel = (riskLevel) => {
  switch (riskLevel) {
    case '高風險': return 'high'
    case '中風險': return 'medium'
    case '低風險': return 'low'
    default: return 'unknown'
  }
}

const changeCategory = (category) => {
  selectedCategory.value = category
  if (category === 'screenshot') {
    router.push('/screenshot')
  }
}

const getRiskIcon = (risk) => {
  switch (risk) {
    case 'low': return require('@/assets/icons/risk-low.svg')
    case 'medium': return require('@/assets/icons/risk-medium.svg')
    case 'high': return require('@/assets/icons/risk-high.svg')
    default: return require('@/assets/icons/risk-unknown.svg')
  }
}

const filteredSmsList = computed(() =>
  smsList.value
    .map(sms => ({ ...sms, read: readPhones.value.includes(sms.phone) }))
    .filter(sms => sms.category === selectedCategory.value)
)

const isUnread = (phone) => !readPhones.value.includes(phone)

const markAsReadAndNavigate = (phone) => {
  if (!readPhones.value.includes(phone)) {
    readPhones.value.push(phone)
    localStorage.setItem('readPhones', JSON.stringify(readPhones.value))
  }
  router.push(`/chat?phone=${phone}`)
}
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #f9d4e0, #ffffff);
  display: flex;
  flex-direction: column;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 10px;
}
.header-icon {
  width: 28px;
  height: 28px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
.sms-category-options {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 10px 0;
}
.button-sms-category {
  padding: 6px 14px;
  border-radius: 100px;
  border: 2px solid #84aacf;
  background: #e0f2ff;
  color: #333;
  font-weight: 500;
  font-family: "irohamaru", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}
.button-sms-category.active {
  background: #84aacf;
  color: white;
  border-color: #3e6c9e;
}
.newsletter-logs {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sms-card {
  background: white;
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
}
.sms-left {
  display: flex;
  gap: 8px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}
.icon img {
  width: 18px;
  height: 18px;
  margin-top: 4px;
}
.text-block {
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 160px);
}
.phone-risk {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.risk-inline {
  display: flex;
  align-items: center;
  gap: 4px;
}
.risk-icon {
  width: 16px;
  height: 16px;
}
.risk-reason {
  font-size: 10px;
  color: #666;
}
.phone {
  font-weight: bold;
  font-size: 14px;
}
.message {
  font-size: 10px;
  color: #333;
  word-break: break-word;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sms-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  min-width: 50px;
}
.date {
  font-size: 10px;
  margin-top: 4px;
}
.badge {
  background: #b3261e;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4px;
}
</style>
