<template>
  <div class="appeal-page-layout">
    <AdminHeaderNavbar />
    <div class="appeal-page-content">
      <div class="post-management-container">
        <!-- 统计概览卡片 -->
        <div class="appeal-statistics-section">
          <div class="appeal-stat-card">
            <div class="appeal-stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="appeal-stat-content">
              <div class="appeal-stat-number">{{ pendingCount }}</div>
              <div class="appeal-stat-label">待处理申诉</div>
            </div>
          </div>
          <div class="appeal-stat-card">
            <div class="appeal-stat-icon approved">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="appeal-stat-content">
              <div class="appeal-stat-number">{{ approvedCount }}</div>
              <div class="appeal-stat-label">申诉通过</div>
            </div>
          </div>
          <div class="appeal-stat-card">
            <div class="appeal-stat-icon rejected">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="appeal-stat-content">
              <div class="appeal-stat-number">{{ rejectedCount }}</div>
              <div class="appeal-stat-label">申诉被拒</div>
            </div>
          </div>
          <div class="appeal-stat-card">
            <div class="appeal-stat-icon blacklist">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="appeal-stat-content">
              <div class="appeal-stat-number">{{ userCount }}</div>
              <div class="appeal-stat-label">黑名单用户</div>
            </div>
          </div>
        </div>

        <!-- 快速操作区域 -->
        <div class="appeal-quick-actions">
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
        </div>

        <!-- 主要内容区域 -->
        <div class="appeal-main-content">
          <el-tabs v-model="currentTab" class="demo-tabs" @tab-click="handleTabClick">
            <el-tab-pane label="申诉审核" name="pending">
              <div class="appeal-tab-content">
                <div class="appeal-tab-header">
                  <h3>申诉申请列表</h3>
                  <div class="appeal-header-stats">
                    <el-tag type="warning" size="small">{{ pendingCount }} 条待处理</el-tag>
                    <el-tag type="success" size="small">{{ approvedCount }} 条已通过</el-tag>
                    <el-tag type="danger" size="small">{{ rejectedCount }} 条已拒绝</el-tag>
                  </div>
                </div>
                
                <!-- 筛选区域 -->
                <div class="appeal-filter-section">
                  <el-select v-model="appealStatusFilter" placeholder="申诉状态" clearable style="width: 120px; margin-right: 10px;">
                    <el-option label="全部" value="" />
                    <el-option label="待处理" value="pending" />
                    <el-option label="已通过" value="approved" />
                    <el-option label="已拒绝" value="rejected" />
                  </el-select>
                  
                  <el-input
                    v-model="searchKeyword"
                    placeholder="搜索用户名 / 用户ID / 申诉理由"
                    style="width: 300px; margin-right: 10px;"
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
                
                <el-table ref="appealTable" :data="appeals" style="width: 100%" @selection-change="onSelectionChange">
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="userName" label="用户名" width="120">
                    <template #default="scope">
                      <div class="appeal-user-info">
                        <el-avatar :size="32" :src="scope.row.userAvatar">
                          <el-icon><User /></el-icon>
                        </el-avatar>
                        <span>{{ scope.row.userName }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="userId" label="用户ID" width="120" />
                  <el-table-column prop="violationTime" label="违约时间" width="180">
                    <template #default="scope">
                      {{ formatAppealTime(scope.row.violationTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="venue" label="预约场馆" width="120">
                    <template #default="scope">
                      <div class="appeal-venue-info">
                        <el-icon><Location /></el-icon>
                        <span>{{ scope.row.venue }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="timeSlot" label="预约时间段" width="120" >
                    <template #default="scope">
                        {{ formatTimeSlot(scope.row.timeSlot) }}
                      </template>
                  </el-table-column>
                  <el-table-column prop="appealReason" label="申诉理由" min-width="200">
                    <template #default="scope">
                      <div class="appeal-appeal-reason">
                        <el-icon><ChatDotRound /></el-icon>
                        <span>{{ scope.row.appealReason }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="appealTime" label="申诉时间" width="180">
                    <template #default="scope">
                      {{ formatAppealTime(scope.row.appealTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="processor" label="处理人" width="120">
                    <template #default="scope">
                      <span v-if="scope.row.processor">{{ scope.row.processorName }}</span>
                      <span v-else style="color: #999;">未处理</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="processTime" label="处理时间" width="180">
                    <template #default="scope">
                      <span v-if="scope.row.processTime">{{ formatAppealTime(scope.row.processTime) }}</span>
                      <span v-else style="color: #999;">未处理</span>
                    </template>
                  </el-table-column>
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
                        <el-tag type="info" size="small" style="margin-left:12px">已处理</el-tag>
                      </div>
                    </template>
                  </el-table-column>

                  <template #empty>
                    <el-empty description="暂无申诉记录" :image-size="200">
                      <el-button type="primary" @click="refreshData">刷新数据</el-button>
                    </el-empty>
                  </template>
                </el-table>
                
                <!-- 分页 -->
                <div class="pagination-container" v-if="appealCount > 0">
                  <el-pagination
                    v-model:current-page="appealCurrentPage"
                    v-model:page-size="appealPageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="appealCount"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleAppealSizeChange"
                    @current-change="handleAppealCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="黑名单管理" name="blacklist">
              <div class="appeal-tab-content">
                <div class="appeal-tab-header">
                  <h3>黑名单用户管理</h3>
                  <div class="appeal-header-actions">
                    <el-tag type="danger" size="small">{{ userCount }} 人在黑名单</el-tag>
                    <el-button type="danger" size="small" @click="showAddBlacklistDialog">
                      <el-icon><User /></el-icon>
                      加入黑名单
                    </el-button>
                  </div>
                </div>
                
                <el-table ref="blacklistTable" :data="blacklistUsers" style="width: 100%" @selection-change="onSelectionUserChange">
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="userName" label="用户名" width="120">
                    <template #default="scope">
                      <div class="appeal-user-info">
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
                  <el-table-column prop="blacklistTime" label="加入黑名单时间" width="180">
                    <template #default="scope">
                      {{ formatBlacklistTime(scope.row.blacklistTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="endTime" label="黑名单结束时间" width="180">
                    <template #default="scope">
                      {{ formatBlacklistTime(scope.row.endTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="blacklistReason" label="加入原因" min-width="200">
                    <template #default="scope">
                      <div class="appeal-blacklist-reason">
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

                  <template #empty>
                    <el-empty description="暂无黑名单用户" :image-size="200">
                      <el-button type="primary" @click="refreshData">刷新数据</el-button>
                    </el-empty>
                  </template>
                </el-table>
                
                <!-- 分页 -->
                <div class="pagination-container" v-if="blacklistCount > 0">
                  <el-pagination
                    v-model:current-page="blacklistCurrentPage"
                    v-model:page-size="blacklistPageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="blacklistCount"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleBlacklistSizeChange"
                    @current-change="handleBlacklistCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 申诉详情查看对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="申诉详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedAppeal" class="appeal-detail">
        <div class="appeal-detail-section">
          <h4>申诉信息</h4>
          <div class="appeal-detail-grid">
            <div class="appeal-detail-item">
              <span class="label">用户：</span>
              <span class="value">{{ selectedAppeal.userName }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">违约时间：</span>
              <span class="value">{{ formatAppealTime(selectedAppeal.violationTime) }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">预约场馆：</span>
              <span class="value">{{ selectedAppeal.venue }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">预约时间段：</span>
              <span class="value">{{ formatTimeSlot(selectedAppeal.timeSlot) }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">申诉时间：</span>
              <span class="value">{{ formatAppealTime(selectedAppeal.appealTime) }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">申诉理由：</span>
              <span class="value">{{ selectedAppeal.appealReason }}</span>
            </div>
            <div class="appeal-detail-item" v-if="selectedAppeal.processor">
              <span class="label">处理人：</span>
              <span class="value">{{ selectedAppeal.processor }}</span>
            </div>
            <div class="appeal-detail-item" v-if="selectedAppeal.processTime">
              <span class="label">处理时间：</span>
              <span class="value">{{ formatAppealTime(selectedAppeal.processTime) }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">申诉状态：</span>
              <span class="value">
                <el-tag :type="getAppealStatusType(selectedAppeal.appealStatus)" size="small">
                  {{ getAppealStatusText(selectedAppeal.appealStatus) }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="appeal-dialog-footer">
          <el-button @click="detailDialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 加入黑名单对话框 -->
    <el-dialog
      v-model="addBlacklistDialogVisible"
      title="加入黑名单"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="addBlacklistForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="addBlacklistForm.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="addBlacklistForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="加入原因">
          <el-input 
            v-model="addBlacklistForm.blacklistReason" 
            type="textarea" 
            :rows="3"
            placeholder="请输入加入黑名单的原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addBlacklistDialogVisible = false">取 消</el-button>
          <el-button type="danger" @click="confirmAddBlacklist">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 申诉处理确认对话框 -->
    <el-dialog
      v-model="appealDialogVisible"
      :title="appealDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="appeal-detail">
        <div class="appeal-detail-section">
          <h4>申诉信息</h4>
          <div class="appeal-detail-grid">
            <div class="appeal-detail-item">
              <span class="label">用户：</span>
              <span class="value">{{ selectedAppeal?.userName }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">违约时间：</span>
              <span class="value">{{ formatAppealTime(selectedAppeal?.violationTime) }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">预约场馆：</span>
              <span class="value">{{ selectedAppeal?.venue }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">预约时间段：</span>
              <span class="value">{{ formatTimeSlot(selectedAppeal?.timeSlot) }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">申诉时间：</span>
              <span class="value">{{ formatAppealTime(selectedAppeal?.appealTime) }}</span>
            </div>
            <div class="appeal-detail-item">
              <span class="label">申诉理由：</span>
              <span class="value">{{ selectedAppeal?.appealReason }}</span>
            </div>
            <div class="appeal-detail-item" v-if="selectedAppeal?.processor">
              <span class="label">处理人：</span>
              <span class="value">{{ selectedAppeal?.processor }}</span>
            </div>
            <div class="appeal-detail-item" v-if="selectedAppeal?.processTime">
              <span class="label">处理时间：</span>
              <span class="value">{{ formatAppealTime(selectedAppeal?.processTime) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="appealAction === 'reject'" class="appeal-reject-reason">
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
        <span class="appeal-dialog-footer">
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
  Search,
  Filter,
  Refresh,
  Location,
  ChatDotRound,
  Warning,
  View
} from '@element-plus/icons-vue'
import { 
  getAppealRecords, 
  getAppealDetail, 
  submitAppeal,
  processAppeal, 
  batchProcessAppeals,
  getBlacklistUsers,
  addUserToBlacklist,
  removeUserFromBlacklist,
  batchRemoveFromBlacklist
} from '../utils/api';
import { formatAppealTime, formatBlacklistTime, formatTimeSlot } from '../utils/formatters';

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
      detailDialogVisible: false,
      addBlacklistDialogVisible: false,
      appealAction: '',
      selectedAppeal: null,
      rejectReason: '',
      
      // 分页
      appealCurrentPage: 1,
      appealPageSize: 20,
      appealCount: 0,
      blacklistCurrentPage: 1,
      blacklistPageSize: 20,
      blacklistCount: 0,
      
      // 加入黑名单表单
      addBlacklistForm: {
        userName: '',
        userId: '',
        blacklistReason: ''
      },
      
      // 筛选条件
      appealStatusFilter: '',
      processorFilter: '',
      searchKeyword: '',
      
      // 加载状态
      loading: false,
      
      // 申诉数据
      appeals: [],
      blacklistUsers: [],

      // 统计数据
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      userCount: 0,

      // 选中项目
      selected: [],
      selectedUsers: [],
    };
  },
  computed: {
    appealDialogTitle() {
      return this.appealAction === 'approve' ? '确认通过申诉' : '确认拒绝申诉';
    },
  },
  async mounted() {
    await this.fetchAppealData();
    await this.fetchBlacklistData();
  },
  setup() {
    return {
      formatBlacklistTime,
      formatAppealTime,
      formatTimeSlot
    }
  },
  methods: {
    // 获取申诉数据
    async fetchAppealData() {
      this.loading = true;
      try {
        const response = await getAppealRecords({
          page: this.appealCurrentPage,
          pageSize: this.appealPageSize,
          status: this.appealStatusFilter,
          keyword: this.searchKeyword
        });
        
        if (response?.data?.code === 200) {
          this.appeals = response.data.data || [];
          this.appealCount = response.data.total || 0;
          this.pendingCount = response.data.pendingCount || 0;
          this.approvedCount = response.data.approvedCount || 0;
          this.rejectedCount = response.data.rejectedCount || 0;
        } else {
          // 如果API未实现，使用模拟数据
          this.pendingAppeals = [
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
            },
            {
              id: 5,
              userName: "陈华",
              userId: "987654",
              userAvatar: "",
              violationTime: "2024-01-17 09:00",
              venue: "网球场",
              timeSlot: "9:00-10:00",
              appealReason: "天气原因，场地湿滑，申请取消违约",
              appealTime: "2024-01-17 10:30",
              appealStatus: "pending"
            },
            {
              id: 6,
              userName: "刘强",
              userId: "567890",
              userAvatar: "",
              violationTime: "2024-01-18 15:00",
              venue: "攀岩馆",
              timeSlot: "15:00-16:00",
              appealReason: "设备故障，无法正常使用，申请取消违约",
              appealTime: "2024-01-18 16:00",
              appealStatus: "pending"
            }
          ];
          
          this.processedAppeals = [
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
          ];
        }
      } catch (error) {
        console.error('获取申诉数据失败:', error);
        ElMessage.error('获取申诉数据失败');
        this.pendingAppeals = [];
        this.processedAppeals = [];
      } finally {
        this.loading = false;
      }
    },

    // 获取黑名单数据
    async fetchBlacklistData() {
      try {
        const response = await getBlacklistUsers({
          page: this.blacklistCurrentPage,
          pageSize: this.blacklistPageSize,
        });
        
        if (response && response.data && response.data.success) {
          // 后端返回的数据结构: { success: true, data: [...] }
          this.blacklistUsers = response.data.data || [];
          this.blacklistCount = response.data.totalCount || 0;
          this.userCount = response.data.userCount || 0;
          const violationCounts = response.data.violationCount || [];
          
          // 转换数据格式以匹配前端组件
          this.blacklistUsers = this.blacklistUsers.map(user => {
            const violationInfo = violationCounts.find(v => v.userId === user.userId);
            const violationCount = violationInfo ? violationInfo.count : 0;

            return{
              id: user.userId,
              userName: user.userName, 
              userId: user.userId.toString(),
              userAvatar: '',
              violationCount: violationCount, 
              blacklistTime: user.beginTime,
              endTime: user.endTime,
              blacklistReason: user.bannedReason || '违约次数过多'
            };
          });
        } else {
          // 如果API未实现，使用模拟数据
          this.blacklistUsers = [
            {
              id: 1,
              userName: "赵强",
              userId: "111111",
              userAvatar: "",
              violationCount: 3,
              blacklistTime: "2024-01-01 10:00",
              blacklistReason: "连续3次违约，自动加入黑名单"
            },
            {
              id: 2,
              userName: "李华",
              userId: "222222",
              userAvatar: "",
              violationCount: 5,
              blacklistTime: "2024-01-05 14:30",
              blacklistReason: "恶意违约，影响其他用户使用"
            }
          ];
        }
      } catch (error) {
        console.error('获取黑名单数据失败:', error);
        ElMessage.error('获取黑名单数据失败');
        this.blacklistUsers = [];
      }
    },

    async handleAppeal(appeal, action) {
      this.selectedAppeal = appeal;
      this.appealAction = action;
      this.rejectReason = '';
      this.appealDialogVisible = true;
    },
    
    async confirmAppeal() {
      try {
        const response = await processAppeal(
          this.selectedAppeal.id, 
          this.appealAction, 
          this.rejectReason
        );
        
        if (response && response.data && response.data.code === 200) {
          if (this.appealAction === 'approve') {
            ElMessage.success('申诉已通过，违约记录已取消');
          } else {
            ElMessage.info('申诉已拒绝');
          }
          
          // 重新获取数据
          await this.fetchAppealData();
          
          // 通知违约管理页面刷新数据
          localStorage.setItem('violationDataNeedsRefresh', Date.now().toString());
        } else {
          ElMessage.error(response?.data?.message || '处理申诉失败');
        }
      } catch (error) {
        console.error('处理申诉失败:', error);
        ElMessage.error('处理申诉失败');
      }
      
      this.appealDialogVisible = false;
    },
    
    async processAppeal(appeal, status) {
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
    
    async removeFromBlacklist(user) {
      try {
        const response = await removeUserFromBlacklist(user.userId, user.blacklistTime);
        
        if (response && response.data && response.data.code === 0) {
          const index = this.blacklistUsers.findIndex(item => item.id === user.id);
          if (index > -1) {
            this.blacklistUsers.splice(index, 1);
          }
          ElMessage.success('已从黑名单移除');
        } else {
          ElMessage.error(response?.data?.msg || '移除黑名单失败');
        }
      } catch (error) {
        console.error('移除黑名单失败:', error);
        ElMessage.error('移除黑名单失败');
      }
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
    
    // 查看申诉详情
    async viewAppealDetail(appeal) {
      try {
        const response = await getAppealDetail(appeal.id);
        if (response && response.data && response.data.code === 200) {
          this.selectedAppeal = response.data.data;
        } else {
          this.selectedAppeal = appeal;
        }
      } catch (error) {
        console.error('获取申诉详情失败:', error);
        this.selectedAppeal = appeal;
      }
      this.detailDialogVisible = true;
    },

    onSelectionChange(rows) {
      this.selected = rows || [];
    },

    onSelectionUserChange(rows) {
      this.selectedUsers = rows || [];
    },
    
    async handleBatchApprove() {
      if (!this.selected.length) {
        ElMessage.warning('请先选择要通过的申诉');
        return;
      }

      try {
        await ElMessageBox.confirm('确定要批量通过选中的申诉吗？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        });

        // 提取 id 数组
        const appealIds = this.selected
          .map(r => Number(r.id))
          .filter(id => !Number.isNaN(id));

        if (!appealIds.length) {
          ElMessage.error('未能识别选中申诉的 ID');
          return;
        }

        const response = await batchProcessAppeals(appealIds, 'approve');

        if (response && response.data && response.data.code === 200) {
          const processedCount = response.data.processedCount;
          const totalCount = appealIds.length;

          if (processedCount === 0) {
            ElMessage.info('没有可处理的待审核申诉');
          } else if (processedCount < totalCount) {
            ElMessage.success(`已成功处理 ${updatedCount} 条待审核申诉，${totalCount - processedCount} 条未处理（非待审核状态）`);
          } else {
            ElMessage.success(`已成功处理 ${processedCount} 条待审核申诉`);
          }
            
          if (this.$refs.appealTable && this.$refs.appealTable.clearSelection) {
            this.$refs.appealTable.clearSelection();
          }
          this.selected = [];
          await this.fetchAppealData();
        } else {
          ElMessage.error(response?.data?.message || '批量通过失败');
        }
      } catch (err) {
        // 用户取消或出错
        if (err === 'cancel' || err === 'close') return;
        console.error('批量通过失败:', err);
        ElMessage.error('批量通过失败');
      }
    },
    
    async handleBatchReject() {
      if (!this.selected.length) {
        ElMessage.warning('请先选择要拒绝的申诉');
        return;
      }

      try {
        await ElMessageBox.confirm('确定要批量拒绝选中的申诉吗？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });

        // 弹框要求输入拒绝理由
        ElMessageBox.prompt('请输入拒绝理由（必填）', '批量拒绝', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputPlaceholder: '填写拒绝理由',
        }).then(async ({ value }) => {
          const reason = (value || '').trim();
          if (!reason) {
            ElMessage.warning('请填写拒绝理由');
            return;
          }

          const appealIds = this.selected
            .map(r => Number(r.id))
            .filter(id => !Number.isNaN(id));

          if (!appealIds.length) {
            ElMessage.error('未能识别选中申诉的 ID');
            return;
          }

          const response = await batchProcessAppeals(appealIds, 'reject', reason);

          if (response && response.data && response.data.code === 200) {
            const processedCount = response.data.processedCount;
            const totalCount = appealIds.length;

            if (processedCount === 0) {
              ElMessage.info('没有可处理的待审核申诉');
            } else if (processedCount < totalCount) {
              ElMessage.success(`已成功处理 ${updatedCount} 条待审核申诉，${totalCount - processedCount} 条未处理（非待审核状态）`);
            } else {
              ElMessage.success(`已成功处理 ${processedCount} 条待审核申诉`);
            }

            if (this.$refs.appealTable && this.$refs.appealTable.clearSelection) {
              this.$refs.appealTable.clearSelection();
            }
            this.selected = [];
            await this.fetchAppealData();
          } else {
            ElMessage.error(response?.data?.message || '批量拒绝失败');
          }
        }).catch(() => {
        });

      } catch (err) {
        if (err === 'cancel' || err === 'close') return;
        console.error('批量拒绝失败:', err);
        ElMessage.error('批量拒绝失败');
      }
    },
    
    async handleBatchRemoveBlacklist() {
      if (!this.selectedUsers.length) {
        ElMessage.warning('请先选择要通过的申诉');
        return;
      }

      try {
        await ElMessageBox.confirm(`确定要批量移除选中的 ${this.selectedUsers.length} 个黑名单用户吗？`, '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        });

        // 构造请求体
        const selectedItems = this.selectedUsers.map(user => ({
            userId: user.userId,
            beginTime: user.blacklistTime
          }));

        const response = await batchRemoveFromBlacklist(selectedItems);

        if (response && response.data && response.data.code === 200) {
           ElMessage.success('批量移除成功');
            
          if (this.$refs.blacklistTable && this.$refs.blacklistTable.clearSelection) {
            this.$refs.blacklistTable.clearSelection();
          }
          this.selectedUsers = [];
          await this.fetchBlacklistData();
        } else {
          ElMessage.error(response?.data?.message || '批量移除失败');
        }
      } catch (err) {
        if (err === 'cancel' || err === 'close') return;
        console.error('批量移除失败:', err);
        ElMessage.error('批量移除失败');
      }
    },
    
    applyFilters() {
      this.fetchAppealData();
      ElMessage.success('筛选已应用');
    },
    
    resetFilters() {
      this.appealStatusFilter = '';
      this.processorFilter = '';
      this.searchKeyword = '';
      this.fetchAppealData();
      ElMessage.success('筛选已重置');
    },
    
    async refreshData() {
      await this.fetchAppealData();
      await this.fetchBlacklistData();
      ElMessage.success('数据已刷新');
    },

    handleTabClick(tab) {
      if (tab.props.name === 'pending') {
        this.appealStatusFilter = '';
        this.processorFilter = '';
        this.searchKeyword = '';
        this.fetchAppealData();
      }
    },
    
    // 加入黑名单相关方法
    showAddBlacklistDialog() {
      this.addBlacklistForm = {
        userName: '',
        userId: '',
        blacklistReason: ''
      };
      this.addBlacklistDialogVisible = true;
    },
    
    async confirmAddBlacklist() {
      if (!this.addBlacklistForm.userId || !this.addBlacklistForm.blacklistReason) {
        ElMessage.warning('请填写用户ID和加入原因');
        return;
      }
      
      try {
        const blacklistData = {
          id: parseInt(this.addBlacklistForm.userId),
          endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
          bannedReason: this.addBlacklistForm.blacklistReason
        };
        
        const response = await addUserToBlacklist(blacklistData);
        
        if (response && response.data && response.data.success) {
          this.addBlacklistDialogVisible = false;
          ElMessage.success('已成功加入黑名单');
          await this.fetchBlacklistData();
        } else {
          ElMessage.error(response?.data?.message || '加入黑名单失败');
        }
      } catch (error) {
        console.error('加入黑名单失败:', error);
        ElMessage.error('加入黑名单失败');
      }
    },
    
    // 分页处理方法
    handleAppealSizeChange(val) {
      this.appealPageSize = val;
      this.appealCurrentPage = 1;
      this.fetchAppealData();
    },
    
    handleAppealCurrentChange(val) {
      this.appealCurrentPage = val;
      this.fetchAppealData();
    },
    
    handleBlacklistSizeChange(val) {
      this.blacklistPageSize = val;
      this.blacklistCurrentPage = 1;
      this.fetchBlacklistData();
    },
    
    handleBlacklistCurrentChange(val) {
      this.blacklistCurrentPage = val;
      this.fetchBlacklistData();
    }
  }
};
</script>


<style src="../styles/appeal-management.css"></style>