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
  };
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
    z-index: 10;
  }
  
  .modal-box {
    background: white;
    padding: 20px 30px;
    border-radius: 10px;
    text-align: center;
    max-width: 300px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .confirm-btn {
    margin-top: 16px;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4c82f0;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  </style>
  