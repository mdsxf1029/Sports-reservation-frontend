<template>
  <TopNavbar title="运动场地预约系统 / 帖子发布" />
  <div class="app-container">
    <!-- 内容区域（编辑区占75%宽度） -->
    <div class="content-wrapper">
      <!-- 编辑区域 -->
      <div class="editor-box">
        <input 
          type="text" 
          class="title-input" 
          placeholder="请输入标题" 
          v-model="post_title"
        />
        <textarea 
          class="content-textarea" 
          placeholder="请输入正文" 
          v-model="post_content"
        ></textarea>
      </div>
      
      <!-- 预览区域 -->
      <div class="preview-box" v-if="isPreviewShow">
        <h3 class="preview-title">{{ post_title }}</h3>
        <p class="preview-content">{{ post_content }}</p>
      </div>
    </div>
    
    <!-- 固定页脚（占满屏幕宽度） -->
    <div class="fixed-footer">
      <div class="footer-content">
        <button class="cancel-btn" @click="handleCancel">取消编辑</button>
        <button class="preview-btn" @click="handlePreview">预览</button>
        <button class="publish-btn" @click="handlePublish">发布</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { createCommunityPost } from '../utils/api.js';

// 响应式数据
const post_title = ref('');
const post_content = ref('');
const isPreviewShow = ref(false);
const router = useRouter();

// 预览按钮事件
const handlePreview = () => {
  isPreviewShow.value = !isPreviewShow.value;
};

// 发布按钮事件
const handlePublish = async () => {
  // 前端基础校验
  if (!post_title.value.trim()) {
    alert('标题不能为空');
    return;
  }
  if (post_content.value.trim().length < 10) {
    alert('内容长度不能少于10个字符');
    return;
  }

  // 获取用户ID
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('请先登录');
    return;
  }

  try {
    const response = await createCommunityPost(
      { title: post_title.value, content: post_content.value },
      userId
    );

    // 关键修改：适配接口返回格式（无code字段，用postId是否存在判断成功）
    if (response.data && response.data.postId !== undefined) {
      console.log('发布成功，完整响应：', response.data);
      alert(`帖子发布成功！\n标题：${response.data.postTitle}\n发布时间：${new Date(response.data.postTime).toLocaleString()}`);
      router.back();
    } else {
      // 处理接口返回格式异常的情况
      console.warn('接口返回格式不符合预期：', response.data);
      alert('发布失败：接口返回数据异常');
    }
  } catch (error) {
    // 增强错误信息打印，方便排查
    console.error('发布失败详细错误：', error);
    
    // 分场景处理错误
    if (error.response) {
      // 有响应但状态码异常（如400/500）
      console.error('响应状态码：', error.response.status);
      console.error('响应数据：', error.response.data);
      alert(`发布失败：服务器返回错误（状态码：${error.response.status}）`);
    } else if (error.request) {
      // 无响应（网络问题）
      alert('发布失败：网络异常，未收到服务器响应');
    } else {
      // 其他错误（如参数错误）
      alert(`发布失败：${error.message || '未知错误'}`);
    }
  }
};

// 取消编辑事件
const handleCancel = () => {
  if (confirm('确定要取消编辑吗？所有未保存的内容将丢失。')) {
    router.back();
  }
};
</script>

<style scoped>
/* 样式部分与原代码一致，省略 */
.app-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-top: 40px;
  padding-bottom: 80px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  color: #1f2937;
}

.app-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-top: 40px;
  padding-bottom: 80px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  color: #1f2937;
}

/* 内容容器 */
.content-wrapper {
  width: 82%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 0px 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 编辑框区域 */
.editor-box {
  background-color: #fff;
  border: 1px solid #e1e4ea;
  border-radius: 12px;
  padding: 32px 28px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03);
}

/* 输入框通用样式 */
.title-input,
.content-textarea {
  width: 100%;
  padding: 16px 18px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 16px;
  background-color: #fafafa;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  margin-bottom: 18px;
}

.title-input::placeholder,
.content-textarea::placeholder {
  color: #9ca3af;
}

.title-input:focus,
.content-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.content-textarea {
  height: 480px;
  resize: vertical;
  line-height: 1.75;
}

/* 预览区 */
.preview-box {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.preview-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 8px;
}

.preview-content {
  font-size: 16px;
  color: #374151;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 固定底部操作区 */
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background-color: #fff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.04);
  z-index: 100;
  display: flex;
  align-items: center;
}

.footer-content {
  width: 82%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  gap: 14px;
}

/* 按钮样式 */
.cancel-btn,
.preview-btn,
.publish-btn {
  padding: 10px 22px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #4b5563;
}
.cancel-btn:hover {
  background-color: #e5e7eb;
}

.preview-btn {
  background-color: #4ade80;
  color: #fff;
}
.preview-btn:hover {
  background-color: #22c55e;
  box-shadow: 0 2px 6px rgba(34, 197, 94, 0.2);
}

.publish-btn {
  background-color: #3b82f6;
  color: #fff;
}
.publish-btn:hover {
  background-color: #2563eb;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .content-wrapper,
  .footer-content {
    width: 92%;
  }

  .content-textarea {
    height: 300px;
  }

  .fixed-footer {
    height: auto;
    padding: 12px 0;
  }

  .footer-content {
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .cancel-btn,
  .preview-btn,
  .publish-btn {
    width: 100%;
  }
}
</style>