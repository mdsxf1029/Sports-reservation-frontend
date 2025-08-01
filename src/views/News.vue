<template>
  <div>
    <HeaderNavbar class="header-navbar"/>

    <div class="news-page">
      <h2 class="page-title">运动新闻公告</h2>

      <!-- 轮播图 Banner -->
      <el-carousel :interval="4000" height="220px" arrow="always" class="news-carousel">
        <el-carousel-item v-for="(banner, idx) in banners" :key="idx">
          <img :src="banner.img" :alt="banner.title" class="carousel-image" />
          <div class="carousel-caption">{{ banner.title }}</div>
        </el-carousel-item>
      </el-carousel>

      <!-- 分类标签（自定义 tab 样式） -->
      <div class="tab-card category-tab-card">
        <div class="tabs">
          <span class="tab" :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">全部</span>
          <span class="tab" :class="{ active: activeCategory === 'announcement' }" @click="activeCategory = 'announcement'">公告</span>
          <span class="tab" :class="{ active: activeCategory === 'event' }" @click="activeCategory = 'event'">活动</span>
          <span class="tab" :class="{ active: activeCategory === 'match' }" @click="activeCategory = 'match'">赛事</span>
        </div>
      </div>

      <!-- 新闻列表 -->
      <div v-if="filteredAnnouncements.length" class="announcement-list">
        <el-card
          v-for="item in filteredAnnouncements"
          :key="item.id"
          shadow="hover"
          class="announcement-item"
          @click="goToDetail(item.id)"
          :body-style="{ padding: '20px 24px' }"
        >
          <div class="announcement-content">
            <div class="announcement-title">{{ item.title }}</div>
            <div class="announcement-date">{{ formatDate(item.date) }}</div>
          </div>
          <el-icon class="arrow-icon" size="24">
            <ArrowRight />
          </el-icon>
        </el-card>
      </div>
      <div v-else class="no-data">暂无相关公告</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const announcements = ref([])
const activeCategory = ref('all')

const banners = [
  { img: new URL('@/assets/Backgrounds/Back1.jpg', import.meta.url).href, title: '暑期运动场地开放公告' },
  { img: new URL('@/assets/Backgrounds/Flower1.jpg', import.meta.url).href, title: '社区运动活动精彩回顾' },
  { img: new URL('@/assets/Backgrounds/Flower2.jpg', import.meta.url).href, title: '即将举办的运动赛事预告' },
]

// 模拟公告数据，增加类别字段
const allAnnouncements = [
  { id: 1, title: '暑期运动场地开放公告', date: '2025-07-20', category: 'announcement' },
  { id: 2, title: '疫情期间场地预约须知', date: '2025-07-10', category: 'announcement' },
  { id: 3, title: '社区运动活动精彩回顾', date: '2025-06-30', category: 'event' },
  { id: 4, title: '夏季马拉松赛事报名开启', date: '2025-07-01', category: 'match' },
]

const filteredAnnouncements = computed(() => {
  if (activeCategory.value === 'all') return announcements.value
  return announcements.value.filter(a => a.category === activeCategory.value)
})

function filterByCategory(tab) {
  // 这里可以调用接口重新拉取不同分类公告，演示用本地过滤
  // fetchAnnouncements(activeCategory.value)
}

function fetchAnnouncements() {
  announcements.value = allAnnouncements
}

function goToDetail(id) {
  router.push(`/news/${id}`)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.news-page {
  max-width: 1100px;
  margin: 48px auto;
  padding: 32px 48px;
  border: 1.5px solid white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12); 
  border-radius: 12px;
  background: #fff; 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}

.page-title {
  font-weight: 900;
  font-size: 36px;
  color: #121212; 
  margin-bottom: 36px;
  text-align: center;
  letter-spacing: 1.6px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.12); 
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
}

.page-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 4px;
  background-color: #0f40f5;
  border-radius: 2px;
  margin: 8px auto 0;
}

.news-carousel {
  border-radius: 12px;
  margin-bottom: 32px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgb(15 64 245 / 0.15);
}

.carousel-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.carousel-caption {
  position: absolute;
  bottom: 12px;
  left: 20px;
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.5);
}

.category-tab-card {
  width: 100%;
  max-width: 480px;
  margin: 0 auto 28px auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 14px 20px 20px 20px;
}

/* 通用 Tab 样式（你已有，也可以提取到全局） */
.tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1.5px solid #ececec;
  margin-bottom: 4px;
}

.tab {
  margin-right: 36px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  padding: 6px 12px 4px 12px;
  transition: color 0.2s, border 0.2s;
  border-bottom: 2.5px solid transparent;
  border-radius: 4px;
}

.tab.active {
  color: #2062ea;
  border-bottom: 2.5px solid #2062ea;
  font-weight: 600;
}

.announcement-list {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(300px,1fr));
  gap: 28px;
  padding-bottom: 24px;
}

.announcement-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 14px;
  padding: 18px 24px;
  background: #fff;
  box-shadow:
    0 6px 16px rgb(15 64 245 / 0.1);
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease,
    background-color 0.3s ease;
  border: 1px solid transparent;
}

.announcement-item:hover {
  background-color: #e8f0fe;
  box-shadow:
    0 12px 32px rgb(15 64 245 / 0.25);
  transform: translateY(-5px);
  border-color: #0f40f5;
}

.announcement-content {
  max-width: 85%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.announcement-title {
  font-size: 20px;
  font-weight: 700;
  color: #0a0a23;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.announcement-date {
  font-size: 14px;
  color: #5a6aaf;
  font-style: italic;
}

.arrow-icon {
  color: #0f40f5;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.announcement-item:hover .arrow-icon {
  transform: translateX(6px);
}

.no-data {
  text-align: center;
  color: #999;
  margin-top: 100px;
  font-size: 20px;
  font-weight: 600;
}
</style>
