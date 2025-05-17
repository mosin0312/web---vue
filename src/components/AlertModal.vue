<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-box">
      <p>{{ message }}</p>
      <button class="confirm-btn" @click="$emit('close')">確定</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    message: String
  }
}
</script>

<style scoped>
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-box {
  background: #fff;
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  min-width: 220px;
  max-width: 80%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
}

.confirm-btn {
  margin-top: 16px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  background-color: #4c82f0;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>