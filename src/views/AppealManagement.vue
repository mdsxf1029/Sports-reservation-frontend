<template>
  <div class="page-layout">
    <AdminMenuBar />
    <div class="page-content">
      <div class="post-management-container">
        <el-table :data="appeals" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="userName" label="用户名" />
          <el-table-column prop="userId" label="用户ID" />
          <el-table-column prop="reason" label="申诉原因" width="350" />
          <el-table-column prop="status" label="申诉状态">
            <template #default="scope">
              <span :class="getStatusClass(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <div v-if="scope.row.status === 'pending'">
                <a href="#" class="action-link" @click.prevent="approveAppeal(scope.row)">审核通过</a>
                <a href="#" class="action-link" @click.prevent="rejectAppeal(scope.row)">拒绝</a>
              </div>
              <span v-else style="color: #909399;">已处理</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import AdminMenuBar from '../components/AdminMenuBar.vue'
import { ElMessage, ElMessageBox } from 'element-plus'; 
import '../styles/appeal-management.css';

export default {
  name: "AppealManagement",
  components: { AdminMenuBar },
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
      ElMessageBox.confirm(`确定要通过用户【${appeal.userName}】的申诉吗？`, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      }).then(() => {
        appeal.status = 'approved';
        ElMessage.success('申诉已通过');
      }).catch(() => { /* 管理员取消 */ });
    },
    rejectAppeal(appeal) {
       ElMessageBox.confirm(`确定要拒绝用户【${appeal.userName}】的申诉吗？`, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        appeal.status = 'rejected';
        ElMessage.info('申诉已拒绝');
      }).catch(() => { /* 管理员取消 */ });
    },
    //根据状态返回不同文本
    getStatusText(status) {
      const statusMap = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已拒绝'
      };
      return statusMap[status] || '未知';
    },
    //根据状态返回不同CSS类
    getStatusClass(status) {
      const classMap = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected'
      };
      return classMap[status] || '';
    }
  }
};
</script>

<style src="../styles/admin-sidebar.css"></style>
<style src="../styles/post-management.css"></style>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  padding-top: 50px;
  padding-left: 15px;
}
.page-content {
  flex: 1;
  padding: 20px;
  background: #fff;
  margin-left: 180px;
}
.status-pending {
  color: #E6A23C;
  font-weight: bold;
}

.status-approved {
  color: #69b046;
  font-weight: bold;
}

.status-rejected {
  color: #F56C6C;
  font-weight: bold;
}
</style>