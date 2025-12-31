<template>
  <div class="main-container">
    <!-- Header -->
    <div class="header">
      <img class="logo" src="@/assets/icons/comeback.svg" alt="logo" @click="goBack" />
      <div class="header-info">
        <span class="sender-name">{{ displayName }}</span>
        <span class="sender-number">{{ phone }}</span>
      </div>
    </div>

    <!-- Message List -->
    <div class="message-list">
      <div
        class="message-item"
        v-for="(msg, index) in messages"
        :key="index"
        :class="msg.position"
      >
        <div v-if="msg.image" class="message-image-wrapper">
          <img :src="msg.image" loading="lazy" class="message-image" alt="" @click="openImage(msg.image)" />
        </div>

        <div v-if="msg.text" class="message-bubble" :class="{ 'from-self': msg.position === 'right' }" @contextmenu.prevent="copyText(msg.text)" >
          <p class="message-text">  {{ msg.text }}
            <template v-if="msg.link">
              <br />
              <a class="message-link" :href="msg.link" target="_blank">{{ msg.link }}</a>
            </template>
          </p>
        </div>

       <div class="match-info">

  <div class="score-container" :class="msg.keywordRiskLevel">
    <div class="score-header">
      <span>風險評分：<strong>{{ msg.riskScore }}</strong> 分</span>
      <span class="risk-badge">
        {{ msg.keywordRiskLevel === 'high' ? '🔴 高度風險' : (msg.keywordRiskLevel === 'medium' ? '🟡 中風險' : '🟢 低風險') }}
      </span>
    </div>
    
    <div v-if="msg.matchedDetails && msg.matchedDetails.length" class="score-details">
      <span class="detail-label">命中特徵：</span>
      <span v-for="(item, idx) in msg.matchedDetails" :key="idx" class="keyword-tag">
        {{ item.word }} <small>({{ item.weight }})</small>
        {{ idx < msg.matchedDetails.length - 1 ? '、' : '' }}
      </span>
    </div>
  </div>

  <div v-if="msg.aiAnalysisResult" class="ai-box">
  <div class="ai-header">
    <span class="ai-icon">🤖</span> AI 語意分析
  </div>
  <div class="ai-content" :style="msg.aiAnalysisResult.includes('無法') ? 'color: red;' : ''">
    {{ msg.aiAnalysisResult }}
  </div>
</div>

  <!-- <div v-if="msg.matchedPatterns && msg.matchedPatterns.length" class="pattern-row">
    <span class="detail-label">語意分析：</span>
    <span>{{ msg.matchedPatterns.join('、') }}</span>
  </div> -->

  <div v-if="msg.matchedScamUrls && msg.matchedScamUrls.length" class="url-row">
    <span class="danger-label">⚠️ 詐騙網址：</span>
    <span>{{ msg.matchedScamUrls.join(', ') }}</span>
  </div>

</div>


        <div class="info-row">
          <span class="message-time">{{ msg.time }}</span>
          <div class="message-meta">
            <!-- <img :src="getRiskIcon(msg.risk)" class="risk-icon" :alt="msg.riskText" />
            <span class="risk-reason">{{ msg.riskText }}</span> -->
          </div>
        </div>
      </div>
      <div ref="messageEndRef"></div>
    </div>

    <!-- Modal Image Preview -->
    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <img :src="previewImg" class="modal-image" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { scamKeywords } from '@/router/topKeywords'


const route = useRoute()
const router = useRouter()

const phone = ref(route.query.phone || ' ')
const displayName = ref(route.query.name || ' ')
const messages = ref([])
const showModal = ref(false)
const previewImg = ref(null)
const messageEndRef = ref(null)

const goBack = () => router.go(-1)
const openImage = (src) => {
  previewImg.value = src
  showModal.value = true
}
const closeModal = () => showModal.value = false

// const getRiskIcon = (risk) => {
//   switch (risk) {
//     case 'low': return new URL('@/assets/icons/risk-low.svg', import.meta.url).href
//     case 'medium': return new URL('@/assets/icons/risk-medium.svg', import.meta.url).href
//     case 'high': return new URL('@/assets/icons/risk-high.svg', import.meta.url).href
//     case 'no': return new URL('@/assets/icons/risk-no.svg', import.meta.url).href
//     default: return new URL('@/assets/icons/risk-unknown.svg', import.meta.url).href
//   }
// }

const copyText = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('已複製訊息'))
    .catch(() => alert('複製失敗'))
}

const convertRisk = (level) => {
  switch (level) {
    case '高風險': return 'high'
    case '中風險': return 'medium'
    case '低風險': return 'low'
    case '無風險': return 'no'
    default: return 'unknown'
  }
}

const extractLink = (text) => {
  const match = text.match(/https?:\/\/[\w.-]+(?:\/\S*)?/)
  return match ? match[0] : ''
}

const normalizePhone = (phone) =>
  phone?.replace(/\D/g, '').replace(/^886/, '0')


// ---------- 🔍 統計客觀評分＋語意規則 ----------

// 1. 定義風險判斷的輔助函式 (基於四分位數)
const getKeywordRiskLevel = (count) => {
  if (count >= 21803) return 'high';   // 前 25% 高頻危險詞
  if (count >= 9726) return 'medium';  // 中間 50%
  return 'low';                        // 後 25% 相對少見
};

// 🏆 核心演算法
const calculateObjectiveRisk = (text) => {
  if (!text) {
    return { overallRisk: 'low', matchedDetails: [], matchedPatterns: [] };
  }

  const normalized = normalizeText(text);
  let matchedDetails = [];
  
  // 用來追蹤這段文字中出現過的「最高」風險等級
  let maxRiskFound = 'low'; 
  const riskSeverity = { 'high': 3, 'medium': 2, 'low': 1 }; // 方便比較嚴重程度

  // 1️⃣ 關鍵字掃描 & 個別風險標記
  for (const [word, count] of Object.entries(scamKeywords)) {
    if (normalized.includes(word)) {
      
      // 取得該關鍵字的風險等級
      const currentWordRisk = getKeywordRiskLevel(count);

      matchedDetails.push({
        word: word,
        count: count,
        risk: currentWordRisk // 這裡會標示 'high', 'medium', 或 'low'
      });

      // 更新整段文字的最高風險等級 (如果發現更嚴重的，就覆蓋過去)
      if (riskSeverity[currentWordRisk] > riskSeverity[maxRiskFound]) {
        maxRiskFound = currentWordRisk;
      }
    }
  }

  // 2️⃣ 語意模式檢查
  const matchedPatterns = []

  // 2️⃣ 30 種語意 pattern
  //const patterns = [
    // // 1. 帳戶凍結 / 停權
    // (t) => {
    //   if (t.includes('帳戶') && containsAny(t, ['凍結', '停權', '限制', '管制'])) {
    //     matchedPatterns.push('帳戶凍結/停權')
    //     return true
    //   }
    //   return false
    // },

    // // 2. 訂單異常 + 退款 / 退費
    // (t) => {
    //   if (t.includes('訂單') &&
    //       containsAny(t, ['異常', '錯誤', '取消']) &&
    //       containsAny(t, ['退款', '退費', '返還', '重複扣款'])) {
    //     matchedPatterns.push('訂單異常退款')
    //     return true
    //   }
    //   return false
    // },

    // // 3. 信用卡異常 + 驗證 / 停用
    // (t) => {
    //   if (t.includes('信用卡') &&
    //       containsAny(t, ['異常', '錯誤']) &&
    //       containsAny(t, ['驗證', '停用', '凍結'])) {
    //     matchedPatterns.push('信用卡異常驗證')
    //     return true
    //   }
    //   return false
    // },

    // // 4. 分期付款 + 解除設定 / 點數
    // (t) => {
    //   if (containsAny(t, ['分期', '分期付款']) &&
    //       containsAny(t, ['解除', '取消', '設定']) &&
    //       containsAny(t, ['點數', '手續費'])) {
    //     matchedPatterns.push('分期付款解除設定')
    //     return true
    //   }
    //   return false
    // },

    // // 5. 客服通知 + 帳務異常
    // (t) => {
    //   if (t.includes('客服') &&
    //       containsAny(t, ['帳務', '帳戶']) &&
    //       containsAny(t, ['異常', '風險', '錯誤'])) {
    //     matchedPatterns.push('客服帳務異常')
    //     return true
    //   }
    //   return false
    // },

    // // 6. ATM 操作 + 設定 / 啟用
    // (t) => {
    //   if (t.includes('ATM') &&
    //       containsAny(t, ['操作', '設定', '啟用']) &&
    //       containsAny(t, ['帳戶', '分期', '服務'])) {
    //     matchedPatterns.push('ATM操作設定')
    //     return true
    //   }
    //   return false
    // },

    // // 7. 轉帳錯誤 + 需協助處理
    // (t) => {
    //   if (containsAny(t, ['轉帳', '匯款']) &&
    //       containsAny(t, ['錯誤', '失敗', '異常']) &&
    //       containsAny(t, ['協助', '處理', '更正'])) {
    //     matchedPatterns.push('轉帳錯誤需處理')
    //     return true
    //   }
    //   return false
    // },

    // // 8. 手機銀行 / 網路銀行 + 綁定 / 登入異常
    // (t) => {
    //   if (containsAny(t, ['手機銀行', '網路銀行']) &&
    //       containsAny(t, ['綁定', '登入']) &&
    //       containsAny(t, ['異常', '風險', '錯誤'])) {
    //     matchedPatterns.push('手機銀行綁定異常')
    //     return true
    //   }
    //   return false
    // },

    // // 9. 欠費 + 停話 / 暫停服務
    // (t) => {
    //   if (containsAny(t, ['欠費', '未繳']) &&
    //       containsAny(t, ['停話', '暫停', '中止']) &&
    //       containsAny(t, ['電信', '門號', '電話'])) {
    //     matchedPatterns.push('電信欠費停話')
    //     return true
    //   }
    //   return false
    // },

    // // 10. 國稅 / 繳稅 + 資料錯誤
    // (t) => {
    //   if (containsAny(t, ['國稅局', '稅務', '繳稅']) &&
    //       containsAny(t, ['資料', '資訊']) &&
    //       containsAny(t, ['錯誤', '異常', '更正'])) {
    //     matchedPatterns.push('繳稅資料錯誤')
    //     return true
    //   }
    //   return false
    // },

    // // 11. 投資 + 保證獲利
    // (t) => {
    //   if (t.includes('投資') &&
    //       containsAny(t, ['保證', '穩賺', '穩定']) &&
    //       containsAny(t, ['獲利', '收益', '回報'])) {
    //     matchedPatterns.push('投資保證獲利')
    //     return true
    //   }
    //   return false
    // },

    // // 12. 虛擬貨幣 + 群組 / 指導
    // (t) => {
    //   if (containsAny(t, ['虛擬貨幣', '虛擬幣', '加密貨幣', '比特幣']) &&
    //       containsAny(t, ['群組', '社群']) &&
    //       containsAny(t, ['老師', '導師', '指導'])) {
    //     matchedPatterns.push('虛擬貨幣導師群組')
    //     return true
    //   }
    //   return false
    // },

    // // 13. 股票 + 內線消息 / 把握機會
    // (t) => {
    //   if (t.includes('股票') &&
    //       containsAny(t, ['內線', '消息']) &&
    //       containsAny(t, ['把握', '機會', '穩賺'])) {
    //     matchedPatterns.push('股票內線機會')
    //     return true
    //   }
    //   return false
    // },

    // // 14. LINE 群組 + 分析師 / 報牌
    // (t) => {
    //   if (containsAny(t, ['LINE群組', '群組']) &&
    //       containsAny(t, ['分析師', '老師']) &&
    //       containsAny(t, ['報牌', '報明牌', '帶單'])) {
    //     matchedPatterns.push('投資群組報牌')
    //     return true
    //   }
    //   return false
    // },

    // // 15. 期貨 / 外匯 + 穩定收益
    // (t) => {
    //   if (containsAny(t, ['期貨', '外匯']) &&
    //       containsAny(t, ['穩定', '穩健']) &&
    //       containsAny(t, ['收益', '獲利', '回報'])) {
    //     matchedPatterns.push('期貨外匯穩定收益')
    //     return true
    //   }
    //   return false
    // },

    // // 16. 儲值 + 回饋 / 點數
    // (t) => {
    //   if (containsAny(t, ['儲值', '充值']) &&
    //       containsAny(t, ['回饋', '贈送']) &&
    //       t.includes('點數')) {
    //     matchedPatterns.push('儲值點數回饋')
    //     return true
    //   }
    //   return false
    // },

    // // 17. 低成本 + 高報酬
    // (t) => {
    //   if (containsAny(t, ['低成本', '小資', '少量', '小額']) &&
    //       containsAny(t, ['高報酬', '高獲利', '高收益'])) {
    //     matchedPatterns.push('低成本高報酬投資')
    //     return true
    //   }
    //   return false
    // },

    // // 18. 會員分紅 + 手續費
    // (t) => {
    //   if (containsAny(t, ['會員', 'VIP']) &&
    //       t.includes('分紅') &&
    //       containsAny(t, ['手續費', '代繳'])) {
    //     matchedPatterns.push('會員分紅手續費')
    //     return true
    //   }
    //   return false
    // },

    // // 19. 涉嫌洗錢 + 配合調查
    // (t) => {
    //   if (t.includes('洗錢') &&
    //       containsAny(t, ['涉嫌', '涉及']) &&
    //       containsAny(t, ['配合', '調查'])) {
    //     matchedPatterns.push('涉嫌洗錢配合調查')
    //     return true
    //   }
    //   return false
    // },

    // // 20. 法院傳票 + 出庭 / 移送
    // (t) => {
    //   if (t.includes('法院') &&
    //       containsAny(t, ['傳票', '出庭', '移送'])) {
    //     matchedPatterns.push('法院傳票出庭')
    //     return true
    //   }
    //   return false
    // },

    // // 21. 政府 / 戶政 / 勞保 / 健保 + 更新資料
    // (t) => {
    //   if (containsAny(t, ['戶政', '勞保', '健保', '政府機關']) &&
    //       containsAny(t, ['更新', '更正', '補件']) &&
    //       t.includes('資料')) {
    //     matchedPatterns.push('公家機關資料更新')
    //     return true
    //   }
    //   return false
    // },

    // // 22. 健保 / 補助 + 異常 / 停發
    // (t) => {
    //   if (containsAny(t, ['健保', '補助', '津貼']) &&
    //       containsAny(t, ['異常', '停發', '中止', '錯誤'])) {
    //     matchedPatterns.push('補助/健保異常')
    //     return true
    //   }
    //   return false
    // },

    // // 23. 罰單未繳 + 系統 / 帳務問題
    // (t) => {
    //   if (containsAny(t, ['罰單', '違規']) &&
    //       containsAny(t, ['未繳', '逾期']) &&
    //       containsAny(t, ['系統', '帳務'])) {
    //     matchedPatterns.push('罰單未繳疑慮')
    //     return true
    //   }
    //   return false
    // },

    // // 24. 海關包裹滯留 + 清關費
    // (t) => {
    //   if (containsAny(t, ['海關', '關務']) &&
    //       containsAny(t, ['包裹', '貨物']) &&
    //       containsAny(t, ['滯留', '扣留']) &&
    //       containsAny(t, ['清關費', '關稅', '手續費'])) {
    //     matchedPatterns.push('海關包裹滯留清關費')
    //     return true
    //   }
    //   return false
    // },

    // // 25. 包裹地址錯誤 + 點擊連結
    // (t) => {
    //   if (containsAny(t, ['包裹', '宅配', '物流']) &&
    //       containsAny(t, ['地址', '收件人']) &&
    //       containsAny(t, ['錯誤', '不完整']) &&
    //       containsAny(t, ['點擊', '連結', '網址'])) {
    //     matchedPatterns.push('宅配地址錯誤連結')
    //     return true
    //   }
    //   return false
    // },

    // // 26. 交友 / 認識 + 匯款 / 幫忙
    // (t) => {
    //   if (containsAny(t, ['交友', '認識', '朋友', '網友']) &&
    //       containsAny(t, ['匯款', '借錢', '幫忙轉帳'])) {
    //     matchedPatterns.push('交友匯款請求')
    //     return true
    //   }
    //   return false
    // },

    // // 27. 貨到付款 + 退款流程 / 手續費
    // (t) => {
    //   if (t.includes('貨到付款') &&
    //       containsAny(t, ['退款', '退費']) &&
    //       containsAny(t, ['手續費', '流程'])) {
    //     matchedPatterns.push('貨到付款退款詐騙')
    //     return true
    //   }
    //   return false
    // },

    // // 28. 門號 / 手機 + 異地登入 / 暫停
    // (t) => {
    //   if (containsAny(t, ['門號', '手機']) &&
    //       containsAny(t, ['異地登入', '異常登入', '風險登入']) &&
    //       containsAny(t, ['暫停', '停用', '保護'])) {
    //     matchedPatterns.push('門號異地登入暫停')
    //     return true
    //   }
    //   return false
    // },

    // // 29. 驗證碼 + 要你提供
    // (t) => {
    //   if (t.includes('驗證碼') &&
    //       containsAny(t, ['提供', '傳給', '回覆', '告知'])) {
    //     matchedPatterns.push('要求提供驗證碼')
    //     return true
    //   }
    //   return false
    // },

    // // 30. 中獎 / 抽獎 + 手續費 / 代繳
    // (t) => {
    //   if (containsAny(t, ['中獎', '抽獎', '得獎']) &&
    //       containsAny(t, ['手續費', '代繳', '保證金'])) {
    //     matchedPatterns.push('中獎手續費詐騙')
    //     return true
    //   }
    //   return false
    // }
  //]

  // 舊的
  // const ruleSuspicious = matchedTopKeywords.length >= 2 || hitPattern

//  patterns.forEach(fn => fn(normalized))

  // 3️⃣ 排序：把最危險的字排在最前面，方便顯示
  matchedDetails.sort((a, b) => {
    // 先比風險等級 (High > Medium > Low)
    const severityDiff = riskSeverity[b.risk] - riskSeverity[a.risk];
    if (severityDiff !== 0) return severityDiff;
    // 如果等級一樣，比次數 (高的在前)
    return b.count - a.count;
  });

  return {
    overallRisk: maxRiskFound, // 整段文字的風險 = 裡面最危險那個字的風險
    matchedDetails: matchedDetails, // 包含每個字的詳細風險清單
    matchedPatterns
  };
}

// ---------- 🔍 分析簡訊主流程 ----------

const analyzeMessages = async (smsArray) => {
  const token = localStorage.getItem('userToken')
  const targetPhone = normalizePhone(phone.value)

  const filtered = smsArray.filter(sms =>
    normalizePhone(sms.address) === targetPhone &&
    (sms.body || sms.image)
  )

  const analyzed = await Promise.all(filtered.map(async sms => {
    let risk = 'unknown'
    let riskText = '未知'
    let matchedKeywords = []
    let matchedScamUrls = []
    let aiAnalysisResult = '' // 🔥 新增：用來存 AI 回傳的文字


    // 2. 呼叫後端 API (包含舊的 CheckRisk 和新的 AI 分析)
      // (A) 呼叫新的 AI 分析 API
      try {
  const token = localStorage.getItem('userToken')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  console.log('🔗 AI request url:', api.defaults.baseURL, '/api/Test/analyze-sms')
  console.log('🔑 token length:', token?.length)

  const aiResponse = await api.post(
    '/api/Test/analyze-sms',
    { SmsText: sms.body },
    { headers }
  )

  const aiData = aiResponse.data
  console.log('🤖 AI response:', aiData)

  // 統一轉字串顯示
  aiAnalysisResult =
    typeof aiData === 'string'
      ? aiData
      : (aiData?.result || aiData?.analysis || JSON.stringify(aiData))

} catch (e) {
  const status = e?.response?.status
  const data = e?.response?.data
  console.error('❌ AI API error:', status, data || e)

  aiAnalysisResult =
    status
      ? `無法取得 AI 分析結果（HTTP ${status}）：${
          typeof data === 'string' ? data : JSON.stringify(data)
        }`
      : `無法取得 AI 分析結果：${e?.message || 'unknown error'}`
}

    // (B) 保留原本的 CheckRisk API (獨立執行)
    try {
      const response = await api.post(
        '/api/Test',
        { message: sms.body },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = response.data
      console.log('📦 CheckRisk 回傳資料：', data)

      risk = convertRisk(data.riskLevel)
      riskText = data.riskLevel
      matchedKeywords = data.matchedKeywords || []
      matchedScamUrls = data.matchedScamUrls || []
    } catch (e) {
      console.warn('❌ CheckRisk API 錯誤：', e)
    }
    

// ... 在 analyzeMessages 函式內 ...

    // ✅ 改成新的呼叫方式
    const aiAnalysis = calculateObjectiveRisk(sms.body)

    const isSelf = sms.type === 2 || sms.fromMe

    return {
      position: isSelf ? 'right' : 'left',
      text: sms.body,
      link: extractLink(sms.body),
      image: sms.image || '',
      time: new Date(Number(sms.date)).toISOString(),
      
      // 整合風險等級
      risk: (aiAnalysis.riskLevel === 'high' || risk === 'high') ? 'high' 
            : (aiAnalysis.riskLevel === 'medium' ? 'medium' : 'low'),
      
      riskText: riskText,
      
      // 🔥 這裡要對應新的回傳結構
      riskScore: aiAnalysis.score,
      keywordRiskLevel: aiAnalysis.riskLevel,
      matchedDetails: aiAnalysis.matchedDetails,
      matchedPatterns: aiAnalysis.matchedPatterns,

      // 🔥 新增：AI 語意分析結果
      aiAnalysisResult: aiAnalysisResult,

      // ⚠️ 關鍵修正：為了避免 ESLint 報錯或畫面壞掉，手動補上舊欄位的空值
      matchedTopKeywords: [], // 給它一個空陣列，這樣就不會報錯了
      matchedKeywords: matchedKeywords, // 來自 API 的
      matchedScamUrls: matchedScamUrls,
      ruleSuspicious: aiAnalysis.riskLevel !== 'low' // 用新邏輯推導舊欄位
    }
    // return {舊的
    //   position: isSelf ? 'right' : 'left',
    //   text: sms.body,
    //   link: extractLink(sms.body),
    //   image: sms.image || '',
    //   time: new Date(Number(sms.date)).toISOString(),
    //   risk,
    //   riskText,
    //   matchedKeywords,
    //   matchedScamUrls,
    //   ruleSuspicious,
    //   matchedTopKeywords,
    //   matchedPatterns
    // }
  }))



  const existingKeys = new Set(messages.value.map(
    m => `${m.text}-${m.time}-${m.image?.length || 0}`
  ))

  const uniqueNew = analyzed.filter(m =>
    !existingKeys.has(`${m.text}-${m.time}-${m.image?.length || 0}`)
  )

  messages.value = [...messages.value, ...uniqueNew].sort(
    (a, b) => new Date(a.time) - new Date(b.time)
  )
}

watch(messages, () => {
  nextTick(() => {
    messageEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
})

onMounted(() => {
  const targetPhone = normalizePhone(route.query.phone)
  const cached = localStorage.getItem('smsList')
  if (!cached) return

  const list = JSON.parse(cached)
  let updated = false

  for (const sms of list) {
    if (normalizePhone(sms.phone) === targetPhone && sms.read === 0) {
      sms.read = 1
      updated = true
    }
  }

  if (updated) {
    localStorage.setItem('smsList', JSON.stringify(list))
    console.log('✅ 已將簡訊標記為已讀')
  }

  window.addEventListener('sms-from-android', (e) => analyzeMessages(e.detail || []))
  window.addEventListener('sms-from-notification', (e) => analyzeMessages(e.detail || []))
 window.addEventListener('mms-from-android', (e) => analyzeMessages(e.detail || []))
 
})

</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #dcf5ff, #ffffff);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 10px;
  z-index: 10; /* 確保在其他區塊上層 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 陰影區分層次 */
}
.logo {
  width: 40px;
  height: 40px;
}
.header-info {
  display: flex;
  flex-direction: column;
}
.sender-name {
  font-weight: bold;
  font-size: 18px;
}
.sender-number {
  font-size: 15px;
  color: #888;
}
.message-list {
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 24px;
}
.message-item {
  display: flex;
  flex-direction: column;
  max-width: 280px;
}
.left {
  align-self: flex-start;
  text-align: left;
}
.right {
  align-self: flex-end;
  text-align: right;
}
.sender-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}
.message-bubble {
  background: white;
  border-radius: 20px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  cursor: pointer;
}
.message-bubble.from-self {
  background: #4af66a;
}

.message-bubble.from-self .message-text {
  text-align: left;

}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  white-space: pre-wrap;       /* 保留換行 + 自動換行 */
  word-break: break-all;       /* 長網址/單字會自動斷行 */
  overflow-wrap: break-word;   /* 備援處理斷行 */
}
.message-link {
  color: #007aff;
  text-decoration: underline;
  font-size: 14px;
}
.message-image {
  width: 160px;
  border-radius: 12px;
  object-fit: cover;
  background: #f0f0f0;
  margin-bottom: 4px;
  cursor: pointer;
}
.info-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.message-time {
  font-size: 10px;
  color: #999;
}
.message-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}
.risk-icon {
  width: 16px;
  height: 16px;
}
.risk-reason {
  font-size: 12px;
  color: #333;
}
.match-info {
  font-size: 12px;
  color: #555;
  margin-top: 6px;
  line-height: 1.4;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 12px;
  background: white;
}

.score-container {
  margin-top: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid #ddd;
}

.score-container.high { background: #ffebee; border-color: #ffcdd2; }
.score-container.medium { background: #fff8e1; border-color: #ffecb3; }
.score-container.low { background: #e8f5e9; border-color: #c8e6c9; }

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.risk-badge {
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255,255,255,0.6);
}

.score-details, .pattern-row, .url-row {
  font-size: 12px;
  line-height: 1.4;
  color: #555;
}

.pattern-row {
  margin-left: 4px; /* 對齊微調 */
  color: #666;
}

.danger-label {
  color: #d32f2f;
  font-weight: bold;
}

.keyword-tag small {
  color: #888; /* 讓權重分數顏色淡一點，不要喧賓奪主 */
}

/* AI 分析區塊 */
.ai-box {
  margin-top: 8px;
  background: #f0f7ff; /* 淡淡的藍色背景 */
  border: 1px solid #cce5ff;
  border-radius: 8px;
  padding: 8px 10px;
}

.ai-header {
  font-size: 12px;
  font-weight: bold;
  color: #0056b3;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-icon {
  font-size: 14px;
}

.ai-content {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap; /* 讓 AI 回傳的換行能正常顯示 */
}
</style>

