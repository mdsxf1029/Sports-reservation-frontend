<template>
  <div>
    <div class="container">
      <!-- 左侧菜单栏 -->
      <div class="sidebar">
        <div class="menu-item" :class="{selected: $route.path==='/venue'}" @click="$router.push('/venue')">场地管理</div>
        <div class="menu-item" :class="{selected: $route.path==='/violation'}" @click="$router.push('/violation')">违约管理</div>
        <div class="menu-item" :class="{selected: $route.path==='/post'}" @click="$router.push('/post')">帖子管理</div>
        <div class="menu-item" :class="{selected: $route.path==='/appeal'}" @click="$router.push('/appeal')">申诉管理</div>
      </div>
      <!-- 右侧内容区 -->
      <div class="content">
        <div class="header-row">
          <div class="title">用户违约记录</div>
          <div class="title blacklist-title">黑名单管理</div>
        </div>
        <table class="violation-table">
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
                <a href="#" class="action-link">历史违约记录</a>
                <a
                  href="#"
                  class="action-link"
                  v-if="!user.isBlacklisted"
                  @click.prevent="addToBlacklist(user)"
                  >加入黑名单设置</a
                >
                <span v-else class="blacklist-time"
                  >黑名单时间：{{ formatDate(user.blacklistTimestamp) }}</span
                >
              </td>
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
   //this.fetchUsers();
  }
};
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  background: #fff;
  font-family: "Microsoft YaHei", Arial, sans-serif;
}

.sidebar {
  width: 180px;
  background: #fafafa;
  border-right: 2px solid #eee;
  display: flex;
  flex-direction: column;
  padding-top: 30px;
}

.menu-item {
  font-size: 26px;
  font-weight: bold;
  color: #222;
  padding: 32px 0 32px 30px;
  cursor: pointer;
  border-bottom: 2px solid #eee;
  transition: background 0.2s;
}

.menu-item.selected {
  background: #fff;
  color: #111;
}

.content {
  flex: 1;
  padding: 30px 40px;
}

.header-row {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  flex: 1;
  padding-bottom: 10px;
}

.blacklist-title {
  flex: 1;
  text-align: right;
  font-size: 28px;
  font-weight: bold;
  color: #222;
  padding-bottom: 10px;
}

.violation-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: #fff;
}

.violation-table th,
.violation-table td {
  border: 1px solid #eee;
  padding: 16px 10px;
  text-align: center;
  font-size: 18px;
}

.violation-table th {
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

.blacklist-time {
  color: #888;
  font-size: 15px;
}
</style>
