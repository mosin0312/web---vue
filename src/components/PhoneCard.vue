<template>
  <div class="call-history-page">
    <header class="call-header">
      <img
        :src="require('@/assets/icons/header-icon.svg')"
        alt="Phone icon"
        class="header-icon"
      />
      <h1 class="header-title">通話記錄</h1>
    </header>

    <!-- Search -->
    <div class="search-container">
      <img src="@/assets/icons/search-icon.svg" alt="Search Icon" class="search-icon" />
      <input 
        type="text" 
        placeholder="Search..." 
        class="search-input" 
        aria-label="Search call records" 
        @focus="onFocus" 
        @blur="onBlur"
      />
    </div>

    <!-- Call List -->
    <section class="call-list">
      <article v-for="(entry, index) in callEntries" :key="index" class="call-entry">
        <div class="call-entry-container">
          <div class="user-info">
            <div class="avatar-container">
              <img :src="require('@/assets/icons/avatar.svg')" alt="User" class="avatar" />
              <div class="status-indicator">
                <img :src="require('@/assets/icons/property-private.svg')" alt="Status" class="status-icon" />
              </div>
            </div>
            <div class="user-details">
              <h2 class="user-name">{{ entry.name }}</h2>
              <p class="user-phone">{{ entry.phoneNumber }}</p>
            </div>
          </div>
          <div class="call-details">
            <time class="call-date">{{ entry.date }}</time>
            <div class="call-time-container">
              <time class="call-time">{{ entry.time }}</time>
              <img :src="getDirectionIcon(entry.isOutgoing)" class="direction-icon" />
            </div>
            <div class="call-icon-container">
              <img :src="getCallIcon(entry.isRed)" class="call-icon" />
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'CallHistoryPage',
  data() {
    return {
      callEntries: [
        { name: '王小明', phoneNumber: '0912-345-678', date: '10/24', time: '10:22', isOutgoing: true, isRed: true },
        { name: '王小明', phoneNumber: '0912-345-678', priorityLabel: '有風險', date: '10/24', time: '10:22', isOutgoing: true, isRed: true },
        { name: '王小明', phoneNumber: '0912-345-678', date: '10/24', time: '10:22', isOutgoing: false, isRed: false }
      ]
    };
  },
  methods: {
    getDirectionIcon(isOutgoing) {
      return require(`@/assets/icons/${isOutgoing ? 'arrow-outgoing' : 'arrow-incoming'}.svg`);
    },
    getCallIcon(isRed) {
      return require(`@/assets/icons/${isRed ? 'call-end' : 'call-received'}.svg`);
    },
    onFocus(e) {
      e.target.placeholder = '';
    },
    onBlur(e) {
      if (!e.target.value) e.target.placeholder = 'Search...';
    }
  }
};
</script>

<style scoped>
.call-history-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #ffebc3 0%, #fff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative; 
}

.call-header {
  width: 100%;
  height: 40px;
  padding: 2px 17px;
  display: flex;
  align-items: center;
  gap: 7px;
  background-color: #fff;
}

.header-icon {
  width: 39px;
  height: 33px;
}

.header-title {
  font-size: 20px;
  color: #000;
  margin: 0;
}

.search-container {
  width: 100%;
  padding: 10px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  background-color: #fff;
  margin: 10px 0 20px;
}

.search-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.search-input {
  font-size: 20px;
  color: #a49f9f;
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
}

.call-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-bottom: 10px;
}

.call-entry {
  height: 72px;
  padding: 8px;
  border-radius: 14px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.call-entry-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar-container {
  width: 44px;
  height: 55px;
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.status-indicator {
  position: absolute;
  left: 26px;
  top: 37px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #ffeaea;
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-icon {
  width: 15px;
  height: 15px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.user-name {
  font-size: 16px;
  color: #333;
  margin: 0;
}

.user-phone {
  font-size: 14px;
  color: #acacac;
}

.priority-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.priority-icon {
  width: 16px;
  height: 16px;
}

.priority-label {
  font-size: 8px;
  color: #000;
}

.call-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.call-date {
  font-size: 10px;
}

.call-time-container {
  display: flex;
  align-items: center;
  gap: 2px;
}

.call-time {
  font-size: 8px;
}

.direction-icon {
  width: 7px;
  height: 8px;
}

.call-icon-container {
  margin-top: 2px;
}

.call-icon {
  width: 24px;
  height: 24px;
}

@media (max-width: 640px) {
  .user-details {
    max-width: 150px;
  }
}
</style>
