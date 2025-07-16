<template>
  <div class="page-layout">
    <div class="top-left-text">
        运动场馆预约平台
        <hr style="margin: 8px 0; width: 200px;">
        <!--margin 是元素外边距的意思，这里上下各8px，左右各0-->
      <!--<p>为用户提供便捷的场馆预约服务</p>-->
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
}

.top-left-text {     
  top: 24px;
  left: 40px;
  padding: 32px 0 4px 6vw;
  font-size: 24px;
  font-weight: bold;
  color: #333; 
}

.responsive-image {
  width: 100%;
  max-width: 700px;
  height: auto;
  max-height: 800px;
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
