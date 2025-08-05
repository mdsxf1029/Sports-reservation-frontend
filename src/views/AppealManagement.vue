<template>
  <div class="page-layout">
    <AdminHeaderNavbar />
    <div class="page-content">
      <div class="post-management-container">
        <!-- 统计概览卡片 -->
        <div class="statistics-section">
          <div class="stat-card">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingAppeals.length }}</div>
              <div class="stat-label">待处理申诉</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon approved">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ approvedAppeals.length }}</div>
              <div class="stat-label">申诉通过</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon rejected">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ rejectedAppeals.length }}</div>
              <div class="stat-label">申诉被拒</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blacklist">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ blacklistUsers.length }}</div>
              <div class="stat-label">黑名单用户</div>
            </div>
          </div>
        </div>

        <!-- 快速操作区域 -->
        <div class="quick-actions">
          <el-button type="success" size="large" @click="handleBatchApprove">
            <el-icon><Check /></el-icon>
            批量通过申诉
          </el-button>
          <el-button type="danger" size="large" @click="handleBatchReject">
            <el-icon><Close /></el-icon>
            批量拒绝申诉
          </el-button>
          <el-button type="warning" size="large" @click="handleBatchRemoveBlacklist">
            <el-icon><User /></el-icon>
            批量移除黑名单
          </el-button>
          <el-button type="info" size="large" @click="exportAppealData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
          <el-tabs v-model="currentTab" class="demo-tabs">
            <el-tab-pane label="申诉审核" name="pending">
              <div class="tab-content">
                <div class="tab-header">
                  <h3>申诉申请列表</h3>
                  <div class="header-stats">
                    <el-tag type="warning" size="small">{{ pendingAppeals.length }} 条待处理</el-tag>
                    <el-tag type="success" size="small">{{ approvedAppeals.length }} 条已通过</el-tag>
                    <el-tag type="danger" size="small">{{ rejectedAppeals.length }} 条已拒绝</el-tag>
                  </div>
                </div>
                
                <!-- 筛选区域 -->
                <div class="filter-section">
                  <el-select v-model="appealStatusFilter" placeholder="申诉状态" clearable style="width: 120px; margin-right: 10px;">
                    <el-option label="全部" value="" />
                    <el-option label="待处理" value="pending" />
                    <el-option label="已通过" value="approved" />
                    <el-option label="已拒绝" value="rejected" />
                  </el-select>
                  
                  <el-select v-model="venueFilter" placeholder="场馆筛选" clearable style="width: 120px; margin-right: 10px;">
                    <el-option label="全部" value="" />
                    <el-option label="乒乓球馆" value="乒乓球馆" />
                    <el-option label="羽毛球馆" value="羽毛球馆" />
                    <el-option label="篮球馆" value="篮球馆" />
                    <el-option label="健身房" value="健身房" />
                  </el-select>
                  
                  <el-input
                    v-model="searchKeyword"
                    placeholder="搜索用户名或用户ID"
                    style="width: 200px; margin-right: 10px;"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                  
                  <el-button type="primary" @click="applyFilters">
                    <el-icon><Filter /></el-icon>
                    应用筛选
                  </el-button>
                  
                  <el-button @click="resetFilters">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </div>
                
                <el-table :data="filteredAppeals" style="width: 100%">
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="userName" label="用户名" width="120">
                    <template #default="scope">
                      <div class="user-info">
                        <el-avatar :size="32" :src="scope.row.userAvatar">
                          <el-icon><User /></el-icon>
                        </el-avatar>
                        <span>{{ scope.row.userName }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="userId" label="用户ID" width="120" />
                  <el-table-column prop="violationTime" label="违约时间" width="180" />
                  <el-table-column prop="venue" label="预约场馆" width="120">
                    <template #default="scope">
                      <div class="venue-info">
                        <el-icon><Location /></el-icon>
                        <span>{{ scope.row.venue }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="timeSlot" label="预约时间段" width="150" />
                  <el-table-column prop="appealReason" label="申诉理由" min-width="200">
                    <template #default="scope">
                      <div class="appeal-reason">
                        <el-icon><ChatDotRound /></el-icon>
                        <span>{{ scope.row.appealReason }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="appealTime" label="申诉时间" width="180" />
                  <el-table-column prop="appealStatus" label="申诉状态" width="120">
                    <template #default="scope">
                      <el-tag :type="getAppealStatusType(scope.row.appealStatus)" size="small">
                        <el-icon v-if="scope.row.appealStatus === 'pending'"><Clock /></el-icon>
                        <el-icon v-else-if="scope.row.appealStatus === 'approved'"><CircleCheck /></el-icon>
                        <el-icon v-else-if="scope.row.appealStatus === 'rejected'"><CircleClose /></el-icon>
                        {{ getAppealStatusText(scope.row.appealStatus) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                      <div v-if="scope.row.appealStatus === 'pending'">
                        <el-button 
                          type="success" 
                          size="small" 
                          @click="handleAppeal(scope.row, 'approve')"
                        >
                          <el-icon><Check /></el-icon>
                          通过
                        </el-button>
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="handleAppeal(scope.row, 'reject')"
                        >
                          <el-icon><Close /></el-icon>
                          拒绝
                        </el-button>
                      </div>
                      <div v-else>
                        <el-button 
                          type="primary" 
                          size="small" 
                          @click="viewAppealDetail(scope.row)"
                        >
                          <el-icon><View /></el-icon>
                          查看详情
                        </el-button>
                        <el-tag type="info" size="small">已处理</el-tag>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div v-if="filteredAppeals.length === 0" class="no-data">
                  <el-empty description="暂无申诉记录" :image-size="200">
                    <el-button type="primary" @click="refreshData">刷新数据</el-button>
                  </el-empty>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="黑名单管理" name="blacklist">
              <div class="tab-content">
                <div class="tab-header">
                  <h3>黑名单用户管理</h3>
                  <el-tag type="danger" size="small">{{ blacklistUsers.length }} 人在黑名单</el-tag>
                </div>
                
                <el-table :data="blacklistUsers" style="width: 100%">
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="userName" label="用户名" width="120">
                    <template #default="scope">
                      <div class="user-info">
                        <el-avatar :size="32" :src="scope.row.userAvatar">
                          <el-icon><User /></el-icon>
                        </el-avatar>
                        <span>{{ scope.row.userName }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="userId" label="用户ID" width="120" />
                  <el-table-column prop="violationCount" label="违约次数" width="100">
                    <template #default="scope">
                      <el-tag type="danger" size="small">{{ scope.row.violationCount }} 次</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="blacklistTime" label="加入黑名单时间" width="180" />
                  <el-table-column prop="blacklistReason" label="加入原因" min-width="200">
                    <template #default="scope">
                      <div class="blacklist-reason">
                        <el-icon><Warning /></el-icon>
                        <span>{{ scope.row.blacklistReason }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" fixed="right">
                    <template #default="scope">
                      <el-button 
                        type="primary" 
                        size="small" 
                        @click="removeFromBlacklist(scope.row)"
                      >
                        <el-icon><User /></el-icon>
                        移除黑名单
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div v-if="blacklistUsers.length === 0" class="no-data">
                  <el-empty description="暂无黑名单用户" :image-size="200">
                    <el-button type="primary" @click="refreshData">刷新数据</el-button>
                  </el-empty>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 申诉处理确认对话框 -->
    <el-dialog
      v-model="appealDialogVisible"
      :title="appealDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="appeal-detail">
        <div class="detail-section">
          <h4>申诉信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">用户：</span>
              <span class="value">{{ selectedAppeal?.userName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">违约时间：</span>
              <span class="value">{{ selectedAppeal?.violationTime }}</span>
            </div>
            <div class="detail-item">
              <span class="label">预约场馆：</span>
              <span class="value">{{ selectedAppeal?.venue }}</span>
            </div>
            <div class="detail-item">
              <span class="label">预约时间段：</span>
              <span class="value">{{ selectedAppeal?.timeSlot }}</span>
            </div>
            <div class="detail-item">
              <span class="label">申诉时间：</span>
              <span class="value">{{ selectedAppeal?.appealTime }}</span>
            </div>
            <div class="detail-item">
              <span class="label">申诉理由：</span>
              <span class="value">{{ selectedAppeal?.appealReason }}</span>
            </div>
          </div>
        </div>
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
import { 
  Clock, 
  CircleCheck, 
  CircleClose, 
  UserFilled,
  Check,
  Close,
  User,
  Download,
  Search,
  Filter,
  Refresh,
  Location,
  ChatDotRound,
  Warning,
  View
} from '@element-plus/icons-vue'

export default {
  name: "AppealManagement",
  components: { 
    AdminHeaderNavbar,
    Clock, 
    CircleCheck, 
    CircleClose, 
    UserFilled,
    Check,
    Close,
    User,
    Download,
    Search,
    Filter,
    Refresh,
    Location,
    ChatDotRound,
    Warning,
    View
  },
  data() {
    return {
      currentTab: 'pending',
      appealDialogVisible: false,
      appealAction: '',
      selectedAppeal: null,
      rejectReason: '',
      
      // 筛选条件
      appealStatusFilter: '',
      venueFilter: '',
      searchKeyword: '',
      
      // 模拟数据 - 待处理申诉
      pendingAppeals: [
        {
          id: 1,
          userName: "夏浩博",
          userId: "123456",
          userAvatar: "",
          violationTime: "2024-01-15 08:00",
          venue: "乒乓球馆",
          timeSlot: "8:00-9:00",
          appealReason: "下雨，路滑，无法前往，申请取消违约",
          appealTime: "2024-01-15 09:30",
          appealStatus: "pending"
        },
        {
          id: 2,
          userName: "李明",
          userId: "654321",
          userAvatar: "",
          violationTime: "2024-01-16 14:00",
          venue: "羽毛球馆",
          timeSlot: "14:00-15:00",
          appealReason: "家中有急事，申请取消违约",
          appealTime: "2024-01-16 15:00",
          appealStatus: "pending"
        }
      ],
      
      // 模拟数据 - 已处理申诉
      processedAppeals: [
        {
          id: 3,
          userName: "王芳",
          userId: "789012",
          userAvatar: "",
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
          userAvatar: "",
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
          userAvatar: "",
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
    },
    
    // 统计计算
    approvedAppeals() {
      return this.processedAppeals.filter(a => a.appealStatus === 'approved');
    },
    
    rejectedAppeals() {
      return this.processedAppeals.filter(a => a.appealStatus === 'rejected');
    },
    
    // 筛选后的申诉数据
    filteredAppeals() {
      let allAppeals = [...this.pendingAppeals, ...this.processedAppeals];
      
      // 状态筛选
      if (this.appealStatusFilter) {
        allAppeals = allAppeals.filter(a => a.appealStatus === this.appealStatusFilter);
      }
      
      // 场馆筛选
      if (this.venueFilter) {
        allAppeals = allAppeals.filter(a => a.venue === this.venueFilter);
      }
      
      // 关键词搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        allAppeals = allAppeals.filter(a => 
          a.userName.toLowerCase().includes(keyword) || 
          a.userId.toLowerCase().includes(keyword)
        );
      }
      
      return allAppeals;
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
        'pending': '待处理',
        'approved': '申诉通过',
        'rejected': '申诉被拒'
      };
      return statusMap[status] || '未知';
    },
    
    getAppealStatusType(status) {
      const typeMap = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
      };
      return typeMap[status] || 'info';
    },
    
    // 新增功能
    viewAppealDetail(appeal) {
      this.selectedAppeal = appeal;
      this.appealAction = '';
      this.appealDialogVisible = true;
    },
    
    handleBatchApprove() {
      ElMessageBox.confirm('确定要批量通过选中的申诉吗？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }).then(() => {
        ElMessage.success('批量通过功能待实现');
      });
    },
    
    handleBatchReject() {
      ElMessageBox.confirm('确定要批量拒绝选中的申诉吗？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        ElMessage.success('批量拒绝功能待实现');
      });
    },
    
    handleBatchRemoveBlacklist() {
      ElMessageBox.confirm('确定要批量移除选中的黑名单用户吗？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }).then(() => {
        ElMessage.success('批量移除功能待实现');
      });
    },
    
    exportAppealData() {
      ElMessage.success('导出功能待实现');
    },
    
    applyFilters() {
      ElMessage.success('筛选已应用');
    },
    
    resetFilters() {
      this.appealStatusFilter = '';
      this.venueFilter = '';
      this.searchKeyword = '';
      ElMessage.success('筛选已重置');
    },
    
    refreshData() {
      ElMessage.success('数据已刷新');
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
  flex: 1;
  padding: 20px;
  background: #fff;
  margin-top: 80px;
  min-height: calc(100vh - 80px);
}

/* 统计卡片样式 */
.statistics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #fff;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #ff9a56, #ff6b6b);
}

.stat-icon.approved {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.stat-icon.rejected {
  background: linear-gradient(135deg, #fa709a, #fee140);
}

.stat-icon.blacklist {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 快速操作区域 */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 主要内容区域 */
.main-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-content {
  margin-top: 20px;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.header-stats {
  display: flex;
  gap: 8px;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 10px;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.venue-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #409eff;
}

.appeal-reason {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e6a23c;
}

.blacklist-reason {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f56c6c;
}

.no-data {
  text-align: center;
  padding: 40px;
}

/* 申诉详情样式 */
.appeal-detail {
  max-height: 400px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-item .label {
  font-weight: 600;
  color: #606266;
  min-width: 100px;
  margin-right: 12px;
}

.detail-item .value {
  color: #303133;
  flex: 1;
}

.reject-reason {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions {
    justify-content: center;
  }
  
  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-stats {
    flex-wrap: wrap;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>