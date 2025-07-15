
<template>
  <div class="container">
    <!-- 顶部导航 -->
    <div class="header-navbar">
      <HeaderNavbar />
    </div>
    <div class="main-content">
      <!-- 左侧菜单栏 -->
      <div class="sidebar">
        <div class="menu-item" :class="{selected: $route.path==='/venue'}" @click="$router.push('/venue')">场地管理</div>
        <div class="menu-item" :class="{selected: $route.path==='/violation'}" @click="$router.push('/violation')">违约管理</div>
        <div class="menu-item" :class="{selected: $route.path==='/post'}" @click="$router.push('/post')">帖子管理</div>
        <div class="menu-item" :class="{selected: $route.path==='/appeal'}" @click="$router.push('/appeal')">申诉管理</div>
      </div>
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
.sidebar {
  width: 180px;
  background: #fafafa;
  border-right: 2px solid #eee;
  display: flex;
  flex-direction: column;
  padding-top: 30px;
}
.menu-item {
  font-size: 26px;
  font-weight: bold;
  color: #222;
  padding: 32px 0 32px 30px;
  cursor: pointer;
  border-bottom: 2px solid #eee;
  transition: background 0.2s;
}
.menu-item.selected {
  background: #fff;
  color: #111;
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
