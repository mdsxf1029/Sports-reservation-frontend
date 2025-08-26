<template>
  <TopNavbar title="运动社区 / 帖子详情" />
  <div class="app-container">
    <div class="content-wrapper">

      <!-- 作者信息 + 发布时间 + 内容 -->
      <div class="post-card">
        <!-- 帖子标题，居中大字 -->
        <h1 class="post-main-title">{{ post.postTitle }}</h1>
        <div class="post-header">
          <div class="author-info">
            <img :src="post.author?.avatarUrl" alt="作者头像" class="author-avatar" />
            <div class="post-info">
              <span class="author-name">{{ post.author?.username }}</span>
              <span class="post-time">发表于 {{ post.postTime }}</span>
            </div>
          </div>
        </div>

        <!-- 帖子正文 -->
        <p class="post-content">{{ post.postContent }}</p>


        <!-- 操作图标 - 现在会显示在右侧 -->
        <div class="post-actions-container">
          <div class="post-icons">
            <!-- 收藏按钮组 -->
            <div>
              <i
                :class="{ 'fa-solid': isFavorited, 'fa-regular': !isFavorited }"
                class="fa-star"
                @click="handleFavorite"
                title="收藏"
              ></i>
              <span>{{ collectionCount }}</span>
            </div>
            
            <!-- 点赞按钮组 -->
            <div>
              <i
                :class="{ 'fa-solid': isLiked, 'fa-regular': !isLiked }"
                class="fa-heart"
                @click="handleLike"
                title="喜欢"
              ></i>
              <span>{{ likeCount }}</span>
            </div>

            <!-- 隐藏式举报按钮 -->
            <el-popover
              placement="bottom"
              :width="100"
              trigger="click"
              popper-class="report-popper"
              v-model:visible="isPopoverVisible"
            >
              <template #reference>
                <i 
                  class="fa-solid fa-ellipsis" 
                  title="更多操作"
                ></i>
              </template>
              <!-- 只有在未打开举报框时才显示举报选项 -->
              <div 
                class="popover-action-item" 
                @click="handleReport"
                v-if="!showReportModal && !showLoginDialog"
              >
                举报
              </div>
            </el-popover>
          </div>
        </div>
      </div>

      <!-- 评论区域（带折叠功能） -->
      <div class="comments-box">
          <div class="comments-box-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 class="comments-title">帖子评论 ({{ comments.length }})</h4>
            <el-select 
              v-model="sortType" 
              placeholder="排序方式" 
              style="margin-left: 12px; width: 100px;"
            >
              <el-option
                v-for="option in sortOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value">
              </el-option>
            </el-select>
          </div>
        
        <!-- 评论列表 -->
        <div 
          v-for="(comment, index) in displayComments" 
          :key="comment.id || index" 
          class="comment-item"
        >
          <!-- 评论者头像 -->
          <img :src="comment.author.avatarUrl" alt="评论者头像" class="comment-avatar">
          
          <!-- 评论内容区域 -->
          <div class="comment-content-wrapper">
            <!-- 评论者名称 -->
            <div class="comment-header">
              <span class="comment-user_name">{{ comment.author.username }}</span>
            </div>
            
            <!-- 评论内容 -->
            <p class="comment-content">{{ comment.content }}</p>
            
            <!-- 评论底部：发布时间、赞、踩 -->
            <div class="comment-footer">
              <span class="comment-time">{{ formatRelativeTime(comment.postTime) }}</span>
              <div class="comment-actions">
                <i
                :class="{ 'fa-solid': comment.isLiked, 'fa-regular': !comment.isLiked }"
                class="fa-thumbs-up"
                @click="handleCommentLike(comment.id)"
                ></i>
                <span>{{ comment.likeCount }}</span>
                <i
                  :class="{ 'fa-solid': comment.isDisliked, 'fa-regular': !comment.isDisliked }"
                  class="fa-thumbs-down"
                  @click="handleCommentDislike(comment.id)"
                ></i>
                <span>{{ comment.dislikeCount }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 折叠/展开按钮 -->
        <el-button
          v-if="comments.length > 5"
          type="text"
          class="toggle-comments-btn"
          @click="isCommentsExpanded = !isCommentsExpanded"
        >
          {{ isCommentsExpanded ? '收起评论' : `显示全部 ${comments.length} 条评论` }}
        </el-button>
      </div>

      <!-- 提示框和举报模态框 -->
      <div v-if="showFavoriteTip" class="tip">{{ favoriteTip }}</div>
      <div v-if="showLikeTip" class="tip">{{ likeTip }}</div>
      <div v-if="showReportTip" class="tip">{{ reportTip }}</div>
      
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
    </div>
  </div>

  <!-- 固定底部评论输入框（可收起） -->
  <div 
    class="fixed-comment-container"
    :class="{ 'collapsed': !isCommentBoxVisible }"
  >
    <!-- 评论框展开/收起控制按钮 -->
    <div 
      class="comment-toggle-btn"
      @click="toggleCommentBox"
    >
      <i :class="isCommentBoxVisible ? 'fa fa-chevron-down' : 'fa fa-chevron-up'"></i>
    </div>
    
    <!-- 评论输入区域 -->
    <div class="fixed-comment-box">
      <textarea 
        v-model="newComment" 
        placeholder="请输入评论内容..." 
        rows="1"
        class="comment-input"
        ref="commentInput"
        @keydown.enter.exact.prevent="submitComment"
        :disabled="!isCommentBoxVisible"
      ></textarea>
      <button 
        class="submit-comment-btn" 
        @click="submitComment" 
        :disabled="!newComment.trim() || !isCommentBoxVisible"
      >
        发送
      </button>
    </div>
  </div>

  <!-- 返回顶部 -->
  <BackToTop/>
  
  <!-- 登录提示组件 -->
  <LoginPrompt
    v-model="showLoginDialog"
    :message="loginPromptMessage"
    @login="handleLoginRedirect"
  />

</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { 
  fetchPostById, reportCommunityPost, likeCommunityPost, unlikeCommunityPost, 
  collectCommunityPost, uncollectCommunityPost, fetchPostComments,
  likeComment, unlikeComment, dislikeComment, undislikeComment, createCommunityComment
} from '../utils/api.js';
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton, ElSelect, ElOption, ElMessage, ElPopover } from 'element-plus';
import { MoreFilled } from '@element-plus/icons-vue';
import BackToTop from '../components/BackToTop.vue';
import TopNavbar from '../components/TopNavbar.vue';
import LoginPrompt from '../components/LoginPrompt.vue';
import { AuthService } from '../utils/auth.js';
import { formatDate, formatRelativeTime } from '../utils/formatters.js';

// 替换原有的 formatPostTime 方法
const formatPostTime = (isoTime) => {
  return formatRelativeTime(isoTime);
};

const router = useRouter();

// 接收路由传递的postId
const props = defineProps({
  postId: {
    type: [String, Number],
    required: true
  }
});

// 评论输入框引用
const commentInput = ref(null);

// 状态初始化
const isLoading = ref(true);
const post = ref({});
const comments = ref([]);

// 评论框显示/隐藏状态
const isCommentBoxVisible = ref(true);

// 折叠相关状态
const isCommentsExpanded = ref(false);

// 排序相关状态
const sortType = ref('latest'); // 默认按最新排序
const sortOptions = [
  { label: '≡ 最新', value: 'latest' },
  { label: '≡ 最热', value: 'hottest' }
];

// 按排序规则计算评论
const sortedComments = computed(() => {
  // 先复制数组避免修改原数据
  const sorted = [...comments.value];
  
  if (sortType.value === 'latest') {
    // 按发布时间降序排序（最新的在前）
    return sorted.sort((a, b) => new Date(b.postTime) - new Date(a.postTime));
  } else if (sortType.value === 'hottest') {
    // 按点赞数降序排序（最热的在前）
    return sorted.sort((a, b) => b.likeCount - a.likeCount);
  }
  
  return sorted;
});

// 根据折叠状态和排序计算显示的评论
const displayComments = computed(() => {
  if (sortedComments.value.length <= 5) {
    return sortedComments.value;
  }
  return isCommentsExpanded.value 
    ? sortedComments.value 
    : sortedComments.value.slice(0, 5);
});

// 交互状态
const isFavorited = ref(false);
const isLiked = ref(false);
const showFavoriteTip = ref(false);
const showLikeTip = ref(false);
const showReportTip = ref(false);
const favoriteTip = ref('');
const likeTip = ref('');
const reportTip = ref('');
const newComment = ref('');
const collectionCount = ref(0);
const likeCount = ref(0);

// 登录设置
const handleLoginRedirect = () => {
  router.push('/login');
};

// 添加处理中的状态，防止用户连续快速点击
const isLiking = ref(false);
const isCollecting = ref(false);
const isCommentInteracting = ref({});

// 帖子举报相关状态（新增isPopoverVisible控制弹窗显示）
const showReportModal = ref(false);
const isPopoverVisible = ref(false); // 控制三点弹出框的显示/隐藏
const reportReasons = [
  { label: '广告', value: 'spam' },
  { label: '色情低俗', value: 'pornography' },
  { label: '欺诈', value: 'fraud' },
  { label: '侵权', value: 'infringement' },
  { label: '其它原因', value: 'other' }
];
const selectedReportReason = ref('');
const reportDescription = ref('');

// 登录提示相关状态
const showLoginDialog = ref(false);
const loginPromptMessage = ref('');

// 初始化帖子数据
onMounted(async () => {
  try {
    // 获取帖子详情
    const postResponse = await fetchPostById(props.postId);
    if (postResponse.data) {
      const postData = postResponse.data;
      post.value = {
        id: postData.postId,
        postTitle: postData.title,
        postContent: postData.content,
        postTime: formatPostTime(postData.publishTime),
        author: postData.author
      };
      
      // 设置当前用户交互状态
      isLiked.value = postData.currentUserInteraction?.hasLiked || false;
      isFavorited.value = postData.currentUserInteraction?.hasCollected || false;
      
      // 设置喜欢和收藏数量
      likeCount.value = postData.stats?.likeCount || 0;
      collectionCount.value = postData.stats?.collectionCount || 0;
    } else {
      console.warn("获取帖子详情失败，使用模拟数据:", postResponse.data?.message || '未知错误');
      initWithMockData();
    }

    // 单独获取评论数据
    const commentResponse = await fetchPostComments(props.postId);
    if (commentResponse.data?.comments) {
      // 转换评论数据结构以匹配前端需求
      comments.value = commentResponse.data.comments.map(comment => ({
        id: comment.commentId,  // 映射commentId到id
        content: comment.content,
        author: {
          userId: comment.author.userId,
          username: comment.author.username,
          avatarUrl: comment.author.avatar  // 映射avatar到avatarUrl
        },
        postTime: comment.publishTime,  // 保留原始时间用于格式化
        isLiked: false,  // 假设初始为未点赞
        isDisliked: false,  // 假设初始为未点踩
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount
      }));
    } else {
      comments.value = [];
      console.warn("获取评论失败，使用空评论列表");
    }
  } catch (error) {
    console.warn("请求数据时发生错误，使用模拟数据:", error);
    initWithMockData();
  } finally {
    isLoading.value = false;
  }
});

// 使用模拟数据初始化
const initWithMockData = () => {
  post.value = {
    id: mockPostData.postId,
    postTitle: mockPostData.title,
    postContent: mockPostData.content,
    postTime: formatPostTime(mockPostData.publishTime),
    author: mockPostData.author
  };
  // 转换模拟评论数据结构
  comments.value = (mockPostData.comments || []).map(comment => ({
    id: comment.id,
    content: comment.content,
    author: {
      userId: comment.author.userId || 0,  // 补充userId字段
      username: comment.author.username,
      avatarUrl: comment.author.avatarUrl
    },
    postTime: comment.postTime,
    isLiked: comment.isLiked,
    isDisliked: comment.isDisliked,
    likeCount: comment.likeCount,
    dislikeCount: comment.dislikeCount
  }));
  isLiked.value = mockPostData.currentUserInteraction?.hasLiked || false;
  isFavorited.value = mockPostData.currentUserInteraction?.hasCollected || false;
  likeCount.value = mockPostData.stats?.likeCount || 0;
  collectionCount.value = mockPostData.stats?.collectionCount || 0;
};

// 方法定义
const handleBack = () => router.back();

// 收藏功能实现
const handleFavorite = async () => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能收藏哦～';
    showLoginDialog.value = true;
    return;
  }

  if (isCollecting.value) return;
  isCollecting.value = true;
  
  try {
    if (isFavorited.value) {
      await uncollectCommunityPost(post.value.id);
      collectionCount.value--;
    } else {
      await collectCommunityPost(post.value.id);
      collectionCount.value++;
    }
    isFavorited.value = !isFavorited.value;
    favoriteTip.value = isFavorited.value ? '已收藏该帖子' : '已取消收藏';
    showFavoriteTip.value = true;
    setTimeout(() => showFavoriteTip.value = false, 2000);
  } catch (error) {
    console.error("收藏操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isCollecting.value = false;
  }
};

// 点赞功能实现
const handleLike = async () => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能点击喜欢哦～';
    showLoginDialog.value = true;
    return;
  }

  if (isLiking.value) return;
  isLiking.value = true;
  
  try {
    if (isLiked.value) {
      await unlikeCommunityPost(post.value.id);
      likeCount.value--;
    } else {
      await likeCommunityPost(post.value.id);
      likeCount.value++;
    }
    isLiked.value = !isLiked.value;
    likeTip.value = isLiked.value ? '已喜欢该帖子' : '已取消喜欢';
    showLikeTip.value = true;
    setTimeout(() => showLikeTip.value = false, 2000);
  } catch (error) {
    console.error("点赞操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isLiking.value = false;
  }
};

// 切换评论框显示/隐藏状态
const toggleCommentBox = () => {
  isCommentBoxVisible.value = !isCommentBoxVisible.value;
  
  if (isCommentBoxVisible.value) {
    nextTick(() => {
      commentInput.value?.focus();
    });
  }
};

// 聚焦到评论输入框
const focusCommentInput = () => {
  if (!isCommentBoxVisible.value) {
    toggleCommentBox();
    return;
  }
  
  nextTick(() => {
    commentInput.value?.focus();
  });
};

// 提交评论方法
const isSubmittingComment = ref(false);

// 在submitComment方法中修改参数传递
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }
  
  const userId = localStorage.getItem('userId');
  if (!userId) {
    loginPromptMessage.value = '登录后才能发表评论哦～';
    showLoginDialog.value = true;
    return;
  }

  isSubmittingComment.value = true;
  try {
    const response = await createCommunityComment(
      props.postId, 
      newComment.value.trim()
    );
    
    if (response.status === 201) {
      ElMessage.success('评论发表成功');
      newComment.value = '';
      window.location.reload();
      // 将新评论添加到评论列表头部
      comments.value.unshift(response.data);
    } else {
      ElMessage.error('发表评论失败：请稍后重试');
    }
  } catch (error) {
    console.error('评论提交失败:', error);
    ElMessage.error('网络错误，评论发表失败');
  } finally {
    isSubmittingComment.value = false;
  }
};

// 评论点赞处理方法
const handleCommentLike = async (commentId) => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能点赞评论哦～';
    showLoginDialog.value = true;
    return;
  }
  
  // 获取当前用户ID
  const userId = localStorage.getItem('userId');
  if (!userId) {
    loginPromptMessage.value = '请先登录再进行操作';
    showLoginDialog.value = true;
    return;
  }
  
  if (isCommentInteracting.value[commentId]) return;
  isCommentInteracting.value[commentId] = true;
  
  try {
    const comment = comments.value.find(item => item.id === commentId);
    if (!comment) return;
    
    // 核心逻辑：如果已经点踩，先发送删除点踩的API请求
    if (comment.isDisliked) {
      // 调用删除点踩的API
      await undislikeComment(commentId, userId);
      // 更新本地状态
      comment.dislikeCount--;
      comment.isDisliked = false;
    }
    
    // 处理点赞/取消点赞逻辑
    if (comment.isLiked) {
      // 取消点赞
      await unlikeComment(commentId, userId);
      comment.likeCount--;
    } else {
      // 点赞
      await likeComment(commentId, userId);
      comment.likeCount++;
    }
    comment.isLiked = !comment.isLiked;
  } catch (error) {
    console.error("评论点赞操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isCommentInteracting.value[commentId] = false;
  }
};

// 评论点踩处理方法
const handleCommentDislike = async (commentId) => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能点踩评论哦～';
    showLoginDialog.value = true;
    return;
  }
  
  // 获取当前用户ID
  const userId = localStorage.getItem('userId');
  if (!userId) {
    loginPromptMessage.value = '请先登录再进行操作';
    showLoginDialog.value = true;
    return;
  }
  
  if (isCommentInteracting.value[commentId]) return;
  isCommentInteracting.value[commentId] = true;
  
  try {
    const comment = comments.value.find(item => item.id === commentId);
    if (!comment) return;
    
    // 核心逻辑：如果已经点赞，先发送删除点赞的API请求
    if (comment.isLiked) {
      // 调用删除点赞的API
      await unlikeComment(commentId, userId);
      // 更新本地状态
      comment.likeCount--;
      comment.isLiked = false;
    }
    
    // 处理点踩/取消点踩逻辑
    if (comment.isDisliked) {
      // 取消点踩
      await undislikeComment(commentId, userId);
      comment.dislikeCount--;
    } else {
      // 点踩
      await dislikeComment(commentId, userId);
      comment.dislikeCount++;
    }
    comment.isDisliked = !comment.isDisliked;
  } catch (error) {
    console.error("评论点踩操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isCommentInteracting.value[commentId] = false;
  }
};

// 帖子举报相关方法（修改部分）
const handleReport = () => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能举报哦～';
    showLoginDialog.value = true;
    isPopoverVisible.value = false;
    return;
  }
  
  // 打开举报框时隐藏三点弹出框和举报选项
  isPopoverVisible.value = false; // 关闭三点弹出框
  openReportModal();
};

const openReportModal = () => {
  showReportModal.value = true;
  selectedReportReason.value = '';
  reportDescription.value = '';
};

const closeReportModal = () => {
  showReportModal.value = false;
};

// 提交举报方法修改
const submitReport = async () => {
  if (!selectedReportReason.value) {
    ElMessage.warning('请选择举报类别');
    return;
  }

  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    ElMessage.error('登录状态已失效，请重新登录');
    showLoginDialog.value = true;
    return;
  }

  try {
    // 仅传递 postId 和举报描述，user_id 由 API 内部从 localStorage 获取
    const reportData = {
      description: `[${selectedReportReason.value}] ${reportDescription.value}`
    };
    await reportCommunityPost(props.postId, reportData); // 直接传 postId 即可

    ElMessage.success('举报已提交');
    closeReportModal();
  } catch (err) {
    ElMessage.error('举报失败，请稍后重试');
    console.error("举报失败:", err);
  }
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f6fa !important;
  padding-top: 20px !important;
  padding-bottom: 120px; /* 为底部评论框留出空间 */
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
    "PingFang SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  color: #1f2937;
}

.content-wrapper {
  width: 82%;
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 36px;
  box-sizing: border-box;
  padding: 20px 0;
}


.post-main-title {
  font-size: 32px;
  font-weight: 700;
  text-align: left;
  color: black; 
  margin-bottom: 40px;
}

/* 帖子卡片整体 */
.post-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 32px 70px;
  position: relative;
}

/* 帖子头部：作者 + 时间 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgb(224, 221, 221) !important;
  padding-bottom: 20px;
  margin-bottom: 24px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 18px;
}

.author-avatar {
  width: 56px !important;
  height: 56px !important;
  border-radius: 50%;
  object-fit: cover;
}

.post-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 22px;
  font-weight: 600;
  color: #1c388b;
}

.post-time {
  font-size: 14px;
  color: #6b7280;
}

/* 帖子内容 */
.post-content {
  font-size: 18px;
  line-height: 1.8;
  color: #1f2937;
  margin-bottom: 32px;
  white-space: pre-line;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 操作图标容器 - 用于将按钮定位在右侧 */
.post-actions-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgb(224, 221, 221);
}

/* 帖子操作图标 - 确保图标和文字垂直居中对齐 */
.post-icons {
  display: flex;
  align-items: center;
  gap: 25px; /* 增大按钮组之间的距离 */
  font-size: 18px;
  color: #6b7280;
}

.post-icons span {
  display: flex;
  align-items: center; /* 确保图标和文字在同一行垂直居中 */
}

.post-icons i {
  cursor: pointer;
  transition: color 0.2s;
  font-size: 20px;
}

.post-icons > div {
  display: flex;
  align-items: center;
  gap: 5px; /* 图标与数字的间距（调小） */
}

.post-icons i:hover {
  color: #3b82f6;
}

.post-icons .fa-solid.fa-heart {
  color: #ef4444;
}

.post-icons .fa-solid.fa-star {
  color: #f59e0b;
}

/* 评论区域 */
.comments-box {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 24px 32px;
}

.comments-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* 评论项 */
.comment-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content-wrapper {
  flex-grow: 1;
}

.comment-header {
  margin-bottom: 8px;
}

.comment-user_name {
  font-weight: 600;
  color: #1c388b;
  font-size: 18px;
}

.comment-content {
  font-size: 16px;
  line-height: 1.6;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.comment-time {
  color: #9ca3af;
}

/* 评论操作按钮 - 确保图标和文字垂直居中对齐 */
.comment-actions {
  display: flex;
  gap: 16px;
  align-items: center; /* 垂直居中 */
}

.comment-actions span {
  display: flex;
  align-items: center; /* 确保图标和文字在同一行垂直居中 */
}

.comment-actions i {
  cursor: pointer;
  transition: color 0.2s;
  margin-right: 1px; /* 调整间距，使对齐更美观 */
}

.comment-actions .fa-thumbs-up:hover {
  color: #3b82f6;
}

.comment-actions .fa-thumbs-down:hover {
  color: #ef4444;
}

.comment-actions .fa-solid.fa-thumbs-up {
  color: #3b82f6;
}

.comment-actions .fa-solid.fa-thumbs-down {
  color: #ef4444;
}

/* 折叠/展开评论按钮 */
.toggle-comments-btn {
  width: 100%;
  color: #3b82f6;
  padding: 8px 0;
  margin-top: 8px;
}

/* 固定底部评论框样式 */
.fixed-comment-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  transition: transform 0.3s ease;
  transform: translateY(0);
  z-index: 1000;
}

/* 评论框收起状态 */
.fixed-comment-container.collapsed {
  transform: translateY(calc(100% - 20px));
}

/* 评论输入区域 */
.fixed-comment-box {
  background-color: white;
  padding: 15px 10%;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  align-items: flex-end;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

/* 评论框展开/收起按钮 */
.comment-toggle-btn {
  background-color: #3b82f6;
  color: white;
  width: 40px;
  height: 20px;
  border-radius: 10px 10px 0 0;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  transition: all 0.3s ease;
}

.comment-input {
  flex-grow: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  resize: none;
  transition: border-color 0.2s;
  min-height: 25px;
}

.comment-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.comment-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.submit-comment-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.submit-comment-btn:hover {
  background-color: #2563eb;
}

.submit-comment-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

/* 提示框样式 */
.tip {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1001;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

/* 举报模态框样式 */
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

/* 举报弹出菜单样式 */
.popover-action-item {
  text-align: center;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 16px;
  border-radius: 4px;
}
.popover-action-item:hover {
  background-color: #f7f8fa;
}
</style>

<style>
/* Popover 的样式需要放在非 scoped 的 style 块中才能生效 */
.el-popover.el-popper.report-popper {
  min-width: 80px !important;
  padding: 0 !important;
}
</style>