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
            <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="已确认违约" value="confirmed" />
              <el-option label="申诉中" value="appeal_pending" />
              <el-option label="申诉通过" value="appeal_approved" />
              <el-option label="申诉被拒" value="appeal_rejected" />
            </el-select>
            <el-select v-model="filterVenue" placeholder="场馆" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="乒乓球馆" value="乒乓球馆" />
              <el-option label="羽毛球馆" value="羽毛球馆" />
              <el-option label="篮球馆" value="篮球馆" />
              <el-option label="健身房" value="健身房" />
              <el-option label="网球场" value="网球场" />
              <el-option label="攀岩馆" value="攀岩馆" />
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
            <el-table-column prop="status" label="处理状态" width="120">
              <template #default="scope">
                <el-tag :type="getCombinedStatusType(scope.row)" size="small">
                  {{ getCombinedStatusText(scope.row) }}
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
                <el-tag :type="getCombinedStatusType(selectedViolation)" size="small">
                  {{ getCombinedStatusText(selectedViolation) }}
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { Warning, User, Calendar, TrendCharts, Search } from '@element-plus/icons-vue'
import { getViolationRecords, getViolationDetail, confirmViolation, cancelViolation } from '../utils/api';

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
      
      // 加载状态
      loading: false,
      
      // 违约记录数据
      violations: []
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
        if (this.filterStatus === 'confirmed') {
          filtered = filtered.filter(v => v.appealStatus === 'none');
        } else if (this.filterStatus === 'appeal_pending') {
          filtered = filtered.filter(v => v.appealStatus === 'pending');
        } else if (this.filterStatus === 'appeal_approved') {
          filtered = filtered.filter(v => v.appealStatus === 'approved');
        } else if (this.filterStatus === 'appeal_rejected') {
          filtered = filtered.filter(v => v.appealStatus === 'rejected');
        }
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
  async mounted() {
    await this.fetchViolationData();
  },
  methods: {
    // 获取违约数据
    async fetchViolationData() {
      this.loading = true;
      try {
        const response = await getViolationRecords({
          page: this.currentPage,
          pageSize: this.pageSize,
          status: this.filterStatus,
          venue: this.filterVenue,
          dateRange: this.dateRange,
          keyword: this.searchKeyword
        });
        
        if (response && response.data && response.data.code === 200) {
          this.violations = response.data.data || [];
        } else {
          // 如果API未实现，使用模拟数据
          this.violations = [
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
            },
            {
              id: 5,
              userName: "陈华",
              userId: "987654",
              violationTime: "2024-01-19 09:00",
              venue: "网球场",
              timeSlot: "9:00-10:00",
              violationType: "late_checkin",
              status: "confirmed",
              appealStatus: "none",
              appealTime: "",
              appealReason: "",
              rejectReason: "",
              userViolationCount: 2,
              lastViolationTime: "2024-01-15 14:00"
            },
            {
              id: 6,
              userName: "刘强",
              userId: "567890",
              violationTime: "2024-01-20 15:00",
              venue: "攀岩馆",
              timeSlot: "15:00-16:00",
              violationType: "no_checkin",
              status: "confirmed",
              appealStatus: "pending",
              appealTime: "2024-01-20 16:00",
              appealReason: "设备故障，无法正常使用",
              rejectReason: "",
              userViolationCount: 1,
              lastViolationTime: ""
            }
          ];
        }
      } catch (error) {
        console.error('获取违约数据失败:', error);
        ElMessage.error('获取违约数据失败');
        // 使用模拟数据作为后备
        this.violations = [];
      } finally {
        this.loading = false;
      }
    },

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
    
    // 综合状态相关方法
    getCombinedStatusText(violation) {
      if (violation.appealStatus === 'none') {
        return '已确认违约';
      } else if (violation.appealStatus === 'pending') {
        return '申诉中';
      } else if (violation.appealStatus === 'approved') {
        return '申诉通过';
      } else if (violation.appealStatus === 'rejected') {
        return '申诉被拒';
      }
      return '未知';
    },
    getCombinedStatusType(violation) {
      if (violation.appealStatus === 'none') {
        return 'danger';
      } else if (violation.appealStatus === 'pending') {
        return 'warning';
      } else if (violation.appealStatus === 'approved') {
        return 'success';
      } else if (violation.appealStatus === 'rejected') {
        return 'danger';
      }
      return 'info';
    },
    
    // 查看详情
    async viewViolationDetail(violation) {
      try {
        const response = await getViolationDetail(violation.id);
        if (response && response.data && response.data.code === 200) {
          this.selectedViolation = response.data.data;
        } else {
          this.selectedViolation = violation;
        }
      } catch (error) {
        console.error('获取违约详情失败:', error);
        this.selectedViolation = violation;
      }
      this.detailDialogVisible = true;
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fetchViolationData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchViolationData();
    }
  }
};
</script>

<style src="../styles/admin-sidebar.css"></style>
<style src="../styles/violation-management.css"></style>