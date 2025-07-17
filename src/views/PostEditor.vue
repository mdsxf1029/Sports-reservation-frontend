<template>
  <div class="app-container">
    <!-- 固定页头（占满屏幕宽度） -->
    <div class="fixed-header">
      <div class="header-content">运动场地预约系统 / 帖子发布</div>
    </div>
    
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
        <h3 class="preview-title">{{ title }}</h3>
        <p class="preview-content">{{ content }}</p>
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
// 响应式数据
const title = ref('');
const content = ref('');
const isPreviewShow = ref(false);
// 预览按钮事件
const handlePreview = () => {
  isPreviewShow.value = !isPreviewShow.value;
};
// 发布按钮事件
const handlePublish = () => {
  if (!title.value.trim() || !content.value.trim()) {
    alert('标题和正文不能为空，请完善后再发布！');
    return;
  }
  console.log('发布的标题：', title.value);
  console.log('发布的正文：', content.value);
  alert('帖子发布成功！（实际需结合接口完成）');
};
// 取消编辑事件
const handleCancel = () => {
  title.value = '';
  content.value = '';
  isPreviewShow.value = false;
  alert('已取消编辑，输入内容已清空。');
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

/* 页头内容容器（与编辑区对齐） */
.header-content {
  width: 75%; /* 与编辑区宽度一致 */
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
  width: 75%; /* 编辑区域占75%宽度 */
  max-width: 1200px; /* 限制最大宽度 */
  margin: 0 auto;
  padding: 20px 0;
  box-sizing: border-box;
}

/* 编辑区域样式 */
.editor-box {
  padding: 25px 20px;
  background-color: #fff;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.title-input,
.content-textarea {
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 15px;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.title-input::placeholder,
.content-textarea::placeholder {
  color: #9ca3af;
}

.title-input:focus,
.content-textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.1);
}

.content-textarea {
  height: 450px;
  resize: vertical;
  line-height: 1.6;
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

/* 页脚内容容器（与编辑区对齐） */
.footer-content {
  width: 75%; /* 与编辑区宽度一致 */
  max-width: 1200px; /* 限制最大宽度 */
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  box-sizing: border-box;
}

/* 按钮样式 */
.cancel-btn, 
.preview-btn, 
.publish-btn {
  padding: 9px 18px;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
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
}

.preview-btn:hover {
  background-color: #22c55e;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2);
}

.publish-btn {
  background-color: #60a5fa;
}

.publish-btn:hover {
  background-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

/* 预览区域样式 */
.preview-box {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.preview-content {
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
}

/* 响应式适配（屏幕过窄时调整） */
@media (max-width: 768px) {
  .content-wrapper,
  .header-content,
  .footer-content {
    width: 95%; /* 小屏幕时编辑区占95%宽度 */
  }
}
</style>