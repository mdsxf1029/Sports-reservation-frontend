<template>
  <div class="app-container">
    <!-- 固定页头（占满屏幕宽度） -->
    <div class="fixed-header">
      <div class="header-content">运动场地预约系统 / 帖子浏览</div>
    </div>

    <!-- 内容区域（浏览区占75%宽度） -->
    <div class="content-wrapper">
      <!-- 帖子作者信息 -->
      <div class="author-info">
        <img :src="post.author.avatar" alt="作者头像" class="author-avatar">
        <span class="author-user_name">{{ post.author.user_name }}</span>
      </div>
      <!-- 帖子内容区域 -->
      <div class="post-box">
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-content">{{ post.content }}</p>
        <!-- 帖子右下角图标 -->
        <div class="post-icons">
          <i
            :class="{ 'fa-solid': isFavorited, 'fa-regular': !isFavorited }"
            class="fa-star"
            @click="handleFavorite"
          ></i>
          <span>{{ collection_count }}</span>
          <i
            :class="{ 'fa-solid': isLiked, 'fa-regular': !isLiked }"
            class="fa-thumbs-up"
            @click="handleLike"
          ></i>
          <span>{{ like_count }}</span>
          <i class="fa-regular fa-comment" @click="openCommentModal"></i>
          <span>{{ comments.length }}</span>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="comments-box">
        <h4 class="comments-title">帖子评论 ({{ comments.length }})</h4>
        <div v-for="(comment, index) in comments" :key="index" class="comment-item">
          <img :src="comment.author.avatar" alt="评论者头像" class="comment-avatar">
          <div class="comment-info">
            <span class="comment-user_name">{{ comment.author.user_name }}</span>
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
          </div>
        </div>
      </div>
    </div>

    <!-- 固定页脚（占满屏幕宽度） -->
    <div class="fixed-footer">
      <div class="footer-content">
        <button class="back-btn" @click="handleBack">返回</button>
      </div>
    </div>

    <!-- 提示框 -->
    <div v-if="showFavoriteTip" class="tip">{{ favoriteTip }}</div>
    <div v-if="showLikeTip" class="tip">{{ likeTip }}</div>

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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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

// 返回按钮事件
const handleBack = () => {
  router.back();
};

// 收藏状态
const isFavorited = ref(false);
// 点赞状态
const isLiked = ref(false);
// 收藏提示显示状态
const showFavoriteTip = ref(false);
// 点赞提示显示状态
const showLikeTip = ref(false);
// 收藏提示内容
const favoriteTip = ref('');
// 点赞提示内容
const likeTip = ref('');

// 评论模态框状态
const showCommentModal = ref(false);
// 新评论内容
const newComment = ref('');

// 收藏数量
const collection_count = ref(0);
// 点赞数量
const like_count = ref(0);

// 收藏按钮事件
const handleFavorite = () => {
  isFavorited.value = !isFavorited.value;
  if (isFavorited.value) {
    collection_count.value++;
    favoriteTip.value = '已收藏该帖子';
  } else {
    collection_count.value--;
    favoriteTip.value = '已取消收藏';
  }
  showFavoriteTip.value = true;
  setTimeout(() => {
    showFavoriteTip.value = false;
  }, 2000);
};

// 点赞按钮事件
const handleLike = () => {
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    like_count.value++;
    likeTip.value = '已点赞该帖子';
  } else {
    like_count.value--;
    likeTip.value = '已取消点赞';
  }
  showLikeTip.value = true;
  setTimeout(() => {
    showLikeTip.value = false;
  }, 2000);
};

// 打开评论模态框
const openCommentModal = () => {
  showCommentModal.value = true;
};

// 关闭评论模态框
const closeCommentModal = () => {
  showCommentModal.value = false;
  newComment.value = ''; // 清空评论内容
};

// 提交评论
const submitComment = () => {
  if (!newComment.value.trim()) return;
  
  // 添加新评论到列表
  comments.value.unshift({
    content: newComment.value,
    author: {
      avatar_url: currentUser.value.avatar_url,
      user_name: currentUser.value.user_name
    },
    isLiked: false,
    isDisliked: false,
    like_count: 0,
    dislike_count: 0
  });
  
  // 关闭模态框
  closeCommentModal();
  
  // 显示成功提示
  likeTip.value = '评论提交成功';
  showLikeTip.value = true;
  setTimeout(() => {
    showLikeTip.value = false;
  }, 2000);
};

// 评论点赞事件
const handleCommentLike = (index) => {
  const comment = comments.value[index];
  if (comment.isLiked) {
    comment.like_count--;
  } else {
    comment.like_count++;
    if (comment.isDisliked) {
      comment.dislike_count--;
      comment.isDisliked = false;
    }
  }
  comment.isLiked = !comment.isLiked;
};

// 评论踩事件
const handleCommentDislike = (index) => {
  const comment = comments.value[index];
  if (comment.isDisliked) {
    comment.dislike_count--;
  } else {
    comment.dislike_count++;
    if (comment.isLiked) {
      comment.like_count--;
      comment.isLiked = false;
    }
  }
  comment.isDisliked = !comment.isDisliked;
};
</script>

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