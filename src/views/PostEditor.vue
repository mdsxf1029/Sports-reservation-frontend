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
import { useRouter } from 'vue-router'; // 引入路由钩子
import axios from 'axios';
import { createCommunityPost } from '../utils/api.js';

// 响应式数据
const post_title = ref('');
const post_content = ref('');
const isPreviewShow = ref(false);
const router = useRouter(); // 获取路由实例

// 预览按钮事件
const handlePreview = () => {
  isPreviewShow.value = !isPreviewShow.value;
};

// 发布按钮事件
// 修改后的handlePublish方法如下
const handlePublish = async () => {
  // 前端基础校验（可保留也可移除，根据后端校验强度决定）
  if (!post_title.value.trim()) {
    alert('标题不能为空');
    return;
  }
  if (post_content.value.trim().length < 10) {
    alert('内容长度不能少于10个字符');
    return;
  }

  try {
    const response = await createCommunityPost({
      postTitle: post_title.value,
      postContent: post_content.value
    });

    // 处理成功响应（code=200的情况）
    if (response.data.code) {
      console.log('发布成功，帖子ID：', response.data.data.post_id);
      console.log('发布时间：', response.data.data.post_time);
      console.log('作者信息：', response.data.data.author);
      alert(`帖子发布成功！\n标题：${response.data.data.post_title}\n发布时间：${response.data.data.post_time}`);
      router.back();
    } 
  } catch (error) {
    // 处理错误响应（包括code=400的情况）
    console.error('发布帖子时出错：', error);
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      // 显示后端返回的错误信息列表
      if (errorData.errors && Array.isArray(errorData.errors)) {
        alert(`发布失败：\n${errorData.errors.join('\n')}`);
      } else {
        // 显示后端返回的错误消息
        alert(errorData.message || '帖子发布失败，请稍后重试');
      }
    } else {
      // 网络错误等情况
      alert('网络异常，发布失败，请检查网络连接');
    }
  }
};

// 取消编辑事件
const handleCancel = () => {
  // 确认是否取消
  if (confirm('确定要取消编辑吗？所有未保存的内容将丢失。')) {
    location.reload();
    router.back();
  }
};
</script>

<style scoped>
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