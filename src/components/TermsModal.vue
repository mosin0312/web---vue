<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-box">
        <h2>📄 防詐APP 註冊須知與會員權益</h2>
  
        <div class="modal-content-scrollable">
          <section>
            <h3>一、會員註冊須知</h3>
            <ul>
              <li> 註冊時請填寫真實資訊，以利驗證與通知。</li>
              <li> 妥善保管帳號密碼，避免被他人冒用。</li>
              <li> 建議 13 歲以上使用，未成年需監護人同意。</li>
              <li> 禁止多帳號操作或不當行為。</li>
            </ul>
          </section>
  
          <section>
            <h3>二、會員權益說明</h3>
            <ul>
              <li> 提供簡訊內容風險提醒功能。</li>
              <li> 可回報可疑號碼、文章。</li>
              <li> 支援截圖/語音辨識詐騙。</li>
              <li> 遵守隱私政策，保障您的資料。</li>
              <li> 主要功能免費使用，無強制付款。</li>
            </ul>
          </section>
  
          <section>
            <h3>三、會員責任與違規處理</h3>
            <p>請勿惡意回報、不實留言，否則將依違規情節處置帳號使用權。</p>
          </section>
        </div>
  
        <button class="agree-button" @click="$emit('accept')">
          我已閱讀並同意以上條款
        </button>
      </div>
    </div>
  </template>
  
  <style scoped>
  .modal-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 999;
  }
  
  .modal-box {
    background: white;
    padding: 20px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  
  .modal-content-scrollable {
    overflow-y: auto;
    max-height: 300px;
    padding-right: 8px;
    margin-bottom: 16px;
  }
  
  .modal-content-scrollable h3 {
    margin-top: 12px;
    margin-bottom: 6px;
    font-size: 16px;
    font-weight: bold;
  }
  
  .modal-content-scrollable ul {
    padding-left: 18px;
    margin-bottom: 8px;
  }
  
  .modal-content-scrollable p {
    font-size: 14px;
  }
  
  .agree-button {
    padding: 10px 16px;
    font-weight: bold;
    border-radius: 8px;
    background: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
    align-self: flex-end;
  }
  </style>
  