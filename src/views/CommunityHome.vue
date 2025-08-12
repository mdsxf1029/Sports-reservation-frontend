<template>
  <div>
    <HeaderNavbar />

    <div class="community-main-container">
      <div class="post-list-container">
        <div class="post-tabs">
          <span 
            class="tab-item" 
            :class="{ active: activeTab === 'recommend' }"
            @click="switchTab('recommend')"
          >
            推荐
          </span>
          <span 
            class="tab-item" 
            :class="{ active: activeTab === 'collections' }"
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
          />
        </div>
      </div>

      <div class="creation-center-container">
        <div class="creation-card">
          <button class="create-button">创作中心</button>
        </div>
      </div>
    </div>

    <!-- 登录提示弹窗 -->
    <LoginPrompt
      v-model="showLoginDialog"
      :message="loginPromptMessage"
      @login="handleLoginRedirect"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 引入新增的 API 函数
import HeaderNavbar from '../components/HeaderNavbar.vue';
import CommunityPostCard from '../components/CommunityPostCard.vue';
import { fetchCommunityPosts, fetchMyCollectedPosts } from '../utils/api.js';
import { AuthService } from '../utils/auth.js';
import LoginPrompt from '../components/LoginPrompt.vue';

// 2. 引入样式文件
import '../styles/community-home.css';

// 3. 定义组件状态
const posts = ref([]);
const isLoading = ref(true);
const pagination = ref({
  page: 1,
  pageSize: 10,
});
// 用于管理当前激活的 Tab
const activeTab = ref('recommend'); 

// 登录提示弹窗相关状态
const router = useRouter();
const showLoginDialog = ref(false);
const loginPromptMessage = ref('');

const handleLoginRedirect = () => {
  router.push('/login'); // 跳转到登录页
};

const getPosts = async () => {
  isLoading.value = true;
  try {
    let response;
    // 根据当前的 Tab 调用不同的 API
    if (activeTab.value === 'recommend') {
      console.log("正在获取推荐帖子...");
      response = await fetchCommunityPosts(pagination.value);
    } else { // activeTab.value === 'collections'
      console.log("正在获取我的收藏...");
      response = await fetchMyCollectedPosts(pagination.value);
    }
    
    if (response.data && response.data.code === 200) {
      posts.value = response.data.data.list;
      console.log("成功获取到帖子:", posts.value);
    } else {
      // 如果API返回非200状态码，也清空列表
      posts.value = [];
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    posts.value = []; // 发生错误时清空列表，防止显示旧数据
  } finally {
    isLoading.value = false;
  }
};

// 切换 Tab 时增加登录判断
const switchTab = (tabName) => {
  // 如果点击的是当前已激活的 Tab，则不执行任何操作
  if (activeTab.value === tabName) {
    return;
  }
  
  // 如果目标是“我的收藏”，则检查登录状态
  if (tabName === 'collections') {
    const authStatus = AuthService.checkLoginStatus();
    if (!authStatus.isValid) {
      loginPromptMessage.value = '登录后才能查看我的收藏哦～';
      showLoginDialog.value = true;
      return; // 阻止切换
    }
  }
  
  activeTab.value = tabName; // 切换激活状态
  pagination.value.page = 1; // 切换 Tab 时重置到第一页
  getPosts(); // 调用方法重新获取数据
};


onMounted(() => {
  getPosts(); // 页面首次加载时，获取默认的“推荐”列表
});
</script>

<style scoped>
/* 列表为空时的样式 */
.empty-list-indicator {
  text-align: center;
  padding: 80px 50px;
  color: #888;
  font-size: 16px;
}
</style>
