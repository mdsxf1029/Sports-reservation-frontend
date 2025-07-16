
<template>
  <div class="container">
    <!-- 顶部导航 -->
    <div class="header-navbar">
      <HeaderNavbar />
    </div>
    <div class="main-content">
      <!-- 右侧内容区 -->
      <div class="content">
        <router-view />
      </div>
    </div>
    <FooterNavbar class="footer-navbar"/>
  </div>
</template>

<script>
import HeaderNavbar from './components/HeaderNavbar.vue'
import FooterNavbar from './components/FooterNavbar.vue'
export default {
  components: { HeaderNavbar, FooterNavbar }
}
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.header-navbar {
  width: 100%;
  z-index: 1000;
}
.main-content {
  flex: 1;
  display: flex;
  height: calc(100vh - 60px); /* 假设顶部导航60px */
}
.content {
  flex: 1;
  padding: 30px 40px;
  background: #fff;
}
.footer-navbar {
  width: 100%;
}
</style>
