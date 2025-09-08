<template>
  <div>
    <HeaderNavbar />

    <div class="community-main-container">
      <div class="post-list-container">
        <div class="post-tabs">
          <span 
            :class="{ 'tab-item': true, active: activeTab === 'recommend' }"
            @click="switchTab('recommend')"
          >
            推荐
          </span>
          <span 
            :class="{ 'tab-item': true, active: activeTab === 'collections' }"
            @click="switchTab('collections')"
          >
            我的收藏
          </span>
        </div>

        <div v-if="isLoading" class="loading-indicator">
          正在加载帖子...
        </div>

        <div v-else-if="posts.length === 0" class="empty-list-indicator">
          这里什么都没有哦～
        </div>

        <div v-else class="post-list">
          <CommunityPostCard
            v-for="post in posts"
            :key="post.postId"
            :post="post"
            @update-interaction="handleInteractionUpdate"
          />
        </div>
        
        <!-- --- 分页控件 --- -->
        <div v-if="!isLoading && posts.length > 0 && totalPages > 1" class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            :page-size="pagination.pageSize"
            :total="totalPosts"
            layout="total, prev, pager, next, jumper"
            background
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <!-- --- 创作中心容器 --- -->
      <div class="creation-center-container">
        <div class="creation-card">
          <!-- 标题 -->
          <h3 class="creation-title">创作中心</h3>
          
          <!-- 提示语和插图 -->
          <div class="creation-prompt">
            <div class="prompt-text">
              <h4>开启你的创作之旅</h4>
              <p>分享你的运动心得，<br>成为社区的焦点吧！</p>
            </div>
            <!-- 一个简单的SVG插图 -->
            <svg class="prompt-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M85,35 A15,15 0 0,1 70,50 L30,50 A15,15 0 0,1 15,35 L15,20 A15,15 0 0,1 30,5 L70,5 A15,15 0 0,1 85,20 Z" fill="#e0f2fe"/>
              <path d="M80,40 A10,10 0 0,1 70,50 L30,50 A10,10 0 0,1 20,40 L20,25 A10,10 0 0,1 30,15 L70,15 A10,10 0 0,1 80,25 Z" fill="#60a5fa"/>
              <line x1="35" y1="25" x2="65" y2="25" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
              <line x1="35" y1="35" x2="55" y2="35" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
              <circle cx="85" cy="20" r="5" fill="#ef4444"/>
            </svg>
          </div>

          <!-- 开始创作按钮 -->
          <button class="create-button" @click="navigateToEditor">
            <span class="plus-icon">+</span> 开始创作
          </button>
        </div>
      </div>
    </div>

    <!-- 登录提示弹窗 -->
    <LoginPrompt
      v-model="showLoginDialog"
      :message="loginPromptMessage"
      @login="handleLoginRedirect"
    />

    <!-- 回到顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// 引入组件和 API
import HeaderNavbar from '../components/HeaderNavbar.vue';
import CommunityPostCard from '../components/CommunityPostCard.vue';
import BackToTop from '../components/BackToTop.vue';
import { fetchCommunityPosts, fetchMyCollectedPosts } from '../utils/api.js';
import { AuthService } from '../utils/auth.js';
import LoginPrompt from '../components/LoginPrompt.vue';

// 引入样式文件
import '../styles/community-home.css';

// 定义组件状态
const posts = ref([]);
const isLoading = ref(true);
const totalPosts = ref(0); // 新增：总帖子数

const pagination = ref({
  page: 1,
  pageSize: 10,
});
const activeTab = ref('recommend'); 

// 登录提示弹窗相关状态
const router = useRouter();
const showLoginDialog = ref(false);
const loginPromptMessage = ref('');

// --- 分页相关计算属性 ---
const totalPages = computed(() => {
  if (totalPosts.value === 0) return 1;
  return Math.ceil(totalPosts.value / pagination.value.pageSize);
});

const handleLoginRedirect = () => {
  router.push('/login');
};

// 添加一个处理子组件事件的方法
const handleInteractionUpdate = (updateData) => {
  // 在当前帖子列表中找到需要更新的帖子
  const postToUpdate = posts.value.find(p => p.postId === updateData.postId);
  if (postToUpdate) {
    // 更新它的交互状态和统计数据
    postToUpdate.currentUserInteraction = updateData.interaction;
    postToUpdate.stats = updateData.stats;
  }
};

// 获取帖子列表
const getPosts = async () => {
  isLoading.value = true;
  try {
    let response;
    if (activeTab.value === 'recommend') {
      console.log(`正在获取推荐帖子... 页码: ${pagination.value.page}`);
      response = await fetchCommunityPosts(pagination.value);
    } else {
      console.log(`正在获取我的收藏... 页码: ${pagination.value.page}`);
      response = await fetchMyCollectedPosts(pagination.value);
    }
    const rawPosts = Array.isArray(response.data.list) ? response.data.list : [];
    posts.value = rawPosts;
    totalPosts.value = response.data.totalCount || 0; // 从API响应中获取总数

  } catch (error) {
    console.error('获取帖子列表失败:', error);
    posts.value = []; // 请求失败时清空列表
    totalPosts.value = 0; // 请求失败时清空总数
  } finally {
    isLoading.value = false;
  }
};

const switchTab = (tabName) => {
  if (activeTab.value === tabName) {
    return;
  }
  
  if (tabName === 'collections') {
    const authStatus = AuthService.checkLoginStatus();
    if (!authStatus.isValid) {
      loginPromptMessage.value = '登录后才能查看我的收藏哦～';
      showLoginDialog.value = true;
      return;
    }
  }
  
  activeTab.value = tabName;
  pagination.value.page = 1;
  getPosts();
};

// --- 分页跳转方法 ---
const handlePageChange = (page) => {
  pagination.value.page = page;
  getPosts();
  window.scrollTo(0, 0);
};

// --- 跳转到帖子编辑页 ---
const navigateToEditor = () => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能开始创作哦～';
    showLoginDialog.value = true;
    return;
  }
  router.push({ name: 'PostEditor' });
};

onMounted(() => {
  getPosts();
});
</script>

<style scoped>
/* 样式 */
.empty-list-indicator {
  text-align: center;
  padding: 80px 50px;
  color: #888;
  font-size: 16px;
}

.creation-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.creation-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  text-align: left;
  border-bottom: 1px solid #f0f2f5;
  padding-bottom: 12px;
}

.creation-prompt {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prompt-text h4 {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #1d2129;
}

.prompt-text p {
  font-size: 13px;
  color: #8a919f;
  margin: 0;
  line-height: 1.5;
}

.prompt-icon {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.create-button {
  width: 100%;
  padding: 10px 0;
  font-size: 15px;
  color: #1e80ff;
  background-color: #fff;
  border: 1px solid #1e80ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.create-button:hover {
  background-color: #eaf2ff;
}

.plus-icon {
  font-size: 20px;
  font-weight: bold;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-top: 20px;
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