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
          
          <!-- 加载状态 -->
          <div v-if="venuesLoading" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在加载热门场馆...</span>
          </div>
          
          <!-- 场馆网格 -->
          <div v-else-if="popularVenues.length > 0" class="venues-grid">
            <div 
              v-for="venue in popularVenues" 
              :key="venue.id" 
              class="venue-card"
              @click="goToVenueDetail(venue.id)"
            >
              <div class="venue-image">
                <img 
                  :src="venue.imageUrl || getDefaultVenueImage(venue.type)" 
                  :alt="venue.name"
                  @error="handleImageError"
                />
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
          
          <!-- 无场馆状态 -->
          <div v-else class="empty-venues">
            <el-icon><LocationInformation /></el-icon>
            <h3>暂无场馆信息</h3>
            <p>场馆信息正在更新中，请稍后再试</p>
            <el-button type="primary" @click="loadPopularVenues">重新加载</el-button>
          </div>
          
          <div v-if="popularVenues.length > 0" class="view-more">
            <el-button @click="goToReservation">查看更多场馆</el-button>
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
import { Calendar, Location, Star, ChatDotRound, User, Loading, LocationInformation } from '@element-plus/icons-vue'
import { getVenues } from '../utils/api.js'
import HeaderNavbar from '../components/HeaderNavbar.vue'
import FooterNavbar from '../components/FooterNavbar.vue'
import BackToTop from '../components/BackToTop.vue'
import axios from 'axios';
import { pa } from 'element-plus/es/locales.mjs'

export default {
  name: 'Home',
  components: {
    HeaderNavbar,
    FooterNavbar,
    Calendar,
    Location,
    Star,
    ChatDotRound,
    User,
    Loading,
    LocationInformation
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
        console.log('开始加载热门场馆...')
        
        const params = {
          page: 1,
          pageSize: 50,
          keyword: null,      // 首页不搜索，传null
          status: '开放',     // 只获取开放的场馆
          type: null          // 获取所有类型，传null
        } 
        const res = await getVenues(params)
        console.log('场馆API响应:', res)
        
        // 根据你的后端响应格式解析数据
        let venuesData = []
        
        if (res && res.data && res.data.code === 200) {
          // 后端返回格式：{ code: 200, data: { list: [...] } }
          venuesData = res.data.data.list || []
          console.log('成功解析场馆数据:', venuesData)
        } else {
          console.warn('API响应格式不正确:', res)
          throw new Error('API响应格式不正确')
        }
        
        if (Array.isArray(venuesData) && venuesData.length > 0) {
          // 过滤并排序，选择真正的"热门"场馆
          const openVenues = venuesData
            .filter(venue => venue.status === '开放') // 确保只显示开放场馆
            .sort((a, b) => {
              // 按价格升序：显示最实惠的场馆
              return (a.price || 0) - (b.price || 0)
            })
          
          // 取前3个场馆作为热门场馆显示
          this.popularVenues = openVenues.slice(0, 3).map(venue => ({
            id: venue.id,
            name: venue.name || '未知场馆',
            type: venue.type || '运动场馆', 
            price: venue.price || 0,
            location: venue.location || '未知位置',
            status: venue.status,
            imageUrl: venue.pictureurl, // 使用后端提供的图片URL
            // 保留原始数据
            originalData: venue
          }))
          
          console.log('设置热门场馆:', this.popularVenues)
        } else {
          console.warn('没有获取到开放的场馆数据')
          this.popularVenues = []
        }
        
      } catch (error) {
        console.error('加载热门场馆失败:', error)
        this.popularVenues = []
      } finally {
        this.venuesLoading = false
      }
    },

    // 跳转到预约页面
    goToReservation() {
      this.$router.push('/venuelist')
    },

    // 跳转到场馆详情
    goToVenueDetail(venueId) {
      this.$router.push(`/venue/${venueId}`)
    },

    // 获取默认场馆图片
    getDefaultVenueImage(Type, Name = '') {
      const type = (Type || '').toLowerCase()
      const name = (Name || '').toLowerCase()
      console.log('获取默认图片，类型:', type, '名称:', name)
      // 篮球场馆
      if (type.includes('篮球')) {
        // 随机选择篮球场图片
        const basketballImages = [
          '/src/assets/pictures/basketballplace1.png',
          '/src/assets/pictures/basketballplace2.png'
        ]
        return basketballImages[Math.floor(Math.random() * basketballImages.length)]
      }
      
      // 羽毛球场馆
      else if (type.includes('羽毛球')) {
        const badmintonImages = [
          '/src/assets/pictures/yumaoqiuplace1.png',
          '/src/assets/pictures/yumaoqiuplace2.png'
        ]
        return badmintonImages[Math.floor(Math.random() * badmintonImages.length)]
      }
      
      // 乒乓球场馆
      else if (type.includes('乒乓')) {
        const pingpongImages = [
          '/src/assets/pictures/pingpangplace1.png',
          '/src/assets/pictures/pingpangplace2.png'
        ]
        return pingpongImages[Math.floor(Math.random() * pingpongImages.length)]
      }
      
      // 网球场馆
      else if (type.includes('网球')) {
        const tennisImages = [
          '/src/assets/pictures/wangqiuplace1.png',
          '/src/assets/pictures/wangqiuplace2.png'
        ]
        return tennisImages[Math.floor(Math.random() * tennisImages.length)]
      }
      
      // 健身房
      else if (type.includes('健身')) {
        const gymImages = [
          '/src/assets/pictures/gym1.png',
          '/src/assets/pictures/gym2.png',
          '/src/assets/pictures/gym3.png'
        ]
        return gymImages[Math.floor(Math.random() * gymImages.length)]
      }

      // 瑜伽馆
      else if (type.includes('瑜伽')) {
        const yogaImages = [
          '/src/assets/pictures/yoga1.png',
          '/src/assets/pictures/yoga2.png',
          '/src/assets/pictures/yoga3.png'
        ]
        return yogaImages[Math.floor(Math.random() * yogaImages.length)]
      }
      
      // 默认图片
      else {
        // 如果都不匹配，随机返回一个图片
        const allImages = [
          '/src/assets/pictures/basketballplace1.png',
          '/src/assets/pictures/yumaoqiuplace1.png',
          '/src/assets/pictures/gym2.png'
        ]
        return allImages[Math.floor(Math.random() * allImages.length)]
      }
    },

    // 处理图片加载错误
    handleImageError(event) {
      event.target.src = '@/assets/Backgrounds/Back1.jpg'
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
  height: 90vh;
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
  height: 90vh;
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

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  font-size: 1.1rem;
  color: #666;
  gap: 12px;
}

.empty-venues {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-venues .el-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-venues h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.empty-venues p {
  margin-bottom: 20px;
  color: #666;
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