<template>
  <div class="page-layout">
    <AdminSidebarMenu />
    <div class="page-content">
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
                <th>序号</th>
                <th>用户名</th>
                <th>用户ID</th>
                <th>违约原因</th>
                <th>预约场馆</th>
                <th>预约时间段</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in users" :key="user.userId">
                <td>{{ index + 1 }}</td>
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
                  >加入黑名单</a>
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
                <th>序号</th>
                <th>用户名</th>
                <th>用户ID</th>
                <th>黑名单时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in users.filter(u=>u.isBlacklisted)" :key="user.userId">
                <td>{{ index + 1 }}</td>
                <td>{{ user.userName }}</td>
                <td>{{ user.userId }}</td>
                <td>{{ formatDate(user.blacklistTimestamp) }}</td>
                <td>
                  <a
                    href="#"
                    class="action-link"
                    @click.prevent="removeFromBlacklist(user)"
                  >移除黑名单</a>
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
import { getViolations, addToBlacklist } from '../utils/api';


export default {
  name: "ViolationManagement",
  components: { AdminSidebarMenu },
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
      user.isBlacklisted = true;
      user.blacklistTimestamp = new Date().toISOString();
    },
    removeFromBlacklist(user) {
      user.isBlacklisted = false;
      user.blacklistTimestamp = null;
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style src="../styles/admin-sidebar.css"></style>

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
