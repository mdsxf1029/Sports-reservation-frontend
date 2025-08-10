<template>
  <div class="page-layout">
    <div class="top-left-text">
        <router-link to="/home" class="title-link">
          运动场馆预约平台
        </router-link>
        <hr style="margin: 4px 0; width: 200px;"> 
    </div>
    <div class="responsive-container">
      <!-- 左侧：图片 -->
      <div class="responsive-left">
        <img :src="Humans1" alt="login-background" class="responsive-image" />
      </div>
      <!-- 右侧：登录表单 -->
      <div class="responsive-right">
        <LoginForm />
      </div>
    </div>
    <footer class="page-footer">
      <!--底部内容-->
      <FooterNavbar class="footer-navbar" />
    </footer>
  </div>
</template>

<script setup>
import LoginForm from '../../components/auth/LoginForm.vue'
import FooterNavbar from '../../components/FooterNavbar.vue'
import Humans1 from '@/assets/Backgrounds/Humans1.jpg?url'
import '@/styles/responsive.css'
</script>

<style scoped>
.page-layout {
  background: #fff;
  min-height: calc(100vh - 20px); /* 减去导航栏高度 */
  overflow-x: hidden; /* 防止水平溢出 */
  overflow-y: hidden; /* 防止垂直溢出 */
  display: flex;
  flex-direction: column;
}

/* 主容器 - 完美居中 */
.responsive-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 3vw;
  box-sizing: border-box;
  max-height: calc(100vh - 180px); /* 减去标题和底部导航 */
}

/* 左侧图片区域 */
.responsive-left {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 右侧表单区域 */
.responsive-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-top: 0; /* 移除margin */
}

.top-left-text {     
  top: 24px;
  left: 40px;
  padding: 32px 0 4px 6vw;
  font-size: 24px;
  font-weight: bold;
  color: #333; 
}

/* 新增：重置router-link样式，保持原文字样式 */
.title-link {
  color: inherit;           /* 继承父元素的颜色 */
  text-decoration: none;    /* 去除下划线 */
  font-size: inherit;       /* 继承父元素的字体大小 */
  font-weight: inherit;     /* 继承父元素的字体粗细 */
  display: inline;          /* 保持行内显示 */
}

.title-link:hover {
  color: inherit;           /* 悬停时也保持原色 */
}

.title-link:visited {
  color: inherit;           /* 访问后保持原色 */
}

.title-link:active {
  color: inherit;           /* 点击时保持原色 */
}


.responsive-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  max-height: 700px;
  object-fit: cover;
  border-radius: 0; /* 不要圆角 */
  box-shadow: none; /* 不要阴影 */
  margin-top: 18px;
  display: block;
}

@media (max-width: 1200px) {
  .responsive-image {
    max-width: 420px;
    max-height: 320px; 
  }
}

@media (max-width: 900px) {
  .responsive-image {
    max-width: 320px;
    max-height: 180px;
  }
  }
  
.responsive-right {
  margin-top: 35px;
}
</style>
