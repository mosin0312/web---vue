<template>
  <div v-if="visible" class="bl-overlay" @click.self="onClose">
    <div class="bl-sheet">
      <!-- 頂部：標題與來電資訊 -->
      <div class="bl-header">
        <div class="bl-title">加入黑名單</div>
        <div class="bl-subtitle">
          <div class="bl-name">{{ incoming?.name || '未知來電' }}</div>
          <div class="bl-number">{{ incoming?.number }}</div>
        </div>
      </div>

      <!-- Step 1：公開 / 非公開 -->
      <div class="bl-card">
        <div class="bl-card-title">黑名單</div>
        <div class="bl-radio-wrap">
          <label class="bl-radio">
            <input type="radio" name="scope" value="公開" v-model="form.scope" />
            <span>公開</span>
          </label>
          <label class="bl-radio">
            <input type="radio" name="scope" value="非公開" v-model="form.scope" />
            <span>非公開</span>
          </label>
        </div>
      </div>

      <!-- Step 2：理由（依 scope 切換） -->
<div class="bl-card">
  <div class="bl-card-title">{{ form.scope }}</div>

  <div class="bl-options">
    <label v-for="opt in reasonOptions" :key="opt" class="bl-option">
      <input type="radio" name="reason" :value="opt" v-model="form.reason" />
      <span>{{ opt }}</span>
    </label>

    <!-- 補充說明：只有「其他」時可輸入，且必填 -->
    <input
      class="bl-input"
      v-model="form.note"
      :maxlength="30"
      :disabled="!canEditNote"
      :placeholder="canEditNote
        ? '請填寫補充說明（必填，最多 30 字）'
        : '選擇「其他」才可填寫'"
    />
    <div
      v-if="canEditNote"
      class="bl-hint"
      :class="{ 'bl-hint--error': !form.note.trim() }"
    >
      {{ form.note.trim() ? `還可輸入 ${30 - form.note.length} 字` : '補充說明不得空白' }}
    </div>
  </div>
</div>

      <!-- 底部按鈕 -->
      <div class="bl-actions">
        <button class="bl-btn ghost" @click="onClose">取消</button>
        <button class="bl-btn" @click="onConfirm">確定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'

/* eslint-disable no-undef */
const props = defineProps({
  visible: { type: Boolean, default: false },
  incoming: { type: Object, default: () => ({ number: '', name: '' }) }
})
const emits = defineEmits(['close', 'confirm'])
/* eslint-enable no-undef */

const form = reactive({
  scope: '公開',
  reason: '',
  note: ''
})

// ★ 選項加入「其他」
const publicOptions = ['一接就掛', '詐騙', '推銷/廣告', '騷擾', '其他']
const privateOptions = ['舊情人', '家庭內部衝突', '語言不通無法溝通', '個人情感問題', '其他']

// 依 scope 切換理由選項
const reasonOptions = computed(() => (form.scope === '公開' ? publicOptions : privateOptions))
// 只有選「其他」才開放輸入備註
const canEditNote = computed(() => form.reason === '其他')

// 開啟時重置表單
watch(
  () => props.visible,
  (v) => {
    if (v) {
      form.scope = '公開'
      form.reason = ''
      form.note = ''
    }
  }
)

// 只要理由不是「其他」就清空備註
watch(
  () => form.reason,
  (val) => {
    if (val !== '其他') form.note = ''
  }
)

function onClose() {
  emits('close')
}

function onConfirm() {
  if (!form.reason) {
    alert('請先選擇理由')
    return
  }
  if (form.reason === '其他') {
    const finalNote = (form.note || '').trim()
    if (!finalNote) {
      alert('已選擇「其他」，請輸入補充說明')
      return
    }
    emits('confirm', { scope: form.scope, reason: '其他', note: finalNote })
    return
  }
  // 非「其他」：note 一律清空
  emits('confirm', { scope: form.scope, reason: form.reason, note: '' })
}

</script>



<style scoped>
.bl-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.25);
  display: flex; align-items: flex-end; z-index: 9999;
}
.bl-sheet {
  width: 100%; max-width: 560px; margin: 0 auto;
  background: #fff; border-top-left-radius: 18px; border-top-right-radius: 18px;
  padding: 16px 16px 12px;
  box-shadow: 0 -8px 24px rgba(0,0,0,.15);
}
.bl-header { margin-bottom: 6px; }
.bl-title { font-weight: 800; font-size: 18px; }
.bl-subtitle { color: #555; display: flex; gap: 8px; align-items: baseline; }
.bl-name { font-size: 14px; font-weight: 600; }
.bl-number { font-size: 13px; color: #888; }

.bl-card { background: #fff7dc; border-radius: 16px; padding: 14px; margin: 10px 0; box-shadow: 0 2px 6px rgba(0,0,0,.08); }
.bl-card-title { font-weight: 700; margin-bottom: 8px; }

.bl-radio-wrap { display: flex; gap: 18px; }
.bl-radio { display: inline-flex; gap: 6px; align-items: center; cursor: pointer; }

.bl-options { display: grid; gap: 8px; }
.bl-option { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.bl-input {
  width: 95%; border: 1px solid #e1d7a6; outline: none; border-radius: 10px;
  padding: 10px 12px; background: #fff; font-size: 14px;
}
.bl-hint { font-size: 12px; color: #888; }

.bl-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; }
.bl-btn { padding: 10px 16px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; background: #6f9cff; color: #fff; }
.bl-btn.ghost { background: #ececec; color: #333; }
.bl-hint--error { color: #d32f2f; }
</style>
