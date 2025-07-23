<template>
  <div class="home-page">
    <!-- 导航栏 -->
    <HeaderNavbar />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 欢迎横幅 -->
      <section class="hero-section">
        <div class="hero-image-full">
          <img src="@/assets/Backgrounds/Back1.jpg" alt="运动场馆" />
          <div class="hero-overlay">
            <h1 class="hero-title">运动场馆预约平台</h1>
            <p class="hero-subtitle">轻松预约，畅享运动生活</p>
            <div class="hero-actions">
              <el-button type="primary" size="large" @click="goToReservation">
                立即预约
              </el-button>
              <el-button size="large" @click="goToVenues">
                浏览场馆
              </el-button>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能特色 -->
      <section class="features-section">
        <div class="container">
          <h2 class="section-title">平台特色</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <h3>便捷预约</h3>
              <p>在线选择时间段，一键完成预约，无需排队等待</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon><Location /></el-icon>
              </div>
              <h3>多样场馆</h3>
              <p>篮球场、羽毛球场、网球场等多种运动场馆任您选择</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon><Star /></el-icon>
              </div>
              <h3>优质服务</h3>
              <p>专业设施维护，贴心客户服务，保障您的运动体验</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <h3>社区交流</h3>
              <p>运动爱好者社区，分享经验，结识运动伙伴</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门场馆 -->
      <section class="popular-venues">
        <div class="container">
          <h2 class="section-title">热门场馆</h2>
          <div class="venues-grid" v-loading="venuesLoading">
            <div 
              v-for="venue in popularVenues" 
              :key="venue.id" 
              class="venue-card"
              @click="goToVenueDetail(venue.id)"
            >
              <div class="venue-image">
                <img :src="venue.imageUrl || '/images/default-venue.jpg'" :alt="venue.name" />
              </div>
              <div class="venue-info">
                <h3>{{ venue.name }}</h3>
                <p class="venue-type">{{ venue.type }}</p>
                <p class="venue-price">￥{{ venue.price }}/小时</p>
                <div class="venue-stats">
                  <span><el-icon><Star /></el-icon> {{ venue.rating || '4.5' }}</span>
                  <span><el-icon><User /></el-icon> {{ venue.bookings || 0 }}次预约</span>
                </div>
              </div>
            </div>
          </div>
          <div class="view-more">
            <el-button @click="goToVenues">查看更多场馆</el-button>
          </div>
        </div>
      </section>

      <!-- 最新动态 -->
      <section class="news-section">
        <div class="container">
          <h2 class="section-title">最新动态</h2>
          <div class="news-grid">
            <div class="news-card">
              <h3>平台功能升级通知</h3>
              <p>新增智能推荐功能，为您推荐最适合的运动场馆...</p>
              <span class="news-date">2024-07-20</span>
            </div>
            <div class="news-card">
              <h3>新场馆入驻</h3>
              <p>市体育中心羽毛球馆正式入驻平台，欢迎预约体验...</p>
              <span class="news-date">2024-07-18</span>
            </div>
            <div class="news-card">
              <h3>优惠活动进行中</h3>
              <p>新用户注册送运动积分，邀请好友更有丰厚奖励...</p>
              <span class="news-date">2024-07-15</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <FooterNavbar />
  </div>
  <BackToTop />
</template>

<script>
import { Calendar, Location, Star, ChatDotRound, User } from '@element-plus/icons-vue'
import { getVenues } from '../utils/api.js'
import HeaderNavbar from '../components/HeaderNavbar.vue'
import FooterNavbar from '../components/FooterNavbar.vue'
import BackToTop from '../components/BackToTop.vue'

export default {
  name: 'Home',
  components: {
    HeaderNavbar,
    FooterNavbar,
    Calendar,
    Location,
    Star,
    ChatDotRound,
    User
  },
  data() {
    return {
      popularVenues: [],
      venuesLoading: false
    }
  },
  async mounted() {
    await this.loadPopularVenues()
  },
  methods: {
    // 加载热门场馆
    async loadPopularVenues() {
      try {
        this.venuesLoading = true
        const response = await getVenues()
        if (response && response.data) {
          // 取前3个场馆作为热门场馆显示
          this.popularVenues = response.data.slice(0, 3)
        }
      } catch (error) {
        console.error('加载热门场馆失败:', error)
      } finally {
        this.venuesLoading = false
      }
    },

    // 跳转到预约页面
    goToReservation() {
      this.$router.push('/reservation')
    },

    // 跳转到场馆列表
    goToVenues() {
      this.$router.push('/venue')
    },

    // 跳转到场馆详情
    goToVenueDetail(venueId) {
      this.$router.push(`/venue/${venueId}`)
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 英雄区域 */

.hero-section {
  position: relative;
  width: 100%;
  height: 800px;
  margin-bottom: 0;
  padding: 0;
  overflow: hidden;
}

.hero-image-full {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-image-full img {
  width: 100%;
  height: 800px;
  object-fit: cover;
  display: block;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.32);
  color: #fff;
  z-index: 2;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 18px;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0,0,0,0.18);
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 32px;
  opacity: 0.95;
  text-shadow: 0 1px 6px rgba(0,0,0,0.12);
}

.hero-actions {
  display: flex;
  gap: 20px;
}

/* 功能特色 */
 
.features-section {
  padding: 80px 0;
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e3f1f1 0%, #77cafa 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 2rem;
  color: white;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* 热门场馆 */
.popular-venues {
  padding: 80px 0;
}

.venues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.venue-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.venue-card:hover {
  transform: translateY(-5px);
}

.venue-image {
  height: 200px;
  overflow: hidden;
}

.venue-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.venue-info {
  padding: 20px;
}

.venue-info h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
  color: #333;
}

.venue-type {
  color: #666;
  margin-bottom: 8px;
}

.venue-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e74c3c;
  margin-bottom: 15px;
}

.venue-stats {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #666;
}

.venue-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-more {
  text-align: center;
}

/* 最新动态 */
.news-section {
  padding: 80px 0;
  background: #f8f9fa;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.news-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
}

.news-card h3 {
  font-size: 1.25rem;
  margin-bottom: 15px;
  color: #333;
}

.news-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.news-date {
  font-size: 0.9rem;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 60px 20px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid,
  .venues-grid,
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>