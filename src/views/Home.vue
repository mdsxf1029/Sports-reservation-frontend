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

      <!-- 推荐场馆 -->
      <section class="popular-venues">
        <div class="container">
          <h2 class="section-title">推荐场馆</h2>
          
          <!-- 加载状态 -->
          <div v-if="venuesLoading" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在加载推荐场馆...</span>
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
                  :src="venue.imageUrl" 
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
          
          <!-- 加载状态 -->
          <div v-if="newsLoading" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在加载最新动态...</span>
          </div>
          
          <!-- 新闻网格 -->
          <div v-else-if="latestNews.length > 0" class="news-grid">
            <div 
              v-for="news in latestNews" 
              :key="news.newsId" 
              class="news-card"
              @click="goToNewsDetail(news)"
            >
              <h3>{{ news.newsTitle }}</h3>
              <p>{{ getNewsPreview(news.newsContent) }}</p>
              <span class="news-date">{{ formatDate(news.newsTime) }}</span>
            </div>
          </div>
          
          <!-- 无新闻状态 -->
          <div v-else class="empty-news">
            <el-icon><ChatDotRound /></el-icon>
            <h3>暂无新闻动态</h3>
            <p>最新动态正在更新中，请稍后再试</p>
            <el-button type="primary" @click="loadLatestNews">重新加载</el-button>
          </div>
          
          <div v-if="latestNews.length > 0" class="view-more">
            <el-button @click="goToNews">查看更多动态</el-button>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <FooterNavbar />
  </div>
  <BackToTop />
  
  <!-- 新闻详情弹窗 -->
  <el-dialog
    v-model="newsDialogVisible"
    width="70%"
    top="5vh"
    class="news-dialog"
    destroy-on-close
  >
    <div v-if="selectedNews" class="news-detail">
      <h2 class="news-detail-title">{{ selectedNews.newsTitle }}</h2>
      <p class="news-detail-date">发布时间：{{ formatDate(selectedNews.newsTime) }}</p>
      <hr class="news-detail-divider" />
      <div class="news-detail-content" v-html="formatContent(selectedNews.newsContent || '暂无内容')"></div>
      <img v-if="selectedNews.coverUrl" :src="selectedNews.coverUrl" class="news-detail-img" />
    </div>
  </el-dialog>
</template>

<script>
import { Calendar, Location, Star, ChatDotRound, User, Loading, LocationInformation } from '@element-plus/icons-vue'
import { getVenues } from '../utils/api.js'
import HeaderNavbar from '../components/HeaderNavbar.vue'
import FooterNavbar from '../components/FooterNavbar.vue'
import BackToTop from '../components/BackToTop.vue'
import axios from 'axios';
import { pa } from 'element-plus/es/locales.mjs'
// 导入默认图片
import defaultImage from '@/assets/Backgrounds/Back1.jpg'

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
      venuesLoading: false,
      latestNews: [],        // 最新新闻数据
      newsLoading: false,    // 新闻加载状态
      newsDialogVisible: false,  // 新闻弹窗显示状态
      selectedNews: null         // 选中的新闻
    }
  },
  async mounted() {
    await this.loadPopularVenues()
    await this.loadLatestNews()  // 加载最新新闻
  },
  methods: {
    // 加载推荐场馆
    async loadPopularVenues() {
      try {
        this.venuesLoading = true
        console.log('开始加载推荐场馆...')
        
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
          // 过滤并排序，选择真正的"推荐"场馆
          const openVenues = venuesData
            .filter(venue => venue.status === '开放') // 确保只显示开放场馆
            .sort((a, b) => {
              // 按价格升序：显示最实惠的场馆
              return (a.price || 0) - (b.price || 0)
            })
          
          // 取前3个场馆作为推荐场馆显示
          this.popularVenues = openVenues.slice(0, 3).map(venue => ({
            id: venue.id,
            name: venue.name || '未知场馆',
            type: venue.type || '运动场馆', 
            price: venue.price || 0,
            location: venue.location || '未知位置',
            status: venue.status,
            imageUrl: venue.pictureurl || '@/assets/Backgrounds/Back1.jpg', // 使用后端提供的图片URL
            // 保留原始数据
            originalData: venue
          }))
          
          console.log('设置推荐场馆:', this.popularVenues)
        } else {
          console.warn('没有获取到开放的场馆数据')
          this.popularVenues = []
        }
        
      } catch (error) {
        console.error('加载推荐场馆失败:', error)
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

    

    // 处理图片加载错误
    handleImageError(event) {
      console.log('图片加载失败，使用默认图片')
      // 使用导入的默认图片
      event.target.src = defaultImage
      // 防止无限循环：移除 error 事件监听器
      event.target.onerror = null
    },

    // 加载最新新闻
    async loadLatestNews() {
      try {
        this.newsLoading = true
        console.log('开始加载最新新闻...')
        
        // 使用与 News.vue 相同的 API
        const response = await axios.get('/api/news/status/published', {
          params: {
            page: 1,
            pageSize: 3,  // 首页只显示最新的3条新闻
            category: null // 获取所有分类的新闻
          }
        })
        
        console.log('新闻API响应:', response)
        
        if (response && response.data) {
          // 尝试不同的响应格式
          let newsList = []
          
          if (response.data.list) {
            newsList = response.data.list
          } else if (response.data.data && response.data.data.list) {
            newsList = response.data.data.list
          } else if (Array.isArray(response.data)) {
            newsList = response.data
          } else {
            console.warn('无法解析新闻数据格式:', response.data)
            newsList = []
          }
          
          // 确保只取前3条
          this.latestNews = newsList.slice(0, 3)
          console.log('成功获取最新新闻，共', this.latestNews.length, '条:', this.latestNews)
        } else {
          console.warn('新闻API响应格式不正确:', response)
          this.latestNews = []
        }
        
      } catch (error) {
        console.error('加载最新新闻失败:', error)
        this.latestNews = []
      } finally {
        this.newsLoading = false
      }
    },

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
      })
    },

    // 获取新闻预览文本
    getNewsPreview(content) {
      if (!content) return '暂无内容预览...'
      
      // 移除HTML标签和换行符
      const cleanContent = content
        .replace(/<[^>]*>/g, '')  // 移除HTML标签
        .replace(/\\n/g, ' ')     // 移除换行符
        .replace(/\s+/g, ' ')     // 合并多个空格
        .trim()
      
      // 截取前30个字符作为预览
      return cleanContent.length > 30 
        ? cleanContent.substring(0, 30) + '...' 
        : cleanContent
    },

    // 显示新闻详情
    goToNewsDetail(news) {
      console.log('打开新闻详情:', news)
      this.selectedNews = news
      this.newsDialogVisible = true
    },

    // 跳转到新闻页面
    goToNews() {
      this.$router.push('/news')
    },

    // 格式化新闻内容
    formatContent(content) {
      if (!content) return '暂无内容'
      
      // 处理换行符
      let formattedContent = content.replace(/\\n/g, '<br>')
      
      // 如果内容是纯文本，添加段落标签
      if (!formattedContent.includes('<') && !formattedContent.includes('>')) {
        formattedContent = formattedContent
          .split('<br>')
          .filter(paragraph => paragraph.trim())
          .map(paragraph => `<p>${paragraph.trim()}</p>`)
          .join('')
      }
      
      return formattedContent
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

/* hero区域 */

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

/* 推荐场馆 */
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
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.news-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.news-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.news-card h3 {
  font-size: 1.25rem;
  margin-bottom: 15px;
  color: #333;
  cursor: pointer;
}

.news-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
  height: 3.2em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-date {
  font-size: 0.9rem;
  color: #999;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-container .el-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.empty-news {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-news .el-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-news h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.empty-news p {
  margin-bottom: 20px;
  color: #666;
}

.view-more {
  text-align: center;
  margin-top: 30px;
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
  .venues-grid {
    grid-template-columns: 1fr;
  }
  
  .news-grid {
    grid-template-columns: 1fr;
  }
}

/* 平板尺寸 */
@media (max-width: 1024px) and (min-width: 769px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 新闻详情弹窗样式 */
.news-dialog :deep(.el-dialog) {
  border-radius: 15px;
  max-height: 80vh;
  overflow: hidden;
}

.news-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

.news-detail {
  padding: 30px;
}

.news-detail-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.4;
}

.news-detail-date {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.news-detail-divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
}

.news-detail-content {
  color: #444;
  line-height: 1.8;
  font-size: 1rem;
  margin-bottom: 20px;
}

.news-detail-content p {
  margin-bottom: 15px;
}

.news-detail-content h1,
.news-detail-content h2,
.news-detail-content h3,
.news-detail-content h4,
.news-detail-content h5,
.news-detail-content h6 {
  color: #333;
  margin: 20px 0 10px 0;
}

.news-detail-content ul,
.news-detail-content ol {
  margin: 15px 0;
  padding-left: 25px;
}

.news-detail-content li {
  margin-bottom: 8px;
}

.news-detail-img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 响应式设计 - 新闻弹窗 */
@media (max-width: 768px) {
  .news-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;
  }
  
  .news-detail {
    padding: 20px;
  }
  
  .news-detail-title {
    font-size: 1.5rem;
  }
}
</style>