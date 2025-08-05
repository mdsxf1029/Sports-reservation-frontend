<template>
  <div class="page-layout">
    <AdminHeaderNavbar />
    <div class="page-content">
      <div class="post-management-container">
        <el-tabs v-model="currentTab" class="demo-tabs">
          <el-tab-pane label="待处理申诉" name="pending">
            <div class="tab-header">
              <h3>待审核的申诉申请</h3>
              <el-tag type="warning" size="small">{{ pendingAppeals.length }} 条待处理</el-tag>
            </div>
            <el-table :data="pendingAppeals" style="width: 100%">
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column prop="userName" label="用户名" width="120" />
              <el-table-column prop="userId" label="用户ID" width="120" />
              <el-table-column prop="violationTime" label="违约时间" width="180" />
              <el-table-column prop="venue" label="预约场馆" width="120" />
              <el-table-column prop="timeSlot" label="预约时间段" width="150" />
              <el-table-column prop="appealReason" label="申诉理由" min-width="200" />
              <el-table-column prop="appealTime" label="申诉时间" width="180" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button 
                    type="success" 
                    size="small" 
                    @click="handleAppeal(scope.row, 'approve')"
                  >
                    通过申诉
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="handleAppeal(scope.row, 'reject')"
                  >
                    拒绝申诉
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="pendingAppeals.length === 0" class="no-data">
              暂无待处理的申诉申请
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="已处理申诉" name="processed">
            <div class="tab-header">
              <h3>已处理的申诉记录</h3>
            </div>
            <el-table :data="processedAppeals" style="width: 100%">
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column prop="userName" label="用户名" width="120" />
              <el-table-column prop="userId" label="用户ID" width="120" />
              <el-table-column prop="violationTime" label="违约时间" width="180" />
              <el-table-column prop="venue" label="预约场馆" width="120" />
              <el-table-column prop="appealReason" label="申诉理由" min-width="200" />
              <el-table-column prop="appealStatus" label="处理结果">
                <template #default="scope">
                  <el-tag :type="getAppealStatusType(scope.row.appealStatus)">
                    {{ getAppealStatusText(scope.row.appealStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="processTime" label="处理时间" width="180" />
              <el-table-column prop="processor" label="处理人" width="120" />
            </el-table>
            <div v-if="processedAppeals.length === 0" class="no-data">
              暂无已处理的申诉记录
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="黑名单管理" name="blacklist">
            <div class="tab-header">
              <h3>黑名单用户管理</h3>
              <el-tag type="danger" size="small">{{ blacklistUsers.length }} 人在黑名单</el-tag>
            </div>
            <el-table :data="blacklistUsers" style="width: 100%">
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column prop="userName" label="用户名" width="120" />
              <el-table-column prop="userId" label="用户ID" width="120" />
              <el-table-column prop="violationCount" label="违约次数" width="100" />
              <el-table-column prop="blacklistTime" label="加入黑名单时间" width="180" />
              <el-table-column prop="blacklistReason" label="加入原因" min-width="200" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="removeFromBlacklist(scope.row)"
                  >
                    移除黑名单
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="blacklistUsers.length === 0" class="no-data">
              暂无黑名单用户
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 申诉处理确认对话框 -->
    <el-dialog
      v-model="appealDialogVisible"
      :title="appealDialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="appeal-detail">
        <p><strong>用户：</strong>{{ selectedAppeal?.userName }}</p>
        <p><strong>违约时间：</strong>{{ selectedAppeal?.violationTime }}</p>
        <p><strong>预约场馆：</strong>{{ selectedAppeal?.venue }}</p>
        <p><strong>申诉理由：</strong>{{ selectedAppeal?.appealReason }}</p>
      </div>
      <div v-if="appealAction === 'reject'" class="reject-reason">
        <el-form-item label="拒绝理由">
          <el-input 
            v-model="rejectReason" 
            type="textarea" 
            :rows="3"
            placeholder="请输入拒绝理由（可选）"
          />
        </el-form-item>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="appealDialogVisible = false">取 消</el-button>
          <el-button 
            :type="appealAction === 'approve' ? 'success' : 'danger'"
            @click="confirmAppeal"
          >
            确 定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import AdminHeaderNavbar from '../components/AdminHeaderNavbar.vue'
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: "AppealManagement",
  components: { AdminHeaderNavbar },
  data() {
    return {
      currentTab: 'pending',
      appealDialogVisible: false,
      appealAction: '',
      selectedAppeal: null,
      rejectReason: '',
      
      // 模拟数据 - 待处理申诉
      pendingAppeals: [
        {
          id: 1,
          userName: "夏浩博",
          userId: "123456",
          violationTime: "2024-01-15 08:00",
          venue: "乒乓球馆",
          timeSlot: "8:00-9:00",
          appealReason: "下雨，路滑，无法前往，申请取消违约",
          appealTime: "2024-01-15 09:30",
          status: "pending"
        },
        {
          id: 2,
          userName: "李明",
          userId: "654321",
          violationTime: "2024-01-16 14:00",
          venue: "羽毛球馆",
          timeSlot: "14:00-15:00",
          appealReason: "家中有急事，申请取消违约",
          appealTime: "2024-01-16 15:00",
          status: "pending"
        }
      ],
      
      // 模拟数据 - 已处理申诉
      processedAppeals: [
        {
          id: 3,
          userName: "王芳",
          userId: "789012",
          violationTime: "2024-01-10 16:00",
          venue: "篮球馆",
          timeSlot: "16:00-17:00",
          appealReason: "身体不适，申请取消违约",
          appealStatus: "approved",
          processTime: "2024-01-10 17:30",
          processor: "管理员A"
        },
        {
          id: 4,
          userName: "张伟",
          userId: "345678",
          violationTime: "2024-01-12 10:00",
          venue: "乒乓球馆",
          timeSlot: "10:00-11:00",
          appealReason: "忘记预约时间，申请取消违约",
          appealStatus: "rejected",
          processTime: "2024-01-12 11:00",
          processor: "管理员B"
        }
      ],
      
      // 模拟数据 - 黑名单用户
      blacklistUsers: [
        {
          id: 1,
          userName: "赵强",
          userId: "111111",
          violationCount: 3,
          blacklistTime: "2024-01-01 10:00",
          blacklistReason: "连续3次违约，自动加入黑名单"
        }
      ]
    };
  },
  computed: {
    appealDialogTitle() {
      return this.appealAction === 'approve' ? '确认通过申诉' : '确认拒绝申诉';
    }
  },
  methods: {
    handleAppeal(appeal, action) {
      this.selectedAppeal = appeal;
      this.appealAction = action;
      this.rejectReason = '';
      this.appealDialogVisible = true;
    },
    
    confirmAppeal() {
      if (this.appealAction === 'approve') {
        // 通过申诉
        this.processAppeal(this.selectedAppeal, 'approved');
        ElMessage.success('申诉已通过，违约记录已取消');
      } else {
        // 拒绝申诉
        this.processAppeal(this.selectedAppeal, 'rejected');
        ElMessage.info('申诉已拒绝');
      }
      this.appealDialogVisible = false;
    },
    
    processAppeal(appeal, status) {
      // 从待处理列表移除
      const index = this.pendingAppeals.findIndex(item => item.id === appeal.id);
      if (index > -1) {
        this.pendingAppeals.splice(index, 1);
      }
      
      // 添加到已处理列表
      const processedAppeal = {
        ...appeal,
        appealStatus: status,
        processTime: new Date().toLocaleString(),
        processor: '当前管理员'
      };
      this.processedAppeals.unshift(processedAppeal);
    },
    
    removeFromBlacklist(user) {
      ElMessageBox.confirm(`确定要将用户【${user.userName}】从黑名单移除吗？`, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }).then(() => {
        const index = this.blacklistUsers.findIndex(item => item.id === user.id);
        if (index > -1) {
          this.blacklistUsers.splice(index, 1);
        }
        ElMessage.success('已从黑名单移除');
      }).catch(() => { /* 管理员取消 */ });
    },
    
    getAppealStatusText(status) {
      const statusMap = {
        'approved': '申诉通过',
        'rejected': '申诉被拒'
      };
      return statusMap[status] || '未知';
    },
    
    getAppealStatusType(status) {
      const typeMap = {
        'approved': 'success',
        'rejected': 'danger'
      };
      return typeMap[status] || 'info';
    }
  }
};
</script>

<style src="../styles/admin-sidebar.css"></style>
<style src="../styles/post-management.css"></style>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-content {
  padding: 20px;
  background: #fff;
  margin-top: 80px;
  min-height: calc(100vh - 80px);
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.tab-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

.appeal-detail {
  margin-bottom: 20px;
}

.appeal-detail p {
  margin: 8px 0;
  line-height: 1.6;
}

.reject-reason {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>