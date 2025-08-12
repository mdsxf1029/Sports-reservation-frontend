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
            <el-button class="post-report-btn" title="更多操作">
              <MoreFilled class="rotated-icon" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openReportModal">举报帖子</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 帖子正文 -->
        <p class="post-content">{{ post.content }}</p>


        <!-- 操作图标 -->
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
                  @click="handleCommentLike(index)"
                ></i>
                <span>{{ comment.like_count }}</span>
                <i
                  :class="{ 'fa-solid': comment.isDisliked, 'fa-regular': !comment.isDisliked }"
                  class="fa-thumbs-down"
                  @click="handleCommentDislike(index)"
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

  <!--返回顶部-->
  <BackToTop/>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPostById } from '../utils/api.js';
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'
import BackToTop from '../components/BackToTop.vue';

const router = useRouter();

// 接收路由传递的postId
const props = defineProps({
  postId: {
    type: [String, Number],
    required: true
  }
});

// 状态初始化
const isLoading = ref(true);
/*const post = ref({ author: {}, publish_time: '' });
const comments = ref([]);

// 模拟当前用户数据
const currentUser = ref({
  avatar: 'https://picsum.photos/id/64/200',
  user_name: '当前用户'
});*/

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
const showCommentModal = ref(false);
const newComment = ref('');
const collection_count = ref(0);
const like_count = ref(0);

// 帖子举报相关状态
const showReportModal = ref(false);
const reportReasons = [
  { label: "垃圾广告", value: "spam" },
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

// 帖子举报相关方法
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

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f6fa !important;
  padding-top: 20px !important;
  padding-bottom: 80px;
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
  box-shadow: 0 0 6px #fff; /* 白色光晕 */
}

.post-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.author-name {
  font-weight: 600;
  font-size: 24px;
  color: #000000; 
}

.post-time {
  font-size: 14px;
  color: #95a5a6; /* 灰色 */
}

/* 举报按钮 */
.post-report-btn {
  position: relative;
  left: -40px !important;
  bottom: -12px !important;
  background: transparent !important;
  border: none !important;
  cursor: pointer;
  color: grey !important;
  font-size: 24px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, color 0.2s ease;
  outline: none;
  box-shadow: none;
}

/* :focus 时取消默认蓝色框 */
.post-report-btn:focus,
.post-report-btn.el-button:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* :hover 保持偏移，放大，颜色变深 */
.post-report-btn:hover {
  transform: scale(1.1);
}

/* 图标旋转 */
.rotated-icon {
  transform: rotate(90deg);
  display: block; 
  width: 1em;
  height: 1em;
  color: inherit;
}

/* 帖子正文 */
.post-content {
  font-size: 18px !important;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 48px;
}



/* 操作图标 */
.post-icons {
  position: absolute;
  bottom: 24px;
  right: 40px;
  display: flex;
  gap: 22px;
  font-size: 20px;
  color: #7f8c8d; /* 灰蓝 */
}

.post-icons i {
  cursor: pointer;
  transition: color 0.2s ease;
}

.post-icons i:hover {
  color: #2980b9; /* 亮蓝色 hover */
}

.post-icons .fa-star.fa-solid {
  color: #3498db; /* 蓝色 */
}

.post-icons .fa-heart.fa-solid {
  color: #e74c3c; /* 红色 */
}


/* 评论区域整体容器 */
.comments-box {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 32px 70px !important;
  position: relative;
}

/* 评论头部：标题和排序选择 */
.comments-box > div:first-child {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.comments-title {
  font-size: 22px !important;
  font-weight: 700;
  color: black;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #969696;
}

.sort-select {
  width: 150px !important;
}

/* 单条评论容器 */
.comment-item {
  display: flex;
  gap: 30px;
  border-bottom: 1px solid #e5e7eb; /* 浅灰分割线 */
  padding-bottom: 20px;
  padding-top: 20px;
}

/* 评论内容外层 */
.comment-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 评论头部，通常放用户名、头像可扩展 */
.comment-avatar {
  width: 50px !important;
  height: 50px !important;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 6px #fff; /* 白色光晕 */
}

.comment-header {
  margin-bottom: 8px;
}

.comment-user_name {
  font-weight: 600 !important;
  color: rgb(21, 96, 189) !important;
  font-size: 18px !important;
}

/* 评论正文 */
.comment-content {
  font-size: 18px;
  line-height: 1.6;
  color: black;
  margin: 0 0 8px 0;
  white-space: pre-wrap;
}

/* 评论底部信息区域 */
.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #6b7280; /* 中灰 */
}

/* 时间 */
.comment-time {
  white-space: nowrap;
  color: #95a5a6; 
  font-size: 14px;
}

/* 评论操作按钮（点赞、踩） */
.comment-actions {
  display: flex;
  gap: 20px;
  color: #6b7280;
}

.comment-actions i {
  cursor: pointer;
  transition: color 0.2s ease;
}

.comment-actions i:hover {
  color: #2563eb; /* 互动蓝 */
}

.comment-actions .fa-thumbs-up.fa-solid {
  color: #ef4444; /* 红色点赞 */
}

.comment-actions .fa-thumbs-down.fa-solid {
  color: #3b82f6; /* 蓝色点踩 */
}

/* 评论输入框 */
.comment-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background-color: #f9fafb;
  resize: none;
  line-height: 1.6;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  min-height: 120px;
  outline: none;
}

.comment-input:focus {
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.5);
}


/* 举报说明文本框 */
.report-description {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  resize: none;
  outline: none;
  margin-bottom: 10px;
  overflow-x: hidden; /* 防止横向滚动 */
  word-wrap: break-word; /* 自动换行 */
  word-break: break-word; /* 长单词拆分换行 */
  box-sizing: border-box; /* 确保padding不影响宽度 */
  max-width: 100%; /* 确保不超出容器 */
}

.post-report-btn {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  transition: transform 0.2s ease, color 0.2s ease;
}

.post-report-btn:hover {
  transform: scale(1.1);
  color: #ff4218;
}

.post-report-icon {
  font-size: 18px;
  color: #6b7280;
}

.header-content {
  width: 100%; /* 修改为100%，让内容容器也占满页头 */
  max-width: 1200px; /* 保持最大宽度限制 */
  margin: 0 auto; /* 居中显示 */
  padding: 0 20px; /* 保留内边距 */
  font-size: 16px;
  color: #333;
  font-weight: 500;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.toggle-comments-btn {
  width: 100%;
  padding: 25px 0;
  margin-top: 30px;
  font-size: 16px;
  color: #fff;
  background-color: #3b82f6; /* 蓝色 */
  border-radius: 6px;
  text-align: center;
  border: none;
  transition: background-color 0.2s ease;
}

.toggle-comments-btn:hover {
  background-color: #2563eb; /* 深蓝色 */
  color: #fff;
}

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

.comment-modal, .report-modal {
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

.report-desc {
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 14px;
}

.report-reasons {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reason-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
}

.reason-item input {
  cursor: pointer;
}

.report-description:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

@media (max-width: 768px) {
  .content-wrapper,
  .header-content,
  .footer-content {
    width: 95%;
  }
}
</style>