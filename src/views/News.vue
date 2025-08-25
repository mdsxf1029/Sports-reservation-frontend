<template>
  <div>
    <HeaderNavbar class="header-navbar"/>

    <div class="news-page">
      <h2 class="page-title">运动新闻公告</h2>

      <!-- 轮播图 Banner -->
      <el-carousel :interval="4000" height="220px" arrow="always" class="news-carousel">
        <el-carousel-item v-for="(banner, idx) in banners.slice(0, 4)" :key="idx">
          <img :src="banner.img" :alt="banner.title" class="carousel-image" />
          <div class="carousel-caption">{{ banner.title }}</div>
        </el-carousel-item>
      </el-carousel>

      <!-- 分类标签 -->
      <div class="tab-card category-tab-card">
        <div class="tabs">
          <span class="tab" :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">全部</span>
          <span class="tab" :class="{ active: activeCategory === 'announcement' }" @click="activeCategory = 'announcement'">公告</span>
          <span class="tab" :class="{ active: activeCategory === 'event' }" @click="activeCategory = 'event'">活动</span>
          <span class="tab" :class="{ active: activeCategory === 'match' }" @click="activeCategory = 'match'">赛事</span>
        </div>
      </div>

      <!-- 新闻列表（改成一行一行） -->
      <div v-if="filteredAnnouncements.length" class="announcement-list">
        <div
          v-for="item in filteredAnnouncements"
          :key="item.id"
          class="announcement-row"
          @click="openDialog(item)"
        >
          <div class="announcement-title">{{ item.title }}</div>
          <div class="announcement-date">{{ formatDate(item.date) }}</div>
          <el-icon class="arrow-icon" size="20">
            <ArrowRight />
          </el-icon>
        </div>
      </div>
      <div v-else class="no-data">暂无相关公告</div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      width="70%"
      top="5vh"
      class="news-dialog"
      destroy-on-close
    >
      <div class="news-detail">
        <!-- 标题 -->
        <h2 class="news-detail-title">{{ selectedNews?.title }}</h2>
        <p class="news-detail-date">发布时间：{{ formatDate(selectedNews?.date) }}</p>
        <hr class="news-detail-divider" />

        <!-- 正文 -->
        <div class="news-detail-content" v-html="formatContent(selectedNews?.content || '暂无内容')"></div>

        <!-- 图片 -->
        <img v-if="selectedNews?.img" :src="selectedNews.img" class="news-detail-img" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

const announcements = ref([])
const activeCategory = ref('all')

// 弹窗状态
const dialogVisible = ref(false)
const selectedNews = ref(null)

// 模拟公告数据（纯文本，多行）
const allAnnouncements = [
  { 
    id: 1, 
    title: '暑期运动场地开放公告', 
    date: '2025-07-20', 
    category: 'announcement', 
    img: 'https://picsum.photos/800/400?random=5',
    content: `关于暑期运动场地开放公告\n\n各位同学大家好：\n为方便暑期运动，学校决定在7月20日-8月31日期间延长开放时间。\n\n1. 开放时间：每天 8:00 - 21:00\n2. 使用须知：请自觉遵守场地秩序，注意安全。\n3. 特别提醒：遇到极端天气将临时关闭。\n\n感谢大家的理解与配合。`
  },
  { 
    id: 2, 
    title: '疫情期间场地预约须知', 
    date: '2025-07-10', 
    category: 'announcement', 
    img: 'https://picsum.photos/800/400?random=2',
    content: `疫情期间场地预约须知\n\n亲爱的同学们：\n为保障大家的健康安全，运动场地将采取预约使用制度。\n\n1. 场地需提前1天在系统内预约。\n2. 入场需佩戴口罩并测量体温。\n3. 建议保持1米以上间距，避免聚集。\n\n感谢配合，祝大家运动愉快！`
  },
  { 
    id: 3, 
    title: '社区运动活动精彩回顾', 
    date: '2025-06-30', 
    category: 'event', 
    img: 'https://picsum.photos/800/400?random=3',
    content: `社区运动活动精彩回顾\n\n在上个月的社区运动嘉年华中，大家踊跃参与，氛围热烈。\n\n活动亮点：\n- 趣味接力赛吸引了超过100名居民参与。\n- 篮球友谊赛展示了社区的青春活力。\n- 健身操表演赢得了热烈掌声。\n\n感谢所有参加的小伙伴们，我们下次再见！`
  },
  { 
    id: 4, 
    title: '夏季马拉松赛事报名开启', 
    date: '2025-07-01', 
    category: 'match', 
    img: 'https://picsum.photos/800/400?random=4',
    content: `夏季马拉松赛事报名开启\n\n亲爱的运动爱好者们：\n2025年夏季马拉松报名正式开始！\n\n赛事信息：\n- 日期：2025年8月15日\n- 路线：校园环线，全长10公里\n- 报名时间：即日起至8月5日\n\n报名方式：登录运动系统，在“赛事报名”模块提交申请。\n\n期待大家的参与！`
  },
]

const banners = allAnnouncements.map(item => ({
  img: item.img || new URL('@/assets/Backgrounds/Flower1.jpg', import.meta.url).href,
  title: item.title
}))

function formatContent(text) {
  if (!text) return '暂无内容'
  return text.replace(/\n/g, '<br/>')  // 每个换行替换成 <br>
}

const filteredAnnouncements = computed(() => {
  if (activeCategory.value === 'all') return announcements.value
  return announcements.value.filter(a => a.category === activeCategory.value)
})

function fetchAnnouncements() {
  announcements.value = allAnnouncements
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

function openDialog(item) {
  selectedNews.value = item
  dialogVisible.value = true
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.news-page { 
  max-width: 1200px; 
  margin: 36px auto; 
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
  width: 120px; 
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

/* 列表样式 */
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.announcement-row:hover {
  background-color: #f5f7fa;
}

.announcement-title {
  font-size: 18px;
  font-weight: 600;
  color: #0a0a23;
  flex: 1;
}

.announcement-date {
  font-size: 14px;
  color: #5a6aaf;
  margin-right: 12px;
}

.arrow-icon {
  color: #0f40f5;
  flex-shrink: 0;
}

/* 弹窗里的内容 */
/* 弹窗整体 */
:deep(.news-dialog .el-dialog__title) {
  display: none; /* 只隐藏默认标题 */
}

.news-detail {
  max-height: 70vh;
  overflow-y: auto;
  padding: 16px 24px 24px 24px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 标题 */
.news-detail-title {
  font-size: 26px;
  font-weight: 800;
  color: #0a0a23;
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

/* 时间 */
.news-detail-date {
  text-align: center;
  color: #777;
  font-size: 14px;
  margin-bottom: 16px;
  font-style: italic;
}

/* 分隔线 */
.news-detail-divider {
  border: none;
  height: 2px;
  background: linear-gradient(to right, transparent, #0f40f5, transparent);
  margin: 0 auto 20px auto;
  width: 60%;
  border-radius: 1px;
}

/* 图片 */
.news-detail-img {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  object-fit: cover;
}

/* 正文 */
.news-detail-content {
  line-height: 1.9;
  font-size: 17px;
  color: #222;
  padding: 0 8px;
  word-break: break-word;
  margin-bottom: 28px;
}
.news-detail-content p {
  margin-bottom: 14px;
}
.news-detail-content strong {
  color: #0f40f5;
}
</style>

