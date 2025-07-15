<template>
  <div>
    <HeaderNavbar class="header-navbar"/>
    <div id="content">
        <div class="center-card">
            <el-menu :default-active='activeIndex' class='order-navbar' mode='horizontal' :ellipsis='false'>
                <el-container>
                    <el-icon class="arrow-icon"><ArrowLeft/></el-icon>
                    <h1>订单详情</h1>
                </el-container>
            </el-menu>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, } from '@element-plus/icons-vue'
import HeaderNavbar from '../components/HeaderNavbar.vue'
const activeIndex = ref('0')

</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.header-navbar {
  position: fixed;
  z-index: 1000;
  width: 100%;
  top: 0;
  left: 0;
  height: 60px;
}

#content {
  background: rgba(154, 154, 154, 0.22);
  width: 100%;
  min-height: calc(100vh - 70px);
  margin-top: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-card {
  background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  padding: 0 32px;
  min-width: 1400px;
  min-height: calc(100vh - 70px);
}

.order-navbar {
  width: 100%;
  height: 100px;  
  display: flex;
  margin-bottom: 84px;
}

.arrow-icon {
  font-size: 32px;
  margin: 40px 20px 0 0;
  cursor: pointer;
}

h1 {
  font-size: 32px;
  margin : 30px 0;
}
</style>
