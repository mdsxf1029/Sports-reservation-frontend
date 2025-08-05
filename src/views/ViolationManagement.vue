<template>
  <div class="page-layout">
    <AdminHeaderNavbar />
    <div class="page-content">
      <div class="post-management-container">
        <!-- 违约统计卡片 -->
        <div class="statistics-cards">
          <div class="stat-card">
            <div class="stat-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalViolations }}</div>
              <div class="stat-label">总违约次数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon danger">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ uniqueUsers }}</div>
              <div class="stat-label">违约用户数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon info">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ todayViolations }}</div>
              <div class="stat-label">今日违约</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ violationRate }}%</div>
              <div class="stat-label">违约率</div>
            </div>
          </div>
        </div>

        <!-- 筛选和搜索区域 -->
        <div class="filter-section">
          <div class="filter-left">
            <el-select v-model="filterStatus" placeholder="违约状态" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="已确认" value="confirmed" />
              <el-option label="已申诉" value="appealed" />
              <el-option label="申诉通过" value="appeal_approved" />
              <el-option label="申诉被拒" value="appeal_rejected" />
            </el-select>
            <el-select v-model="filterVenue" placeholder="场馆" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="乒乓球馆" value="乒乓球馆" />
              <el-option label="羽毛球馆" value="羽毛球馆" />
              <el-option label="篮球馆" value="篮球馆" />
              <el-option label="健身房" value="健身房" />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px; margin-right: 10px;"
            />
          </div>
          <div class="filter-right">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名或用户ID"
              style="width: 200px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <!-- 违约记录表格 -->
        <div class="table-section">
          <div class="table-header">
            <h3>违约记录列表</h3>
            <el-tag type="info" size="small">{{ filteredViolations.length }} 条记录</el-tag>
          </div>
          
          <el-table :data="filteredViolations" style="width: 100%" stripe>
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="userName" label="用户名" width="120" />
            <el-table-column prop="userId" label="用户ID" width="120" />
            <el-table-column prop="violationTime" label="违约时间" width="180" />
            <el-table-column prop="venue" label="预约场馆" width="120" />
            <el-table-column prop="timeSlot" label="预约时间段" width="150" />
            <el-table-column prop="violationType" label="违约类型" width="120">
              <template #default="scope">
                <el-tag :type="getViolationTypeTag(scope.row.violationType)" size="small">
                  {{ getViolationTypeText(scope.row.violationType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="appealStatus" label="申诉状态" width="120">
              <template #default="scope">
                <span v-if="scope.row.appealStatus === 'none'">无申诉</span>
                <el-tag v-else :type="getAppealStatusType(scope.row.appealStatus)" size="small">
                  {{ getAppealStatusText(scope.row.appealStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="viewViolationDetail(scope.row)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div v-if="filteredViolations.length === 0" class="no-data">
            暂无违约记录
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredViolations.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 违约详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="违约记录详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedViolation" class="violation-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">用户名：</span>
              <span class="value">{{ selectedViolation.userName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">用户ID：</span>
              <span class="value">{{ selectedViolation.userId }}</span>
            </div>
            <div class="detail-item">
              <span class="label">违约时间：</span>
              <span class="value">{{ selectedViolation.violationTime }}</span>
            </div>
            <div class="detail-item">
              <span class="label">预约场馆：</span>
              <span class="value">{{ selectedViolation.venue }}</span>
            </div>
            <div class="detail-item">
              <span class="label">预约时间段：</span>
              <span class="value">{{ selectedViolation.timeSlot }}</span>
            </div>
            <div class="detail-item">
              <span class="label">违约类型：</span>
              <span class="value">
                <el-tag :type="getViolationTypeTag(selectedViolation.violationType)" size="small">
                  {{ getViolationTypeText(selectedViolation.violationType) }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="selectedViolation.appealStatus !== 'none'">
          <h4>申诉信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">申诉时间：</span>
              <span class="value">{{ selectedViolation.appealTime }}</span>
            </div>
            <div class="detail-item">
              <span class="label">申诉理由：</span>
              <span class="value">{{ selectedViolation.appealReason }}</span>
            </div>
            <div class="detail-item">
              <span class="label">申诉状态：</span>
              <span class="value">
                <el-tag :type="getAppealStatusType(selectedViolation.appealStatus)" size="small">
                  {{ getAppealStatusText(selectedViolation.appealStatus) }}
                </el-tag>
              </span>
            </div>
            <div class="detail-item" v-if="selectedViolation.appealStatus === 'rejected'">
              <span class="label">拒绝理由：</span>
              <span class="value">{{ selectedViolation.rejectReason || '无' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>用户违约历史</h4>
          <div class="history-summary">
            <p>该用户累计违约 <strong>{{ selectedViolation.userViolationCount }}</strong> 次</p>
            <p>最近一次违约：{{ selectedViolation.lastViolationTime || '无' }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import AdminHeaderNavbar from '../components/AdminHeaderNavbar.vue'
import { ElMessage } from 'element-plus';
import { Warning, User, Calendar, TrendCharts, Search } from '@element-plus/icons-vue'

export default {
  name: "ViolationManagement",
  components: { 
    AdminHeaderNavbar,
    Warning,
    User,
    Calendar,
    TrendCharts,
    Search
  },
  data() {
    return {
      // 筛选条件
      filterStatus: '',
      filterVenue: '',
      dateRange: [],
      searchKeyword: '',
      
      // 分页
      currentPage: 1,
      pageSize: 20,
      
      // 对话框
      detailDialogVisible: false,
      selectedViolation: null,
      
      // 模拟数据 - 违约记录
      violations: [
        {
          id: 1,
          userName: "夏浩博",
          userId: "123456",
          violationTime: "2024-01-15 08:00",
          venue: "乒乓球馆",
          timeSlot: "8:00-9:00",
          violationType: "no_checkin",
          status: "confirmed",
          appealStatus: "pending",
          appealTime: "2024-01-15 09:30",
          appealReason: "下雨，路滑，无法前往",
          rejectReason: "",
          userViolationCount: 2,
          lastViolationTime: "2024-01-10 14:00"
        },
        {
          id: 2,
          userName: "李明",
          userId: "654321",
          violationTime: "2024-01-16 14:00",
          venue: "羽毛球馆",
          timeSlot: "14:00-15:00",
          violationType: "late_checkin",
          status: "confirmed",
          appealStatus: "none",
          appealTime: "",
          appealReason: "",
          rejectReason: "",
          userViolationCount: 1,
          lastViolationTime: ""
        },
        {
          id: 3,
          userName: "王芳",
          userId: "789012",
          violationTime: "2024-01-17 16:00",
          venue: "篮球馆",
          timeSlot: "16:00-17:00",
          violationType: "no_checkin",
          status: "confirmed",
          appealStatus: "approved",
          appealTime: "2024-01-17 17:00",
          appealReason: "身体不适，有医院证明",
          rejectReason: "",
          userViolationCount: 3,
          lastViolationTime: "2024-01-12 10:00"
        },
        {
          id: 4,
          userName: "张伟",
          userId: "345678",
          violationTime: "2024-01-18 10:00",
          venue: "乒乓球馆",
          timeSlot: "10:00-11:00",
          violationType: "no_checkin",
          status: "confirmed",
          appealStatus: "rejected",
          appealTime: "2024-01-18 11:00",
          appealReason: "忘记预约时间",
          rejectReason: "理由不充分，无法证明特殊情况",
          userViolationCount: 1,
          lastViolationTime: ""
        }
      ]
    };
  },
  computed: {
    // 统计计算
    totalViolations() {
      return this.violations.length;
    },
    uniqueUsers() {
      const userIds = new Set(this.violations.map(v => v.userId));
      return userIds.size;
    },
    todayViolations() {
      const today = new Date().toISOString().split('T')[0];
      return this.violations.filter(v => v.violationTime.startsWith(today)).length;
    },
    violationRate() {
      // 模拟计算违约率（实际应该基于总预约数）
      return ((this.violations.length / 100) * 100).toFixed(1);
    },
    
    // 筛选后的数据
    filteredViolations() {
      let filtered = [...this.violations];
      
      // 状态筛选
      if (this.filterStatus) {
        filtered = filtered.filter(v => v.status === this.filterStatus);
      }
      
      // 场馆筛选
      if (this.filterVenue) {
        filtered = filtered.filter(v => v.venue === this.filterVenue);
      }
      
      // 日期筛选
      if (this.dateRange && this.dateRange.length === 2) {
        filtered = filtered.filter(v => {
          const violationDate = v.violationTime.split(' ')[0];
          return violationDate >= this.dateRange[0] && violationDate <= this.dateRange[1];
        });
      }
      
      // 关键词搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        filtered = filtered.filter(v => 
          v.userName.toLowerCase().includes(keyword) || 
          v.userId.toLowerCase().includes(keyword)
        );
      }
      
      return filtered;
    }
  },
  methods: {
    // 违约类型相关方法
    getViolationTypeText(type) {
      const typeMap = {
        'no_checkin': '未签到',
        'late_checkin': '迟到签到',
        'early_leave': '提前离场'
      };
      return typeMap[type] || '未知';
    },
    getViolationTypeTag(type) {
      const tagMap = {
        'no_checkin': 'danger',
        'late_checkin': 'warning',
        'early_leave': 'info'
      };
      return tagMap[type] || 'info';
    },
    
    // 状态相关方法
    getStatusText(status) {
      const statusMap = {
        'confirmed': '已确认',
        'pending': '待确认',
        'cancelled': '已取消'
      };
      return statusMap[status] || '未知';
    },
    getStatusType(status) {
      const typeMap = {
        'confirmed': 'danger',
        'pending': 'warning',
        'cancelled': 'info'
      };
      return typeMap[status] || 'info';
    },
    
    // 申诉状态相关方法
    getAppealStatusText(status) {
      const statusMap = {
        'none': '无申诉',
        'pending': '申诉中',
        'approved': '申诉通过',
        'rejected': '申诉被拒'
      };
      return statusMap[status] || '未知';
    },
    getAppealStatusType(status) {
      const typeMap = {
        'none': 'info',
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
      };
      return typeMap[status] || 'info';
    },
    
    // 查看详情
    viewViolationDetail(violation) {
      this.selectedViolation = violation;
      this.detailDialogVisible = true;
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
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

/* 统计卡片样式 */
.statistics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: #fff;
}

.stat-icon.warning {
  background: linear-gradient(135deg, #ff9a56, #ff6b6b);
}

.stat-icon.danger {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.stat-icon.info {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.stat-icon.success {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: #333;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 筛选区域样式 */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-left {
  display: flex;
  align-items: center;
}

.filter-right {
  display: flex;
  align-items: center;
}

/* 表格区域样式 */
.table-section {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.table-header h3 {
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

/* 分页样式 */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情对话框样式 */
.violation-detail {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-item .label {
  font-weight: 600;
  color: #606266;
  min-width: 100px;
  margin-right: 10px;
}

.detail-item .value {
  color: #303133;
  flex: 1;
}

.history-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.history-summary p {
  margin: 5px 0;
  color: #606266;
}

.history-summary strong {
  color: #409eff;
}
</style>