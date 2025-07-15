<template>
  <div>
    <h2>用户违约记录</h2>
    <table>
      <thead>
        <tr>
          <th>用户名</th>
          <th>用户ID</th>
          <th>违约原因</th>
          <th>预约场馆</th>
          <th>预约时间段</th>
          <th>违约次数</th>
          <th>黑名单状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.userId">
          <td>{{ user.userName }}</td>
          <td>{{ user.userId }}</td>
          <td>{{ user.violationReason }}</td>
          <td>{{ user.venue }}</td>
          <td>{{ user.timeSlot }}</td>
          <td>{{ user.violationCount }}</td>
          <td>
            <span v-if="user.isBlacklisted">在黑名单</span>
            <span v-else>未在黑名单</span>
          </td>
          <td>
            <button v-if="!user.isBlacklisted" @click="addToBlacklist(user)">加入黑名单</button>
            <span v-else>黑名单时间：{{ formatDate(user.blacklistTimestamp) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { getViolations, addToBlacklist } from '../utils/api';

export default {
  name: "ViolationManagement",
  data() {
    return {
      users: [] // 这里存放用户违约数据
    };
  },
  methods: {
    // 格式化时间
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    },
    // 加入黑名单操作
    addToBlacklist(user) {
      addToBlacklist(user.userId)
        .then(() => {
          alert('已加入黑名单');
          this.fetchUsers();
        })
        .catch(() => {
          alert('操作失败');
        });
    },
    // 拉取用户违约数据
    fetchUsers() {
      getViolations()
        .then(res => {
          this.users = res.data;
        })
        .catch(() => {
          alert('获取数据失败');
        });
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #eee;
  padding: 8px;
  text-align: center;
}
</style>
