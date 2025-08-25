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
              <div class="stat-number">{{ pendingPosts.length }}</div>
              <div class="stat-label">待审核帖子</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon reports">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingReports.length }}</div>
              <div class="stat-label">待处理举报</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon approved">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ approvedCount }}</div>
              <div class="stat-label">已通过帖子</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon rejected">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ rejectedCount }}</div>
              <div class="stat-label">已拒绝帖子</div>
            </div>
          </div>
        </div>

        <!-- 快速操作区域 -->
        <div class="quick-actions">
          <el-button type="success" size="large" @click="handleBatchApprove">
            <el-icon><Check /></el-icon>
            批量通过
          </el-button>
          <el-button type="danger" size="large" @click="handleBatchReject">
            <el-icon><Close /></el-icon>
            批量拒绝
          </el-button>
          <el-button type="warning" size="large" @click="handleBatchIgnore">
            <el-icon><View /></el-icon>
            批量忽略举报
          </el-button>
          <el-button type="info" size="large" @click="exportPostData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
          <el-tabs v-model="activeTab" class="demo-tabs">
            <el-tab-pane label="待审核帖子" name="pending">
              <div class="tab-content">
                <div class="tab-header">
                  <h3>待审核的帖子列表</h3>
                  <el-tag type="warning" size="small">{{ pendingPosts.length }} 条待审核</el-tag>
                </div>
                
                <el-table :data="pendingPosts" v-loading="postLoading" style="width: 100%">
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="title" label="帖子标题" min-width="200">
                    <template #default="scope">
                      <div class="post-title">
                        <el-icon><Document /></el-icon>
                        <span>{{ scope.row.title }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="author" label="发布者" width="120" />
                  <el-table-column prop="publishTime" label="发布时间" width="180" />
                  <el-table-column prop="category" label="分类" width="100">
                    <template #default="scope">
                      <el-tag type="info" size="small">{{ scope.row.category || '未分类' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="审核状态" width="120">
                    <template #default="scope">
                      <el-tag type="warning" size="small">
                        <el-icon><Clock /></el-icon>
                        待审核
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                      <el-button size="small" type="primary" @click="viewPost(scope.row)">
                        <el-icon><View /></el-icon>
                        查看内容
                      </el-button>
                      <el-button size="small" type="success" @click="handleApprove(scope.row)">
                        <el-icon><Check /></el-icon>
                        通过
                      </el-button>
                      <el-button size="small" type="danger" @click="handleReject(scope.row)">
                        <el-icon><Close /></el-icon>
                        拒绝
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div v-if="pendingPosts.length === 0" class="no-data">
                  <el-empty description="暂无待审核的帖子" :image-size="200">
                    <el-button type="primary" @click="refreshData">刷新数据</el-button>
                  </el-empty>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="举报信息" name="reports">
              <div class="tab-content">
                <div class="tab-header">
                  <h3>待处理的举报信息</h3>
                  <el-tag type="danger" size="small">{{ pendingReports.length }} 条举报</el-tag>
                </div>
                
                <el-table :data="pendingReports" v-loading="reportLoading" style="width: 100%">
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="reportTime" label="举报时间" width="180" />
                  <el-table-column prop="reporter" label="举报人" width="120" />
                  <el-table-column prop="reason" label="举报原因" min-width="200">
                    <template #default="scope">
                      <div class="report-reason">
                        <el-icon><Warning /></el-icon>
                        <span>{{ scope.row.reason }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="reportedType" label="举报类型" width="120">
                    <template #default="scope">
                      <el-tag :type="getReportTypeTag(scope.row.reportedType)" size="small">
                        {{ scope.row.reportedType }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="处理状态" width="120">
                    <template #default="scope">
                      <el-tag type="warning" size="small">
                        <el-icon><Clock /></el-icon>
                        待处理
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                      <el-button size="small" type="primary" @click="viewReport(scope.row)">
                        <el-icon><View /></el-icon>
                        查看内容
                      </el-button>
                      <el-button size="small" type="info" @click="handleIgnoreReport(scope.row)">
                        <el-icon><View /></el-icon>
                        忽略举报
                      </el-button>
                      <el-button size="small" type="danger" @click="handleDeleteContent(scope.row)">
                        <el-icon><Delete /></el-icon>
                        删除内容
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div v-if="pendingReports.length === 0" class="no-data">
                  <el-empty description="暂无待处理的举报" :image-size="200">
                    <el-button type="primary" @click="refreshData">刷新数据</el-button>
                  </el-empty>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 内容详情对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <div class="content-detail">
        <div class="content-header">
          <h4>{{ currentContent.title }}</h4>
          <div class="content-meta">
            <el-tag type="info" size="small">{{ currentContent.author || '匿名用户' }}</el-tag>
            <el-tag type="success" size="small">{{ currentContent.publishTime || '未知时间' }}</el-tag>
          </div>
        </div>
        <div class="content-body">
          <p>{{ currentContent.content }}</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="dialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { 
  ElMessage, 
  ElMessageBox 
} from 'element-plus';
import { 
  Clock, 
  Warning, 
  CircleCheck, 
  CircleClose,
  Check,
  Close,
  View,
  Download,
  Document,
  Delete
} from '@element-plus/icons-vue';
// 导入所有需要的API函数
import { getPendingPosts, approvePost, rejectPost, getPendingReports, processReport } from '../utils/api';
import '../styles/post-management.css';
import AdminHeaderNavbar from '../components/AdminHeaderNavbar.vue';

const activeTab = ref('pending'); 

// 帖子审核模块的状态
const postLoading = ref(true);
const pendingPosts = ref([]);

// 举报信息模块的状态
const reportLoading = ref(true);
const pendingReports = ref([]);
const hasLoadedReports = ref(false); 

// 通用弹窗的状态
const dialogVisible = ref(false);
const dialogTitle = ref('');
const currentContent = ref({ title: '', content: '', author: '', publishTime: '' });

// 统计计算（避免误导，默认显示 0；如需真实统计，请从后端接口获取）
const approvedCount = computed(() => {
  return 0;
});

const rejectedCount = computed(() => {
  return 0;
});

// 帖子审核相关函数
const fetchPendingPosts = async () => {
  postLoading.value = true;
  try {
    const response = await getPendingPosts();
    pendingPosts.value = response?.data?.data ?? [];
  } catch (error) {
    ElMessage.error("获取待审核帖子失败");
    pendingPosts.value = [];
  } finally {
    postLoading.value = false;
  }
};

const handleReviewAction = async (apiCall, post, successMessage) => {
  try {
    const response = await apiCall(post.id);
    if (response?.data?.code === 200) {
      ElMessage.success(successMessage);
      await fetchPendingPosts(); // 重新加载数据
    } else {
      ElMessage.error(response?.data?.message || "操作失败");
    }
  } catch (error) {
    ElMessage.error("请求失败");
  }
};

// 举报信息相关函数
const fetchPendingReports = async () => {
  reportLoading.value = true;
  try {
    const response = await getPendingReports();
    pendingReports.value = response?.data?.data ?? [];
    hasLoadedReports.value = true;
  } catch (error) {
    ElMessage.error("获取举报信息失败");
    pendingReports.value = [];
  } finally {
    reportLoading.value = false;
  }
};

const handleReportAction = async (report, action, successMessage, confirmMessage, finalMessage) => {
  try {
    await ElMessageBox.confirm(confirmMessage, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    const response = await processReport(report.id, action);
    if (response?.data?.code === 200) {
      ElMessage.success(finalMessage);
      await fetchPendingReports(); // 重新加载数据
    } else {
      ElMessage.error(response?.data?.message || "操作失败");
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error("请求失败");
    }
  }
};

//事件处理函数

// 帖子审核的事件处理
onMounted(fetchPendingPosts); // 页面加载后，默认加载待审核帖子

const viewPost = (post) => {
  dialogTitle.value = '帖子内容详情';
  currentContent.value = { 
    title: post.title, 
    content: post.content,
    author: post.author,
    publishTime: post.publishTime
  };
  dialogVisible.value = true;
};

const handleApprove = (post) => {
  handleReviewAction(approvePost, post, `帖子【${post.title}】已审核通过`);
};

const handleReject = (post) => {
  ElMessageBox.confirm(`确定要将帖子【${post.title}】设置为不通过吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    handleReviewAction(rejectPost, post, `帖子【${post.title}】已审核不通过`);
  });
};

// 举报信息的事件处理
const viewReport = (report) => {
    dialogTitle.value = '被举报内容详情';
    currentContent.value = { 
        title: `【${report.reportedType}】被举报 - 原因：${report.reason}`,
        content: report.reportedContent,
        author: report.reporter,
        publishTime: report.reportTime
    };
    dialogVisible.value = true;
};

const handleIgnoreReport = (report) => {
    handleReportAction(
        report, 
        'ignore', 
        '管理员已阅，忽略此举报', 
        '确定要忽略这条举报吗？此操作不会删除内容。',
        '该举报已忽略'
    );
};

const handleDeleteContent = (report) => {
    handleReportAction(
        report, 
        'delete_content',
        '管理员确认内容违规，已删除',
        `确定要删除这条【${report.reportedType}】内容吗？此操作不可恢复。`,
        '被举报的内容已删除'
    );
};

// 新增功能
const getReportTypeTag = (type) => {
  const typeMap = {
    '帖子': 'danger',
    '评论': 'warning',
    '用户': 'info'
  };
  return typeMap[type] || 'info';
};

const handleBatchApprove = () => {
  ElMessageBox.confirm('确定要批量通过选中的帖子吗？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    ElMessage.success('批量通过功能待实现');
  });
};

const handleBatchReject = () => {
  ElMessageBox.confirm('确定要批量拒绝选中的帖子吗？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('批量拒绝功能待实现');
  });
};

const handleBatchIgnore = () => {
  ElMessageBox.confirm('确定要批量忽略选中的举报吗？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    ElMessage.success('批量忽略功能待实现');
  });
};

const exportPostData = () => {
  ElMessage.success('导出功能待实现');
};

const refreshData = () => {
  if (activeTab.value === 'pending') {
    fetchPendingPosts();
  } else {
    fetchPendingReports();
  }
};

// 监听标签页切换，按需加载举报信息数据
watch(activeTab, (newTab) => {
  if (newTab === 'reports' && !hasLoadedReports.value) {
    fetchPendingReports();
  }
});

</script>


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

.stat-icon.reports {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-icon.approved {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.stat-icon.rejected {
  background: linear-gradient(135deg, #fa709a, #fee140);
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

.post-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-weight: 500;
}

.report-reason {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e6a23c;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 40px;
}

/* 内容详情对话框样式 */
.content-detail {
  max-height: 500px;
  overflow-y: auto;
}

.content-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.content-header h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.content-meta {
  display: flex;
  gap: 8px;
}

.content-body {
  line-height: 1.6;
  color: #606266;
}

.content-body p {
  margin: 0;
  white-space: pre-wrap;
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
}
</style>