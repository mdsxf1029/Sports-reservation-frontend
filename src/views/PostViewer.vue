<template>
  <TopNavbar title="运动社区 / 帖子详情" />
  <div class="app-container">
    <div class="content-wrapper">

      <!-- 作者信息 + 发布时间 + 内容 -->
      <div class="post-card">
        <!-- 帖子标题，居中大字 -->
        <h1 class="post-main-title">{{ post.title }}</h1>
        <div class="post-header">
          <div class="author-info">
            <img :src="post.author.avatar" alt="作者头像" class="author-avatar" />
            <div class="post-info">
              <span class="author-name">{{ post.author.user_name }}</span>
              <span class="post-time">发表于 {{ post.publish_time }}</span>
            </div>
          </div>
          <el-dropdown>
            <button class="post-menu-btn" title="更多操作">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleReport">举报帖子</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 帖子正文 -->
        <p class="post-content">{{ post.content }}</p>


        <!-- 操作图标 - 现在会显示在右侧 -->
        <div class="post-actions-container">
          <div class="post-icons">
            <i
              :class="{ 'fa-solid': isFavorited, 'fa-regular': !isFavorited }"
              class="fa-star"
              @click="handleFavorite"
              title="收藏"
            ></i>
            <span>{{ collection_count }}</span>
            <i
              :class="{ 'fa-solid': isLiked, 'fa-regular': !isLiked }"
              class="fa-heart"
              @click="handleLike"
              title="喜欢"
            ></i>
            <span>{{ like_count }}</span>
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
          <img :src="comment.author.avatar" alt="评论者头像" class="comment-avatar">
          
          <!-- 评论内容区域 -->
          <div class="comment-content-wrapper">
            <!-- 评论者名称 -->
            <div class="comment-header">
              <span class="comment-user_name">{{ comment.author.user_name }}</span>
            </div>
            
            <!-- 评论内容 -->
            <p class="comment-content">{{ comment.content }}</p>
            
            <!-- 评论底部：发布时间、赞、踩 -->
            <div class="comment-footer">
              <span class="comment-time">{{ comment.publish_time }}</span>
              <div class="comment-actions">
                <i
                :class="{ 'fa-solid': comment.isLiked, 'fa-regular': !comment.isLiked }"
                class="fa-thumbs-up"
                @click="handleCommentLike(comment.id)"
                ></i>
                <span>{{ comment.like_count }}</span>
                <i
                  :class="{ 'fa-solid': comment.isDisliked, 'fa-regular': !comment.isDisliked }"
                  class="fa-thumbs-down"
                  @click="handleCommentDislike(comment.id)"
                ></i>
                <span>{{ comment.dislike_count }}</span>
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
    </div>

    <!-- 提示框和举报模态框 -->
    <div v-if="showFavoriteTip" class="tip">{{ favoriteTip }}</div>
    <div v-if="showLikeTip" class="tip">{{ likeTip }}</div>
    <div v-if="showReportTip" class="tip">{{ reportTip }}</div>
    
    <!-- 帖子举报模态框 -->
    <div v-if="showReportModal" class="modal-overlay" @click.self="closeReportModal">
      <div class="report-modal">
        <div class="modal-header">
          <h3>举报</h3>
          <button class="close-btn" @click="closeReportModal">×</button>
        </div>
        <div class="modal-body">
          <p class="report-desc">请选择举报原因：</p>
          <div class="report-reasons">
            <label class="reason-item" v-for="(reason, index) in reportReasons" :key="index">
              <input 
                type="radio" 
                v-model="selectedReportReason" 
                :value="reason.value"
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
  collectCommunityPost, uncollectCommunityPost,
  likeComment, unlikeComment, dislikeComment, undislikeComment, createCommunityComment
} from '../utils/api.js';
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton, ElSelect, ElOption, ElMessage } from 'element-plus';
import { MoreFilled } from '@element-plus/icons-vue';
import BackToTop from '../components/BackToTop.vue';
import TopNavbar from '../components/TopNavbar.vue';
import LoginPrompt from '../components/LoginPrompt.vue';
import { AuthService } from '../utils/auth.js';

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
const post = ref({ author: {}, publish_time: '' });
const comments = ref([]);

// 评论框显示/隐藏状态
const isCommentBoxVisible = ref(true);

// 模拟当前用户数据
const currentUser = ref({
  avatar: 'https://picsum.photos/id/64/200',
  user_name: '当前用户'
});

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
    return sorted.sort((a, b) => new Date(b.publish_time) - new Date(a.publish_time));
  } else if (sortType.value === 'hottest') {
    // 按点赞数降序排序（最热的在前）
    return sorted.sort((a, b) => b.like_count - a.like_count);
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
const collection_count = ref(0);
const like_count = ref(0);

// 添加处理中的状态，防止用户连续快速点击
const isLiking = ref(false);
const isCollecting = ref(false);

// 帖子举报相关状态
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

// 登录提示相关状态
const showLoginDialog = ref(false);
const loginPromptMessage = ref('');

// 模拟帖子数据
const mockPostData = {
  post: {
    id: 1,
    title: "分享我的马拉松训练计划",
    content: "大家好，我想分享一下我为即将到来的城市马拉松准备的训练计划。\n\n每周一、三、五：早晨6点进行5-8公里的轻松跑\n每周二、四：力量训练+核心训练（各30分钟）\n每周六：长距离慢跑（从15公里开始，每周增加2公里）\n每周日：休息或轻度拉伸\n\n饮食方面，我主要以高蛋白、低碳水为主，每天保证3升以上的水分摄入。\n\n有没有跑友有更好的建议？欢迎交流！",
    author: {
      avatar: "https://picsum.photos/id/237/200",
      user_name: "跑步达人"
    },
    publish_time: "2023-10-15 08:30",
    stats: {
      likeCount: 128,
      collectionCount: 45
    }
  },
  comments: [
    {
      id: 1,
      content: "请问你跑前会做哪些热身运动？我每次跑完膝盖都会有点不舒服。",
      author: {
        avatar: "https://picsum.photos/id/1005/200",
        user_name: "新手跑者"
      },
      publish_time: "2023-10-15 09:15",
      isLiked: false,
      isDisliked: false,
      like_count: 8,
      dislike_count: 0
    },
    {
      id: 2,
      content: "你的计划很科学，我之前也是这样训练的，成功完成了全马！",
      author: {
        avatar: "https://picsum.photos/id/1012/200",
        user_name: "老马识途"
      },
      publish_time: "2023-10-15 10:02",
      isLiked: true,
      isDisliked: false,
      like_count: 23,
      dislike_count: 0
    },
    {
      id: 3,
      content: "长距离跑的时候你会补充能量胶吗？还是只用水？",
      author: {
        avatar: "https://picsum.photos/id/1025/200",
        user_name: "越野爱好者"
      },
      publish_time: "2023-10-15 11:45",
      isLiked: false,
      isDisliked: false,
      like_count: 5,
      dislike_count: 0
    },
    {
      id: 4,
      content: "我觉得可以增加一些间歇训练，提高速度耐力",
      author: {
        avatar: "https://picsum.photos/id/1074/200",
        user_name: "速度狂人"
      },
      publish_time: "2023-10-15 13:20",
      isLiked: false,
      isDisliked: true,
      like_count: 3,
      dislike_count: 1
    },
    {
      id: 5,
      content: "请问你的跑鞋是什么牌子的？我正在选一双适合长距离的跑鞋",
      author: {
        avatar: "https://picsum.photos/id/177/200",
        user_name: "装备党"
      },
      publish_time: "2023-10-15 14:05",
      isLiked: false,
      isDisliked: false,
      like_count: 12,
      dislike_count: 0
    },
    {
      id: 6,
      content: "我也是这个时间参加马拉松，说不定到时候能遇到你！",
      author: {
        avatar: "https://picsum.photos/id/338/200",
        user_name: "同城跑友"
      },
      publish_time: "2023-10-15 15:30",
      isLiked: false,
      isDisliked: false,
      like_count: 2,
      dislike_count: 0
    },
    {
      id: 7,
      content: "核心训练具体做哪些动作呢？能分享一下吗？",
      author: {
        avatar: "https://picsum.photos/id/349/200",
        user_name: "健身小白"
      },
      publish_time: "2023-10-15 16:45",
      isLiked: false,
      isDisliked: false,
      like_count: 7,
      dislike_count: 0
    }
  ],
  currentUserInteraction: {
    hasLiked: false,
    hasCollected: false
  }
};

// 组件挂载时获取数据
onMounted(async () => {
  try {
    // 尝试获取真实数据
    const response = await fetchPostById(props.postId);
    if (response.data && response.data.code === 200) {
      const postData = response.data.data;
      post.value = postData.post;
      comments.value = postData.comments;
      
      // 初始化交互状态
      isLiked.value = postData.currentUserInteraction.hasLiked;
      isFavorited.value = postData.currentUserInteraction.hasCollected;
      like_count.value = postData.post.stats.likeCount;
      collection_count.value = postData.post.stats.collectionCount;
    } else {
      console.warn("获取帖子详情失败，使用模拟数据:", response.data?.message || '未知错误');
      // 使用模拟数据
      initWithMockData();
    }
  } catch (error) {
    console.warn("请求帖子详情时发生错误，使用模拟数据:", error);
    // 使用模拟数据
    initWithMockData();
  } finally {
    isLoading.value = false;
  }
});

// 使用模拟数据初始化
const initWithMockData = () => {
  post.value = mockPostData.post;
  comments.value = mockPostData.comments;
  isLiked.value = mockPostData.currentUserInteraction.hasLiked;
  isFavorited.value = mockPostData.currentUserInteraction.hasCollected;
  like_count.value = mockPostData.post.stats.likeCount;
  collection_count.value = mockPostData.post.stats.collectionCount;
};

// 方法定义
const handleBack = () => router.back();

// 修改收藏功能实现
const handleFavorite = async () => {
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能收藏哦～';
    showLoginDialog.value = true;
    return;
  }

  if (isCollecting.value) return; // 如果正在处理中，则不执行任何操作
  isCollecting.value = true;
  
  try {
    if (isFavorited.value) {
      // 当前已收藏，执行取消收藏操作
      await uncollectCommunityPost(post.value.id);
      collection_count.value--;
    } else {
      // 当前未收藏，执行收藏操作
      await collectCommunityPost(post.value.id);
      collection_count.value++;
    }
    // 切换收藏状态
    isFavorited.value = !isFavorited.value;
    favoriteTip.value = isFavorited.value ? '已收藏该帖子' : '已取消收藏';
    showFavoriteTip.value = true;
    setTimeout(() => showFavoriteTip.value = false, 2000);
  } catch (error) {
    console.error("收藏操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isCollecting.value = false; // 无论成功或失败，都结束处理状态
  }
};

// 修改点赞功能实现
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
    if (isLiked.value) {
      // 当前已点赞，执行取消点赞操作
      await unlikeCommunityPost(post.value.id);
      like_count.value--;
    } else {
      // 当前未点赞，执行点赞操作
      await likeCommunityPost(post.value.id);
      like_count.value++;
    }
    // 切换点赞状态
    isLiked.value = !isLiked.value;
    likeTip.value = isLiked.value ? '已喜欢该帖子' : '已取消喜欢';
    showLikeTip.value = true;
    setTimeout(() => showLikeTip.value = false, 2000);
  } catch (error) {
    console.error("点赞操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isLiking.value = false; // 无论成功或失败，都结束处理状态
  }
};

// 切换评论框显示/隐藏状态
const toggleCommentBox = () => {
  isCommentBoxVisible.value = !isCommentBoxVisible.value;
  
  // 如果显示评论框，自动聚焦
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

// 修改提交评论方法
const isSubmittingComment = ref(false);

// 修改提交评论方法
const submitComment = async () => {
  // 验证输入和状态
  if (!newComment.value.trim() || !isCommentBoxVisible.value || isSubmittingComment.value) return;
  
  // 检查登录状态
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能发表评论哦～';
    showLoginDialog.value = true;
    return;
  }

  isSubmittingComment.value = true;
  try {
    // 调用评论API提交
    const response = await createCommunityComment({
      post_id: props.postId,
      content: newComment.value.trim()
    });

    // 处理API返回结果
    if (response.data?.code === 200 && response.data.data) {
      // 将API返回的评论数据添加到列表
      comments.value.unshift(response.data.data);
      newComment.value = '';
      ElMessage.success('评论发布成功');
    } else {
      ElMessage.error(response.data?.message || '评论发布失败，请重试');
    }
  } catch (error) {
    console.error('评论提交失败:', error);
    ElMessage.error('网络错误，无法提交评论');
  } finally {
    isSubmittingComment.value = false;
  }
};

const handleCommentLike = async (commentId) => {
  // 检查登录状态
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能点赞评论哦～';
    showLoginDialog.value = true;
    return;
  }
  
  // 防止重复点击
  if (isCommentInteracting.value[commentId]) return;
  isCommentInteracting.value[commentId] = true;
  
  try {
    // 找到对应的评论对象
    const comment = comments.value.find(item => item.id === commentId);
    if (!comment) return;
    
    if (comment.isLiked) {
      // 取消点赞
      await unlikeComment(commentId);
      comment.like_count--;
    } else {
      // 点赞
      await likeComment(commentId);
      comment.like_count++;
      // 如果之前点了踩，需要取消踩
      if (comment.isDisliked) {
        comment.dislike_count--;
        comment.isDisliked = false;
      }
    }
    comment.isLiked = !comment.isLiked;
  } catch (error) {
    console.error("评论点赞操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isCommentInteracting.value[commentId] = false;
  }
};

// 修改评论点踩处理方法
const handleCommentDislike = async (commentId) => {
  // 检查登录状态
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能点踩评论哦～';
    showLoginDialog.value = true;
    return;
  }
  
  // 防止重复点击
  if (isCommentInteracting.value[commentId]) return;
  isCommentInteracting.value[commentId] = true;
  
  try {
    // 找到对应的评论对象
    const comment = comments.value.find(item => item.id === commentId);
    if (!comment) return;
    
    if (comment.isDisliked) {
      // 取消点踩
      await undislikeComment(commentId);
      comment.dislike_count--;
    } else {
      // 点踩
      await dislikeComment(commentId);
      comment.dislike_count++;
      // 如果之前点了赞，需要取消赞
      if (comment.isLiked) {
        comment.like_count--;
        comment.isLiked = false;
      }
    }
    comment.isDisliked = !comment.isDisliked;
  } catch (error) {
    console.error("评论点踩操作失败:", error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isCommentInteracting.value[commentId] = false;
  }
};

// 帖子举报相关方法
const handleReport = () => {
  // 检查登录状态
  const authStatus = AuthService.checkLoginStatus();
  if (!authStatus.isValid) {
    loginPromptMessage.value = '登录后才能举报哦～';
    showLoginDialog.value = true;
    return;
  }
  // 登录后才打开举报窗口
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
    // 调用统一的举报API
    await reportCommunityPost(props.postId, {
      user_id: authStatus.userId,
      category: selectedReportReason.value,
      reason: reportDescription.value,
    });

    ElMessage.success('举报已提交，感谢您的反馈');
    closeReportModal();
  } catch (err) {
    ElMessage.error('举报失败，请稍后重试');
    console.error("举报失败:", err);
  }
};

const handleLoginRedirect = () => {
  router.push('/login'); // 跳转到登录页
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
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
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
  white-space: pre-line; /* 保留换行符 */
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
  gap: 24px;
  font-size: 20px;
  color: #6b7280;
  align-items: center; /* 垂直居中 */
}

.post-icons span {
  display: flex;
  align-items: center; /* 确保图标和文字在同一行垂直居中 */
}

.post-icons i {
  cursor: pointer;
  transition: color 0.2s;
  margin-right: 2px; /* 调整间距，使对齐更美观 */
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
  color: #1f2937;
  font-size: 14px;
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
  /* 整个容器向下移动，只露出切换按钮 */
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
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1010;
}

.report-modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

.report-desc {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1f2937;
}

.report-reasons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.reason-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.reason-item input {
  width: 16px;
  height: 16px;
}

.report-description {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px;
  resize: none;
  box-sizing: border-box;
  font-family: inherit;
}

.report-description:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #f9fafb;
}

.submit-btn {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #2563eb;
}

.submit-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

/* 三个点按钮样式 */
.post-menu-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px; /* 控制点之间的距离 */
  align-items: center;
  justify-content: center;
}

.post-menu-btn .dot {
  display: block;
  width: 4px; /* 点的大小 */
  height: 4px;
  border-radius: 50%;
  background-color: #666; /* 点的颜色 */
}

.rotated-icon {
  display: none;
}
</style>