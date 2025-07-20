<template>
  <div class="page-layout">
    <div class="header-section">
      <h1 class="site-title">运动场馆预约平台</h1>
      <p class="site-description">专业的运动场地预约服务</p>
    </div>
    
    <div class="main-container">
      <div class="register-container">
        <RegisterForm/>
      </div>
    </div>
    
    <footer class="page-footer">
      <FooterNavbar />
    </footer>
  </div>
</template>

<script setup> 
import RegisterForm from '../../components/auth/RegisterForm.vue'
import FooterNavbar from '../../components/FooterNavbar.vue'
import '@/styles/responsive.css'
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-section {
  background: white;
  padding: 0.5rem 0; /* 稍微增加一点内边距，但不会太大 */
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.site-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.3rem 0; /* 取消上外边距，只保留下外边距 */
}

.site-description {
  color: #666;
  margin: 0;
}

.main-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 改为顶部对齐 */
  padding: 1.5rem 1rem; 
}

.register-container {
  width: 100%;
  max-width: 600px;
}

.page-footer {
  background: white;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .site-title {
    font-size: 1.5rem;
  }
  
  .main-container {
    padding: 1rem 0.5rem;
  }
  
  .header-section {
    padding: 1rem 0;
  }
}
</style>
