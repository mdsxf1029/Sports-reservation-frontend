<template>
  <div class="appeal-container">
    <h2>申诉管理</h2>
    <table class="appeal-table">
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
            <button v-if="appeal.status === 'pending'" @click="approveAppeal(appeal)">审核通过</button>
            <button v-if="appeal.status === 'pending'" @click="rejectAppeal(appeal)">拒绝</button>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
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
.appeal-container {
  padding: 40px;
}
.appeal-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #fff;
}
.appeal-table th,
.appeal-table td {
  border: 1px solid #eee;
  padding: 14px 10px;
  text-align: center;
  font-size: 18px;
}
.appeal-table th {
  background: #fafafa;
  font-weight: bold;
}
button {
  margin: 0 6px;
  padding: 4px 12px;
  font-size: 16px;
  cursor: pointer;
}
</style>
