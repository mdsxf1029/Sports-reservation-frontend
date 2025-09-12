<template>
  <div>
    <HeaderNavbar class="header-navbar"/>

    <div class="news-page">
      <h2 class="page-title">运动新闻公告</h2>

      <!-- 轮播图 Banner -->
      <el-carousel :interval="4000" height="420px" arrow="always" class="news-carousel">
        <el-carousel-item v-for="(banner, idx) in banners.slice(0, 4)" :key="idx">
          <img :src="banner.coverUrl" :alt="banner.newsTitle" class="carousel-image" />
          <div class="carousel-caption">{{ banner.newsTitle }}</div>
        </el-carousel-item>
      </el-carousel>

      <!-- 分类标签 -->
      <div class="tab-card category-tab-card">
        <div class="tabs">
          <span class="tab" :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">全部</span>
          <span class="tab" :class="{ active: activeCategory === 'match-report' }" @click="activeCategory = 'match-report'">赛事报道</span>
          <span class="tab" :class="{ active: activeCategory === 'announcement' }" @click="activeCategory = 'announcement'">公告</span>
          <span class="tab" :class="{ active: activeCategory === 'commentary' }" @click="activeCategory = 'commentary'">实况</span>
          <span class="tab" :class="{ active: activeCategory === 'interview' }" @click="activeCategory = 'interview'">采访</span>
          <span class="tab" :class="{ active: activeCategory === 'off-the-field' }" @click="activeCategory = 'off-the-field'">场外</span>
        </div>
      </div>

      <!-- 新闻列表（改成一行一行） -->
      <div v-if="newsPagination.total" class="announcement-list">
        <div
          v-for="item in announcements"
          :key="item.newsId"
          class="announcement-row"
          @click="openDialog(item)"
        >
          <div class="announcement-title">{{ item.newsTitle }}</div>
          <div class="announcement-date">{{ formatDate(item.newsTime) }}</div>
          <el-icon class="arrow-icon" size="20">
            <ArrowRight />
          </el-icon>
        </div>
      </div>
      <div v-else class="no-data">暂无相关公告</div>

      <div v-if="newsPagination.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="newsPagination.page"
          v-model:page-size="newsPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :small="false"
          :disabled="newsLoading"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="newsPagination.total"
          @size-change="handleNewsPageSizeChange"
          @current-change="handleNewsPageChange"
        />
      </div>
    </div>

    <BackToTop/>

    <el-dialog
      v-model="dialogVisible"
      width="70%"
      top="5vh"
      class="news-dialog"
      destroy-on-close
    >
      <div class="news-detail">
        <!-- 标题 -->
        <h2 class="news-detail-title">{{ selectedNews?.newsTitle }}</h2>
        <p class="news-detail-date">发布时间：{{ formatDate(selectedNews?.newsTime) }}</p>
        <hr class="news-detail-divider" />

        <!-- 正文 -->
        <div class="news-detail-content" v-html="formatContent(selectedNews?.newsContent || '暂无内容')"></div>

        <!-- 图片 -->
        <img v-if="selectedNews?.coverUrl" :src="selectedNews.coverUrl" class="news-detail-img" />
      </div>
    </el-dialog>
  </div>
</template>
     
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import axios from 'axios';
import BackToTop from '../components/BackToTop.vue'

const announcements = ref([])
const activeCategory = ref('all')
import defaultImage from '@/assets/Backgrounds/Flower1.jpg';

// 弹窗状态相关
const dialogVisible = ref(false)
const selectedNews = ref(null)

// 分页相关参数
const newsPagination = ref({
  page: 1,        // 当前页数
  pageSize: 10,   // 每页显示条数
  total: 0        // 总记录数
})

const newsLoading = ref(false) // 加载状态

// 轮播图数据
const banners = computed(() => {
  return announcements.value.map(item => ({
    coverUrl: item.coverUrl || defaultImage,
    newsTitle: item.newsTitle
  }))
})

function formatContent(text) {
  if (!text) return '暂无内容'
  const formattedText = text.replace(/\\n/g, '\n');
  return formattedText.replace(/\n/g, '<br/>');
}

const fetchAnnouncements = async () => {
  try {
    newsLoading.value = true;

    const response = await axios.get(`/api/news/status/${'published'}`, {
      params: {
        page: newsPagination.value.page,
        pageSize: newsPagination.value.pageSize,
        category: activeCategory.value !== 'all' ? activeCategory.value : null
      }
    });

    newsPagination.value.page = response.data.page;
    newsPagination.value.pageSize = response.data.pageSize;
    newsPagination.value.total = response.data.totalCount;
    announcements.value = response.data.list;
  } catch (error) {
    console.error("获取新闻数据失败：", error);
  } finally {
    newsLoading.value = false;  // 加载完毕，关闭加载状态
  }
};

// 页码或每页条数变化时触发的数据加载函数
const handleNewsPageChange = (newPage) => {
  newsPagination.value.page = newPage;
  fetchAnnouncements();
};

// 每页显示条数变化时触发的数据加载函数
const handleNewsPageSizeChange = (newSize) => {
  newsPagination.value.pageSize = newSize;
  newsPagination.value.page = 1;  // 重置到第一页
  fetchAnnouncements();
};

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

function openDialog(item) {
  selectedNews.value = item
  dialogVisible.value = true
}

watch(activeCategory, () => {
  newsPagination.value.page = 1;  // 切换分类时回到第一页
  fetchAnnouncements();
});

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
  height: 620px;
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
  max-width: 600px; 
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
  height: 1px; 
  background-color: #dcdcdc; 
  margin: 0 auto 20px auto; 
  width: 80%; 
  border-radius: 2px; 
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
  white-space: pre-wrap;
}
.news-detail-content p {
  margin-bottom: 14px;
}
.news-detail-content strong {
  color: #0f40f5;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.pagination-container .el-pagination {
  --el-pagination-font-size: 14px;
  --el-pagination-bg-color: #fff;
  --el-pagination-text-color: #606266;
  --el-pagination-border-radius: 4px;
  --el-pagination-button-disabled-color: #c0c4cc;
  --el-pagination-button-disabled-bg-color: #fff;
  --el-pagination-hover-color: #2062ea;
}

/* 修复分页按钮样式 */
.pagination-container .el-pagination .el-pager li {
  min-width: 30px;
  height: 32px;
  line-height: 30px;
  margin: 0 2px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-container .el-pagination .el-pager li:hover {
  color: #2062ea;
  border-color: #2062ea;
}

.pagination-container .el-pagination .el-pager li.is-active {
  background-color: #2062ea;
  border-color: #2062ea;
  color: #fff;
}
</style>

