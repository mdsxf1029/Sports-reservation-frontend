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
    <div class="tab-menu">
      <span
        :class="{active: currentTab==='violation'}"
        @click="currentTab='violation'"
      >用户违约记录</span>
      <span
        :class="{active: currentTab==='blacklist'}"
        @click="currentTab='blacklist'"
      >黑名单管理</span>
    </div>
    <div v-if="currentTab==='violation'">
      <div class="table-wrapper">
        <table class="main-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>用户ID</th>
              <th>违约原因</th>
              <th>预约场馆</th>
              <th>预约时间段</th>
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
              <td>
                <router-link
                  class="action-link"
                  :to="{ path: '/violation/history', query: { userId: user.userId } }"
                >历史违约记录</router-link>
                <a
                  href="#"
                  class="action-link"
                  v-if="!user.isBlacklisted"
                  @click.prevent="addToBlacklist(user)"
                >加入黑名单设置</a>
                <span v-else class="blacklist-time"
                  >黑名单时间：{{ formatDate(user.blacklistTimestamp) }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <div class="table-wrapper">
        <table class="main-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>用户ID</th>
              <th>黑名单时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users.filter(u=>u.isBlacklisted)" :key="user.userId">
              <td>{{ user.userName }}</td>
              <td>{{ user.userId }}</td>
              <td>{{ formatDate(user.blacklistTimestamp) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { getViolations, addToBlacklist } from '../utils/api';

export default {
  name: "ViolationManagement",
  data() {
    return {
      currentTab: 'violation',
      users: [
        {
          userName: "夏浩博",
          userId: "123456",
          violationReason: "未签到",
          venue: "乒乓球馆",
          timeSlot: "8:00-9:00",
          isBlacklisted: false,
          blacklistTimestamp: null
        },
        {
          userName: "李明",
          userId: "654321",
          violationReason: "迟到",
          venue: "羽毛球馆",
          timeSlot: "9:00-10:00",
          isBlacklisted: true,
          blacklistTimestamp: "2024-01-01T08:00:00Z"
        }
      ]
    };
  },
  methods: {
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
<!-- 全局引入样式 -->
<style src="../styles/violation.css"></style>
