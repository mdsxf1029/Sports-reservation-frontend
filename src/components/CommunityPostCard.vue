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
      <div class="action-item" @click="openReportDialog">
        <span class="icon">🚩</span>
        <span>举报</span>
      </div>
    </div>
  </div>
<el-dialog v-model="reportDialogVisible" title="举报帖子" width="400px">
  <el-form label-position="top">
    <el-form-item label="举报类别（必选）">
      <el-select v-model="reportForm.category" placeholder="请选择举报类别">
        <el-option
          v-for="item in reportCategories"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="举报理由（可选，最多500字节）">
      <el-input
        v-model="reportForm.reason"
        type="textarea"
        maxlength="500"
        show-word-limit
        placeholder="请描述举报原因（选填）"
      />
    </el-form-item>
  </el-form>
  <template #footer>
    <el-button @click="reportDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="submitReport">提交</el-button>
  </template>
</el-dialog>
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

import { ElDialog, ElSelect, ElOption, ElInput, ElMessageBox, ElMessage } from 'element-plus'; // 使用 Element Plus

// 举报表单相关状态
const reportDialogVisible = ref(false);
const reportForm = reactive({
  category: '',
  reason: '',
});

const reportCategories = ['广告', '色情低俗', '欺诈', '侵权', '其它原因'];

// 打开举报表单
const openReportDialog = () => {
  reportForm.category = '';
  reportForm.reason = '';
  reportDialogVisible.value = true;
};

// 提交举报逻辑
const submitReport = async () => {
  if (!reportForm.category) {
    ElMessage.warning('请选择举报类别');
    return;
  }

  try {
    await ElMessageBox.confirm(
      '你确认要提交举报吗？',
      '确认举报',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 向后端发送举报请求
    await reportCommunityPost(props.post.postId, {
      category: reportForm.category,
      reason: reportForm.reason,
    });

    ElMessage.success('举报已提交');
    reportDialogVisible.value = false;
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('举报失败，请稍后重试');
    }
  }
};
</script>

<style scoped>
.post-link {
  color: inherit;
  text-decoration: none;
}
.post-card {
  background-color: #fff;
  padding: 20px;
  border-bottom: 1px solid #f0f2f5;
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
</style>