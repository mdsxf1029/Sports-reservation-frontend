<template>
  <div class="app-container">
    <!-- 固定页头 -->
    <div class="fixed-header">
      <div class="header-content">
        运动社区 / {{ post.title }}
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 帖子作者信息（包含举报按钮） -->
      <div class="author-info">
        <img :src="post.author.avatar" alt="作者头像" class="author-avatar">
        <div class="author-details">
          <span class="author-user_name">{{ post.author.user_name }}</span>
          <span class="author-post-time">{{ post.publish_time }}</span>
        </div>
        <!-- 举报按钮 - 放在帖主头像一排最右方，使用⚠符号 -->
        <button class="report-btn" @click="openReportModal" title="举报帖子">
          <span class="report-icon">⚠</span>
        </button>
      </div>

      <!-- 帖子内容区域 -->
      <div class="post-box">
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-content">{{ post.content }}</p>
        <!-- 帖子操作图标 -->
        <div class="post-icons">
          <i
            :class="{ 'fa-solid': isFavorited, 'fa-regular': !isFavorited }"
            class="fa-star"
            @click="handleFavorite"
          ></i>
          <span>{{ collection_count }}</span>
          <i
            :class="{ 'fa-solid': isLiked, 'fa-regular': !isLiked }"
            class="fa-heart"
            @click="handleLike"
          ></i>
          <span>{{ like_count }}</span>
          <i class="fa-regular fa-comment" @click="openCommentModal"></i>
          <span>{{ comments.length }}</span>
        </div>
      </div>

      <!-- 评论区域（带折叠功能） -->
      <div class="comments-box">
        <h4 class="comments-title">帖子评论 ({{ comments.length }})</h4>
        
        <!-- 评论列表（根据折叠状态显示） -->
        <div 
          v-for="(comment, index) in displayComments" 
          :key="index" 
          class="comment-item"
        >
          <img :src="comment.author.avatar" alt="评论者头像" class="comment-avatar">
          <div class="comment-info">
            <div class="comment-header">
              <span class="comment-user_name">{{ comment.author.user_name }}</span>
              <span class="comment-time">{{ comment.publish_time }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
          <div class="comment-icons">
            <i
              :class="{ 'fa-solid': comment.isLiked, 'fa-regular': !comment.isLiked }"
              class="fa-thumbs-up"
              @click="handleCommentLike(index)"
            ></i>
            <span>{{ comment.like_count }}</span>
            <i
              :class="{ 'fa-solid': comment.isDisliked, 'fa-regular': !comment.isDisliked }"
              class="fa-thumbs-down"
              @click="handleCommentDislike(index)"
            ></i>
            <span>{{ comment.dislike_count }}</span>
            <!-- 已删除评论举报按钮 -->
          </div>
        </div>
        
        <!-- 折叠/展开按钮 -->
        <button 
          v-if="comments.length > 5" 
          class="toggle-comments-btn"
          @click="isCommentsExpanded = !isCommentsExpanded"
        >
          {{ isCommentsExpanded ? '收起评论' : `显示全部 ${comments.length} 条评论` }}
        </button>
      </div>
    </div>

    <!-- 固定页脚 -->
    <div class="fixed-footer">
      <div class="footer-content">
        <button class="back-btn" @click="handleBack">返回</button>
      </div>
    </div>

    <!-- 提示框和各种模态框 -->
    <div v-if="showFavoriteTip" class="tip">{{ favoriteTip }}</div>
    <div v-if="showLikeTip" class="tip">{{ likeTip }}</div>
    <div v-if="showReportTip" class="tip">{{ reportTip }}</div>
    
    <!-- 评论模态框 -->
    <div v-if="showCommentModal" class="modal-overlay" @click.self="closeCommentModal">
      <div class="comment-modal">
        <div class="modal-header">
          <h3>发表评论</h3>
          <button class="close-btn" @click="closeCommentModal">×</button>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="newComment" 
            placeholder="请输入评论内容..." 
            rows="4"
            class="comment-input"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeCommentModal">取消</button>
          <button class="submit-btn" @click="submitComment" :disabled="!newComment.trim()">提交</button>
        </div>
      </div>
    </div>
    
    <!-- 帖子举报模态框 -->
    <div v-if="showReportModal" class="modal-overlay" @click.self="closeReportModal">
      <div class="report-modal">
        <div class="modal-header">
          <h3>举报帖子</h3>
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
</template>

<script setup>
<<<<<<< Updated upstream
import { ref } from 'vue';
import { useRouter } from 'vue-router';
=======
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPostById } from '../utils/api.js';

const router = useRouter();

// 接收路由传递的postId
const props = defineProps({
  postId: {
    type: [String, Number],
    required: true
  }
});
>>>>>>> Stashed changes

// 状态初始化
const isLoading = ref(true);
const post = ref({ author: {}, publish_time: '' });
const comments = ref([]);
const currentUser = ref({
  avatar: 'https://picsum.photos/id/64/200',
  user_name: '当前用户'
});

<<<<<<< Updated upstream
// 模拟当前用户数据
const currentUser = ref({
  avatar: 'https://example.com/author-avatar.jpg',
  user_name: '当前用户'
});

// 模拟帖子数据
const post = ref({
  title: '这是帖子的标题',
  content: '这是帖子的正文内容，这里可以是关于运动场地预约的相关信息等。',
  author: {
    avatar: 'https://th.bing.com/th/id/OIP.JCEcaQJVR_vC2kgt6BGZlAAAAA?w=216&h=220&c=7&r=0&o=7&dpr=1.8&pid=1.7&rm=3', // 替换为实际的头像链接
    user_name: '作者昵称'
  }
});

// 模拟评论数据
const comments = ref([
  {
    content: '这条帖子很有用！',
    author: {
      avatar: 'https://th.bing.com/th/id/OIP.JCEcaQJVR_vC2kgt6BGZlAAAAA?w=216&h=220&c=7&r=0&o=7&dpr=1.8&pid=1.7&rm=3', // 替换为实际的头像链接
      user_name: '评论者1'
    },
    isLiked: false,
    isDisliked: false,
    like_count: 0,
    dislike_count: 0
  },
  {
    content: '希望能有更多场地信息。',
    author: {
      avatar: 'https://th.bing.com/th/id/OIP.JCEcaQJVR_vC2kgt6BGZlAAAAA?w=216&h=220&c=7&r=0&o=7&dpr=1.8&pid=1.7&rm=3', // 替换为实际的头像链接
      user_name: '评论者2'
    },
    isLiked: false,
    isDisliked: false,
    like_count: 0,
    dislike_count: 0
  },
  {
    content: '感谢分享！',
    author: {
      avatar: 'https://th.bing.com/th/id/OIP.JCEcaQJVR_vC2kgt6BGZlAAAAA?w=216&h=220&c=7&r=0&o=7&dpr=1.8&pid=1.7&rm=3', // 替换为实际的头像链接
      user_name: '评论者3'
    },
    isLiked: false,
    isDisliked: false,
    like_count: 0,
    dislike_count: 0
  }
]);
=======
// 折叠相关状态
const isCommentsExpanded = ref(false);

// 根据折叠状态计算显示的评论
const displayComments = computed(() => {
  if (comments.value.length <= 5) {
    return comments.value;
  }
  return isCommentsExpanded.value 
    ? comments.value 
    : comments.value.slice(0, 5);
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
const showCommentModal = ref(false);
const newComment = ref('');
const collection_count = ref(0);
const like_count = ref(0);

// 仅保留帖子举报相关状态，删除评论举报状态
const showReportModal = ref(false);
const reportReasons = [
  { label: "违法违规", value: "illegal" },
  { label: "辱骂攻击", value: "abuse" },
  { label: "色情低俗", value: "pornography" },
  { label: "其他原因", value: "other" }
];
const selectedReportReason = ref('');
const reportDescription = ref('');

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
>>>>>>> Stashed changes

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

const handleFavorite = () => {
  isFavorited.value = !isFavorited.value;
  collection_count.value += isFavorited.value ? 1 : -1;
  favoriteTip.value = isFavorited.value ? '已收藏该帖子' : '已取消收藏';
  showFavoriteTip.value = true;
  setTimeout(() => showFavoriteTip.value = false, 2000);
  // TODO: 调用收藏API接口
};

const handleLike = () => {
  isLiked.value = !isLiked.value;
  like_count.value += isLiked.value ? 1 : -1;
  likeTip.value = isLiked.value ? '已喜欢该帖子' : '已取消喜欢';
  showLikeTip.value = true;
  setTimeout(() => showLikeTip.value = false, 2000);
  // TODO: 调用点赞API接口
};

const openCommentModal = () => showCommentModal.value = true;

const closeCommentModal = () => {
  showCommentModal.value = false;
  newComment.value = '';
};

const submitComment = () => {
  if (!newComment.value.trim()) return;
  const now = new Date();
  const formattedTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // 本地临时添加评论
  const newCommentObj = {
    content: newComment.value,
    author: { 
      avatar: currentUser.value.avatar, 
      user_name: currentUser.value.user_name 
    },
    publish_time: formattedTime,
    isLiked: false, 
    isDisliked: false, 
    like_count: 0, 
    dislike_count: 0
  };
  comments.value.unshift(newCommentObj);
  
  // 关闭模态框并显示提示
  closeCommentModal();
  likeTip.value = '评论提交成功';
  showLikeTip.value = true;
  setTimeout(() => showLikeTip.value = false, 2000);
  
  // TODO: 调用提交评论API接口
};

const handleCommentLike = (index) => {
  const comment = comments.value[index];
  comment.like_count += comment.isLiked ? -1 : 1;
  if (!comment.isLiked && comment.isDisliked) {
    comment.dislike_count--;
    comment.isDisliked = false;
  }
  comment.isLiked = !comment.isLiked;
  // TODO: 调用评论点赞API接口
};

const handleCommentDislike = (index) => {
  const comment = comments.value[index];
  comment.dislike_count += comment.isDisliked ? -1 : 1;
  if (!comment.isDisliked && comment.isLiked) {
    comment.like_count--;
    comment.isLiked = false;
  }
  comment.isDisliked = !comment.isDisliked;
  // TODO: 调用评论点踩API接口
};

// 仅保留帖子举报相关方法
const openReportModal = () => {
  showReportModal.value = true;
  selectedReportReason.value = '';
  reportDescription.value = '';
};

const closeReportModal = () => {
  showReportModal.value = false;
};

const submitReport = () => {
  if (!selectedReportReason.value) return;
  
  // 显示举报成功提示
  reportTip.value = '举报已提交，感谢您的反馈';
  showReportTip.value = true;
  setTimeout(() => showReportTip.value = false, 2000);
  
  // 关闭模态框
  closeReportModal();
  
  // TODO: 调用帖子举报API接口
  console.log('举报帖子:', {
    postId: props.postId,
    reason: selectedReportReason.value,
    description: reportDescription.value
  });
};
</script>

<<<<<<< Updated upstream
<style scoped>
/* 全局容器 */
.app-container {
  min-height: 100vh;
  background-color: #fafafa;
  padding-top: 40px; /* 页头高度 */
  padding-bottom: 60px; /* 页脚高度 */
  box-sizing: border-box;
}

/* 固定页头（100%宽度） */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%; /* 横向占满屏幕 */
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
  display: flex;
  align-items: center;
}

/* 页头内容容器（与浏览区对齐） */
.header-content {
  width: 75%; /* 与浏览区宽度一致 */
  max-width: 1200px; /* 限制最大宽度，避免过宽 */
  margin: 0 auto;
  padding: 0 20px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
  box-sizing: border-box;
}

/* 内容区域容器 */
.content-wrapper {
  width: 75%; /* 浏览区域占75%宽度 */
  max-width: 1200px; /* 限制最大宽度 */
  margin: 0 auto;
  padding: 20px 0;
  box-sizing: border-box;
}

/* 帖子作者信息样式 */
.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.author-user_name {
  font-size: 14px;
  color: #374151;
}

/* 帖子内容区域样式 */
.post-box {
  padding: 25px 20px;
  background-color: #fff;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: relative;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.post-content {
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
}

/* 新增图标区域样式 */
.post-icons {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 15px; /* 增大图标间隔 */
  font-size: 18px;
  color: #4b5563;
}

.post-icons i {
  cursor: pointer;
  transition: color 0.2s ease;
}

.post-icons i:hover {
  color: #1f2937;
}

.post-icons .fa-star.fa-solid {
  color: #ffc107; /* 收藏图标颜色 */
}

.post-icons .fa-thumbs-up.fa-solid {
  color: #ff4218; /* 点赞图标颜色 */
}

/* 评论区域样式 */
.comments-box {
  padding: 25px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.comments-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  position: relative;
}

.comment-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-info {
  flex: 1;
}

.comment-user_name {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  margin-bottom: 2px;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin: 0;
}

/* 评论图标区域样式 */
.comment-icons {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  gap: 15px;
  font-size: 16px;
  color: #4b5563;
}

.comment-icons i {
  cursor: pointer;
  transition: color 0.2s ease;
}

.comment-icons i:hover {
  color: #1f2937;
}

.comment-icons .fa-thumbs-up.fa-solid {
  color: #ff4218;
}

.comment-icons .fa-thumbs-down.fa-solid {
  color: #0d8bf2;
}

/* 固定页脚（100%宽度） */
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%; /* 横向占满屏幕 */
  height: 60px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
  display: flex;
  align-items: center;
}

/* 页脚内容容器（与浏览区对齐） */
.footer-content {
  width: 75%; /* 与浏览区宽度一致 */
  max-width: 1200px; /* 限制最大宽度 */
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  box-sizing: border-box;
}

/* 返回按钮样式 */
.back-btn {
  padding: 9px 18px;
  border: none;
  border-radius: 6px;
  background-color: #f3f4f6;
  color: #4b5563;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: #e5e7eb;
}

/* 提示框样式 */
.tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
  white-space: nowrap;
}

/* 评论模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.comment-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0 5px;
}

.close-btn:hover {
  color: #4b5563;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.comment-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  resize: none;
  outline: none;
}

.comment-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn, .submit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
}

.submit-btn {
  background-color: #1890ff;
  color: white;
  border: none;
}

.submit-btn:hover {
  background-color: #0d8bf2;
}

.submit-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

/* 响应式适配（屏幕过窄时调整） */
@media (max-width: 768px) {
  .content-wrapper,
  .header-content,
  .footer-content {
    width: 95%; /* 小屏幕时浏览区占95%宽度 */
  }
}
</style>
=======
<style src="../styles/post-viewer.css"></style>
>>>>>>> Stashed changes
