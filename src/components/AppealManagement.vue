<template>
  <div>
    <div class="header-row">
      <div class="title">申诉管理</div>
    </div>
    <div class="table-wrapper">
      <table class="main-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>用户ID</th>
            <th>申诉原因</th>
            <th>申诉状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appeal in appeals" :key="appeal.id">
            <td>{{ appeal.userName }}</td>
            <td>{{ appeal.userId }}</td>
            <td>{{ appeal.reason }}</td>
            <td>
              <span v-if="appeal.status === 'pending'">待审核</span>
              <span v-else-if="appeal.status === 'approved'" style="color:green;">已通过</span>
              <span v-else style="color:red;">已拒绝</span>
            </td>
            <td>
              <a v-if="appeal.status === 'pending'" href="#" class="action-link" @click.prevent="approveAppeal(appeal)">审核通过</a>
              <a v-if="appeal.status === 'pending'" href="#" class="action-link" @click.prevent="rejectAppeal(appeal)">拒绝</a>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "AppealManagement",
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

<style scoped>
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
.action-link {
  color: #3b6cff;
  margin-right: 16px;
  cursor: pointer;
  text-decoration: none;
  font-size: 16px;
}
.action-link:hover {
  text-decoration: underline;
}
</style>
