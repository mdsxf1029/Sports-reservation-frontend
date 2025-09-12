<template>
  <div class="violation-page-layout">
    <AdminHeaderNavbar />
    <div class="violation-page-content">
      <div class="post-management-container">
        <!-- 违约统计卡片 -->
        <div class="violation-statistics-cards">
          <div class="violation-stat-card">
            <div class="violation-stat-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="violation-stat-content">
              <div class="violation-stat-number">{{ allViolationCount }}</div>
              <div class="violation-stat-label">总违约次数</div>
            </div>
          </div>
          <div class="violation-stat-card">
            <div class="violation-stat-icon danger">
              <el-icon><User /></el-icon>
            </div>
            <div class="violation-stat-content">
              <div class="violation-stat-number">{{ userCount }}</div>
              <div class="violation-stat-label">违约用户数</div>
            </div>
          </div>
          <div class="violation-stat-card">
            <div class="violation-stat-icon info">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="violation-stat-content">
              <div class="violation-stat-number">{{ todayCount }}</div>
              <div class="violation-stat-label">今日违约</div>
            </div>
          </div>
          <div class="violation-stat-card">
            <div class="violation-stat-icon success">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="violation-stat-content">
              <div class="violation-stat-number">{{ violationRate }}%</div>
              <div class="violation-stat-label">违约率</div>
            </div>
          </div>
        </div>

        <!-- 筛选和搜索区域 -->
        <div class="violation-filter-section">
          <div class="violation-filter-left">
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
          <div class="violation-filter-right">
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
            <el-button type="primary" @click="applyFilters">
              <el-icon><Filter /></el-icon>
              应用筛选
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>

        <!-- 违约记录表格 -->
        <div class="violation-table-section">
          <div class="violation-table-header">
            <h3>违约记录列表</h3>
            <el-tag type="info" size="small">{{ totalCount }} 条记录</el-tag>
          </div>
          
          <el-table :data="violations" style="width: 100%" stripe>
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="userName" label="用户名" width="120" />
            <el-table-column prop="userId" label="用户ID" width="120" />
            <el-table-column prop="violationTime" label="违约时间" width="250">
              <template #default="scope">
                {{ formatViolationTime(scope.row.violationTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="venue" label="预约场馆" width="250" />
            <el-table-column prop="timeSlot" label="预约时间段" width="220" />
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
          
          <div v-if="totalCount === 0" class="no-data">
            暂无违约记录
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalCount > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 违约详情对话框 -->

    
    <!-- 历史违约记录弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="违约记录详情"
      width="700px"
      :close-on-click-modal="false"
      :show-close="false"
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
              <span class="value">{{ formatViolationTime(selectedViolation.violationTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">预约场馆：</span>
              <span class="value">{{ selectedViolation.venue }}</span>
            </div>
            <div class="detail-item">
              <span class="label">预约时间段：</span>
              <span class="value">{{ selectedViolation.timeSlot }}</span>
            </div>
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
import { Warning, User, Calendar, TrendCharts, Search, Filter, Refresh } from '@element-plus/icons-vue'
import { getViolationRecords } from '../utils/api';
import { formatViolationTime } from '../utils/formatters';

export default {
  name: "ViolationManagement",
  components: { 
    AdminHeaderNavbar,
    Warning,
    User,
    Calendar,
    TrendCharts,
    Search,
    Filter,
    Refresh
  },
  data() {
    return {
      // 筛选条件
      dateRange: [],
      searchKeyword: '',
      
      // 分页
      currentPage: 1,
      pageSize: 20,
      totalCount: 0,

      // 统计信息
      allViolationCount: 0,
      userCount: 0,
      todayCount: 0,
      allAppointmentCount: 0,
      
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
    violationRate() {
      // 模拟计算违约率（实际应该基于总预约数）
      return ((this.allViolationCount / this.allAppointmentCount) * 100).toFixed(1);
    },
  },
  async mounted() {
    await this.fetchViolationData();
    
    // 监听申诉状态变化，自动刷新数据
    this.setupDataRefreshListener();
  },
  setup() {
    return {
      formatViolationTime
    }
  },
  methods: {
    // 获取违约数据
    async fetchViolationData() {
      this.loading = true;
      try {
        const response = await getViolationRecords({
          page: this.currentPage,
          pageSize: this.pageSize,
          dateRange: this.dateRange,
          keyword: this.searchKeyword
        });
        
        if (response && response.data && response.data.success) {
          this.totalCount = response.data.totalCount || 0;
          this.allViolationCount = response.data.allViolationCount || 0;
          this.userCount = response.data.userCount || 0;
          this.todayCount = response.data.todayCount || 0;
          this.allAppointmentCount = response.data.allAppointmentCount || 0;
          
          // 转换数据格式以匹配前端组件
          this.violations = (response.data.data || []).map(violation => {
            const date = violation.violationDate;            
            const startTime = violation.timeSlot.split('-')[0];

            return{
              id: violation.id,
              userName: violation.userName,
              userId: violation.userId.toString(),
              violationTime: `${date} ${startTime}:00`,
              venue: violation.venue,
              timeSlot: violation.timeSlot,
              status: 'confirmed',
              appealStatus: violation.appealStatus || 'none', // 使用后端申诉状态
              appealTime: violation.appealTime || '',
              appealReason: violation.appealReason || '',
              rejectReason: violation.rejectReason || '',
            };
            
          });
        } else {
          // 如果API未实现，使用模拟数据
          this.violations = [
            {
              id: 1,
              userName: "夏浩博",
              userId: "123456",
              violationTime: "2024-01-15T08:00:00",
              venue: "乒乓球馆",
              timeSlot: "8:00-9:00",
              status: "confirmed",
              appealStatus: "pending",
              appealTime: "2024-01-15T09:30:00",
              appealReason: "下雨，路滑，无法前往",
              rejectReason: "",
              userViolationCount: 2,
              lastViolationTime: "2024-01-10T14:00:00"
            },
            {
              id: 2,
              userName: "李明",
              userId: "654321",
              violationTime: "2024-01-16T14:00:00",
              venue: "羽毛球馆",
              timeSlot: "14:00-15:00",
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
              violationTime: "2024-01-17T16:00:00",
              venue: "篮球馆",
              timeSlot: "16:00-17:00",
              status: "confirmed",
              appealStatus: "approved",
              appealTime: "2024-01-17T17:00:00",
              appealReason: "身体不适，有医院证明",
              rejectReason: "",
              userViolationCount: 3,
              lastViolationTime: "2024-01-12T10:00:00"
            },
            {
              id: 4,
              userName: "张伟",
              userId: "345678",
              violationTime: "2024-01-18T10:00:00",
              venue: "乒乓球馆",
              timeSlot: "10:00-11:00",
              status: "confirmed",
              appealStatus: "rejected",
              appealTime: "2024-01-18T11:00:00",
              appealReason: "忘记预约时间",
              rejectReason: "理由不充分，无法证明特殊情况",
              userViolationCount: 1,
              lastViolationTime: ""
            },
            {
              id: 5,
              userName: "陈华",
              userId: "987654",
              violationTime: "2024-01-19T09:00:00",
              venue: "网球场",
              timeSlot: "9:00-10:00",
              status: "confirmed",
              appealStatus: "none",
              appealTime: "",
              appealReason: "",
              rejectReason: "",
              userViolationCount: 2,
              lastViolationTime: "2024-01-15T14:00:00"
            },
            {
              id: 6,
              userName: "刘强",
              userId: "567890",
              violationTime: "2024-01-20T15:00:00",
              venue: "攀岩馆",
              timeSlot: "15:00-16:00",
              status: "confirmed",
              appealStatus: "pending",
              appealTime: "2024-01-20T16:00:00",
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
    
    // 查看详情
    viewViolationDetail(violation) {
      this.selectedViolation = violation;
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
    },

    // 筛选逻辑
    applyFilters() {
      this.currentPage = 1;
      this.fetchViolationData();
      ElMessage.success('筛选已应用');
    },
    resetFilters() {
      this.searchKeyword = '';
      this.dateRange = [];
      this.currentPage = 1;
      this.fetchViolationData();
      ElMessage.success('筛选已重置');
    },
    
    // 设置数据刷新监听器
    setupDataRefreshListener() {
      // 监听localStorage变化
      window.addEventListener('storage', this.handleStorageChange);
      
      // 定期检查刷新标志
      this.refreshCheckInterval = setInterval(() => {
        const refreshFlag = localStorage.getItem('violationDataNeedsRefresh');
        if (refreshFlag) {
          // 清除标志并刷新数据
          localStorage.removeItem('violationDataNeedsRefresh');
          this.fetchViolationData();
        }
      }, 1000); // 每秒检查一次
    },
    
    // 处理localStorage变化
    handleStorageChange(event) {
      if (event.key === 'violationDataNeedsRefresh') {
        this.fetchViolationData();
      }
    }
  },
  
  // 组件销毁时清理监听器
  beforeUnmount() {
    if (this.refreshCheckInterval) {
      clearInterval(this.refreshCheckInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange);
  }
};
</script>

<style src="../styles/violation-management.css"></style>