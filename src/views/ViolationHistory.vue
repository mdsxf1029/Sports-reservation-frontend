<template>
  <div class="page-layout">
    <AdminSidebarMenu />
    <div class="page-content">
      <div>
        <div class="header-row">
          <div class="title">历史违约记录</div>
        </div>
        <div class="table-wrapper">
          <table class="main-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>用户名</th>
                <th>违约时间</th>
                <th>违约原因</th>
                <th>场馆</th>
                <th>时间段</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in history" :key="record.id">
                <td>{{ index + 1 }}</td>
                <td>{{ record.userName }}</td>
                <td>{{ record.date }}</td>
                <td>{{ record.reason }}</td>
                <td>{{ record.venue }}</td>
                <td>{{ record.timeSlot }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebarMenu from '../components/AdminSidebarMenu.vue'
export default {
  name: "ViolationHistory",
  components: { AdminSidebarMenu },
  data() {
    return {
      // 这里可以根据实际传参动态获取
      history: [
        { id: 1, userName: "夏浩博", date: "2024-01-01", reason: "未签到", venue: "乒乓球馆", timeSlot: "8:00-9:00" },
        { id: 2, userName: "李明", date: "2024-02-15", reason: "迟到", venue: "羽毛球馆", timeSlot: "9:00-10:00" },
        { id: 3, userName: "王芳", date: "2024-03-10", reason: "未到场", venue: "篮球馆", timeSlot: "14:00-15:00" }
      ]
    };
  }
};
</script>

<style src="../styles/admin-sidebar.css"></style>
<style scoped>
.page-layout {
  display: flex;
}
.page-content {
  flex: 1;
  background: #fff;
}
/* 可复用你现有的表格样式 */
.header-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  margin-top: 10px;
}
.title {
  font-size: 28px;
  font-weight: bold;
  flex: 1;
  text-align: left;
  padding-bottom: 10px;
}
.table-wrapper {
  display: flex;
  justify-content: center;
}
.main-table {
  min-width: 900px;
  max-width: 1200px;
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.main-table th,
.main-table td {
  border: 1px solid #eee;
  padding: 16px 10px;
  text-align: center;
  font-size: 18px;
}
.main-table th {
  background: #fafafa;
  font-weight: bold;
}
</style>
