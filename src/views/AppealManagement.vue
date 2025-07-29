<template>
  <div class="page-layout">
    <AdminSidebarMenu />
    <div class="page-content">
      <div>
        <div class="header-row">
          <div class="title">申诉管理</div>
        </div>
        <div class="table-wrapper">
          <table class="main-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>用户名</th>
                <th>用户ID</th>
                <th>申诉原因</th>
                <th>申诉状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(appeal, index) in appeals" :key="appeal.id">
                <td>{{ index + 1 }}</td>
                <td>{{ appeal.userName }}</td>
                <td>{{ appeal.userId }}</td>
                <td>{{ appeal.reason }}</td>
                <td>
                  <span v-if="appeal.status === 'pending'">待审核</span>
                  <span v-else-if="appeal.status === 'approved'" style="color:green;">已通过</span>
                  <span v-else style="color:red;">已拒绝</span>
                </td>
                <td>
                  <a href="#" class="action-link" @click.prevent="approveAppeal(appeal)">审核通过</a>
                  <a href="#" class="action-link" @click.prevent="rejectAppeal(appeal)">拒绝</a>
                </td>
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
import '../styles/appeal-management.css';

export default {
  name: "AppealManagement",
  components: { AdminSidebarMenu },
  data() {
    return {
      appeals: [
        {
          id: 1,
          userName: "夏浩博",
          userId: "123456",
          reason: "下雨，无法到场，申请取消违约",
          status: "pending"
        },
        {
          id: 2,
          userName: "李明",
          userId: "654321",
          reason: "家中有急事，申请取消违约",
          status: "approved"
        },
        {
          id: 3,
          userName: "王芳",
          userId: "789012",
          reason: "下雨，路滑，无法前往，申请取消违约",
          status: "rejected"
        }
      ]
    };
  },
  methods: {
    approveAppeal(appeal) {
      appeal.status = 'approved';
    },
    rejectAppeal(appeal) {
      appeal.status = 'rejected';
    }
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
  padding: 0;
  background: #fff;
}
</style>
