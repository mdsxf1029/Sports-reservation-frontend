<template>
  <div class="login-page">
    <div class="top-left-text">
        运动场馆预约平台
    </div>
    <div class="login-container">
      <!-- 左侧：图片 -->
      <div class="login-left">
        <img :src="Humans1" alt="login-background" class="login-image" />
      </div>
      <!-- 右侧：登录表单 -->
      <div class="login-right">
        <LoginForm />
      </div>
    </div>
    <footer>
      <!--底部内容-->
      <FooterNavbar class="footer-navbar" />
    </footer>
  </div>
</template>

<script setup>
import LoginForm from './components/LoginForm.vue'
import Humans1 from '@/assets/Backgrounds/Humans1.jpg?url'
</script>

<style scoped>
/* 页面整体布局，footer吸底 */
.login-page {
  min-height: 92vh;
  display: flex;
  flex-direction: column;
}
.top-left-text{    
    position: absolute;  /* 新增此行 */
    top: 24px;
    left: 40px;
    font-size: 24px;
    font-weight: bold; /*黑体加粗*/
    color: #333; 
}
/* 主体容器左右分栏 */
.login-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5vw;
  gap: 0;
  background: #fff;
}

/* 左侧表单区域 */
.login-left {
  flex: 0 0 50%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 340px;
}
 

/* 右侧区域 */
.login-right {
  flex: 0 0 50%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-width: 420px;
  padding-left: 4vw;
}

.login-image {
  width: 100%;
  max-width: 900px;
  height: auto;
  max-height: 900px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
}

/* 底部footer */
footer {
  margin-top: auto;
  width: 100%;
  text-align: center;
  padding: 14px 0 8px 0;
  background: #f8f8f8;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .login-container {
    padding: 0 2vw;
  }
  .login-image {
    width: 95%;
    max-width: 420px;
    max-height: 320px;
  }
}

@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    padding: 0 4vw;
    gap: 32px;
  }
  .login-left,
  .login-right {
    flex: unset;
    justify-content: center;
    min-width: 0;
    padding-left: 0;
  }
  .login-image {
    width: 100%;
    max-width: 320px;
    max-height: 180px;
  }
}
</style>
