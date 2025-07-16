<template>
  <div class="page-layout">
    <AdminSidebarMenu />
    <div class="page-content">
      <div style="padding:40px;font-size:28px;">这里是帖子管理页面</div>
    </div>
  </div>
</template>
<script>
import AdminSidebarMenu from './AdminSidebarMenu.vue'
export default { name: "PostManagement", components: { AdminSidebarMenu } }
</script>
<style src="../styles/admin-sidebar.css"></style>
<style scoped>
.page-layout {
  display: flex;
}
.page-content {
  flex: 1;
  padding: 0;
  background: #fff;
}
</style> 