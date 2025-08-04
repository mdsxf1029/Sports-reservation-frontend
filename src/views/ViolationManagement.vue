<template>
  <div class="page-layout">
    <AdminMenuBar />
    <div class="page-content">
      <div class="content-wrapper">
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
                  <a
                    href="#"
                    class="action-link"
                    @click.prevent="showViolationHistory(user)"
                  >历史违约记录</a>
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

    <!-- 历史违约记录弹窗 -->
    <el-dialog
      v-model="historyDialogVisible"
      :title="`${selectedUser?.userName || ''} 的历史违约记录`"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedUser">
        <div class="history-table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>违约时间</th>
                <th>违约原因</th>
                <th>场馆</th>
                <th>时间段</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in userViolationHistory" :key="record.id">
                <td>{{ index + 1 }}</td>
                <td>{{ record.date }}</td>
                <td>{{ record.reason }}</td>
                <td>{{ record.venue }}</td>
                <td>{{ record.timeSlot }}</td>
                <td>
                  <span :class="getStatusClass(record.status)">{{ getStatusText(record.status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="userViolationHistory.length === 0" class="no-data">
          该用户暂无违约记录
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AdminMenuBar from '../components/AdminMenuBar.vue'
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: "ViolationManagement",
  components: { AdminMenuBar },
  data() {
    return {
      currentTab: 'violation',
      historyDialogVisible: false,
      selectedUser: null,
      userViolationHistory: [],
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
  computed: {
    blacklistUsers() {
      return this.users.filter(u => u.isBlacklisted);
    }
  },
  methods: {
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    },
    addToBlacklist(user) {
       ElMessageBox.confirm(`确定要将用户【${user.userName}】加入黑名单吗？`, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        user.isBlacklisted = true;
        user.blacklistTimestamp = new Date().toISOString();
        ElMessage.success('已加入黑名单');
      }).catch(()=>{/* 管理员取消 */});
    },
    removeFromBlacklist(user) {
       ElMessageBox.confirm(`确定要将用户【${user.userName}】从黑名单移除吗？`, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }).then(() => {
        user.isBlacklisted = false;
        user.blacklistTimestamp = null;
        ElMessage.success('已从黑名单移除');
      }).catch(()=>{/* 管理员取消 */});
    },
    showViolationHistory(user) {
      this.selectedUser = user;
      this.historyDialogVisible = true;
      this.loadUserViolationHistory(user.userId);
    },
    loadUserViolationHistory(userId) {
      // 模拟从API获取用户的历史违约记录
      // 这里可以根据实际的API调用替换
      const mockHistory = {
        "123456": [
          { id: 1, date: "2024-01-01", reason: "未签到", venue: "乒乓球馆", timeSlot: "8:00-9:00", status: "confirmed" },
          { id: 2, date: "2024-01-15", reason: "迟到", venue: "篮球馆", timeSlot: "14:00-15:00", status: "confirmed" }
        ],
        "654321": [
          { id: 3, date: "2024-02-15", reason: "迟到", venue: "羽毛球馆", timeSlot: "9:00-10:00", status: "confirmed" },
          { id: 4, date: "2024-03-01", reason: "未到场", venue: "乒乓球馆", timeSlot: "16:00-17:00", status: "pending" }
        ]
      };
      
      this.userViolationHistory = mockHistory[userId] || [];
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'appealed': '已申诉'
      };
      return statusMap[status] || '未知';
    },
    getStatusClass(status) {
      const classMap = {
        'pending': 'status-pending',
        'confirmed': 'status-confirmed',
        'appealed': 'status-appealed'
      };
      return classMap[status] || '';
    }
  }
};
</script>

<style src="../styles/admin-sidebar.css"></style>
<style src="../styles/violation.css"></style>
<style src="../styles/post-management.css"></style>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-left: 25px;
}
.page-content {
  display: flex;
  flex-direction: row;
  flex: 1;
  background: #fff;
  margin-left: 180px;
  margin-top: 60px;
  padding-top: 20px;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
}

/* 历史违约记录弹窗样式 */
.history-table-wrapper {
  max-height: 400px;
  overflow-y: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.history-table th,
.history-table td {
  border: 1px solid #eee;
  padding: 12px 8px;
  text-align: center;
  font-size: 14px;
}

.history-table th {
  background: #fafafa;
  font-weight: bold;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

.status-pending {
  color: #e6a23c;
  font-weight: bold;
}

.status-confirmed {
  color: #f56c6c;
  font-weight: bold;
}

.status-appealed {
  color: #409eff;
  font-weight: bold;
}

.action-cell {
  display: flex;
  align-items: center; 
}

.status-text {
  color: #909399;
  font-size: 16px; 
}
</style>