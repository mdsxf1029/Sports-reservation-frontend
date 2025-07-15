<template>
  <div class="register-page">
    <div class="top-left-text">
        运动场馆预约平台
        <hr style="margin: 8px 0; width: 200px;"> 
    </div>
    <div class="register-container">
      <!-- 左侧：图片 -->
      <div class="register-left">
        <img :src="Humans1" alt="register-background" class="register-image" />
      </div>
      <!-- 右侧：注册表单 -->
      <div class="register-right">
        <RegisterForm/>
      </div>
    </div>
    <footer>
      <!--底部内容-->
      <FooterNavbar class="footer-navbar" />
    </footer>
  </div>
</template>

<script setup> 
import RegisterForm from '../../components/RegisterForm.vue'
import Humans1 from '@/assets/Backgrounds/Humans1.jpg?url'
</script>

<style scoped>
/* 页面整体布局，footer吸底 */
.register-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.top-left-text{     
    top: 24px;
    left: 40px;
    padding: 32px 0 4px 6vw; /*padding 是 内边距，padding: 上右下左*/
    font-size: 24px;
    font-weight: bold; /*黑体加粗*/
    color: #333; 
}
/* 主体容器左右分栏 */
.register-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5vw;
  gap: 0;
  background: #fff;
}

/* 左侧表单区域 */
.register-left,
.register-right {
  flex: 1;
  min-width: 0;      /* 关键！允许收缩 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  box-sizing: border-box;
}

.register-image {
  width: 100%;
  max-width: 700px;
  height: auto;
  max-height: 800px;
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
  .register-container {
    padding: 0 2vw;
  }
  .register-image {
    width: 95%;
    max-width: 420px;
    max-height: 320px;
  }
}

@media (max-width: 900px) {
  .register-container {
    flex-direction: column;
    padding: 0 4vw;
    gap: 32px;
  }
  .register-left,
  .register-right {
    flex: unset;
    justify-content: center;
    min-width: 0;
    padding-left: 0;
  }
  .register-image {
    width: 100%;
    max-width: 320px;
    max-height: 180px;
  }
}
</style>
