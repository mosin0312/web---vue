<template>
  <div class="account-item">
    <span class="label">{{ title }}</span>
    <div class="value-box">
      <span class="value">{{ value }}</span>
      <button v-if="editable" class="arrow-btn" @click="$emit('edit')">
        <img class="arrow-icon" src="@/assets/icons/icon.svg" alt="arrow" />
      </button>
    </div>
  </div>
</template>

<script setup>
// eslint-disable-next-line no-undef
defineProps({
  title: String,
  value: String,
  editable: {
    type: Boolean,
    default: true
  }
})
// eslint-disable-next-line no-undef
defineEmits(['edit'])
</script>

<style scoped>
.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.label {
  width: 120px;
  font-size: 16px;
  font-family: 'irohamaru', sans-serif;
}

.value-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 180px;         /* ✅ 固定寬度 */
  height: 36px;         /* ✅ 固定高度 */
  border: 1.5px dashed black;
  border-radius: 20px;
  padding: 0 12px;
  box-sizing: border-box;
  background: white;
}

.value {
  font-size: 12px;
  font-weight: bold;
  font-family: 'GenRyuMin2 TW', sans-serif;
  white-space: nowrap;
}

.arrow-btn {
  margin-left: 8px;
  padding: 4px;
  background-color: white;
  border: 1px solid black;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}
</style>
