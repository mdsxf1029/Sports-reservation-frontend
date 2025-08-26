<template>
  <div class="post-card">
    <!-- 头部区域：作者信息 -->
    <div class="post-header">
      <div class="author-info">
        <img :src="post.author.avatarUrl" alt="avatar" class="author-avatar">
        <div class="author-details">
          <span class="author-name">{{ post.author.username }}</span>
          <span class="publish-time">{{ formattedPublishTime }}</span>
        </div>
      </div>
    </div>

    <!-- 中间区域：可点击的帖子标题和内容 -->
    <router-link :to="{ name: 'PostViewer', params: { postId: post.postId } }" class="post-link">
      <h3 class="post-title">{{ post.title }}</h3>
      <p class="post-content">{{ post.content }}</p>
    </router-link>

    <!-- 底部操作区域：点赞、收藏和举报 -->
    <div class="post-actions">
      <div class="action-icons-wrapper">
        <!-- 收藏按钮和计数组 -->
        <div class="action-item">
          <i
            :class="{ 'fa-solid': post.currentUserInteraction.hasCollected, 'fa-regular': !post.currentUserInteraction.hasCollected }"
            class="fa-star"
            @click="handleCollect"
          ></i>
          <span>{{ post.stats.collectionCount || 0 }}</span>
        </div>
        
        <!-- 点赞按钮和计数组 -->
        <div class="action-item">
          <i
            :class="{ 'fa-solid': post.currentUserInteraction.hasLiked, 'fa-regular': !post.currentUserInteraction.hasLiked }"
            class="fa-heart"
            @click="handleLike"
          ></i>
          <span>{{ post.stats.likeCount }}</span>
        </div>

        <!-- 举报功能的 Popover -->
        <el-popover
          placement="bottom"
          :width="100"
          trigger="click"
          popper-class="report-popper"
        >
          <template #reference>
            <i 
              class="fa-solid fa-ellipsis" 
              title="更多操作"
            ></i>
          </template>
          <!-- Popover 的内容 -->
          <div class="popover-action-item" @click="handleReport">
            举报
          </div>
        </el-popover>
      </div>
    </div>
  </div>

  <!-- 举报模态框 -->
  <div v-if="showReportModal" class="modal-overlay" @click.self="closeReportModal">
    <div class="report-modal">
      <div class="modal-header">
        <h3>举报帖子</h3>
        <button class="close-btn" @click="closeReportModal">×</button>
      </div>
      <div class="modal-body">
        <p class="report-desc">请选择举报原因：</p>
        <div class="report-reasons">
          <label class="reason-item" v-for="reason in reportReasons" :key="reason.value">
            <input 
              type="radio" 
              v-model="selectedReportReason" 
              :value="reason.label"
            >
            {{ reason.label }}
          </label>
        </div>
        <textarea 
          v-model="reportDescription" 
          placeholder="请输入详细说明（可选）..." 
          rows="3"
          maxlength="500"
          class="report-description"
        ></textarea>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeReportModal">取消</button>
        <button 
          class="submit-btn" 
          @click="submitReport" 
          :disabled="!selectedReportReason"
        >
          提交举报
        </button>
      </div>
    </div>
  </div>

  <!-- 提示信息 -->
  <div v-if="showReportTip" class="tip">{{ reportTip }}</div>

  <!-- 登录提示 -->
  <LoginPrompt
    v-model="showLoginDialog"
    :message="loginPromptMessage"
    @login="handleLoginRedirect"
  />
</template>

<script setup>
import { defineProps, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElPopover } from 'element-plus';
import { 
  likeCommunityPost, 
  unlikeCommunityPost,
  collectCommunityPost,
  uncollectCommunityPost,
  reportCommunityPost
} from '../utils/api.js';
import { AuthService } from '../utils/auth.js';
import LoginPrompt from './LoginPrompt.vue';
import { formatRelativeTime } from '../utils/formatters.js';


const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

// 添加处理中的状态，防止用户连续快速点击
const isLiking = ref(false);
const isCollecting = ref(false);

// 登录提示弹窗相关状态
const router = useRouter();
const showLoginDialog = ref(false);
const loginPromptMessage = ref('');

const handleLoginRedirect = () => {
  router.push('/login'); // 跳转到登录页
};

const formattedPublishTime = computed(() => {
    // 直接调用 formatRelativeTime 函数
    return formatRelativeTime(props.post.postTime);
});

// 实现完整的点赞/取消点赞逻辑，增加登录检查
const handleLike = async () => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能点赞哦～';
    showLoginDialog.value = true;
    return;
  }

  if (isLiking.value) return; // 如果正在处理中，则不执行任何操作
  isLiking.value = true;
  
  try {
    if (props.post.currentUserInteraction.hasLiked) {
      // 当前已点赞，执行取消点赞操作
      await unlikeCommunityPost(props.post.postId);
      props.post.stats.likeCount--;
    } else {
      // 当前未点赞，执行点赞操作
      await likeCommunityPost(props.post.postId);
      props.post.stats.likeCount++;
    }
    // 切换点赞状态
    props.post.currentUserInteraction.hasLiked = !props.post.currentUserInteraction.hasLiked;
  } catch (error) {
    console.error("点赞操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isLiking.value = false; // 无论成功或失败，都结束处理状态
  }
};

// 实现完整的收藏/取消收藏逻辑，增加登录检查
const handleCollect = async () => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能收藏哦～';
    showLoginDialog.value = true;
    return;
  }

  if (isCollecting.value) return;
  isCollecting.value = true;

  try {
    if (props.post.currentUserInteraction.hasCollected) {
      // 当前已收藏，执行取消收藏操作
      await uncollectCommunityPost(props.post.postId);
        props.post.stats.collectionCount--;
    } else {
      // 当前未收藏，执行收藏操作
      await collectCommunityPost(props.post.postId);
        props.post.stats.collectionCount++;
    }
    // 切换收藏状态
    props.post.currentUserInteraction.hasCollected = !props.post.currentUserInteraction.hasCollected;
  } catch (error) {
    console.error("收藏操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isCollecting.value = false;
  }
};


// --- 举报功能 ---

// 举报模态框相关状态
const showReportModal = ref(false);
const reportReasons = [
  { label: '广告', value: 'spam' },
  { label: '色情低俗', value: 'pornography' },
  { label: '欺诈', value: 'fraud' },
  { label: '侵权', value: 'infringement' },
  { label: '其它原因', value: 'other' }
];
const selectedReportReason = ref('');
const reportDescription = ref('');

// 举报成功提示相关状态
const showReportTip = ref(false);
const reportTip = ref('');

// 举报操作的包裹函数，用于检查登录
const handleReport = () => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能举报哦～';
    showLoginDialog.value = true;
    return;
  }
  // 登录后才打开举报窗口
  openReportModal();
};

// 打开举报模态框
const openReportModal = () => {
  selectedReportReason.value = '';
  reportDescription.value = '';
  showReportModal.value = true;
};

// 关闭举报模态框
const closeReportModal = () => {
  showReportModal.value = false;
};

// 提交举报逻辑，增加 userId
const submitReport = async () => {
  if (!selectedReportReason.value) {
    ElMessage.warning('请选择举报类别');
    return;
  }

  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    ElMessage.error('登录状态已失效，请重新登录');
    showLoginDialog.value = true; // 再次提示登录
    return;
  }

  try {
    // 向后端发送举报请求
    const combinedReason = `[${selectedReportReason.value}] ${reportDescription.value}`
    await reportCommunityPost(props.post.postId, {
      user_id: authStatus.userId, // 提交用户ID
      reportReason: combinedReason,
    });

    ElMessage.success('举报已提交');
    closeReportModal();
  } catch (err) {
    ElMessage.error('举报失败，请稍后重试');
    console.error("举报失败:", err);
  }
};
</script>

<style>
/* Popover 的样式需要放在非 scoped 的 style 块中才能生效 */
.el-popover.el-popper.report-popper {
  min-width: 80px !important;
  padding: 0 !important;
}
</style>

<style scoped>
/* --- 智能布局核心 --- */
.post-card {
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
  background-color: #fff;
  padding: 20px;
  border-bottom: 1px solid #f0f2f5;
}
.post-card:last-child {
  border-bottom: none;
}
.post-link {
  color: inherit;
  text-decoration: none;
  flex-grow: 1; /* 让内容区域自适应伸展 */
}

/* --- 头部样式 --- */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.author-info {
  display: flex;
  align-items: center;
}
.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}
.author-details {
  display: flex;
  flex-direction: column;
}
.author-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.publish-time {
  font-size: 12px;
  color: #8a919f;
}

/* --- 内容样式 --- */
.post-title {
  font-size: 18px;
  margin: 0 0 10px 0;
  font-weight: 600;
  color: #1d2129;
}
.post-content {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- 底部操作区样式 --- */
.post-actions {
  display: flex;
  justify-content: flex-end; /* 将图标容器推到右侧 */
  margin-top: 15px; /* 与上方内容保持间距 */
}
.action-icons-wrapper {
  display: flex;
  align-items: center;
  gap: 18px; /* 各功能组之间的间距 */
  font-size: 18px;
  color: #7f8c8d;
}
.action-item {
  display: flex;
  align-items: center;
  gap: 6px; /* 图标和它自己的数字之间的间距 */
}
.action-icons-wrapper i {
  cursor: pointer;
  transition: color 0.2s ease;
}
.action-icons-wrapper i:hover {
  color: #2980b9;
}
.action-icons-wrapper .fa-star.fa-solid {
  color: #3498db;
}
.action-icons-wrapper .fa-heart.fa-solid {
  color: #e74c3c;
}
/* 为三点图标也添加悬停效果 */
.action-icons-wrapper .fa-ellipsis:hover {
  color: #2980b9;
}

/* 新增：Popover 内部项目的样式 */
.popover-action-item {
  text-align: center;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 4px;
}
.popover-action-item:hover {
  background-color: #f7f8fa;
}


/* --- 举报弹窗和提示框样式 --- */
.tip {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1001;
  font-size: 14px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.report-modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}
.modal-body .report-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}
.report-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.reason-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}
.reason-item input[type="radio"] {
  margin-right: 5px;
}
.report-description {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.cancel-btn, .submit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 14px;
}
.cancel-btn {
  background-color: #f0f0f0;
}
.submit-btn {
  background-color: #1e80ff;
  color: white;
  border-color: #1e80ff;
}
.submit-btn:disabled {
  background-color: #a0cfff;
  border-color: #a0cfff;
  cursor: not-allowed;
}
</style>