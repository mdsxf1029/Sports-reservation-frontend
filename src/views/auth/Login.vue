<template>
  <div class="page-layout">
    <div class="top-left-text">
        <router-link to="/home" class="title-link">
          运动场馆预约平台
        </router-link>
        <hr style="margin: 4px 0; width: 200px;"> 
    </div>
    <div class="responsive-container page-content">
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
  overflow-y: auto; /* 允许垂直滚动 */
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
  max-width: 550px;
  height: auto;
  max-height: 650px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
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
</style>
