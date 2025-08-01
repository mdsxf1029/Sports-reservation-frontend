<template>
  <div class="sidebar">
    <div class="menu-item" :class="{selected: $route.path==='/venue'}" @click="$router.push('/venue')">场地管理</div>
    <div class="menu-item" :class="{selected: $route.path==='/violation'}" @click="$router.push('/violation')">违约管理</div>
    <div class="menu-item" :class="{selected: $route.path==='/post'}" @click="$router.push('/post')">帖子管理</div>
    <div class="menu-item" :class="{selected: $route.path==='/appeal'}" @click="$router.push('/appeal')">申诉管理</div>
  </div>
</template>

<script>
export default {
  name: 'AdminSidebarMenu'
}
</script>

<!-- 样式已移至外部css文件 --> 