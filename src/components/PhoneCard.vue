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

    <!-- Search Component -->
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

    <section class="call-list">
      <article
        v-for="(entry, index) in callEntries"
        :key="index"
        class="call-entry"
      >
        <div class="call-entry-container">
          <div class="user-info">
            <div class="avatar-container">
              <img :src="require('@/assets/icons/avatar.svg')" alt="User" class="avatar" />
              <div class="status-indicator">
                <img :src="require('@/assets/icons/status-private.svg')" alt="User status" class="status-icon" />
              </div>
            </div>
            <div class="user-details">
              <h2 class="user-name">{{ entry.name }}</h2>
              <p class="user-phone">{{ entry.phoneNumber }}</p>
              <div class="priority-container">
                <img
                  :src="getPriorityIcon(entry.priority)"
                  :alt="entry.priority"
                  class="priority-icon"
                />
                <span class="priority-label">{{ entry.priorityLabel }}</span>
              </div>
            </div>
          </div>
          <div class="call-details">
            <time class="call-date">{{ entry.date }}</time>
            <div class="call-time-container">
              <time class="call-time">{{ entry.time }}</time>
              <img
                :src="getDirectionIcon(entry.isOutgoing)"
                alt="Direction"
                class="direction-icon"
              />
            </div>
            <div class="call-icon-container">
              <img :src="getCallIcon(entry.isRed)" alt="Call status" class="call-icon" />
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
        { name: '王小明', phoneNumber: '0912-345-678', priority: '低', priorityLabel: '原因', date: '10/24', time: '10:22', isOutgoing: true, isRed: true },
        { name: '王小明', phoneNumber: '0912-345-678', priority: '低', priorityLabel: '原因', date: '10/24', time: '10:22', isOutgoing: true, isRed: true },
        { name: '王小明', phoneNumber: '0912-345-678', priority: '低', priorityLabel: '原因', date: '10/24', time: '10:22', isOutgoing: false, isRed: false },
        { name: '王小明', phoneNumber: '0912-345-678', priority: '低', priorityLabel: '原因', date: '10/24', time: '10:22', isOutgoing: true, isRed: true },
        { name: '王小明', phoneNumber: '0912-345-678', priority: '低', priorityLabel: '原因', date: '10/24', time: '10:22', isOutgoing: true, isRed: true },
        { name: '王小明', phoneNumber: '0912-345-678', priority: '低', priorityLabel: '原因', date: '10/24', time: '10:22', isOutgoing: false, isRed: false },
        { name: '王小明', phoneNumber: '0912-345-678', priority: '低', priorityLabel: '原因', date: '10/24', time: '10:22', isOutgoing: true, isRed: true }
      ]
    };
  },
  methods: {
    getPriorityIcon(level) {
      switch (level) {
        case '高': return require('@/assets/icons/risk-high.svg');
        case '中': return require('@/assets/icons/risk-medium.svg');
        case '低':
        default: return require('@/assets/icons/risk-low.svg');
      }
    },
    getDirectionIcon(isOutgoing) {
      return isOutgoing
        ? require('@/assets/icons/call-end.svg') // 換成結束通話當箭頭圖
        : require('@/assets/icons/arrow-incoming.svg');
    },
    getCallIcon(isRed) {
      return isRed
        ? require('@/assets/icons/arrow-outgoing.svg') // 換成紅箭頭當通話圖
        : require('@/assets/icons/call-received.svg');
    },
    onFocus(event) {
      event.target.placeholder = '';
    },
    onBlur(event) {
      if (!event.target.value) {
        event.target.placeholder = 'Search...';
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Irohamaru:wght@400;500&display=swap');

.call-history-page {
  width: 360px;
  min-height: 800px;
  background: linear-gradient(180deg, #ffebc3 0%, #fff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: "Irohamaru", sans-serif;
}

.call-header {
  width: 360px;
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
  font-weight: normal;
}

/* Search Section */
.search-container {
  width: 92%;
  padding: 10px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  background-color: #fff;
  margin-top: 10px;
  position: relative;
}

.search-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.search-input {
  font-family: Irohamaru, sans-serif;
  font-size: 20px;
  color: #a49f9f;
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
  position: relative;
  z-index: 1;
  text-align: left;
}

/* Call List Section */
.call-list {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-bottom: 10px;
}

.call-entry {
  height: 72px;
  padding: 8px;
  border-radius: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.call-entry-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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
  border-radius: 20px;
}

.status-indicator {
  position: absolute;
  left: 26px;
  top: 37px;
  width: 18px;
  height: 18px;
  border-radius: 9px;
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
  font-weight: normal;
}

.user-phone {
  font-size: 14px;
  color: #acacac;
  margin: 0;
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
  color: #000;
  margin: 0;
}

.call-time-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}

.call-time {
  font-size: 8px;
  color: #000;
  margin: 0;
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
  .call-history-page,
  .call-header,
  .call-list,
  .call-entry-container {
    width: 100%;
  }
  .user-details {
    max-width: 150px;
  }
}
</style>