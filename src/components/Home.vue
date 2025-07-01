<template>
  <main class="notification-page">
    <header class="header">
      <div class="home-section">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/58b657e52fe8cda21d491eb8d4e4cb297e11a667"
          alt="Home logo"
          class="home-logo"
        />
        <h1 class="home-title">主頁</h1>
      </div>
      <button class="menu-button" aria-label="Menu">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/73f68d99227c9c07cc73fd1545a3a47aec30db5e"
          alt=""
          class="menu-icon"
        />
      </button>
    </header>
    <div class="content-container">
      <section class="notification-bar">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/a40987fbbc1f283a78518816fd3a587747d67e2b"
          alt=""
          class="notification-icon"
        />
        <span class="notification-text">通知</span>
      </section>
      <div class="main-content">
        <section class="carousel-container">
          <div
            class="carousel-track"
            :style="{ transform: `translateX(-${activeSlide * 100}%)` }"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <div
              v-for="(image, index) in carouselImages"
              :key="index"
              class="carousel-slide"
            >
              <img
                :src="image.src"
                alt=""
                :class="[
                  'carousel-image',
                  index === activeSlide ? 'main-image' : 'blurred-image',
                ]"
              />
            </div>
          </div>
          <div class="carousel-indicators">
            <button
              v-for="(_, index) in carouselImages"
              :key="index"
              :class="['indicator', { active: index === activeSlide }]"
              @click="goToSlide(index)"
              :aria-label="`Go to slide ${index + 1}`"
              :aria-current="index === activeSlide ? 'true' : 'false'"
            ></button>
          </div>
          <div class="carousel-controls">
            <button
              class="carousel-control prev"
              @click="prevSlide"
              aria-label="Previous slide"
            >
              <span aria-hidden="true">&#10094;</span>
            </button>
            <button
              class="carousel-control next"
              @click="nextSlide"
              aria-label="Next slide"
            >
              <span aria-hidden="true">&#10095;</span>
            </button>
          </div>
        </section>
        <section class="news-section">
          <header class="news-header">
            <h2 class="news-title">更多相關資訊</h2>
            <div class="view-all">
              <span class="view-all-text">查看全部</span>
              <div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="arrow-icon"
                >
                  <path
                    d="M8.0875 6.5H2V5.5H8.0875L5.2875 2.7L6 2L10 6L6 10L5.2875 9.3L8.0875 6.5Z"
                    fill="#0064FA"
                  ></path>
                </svg>
              </div>
            </div>
          </header>
          <div class="news-list">
            <article class="news-item">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/e926402776adae16cdc4462445cf36d019130b7d"
                alt=""
                class="news-image"
              />
              <div class="news-content">
                <h3 class="news-item-title">
                  善用信賴科技 減少接電話、上網聊天被詐騙的機率
                </h3>
                <p class="news-description">
                  根據國家通訊傳播委員會（NCC）統計，常見的詐騙來源中電話詐騙為大宗，政府因此要求電信業者開發...
                </p>
                <div class="news-footer">
                  <time class="news-date">2025/01/28</time>
                  <a href="#" class="read-more">點擊看完整內容</a>
                </div>
              </div>
            </article>
            <article class="news-item">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/e926402776adae16cdc4462445cf36d019130b7d"
                alt=""
                class="news-image"
              />
              <div class="news-content">
                <h3 class="news-item-title">
                  善用信賴科技 減少接電話、上網聊天被詐騙的機率
                </h3>
                <p class="news-description">
                  根據國家通訊傳播委員會（NCC）統計，常見的詐騙來源中電話詐騙為大宗，政府因此要求電信業者開發...
                </p>
                <div class="news-footer">
                  <time class="news-date">2025/01/28</time>
                  <a href="#" class="read-more">點擊看完整內容</a>
                </div>
              </div>
            </article>
            <article class="news-item">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/e926402776adae16cdc4462445cf36d019130b7d"
                alt=""
                class="news-image"
              />
              <div class="news-content">
                <h3 class="news-item-title">
                  善用信賴科技 減少接電話、上網聊天被詐騙的機率
                </h3>
                <p class="news-description">
                  根據國家通訊傳播委員會（NCC）統計，常見的詐騙來源中電話詐騙為大宗，政府因此要求電信業者開發...
                </p>
                <div class="news-footer">
                  <time class="news-date">2025/01/28</time>
                  <a href="#" class="read-more">點擊看完整內容</a>
                </div>
              </div>
            </article>
            <article class="news-item">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/e926402776adae16cdc4462445cf36d019130b7d"
                alt=""
                class="news-image"
              />
              <div class="news-content">
                <h3 class="news-item-title">
                  善用信賴科技 減少接電話、上網聊天被詐騙的機率
                </h3>
                <p class="news-description">
                  根據國家通訊傳播委員會（NCC）統計，常見的詐騙來源中電話詐騙為大宗，政府因此要求電信業者開發...
                </p>
                <div class="news-footer">
                  <time class="news-date">2025/01/28</time>
                  <a href="#" class="read-more">點擊看完整內容</a>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: "NotificationPage",
  data() {
    return {
      activeSlide: 0,
      carouselImages: [
        {
          src: "https://cdn.builder.io/api/v1/image/assets/TEMP/fa5b30d7805646d18240a531e3a09b6af2300f00",
        },
        {
          src: "https://cdn.builder.io/api/v1/image/assets/TEMP/ec7c50e6ea5c6a00833d9b7d8a159b02375cbff4",
        },
        {
          src: "https://cdn.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f",
        },
      ],
      autoplayInterval: null,
      autoplayDelay: 5000, // 5 seconds
      touchStartX: 0,
      touchEndX: 0,
    };
  },
  mounted() {
    this.startAutoplay();
    // Add event listeners for focus/blur to pause/resume autoplay
    window.addEventListener("blur", this.pauseAutoplay);
    window.addEventListener("focus", this.startAutoplay);
  },
  beforeUnmount() {
    this.pauseAutoplay();
    window.removeEventListener("blur", this.pauseAutoplay);
    window.removeEventListener("focus", this.startAutoplay);
  },
  methods: {
    nextSlide() {
      this.activeSlide = (this.activeSlide + 1) % this.carouselImages.length;
      this.resetAutoplay();
    },
    prevSlide() {
      this.activeSlide =
        (this.activeSlide - 1 + this.carouselImages.length) %
        this.carouselImages.length;
      this.resetAutoplay();
    },
    goToSlide(index) {
      this.activeSlide = index;
      this.resetAutoplay();
    },
    startAutoplay() {
      if (this.autoplayInterval) return;
      this.autoplayInterval = setInterval(() => {
        this.nextSlide();
      }, this.autoplayDelay);
    },
    pauseAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    },
    resetAutoplay() {
      this.pauseAutoplay();
      this.startAutoplay();
    },
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
      this.pauseAutoplay(); // Pause autoplay during touch interaction
    },
    handleTouchMove(e) {
      this.touchEndX = e.touches[0].clientX;
    },
    handleTouchEnd() {
      const touchDiff = this.touchStartX - this.touchEndX;
      const minSwipeDistance = 50; // Minimum distance to register as a swipe

      if (touchDiff > minSwipeDistance) {
        // Swipe left, go to next slide
        this.nextSlide();
      } else if (touchDiff < -minSwipeDistance) {
        // Swipe right, go to previous slide
        this.prevSlide();
      }

      this.startAutoplay(); // Resume autoplay after touch interaction
    },
  },
};
</script>

<style scoped>
.notification-page {
  display: flex;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: linear-gradient(180deg, #e5d4fa 78.6%, #fff 100%);
  overflow-x: hidden; /* ✅ 防止橫向捲軸產生 */
}

.header {
  display: flex;
  width: 100%;
  height: 40px;
  padding: 0 21px;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  background-color: #fff;
}

.home-section {
  display: flex;
  align-items: center;
  gap: 7px;
}

.home-logo {
  width: 39px;
  height: 33px;
}

.home-title {
  color: #000;
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 500;
  margin: 0;
}

.menu-button {
  display: flex;
  width: 40px;
  height: 40px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
}

.menu-icon {
  width: 36px;
  height: 36px;
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 360px;
  width: 100%;
  gap: 10px;
  padding-left: 20px;
  padding-right: 20px;
}

.notification-bar {
  display: flex;
  width: 100%;
  padding: 4px 10px 4px 4px;
  align-items: center;
  gap: 5px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}

.notification-icon {
  width: 40px;
  height: 40px;
}

.notification-text {
  color: #acacac;
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 500;
}

.main-content {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.carousel-container {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.carousel-track {
  display: flex;
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.carousel-slide {
  min-width: 100%;
  display: flex;
  justify-content: center;
}

.carousel-image {
  border-radius: 16px;
}

.main-image {
  width: 100%;
  height: 215px;
  object-fit: cover;
}

.blurred-image {
  width: 260px;
  height: 195px;
  filter: blur(2px);
  flex-shrink: 0;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50px;
  background-color: #d6d6d6;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  width: 18px;
  background-color: #acacac;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  padding: 0 10px;
}

.carousel-control {
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  transition: background-color 0.3s ease;
}

.carousel-control:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

@media (hover: none) {
  .carousel-controls {
    display: none;
  }
}

.news-section {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 5px;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.news-title {
  color: #000;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 5px;
}

.view-all-text {
  color: #0064fa;
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-weight: 200;
}

.arrow-icon {
  width: 12px;
  height: 12px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.news-item {
  display: flex;
  height: 66px;
  padding: 6px 9px;
  align-items: center;
  gap: 5px;
  border-radius: 10px;
  background-color: #f5f5f5;
}

.news-image {
  width: 75px;
  height: 55px;
}

.news-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.news-item-title {
  color: #000;
  font-family: Inter, sans-serif;
  font-size: 9px;
  font-weight: 900;
  margin: 0;
}

.news-description {
  color: #4d4d4d;
  font-family: Inter, sans-serif;
  font-size: 8px;
  font-weight: 300;
  margin: 0;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-date {
  color: #000;
  font-family: Inter, sans-serif;
  font-size: 8px;
}

.read-more {
  color: #2054ee;
  font-family: Inter, sans-serif;
  font-size: 8px;
  text-decoration: none;
}
</style>