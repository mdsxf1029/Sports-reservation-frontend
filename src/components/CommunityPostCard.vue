<template>
  <div class="post-card">
    <div class="author-info">
      <img :src="post.author.avatarUrl" alt="avatar" class="author-avatar">
      <div class="author-details">
        <span class="author-name">{{ post.author.username }}</span>
        <span class="publish-time">{{ formattedPublishTime }}</span>
      </div>
    </div>

    <router-link :to="{ name: 'PostViewer', params: { postId: post.postId } }" class="post-link">
      <h3 class="post-title">{{ post.title }}</h3>
      <p class="post-content">{{ post.content }}</p>
    </router-link>

    <div class="post-actions">
      <div class="action-item" @click="handleLike">
        <span class="icon">{{ post.currentUserInteraction.hasLiked ? '❤️' : '♡' }}</span>
        <span>{{ post.stats.likeCount }}</span>
      </div>
      <div class="action-item" @click="handleCollect">
        <span class="icon">{{ post.currentUserInteraction.hasCollected ? '⭐' : '☆' }}</span>
        <span>收藏</span>
      </div>
      <div class="action-item" @click="openReportModal">
        <span class="icon">🚩</span>
        <span>举报</span>
      </div>
    </div>
  </div>

  <div v-if="showReportTip" class="tip">{{ reportTip }}</div>

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
          placeholder="请输入详细说明（可选，最多500字节）..." 
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
</template>

<script setup>
import { defineProps, computed, ref, reactive } from 'vue';
// 引入所有需要用到的 API 函数
import { 
  likeCommunityPost, 
  unlikeCommunityPost,
  collectCommunityPost,
  uncollectCommunityPost,
  reportCommunityPost
} from '../utils/api.js';
import { ElMessage } from 'element-plus';

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

// 添加处理中的状态，防止用户连续快速点击
const isLiking = ref(false);
const isCollecting = ref(false);

const formattedPublishTime = computed(() => {
    if (!props.post.postTime) return '';
    return new Date(props.post.postTime).toLocaleString();
});

// 实现完整的点赞/取消点赞逻辑
const handleLike = async () => {
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
    // 这里可以添加用户提示，例如弹出一个小消息说“操作失败”
  } finally {
    isLiking.value = false; // 无论成功或失败，都结束处理状态
  }
};

// 实现完整的收藏/取消收藏逻辑
const handleCollect = async () => {
  if (isCollecting.value) return;
  isCollecting.value = true;

  try {
    if (props.post.currentUserInteraction.hasCollected) {
      // 当前已收藏，执行取消收藏操作
      await uncollectCommunityPost(props.post.postId);
    } else {
      // 当前未收藏，执行收藏操作
      await collectCommunityPost(props.post.postId);
    }
    // 切换收藏状态
    props.post.currentUserInteraction.hasCollected = !props.post.currentUserInteraction.hasCollected;
  } catch (error) {
    console.error("收藏操作失败:", error);
  } finally {
    isCollecting.value = false;
  }
};

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

// 提交举报逻辑
const submitReport = async () => {
  if (!selectedReportReason.value) {
    ElMessage.warning('请选择举报类别');
    return;
  }

  try {
    // 向后端发送举报请求
    await reportCommunityPost(props.post.postId, {
      category: selectedReportReason.value,
      reason: reportDescription.value,
    });

    // 显示举报成功提示
    reportTip.value = '举报已提交，感谢您的反馈';
    showReportTip.value = true;
    setTimeout(() => {
      showReportTip.value = false;
    }, 2000);

    closeReportModal();
  } catch (err) {
    ElMessage.error('举报失败，请稍后重试');
    console.error("举报失败:", err);
  }
};
</script>

<style scoped>
/* 原有样式保留 */
.post-link {
  color: inherit;
  text-decoration: none;
}
.post-card {
  background-color: #fff;
  padding: 20px;
  border-bottom: 1px solid #f0f2f5;
  position: relative; /* 为提示框定位 */
}
.post-card:last-child {
  border-bottom: none;
}
.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
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
  -webkit-line-clamp: 2; /* 最多显示两行 */
  overflow: hidden;
  text-overflow: ellipsis;
}
.post-actions {
  display: flex;
  margin-top: 15px;
  color: #8a919f;
  font-size: 14px;
}
.action-item {
  display: flex;
  align-items: center;
  margin-right: 25px;
  cursor: pointer;
  transition: color 0.2s;
}
.action-item:hover {
  color: #1e80ff;
}
.action-item .icon {
  margin-right: 6px;
  font-size: 16px;
}

/* --- 与 PostViewer.vue 统一的模态框和提示框样式 --- */

/* 提示框样式 */
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

/* 模态框遮罩层 */
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

/* 举报模态框本体 */
.report-modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 模态框头部 */
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

/* 模态框主体 */
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
  box-sizing: border-box; /* 保证 padding 不会撑大宽度 */
}

/* 模态框脚部 */
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
