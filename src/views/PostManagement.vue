<template>
  <div class="page-layout">
    <AdminHeaderNavbar />
    <div class="page-content">
      <div class="post-management-container">
        <div class="statistics-section">
          <div class="stat-card">
            <div class="stat-icon pending">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingReportsCount }}</div>
              <div class="stat-label">待处理举报</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon reported-users"> 
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ reportedUsersCount }}</div> 
              <div class="stat-label">被举报人数量</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon rejected">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ rejectedReportsCount }}</div>
              <div class="stat-label">已驳回举报</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon reports">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalReportsCount }}</div>
              <div class="stat-label">累计举报总数</div>
            </div>
          </div>
        </div>

        <div class="main-content">
          <div class="tab-content">
            <div class="tab-header">
              <h3>举报列表</h3>
            </div>
            
            <div class="filter-section">
              <el-select v-model="reportFilters.type" placeholder="举报类型" clearable style="width: 140px; margin-right: 10px;">
                <el-option label="全部类型" value="" />
                <el-option label="帖子" value="帖子" />
                <el-option label="评论" value="评论" />
                </el-select>

              <el-select v-model="reportFilters.status" placeholder="处理状态" clearable style="width: 140px; margin-right: 10px;">
                <el-option label="全部状态" value="" />
                <el-option label="待处理" value="checking" />
                <el-option label="已接受" value="accepted" />
                <el-option label="已驳回" value="rejected" />
              </el-select>
              
              <el-input
                v-model="reportFilters.keyword"
                placeholder="搜索内容、举报人等"
                style="width: 240px; margin-right: 10px;"
                clearable
                @keyup.enter="applyReportFilters"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              
              <el-button type="primary" @click="applyReportFilters">
                <el-icon><Filter /></el-icon>
                应用筛选
              </el-button>
              
              <el-button @click="resetReportFilters">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </div>
            
            <el-table :data="tableReports" v-loading="reportsLoading" style="width: 100%">
              <el-table-column prop="type" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.type === '帖子' ? 'primary' : 'success'" size="small">{{ scope.row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="reportedPost.postTitle" label="被举报内容" min-width="250">
                <template #default="scope">
                  <span v-if="scope.row.type === '帖子'" class="report-content">
                    {{ scope.row.reportedPost.postTitle }}
                  </span>
                  <span v-else-if="scope.row.type === '评论'" class="report-content">
                    {{ scope.row.reportedComment.commentContent }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="reportReason" label="举报原因" min-width="200">
                <template #default="scope">
                  <span v-if="scope.row.reportReason">{{ scope.row.reportReason }}</span>
                  <span v-else class="text-placeholder">未填写</span>
                </template>
              </el-table-column>
              <el-table-column prop="reporter.username" label="举报人" width="120" />
              <el-table-column prop="reportStatus" label="处理状态" width="120">
                 <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.reportStatus)" size="small" effect="light">
                    {{ getStatusText(scope.row.reportStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" fixed="right">
                <template #default="scope">
                   <div class="action-buttons">
                    <el-button size="small" type="primary" link @click="viewDetails(scope.row)">
                      <el-icon><View /></el-icon>
                      详情
                    </el-button>
                    <template v-if="scope.row.reportStatus === 'checking'">
                      <el-button size="small" type="success" @click="handleProcessReport('accepted', scope.row)">接受</el-button>
                      <el-button size="small" type="danger" @click="handleProcessReport('rejected', scope.row)">驳回</el-button>
                    </template>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            
            <div v-if="!reportsLoading && tableReports.length === 0" class="no-data">
              <el-empty description="暂无匹配的举报记录" />
            </div>

            <div class="pagination-container" v-if="reportTotal > 0">
              <el-pagination
                v-model:current-page="reportCurrentPage"
                v-model:page-size="reportPageSize"
                :page-sizes="[5, 10, 20, 50]"
                :total="reportTotal"
                layout="total, sizes, prev, pager, next, jumper"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="dialogVisible" title="举报内容详情" width="700px">
      <div v-if="currentContent && currentContent.reporter">
        <p><strong>举报类型：</strong> 
            <el-tag size="small" :type="currentContent.type === '帖子' ? 'primary' : 'success'">
                {{ currentContent.type }}
            </el-tag>
        </p>
        <p><strong>举报人：</strong> {{ currentContent.reporter.username }}</p>
        <p><strong>被举报人：</strong> {{ currentContent.reportedUser.username }}</p>
        <p><strong>举报时间：</strong> {{ currentContent.reportTime }}</p>
        <p><strong>举报原因：</strong> {{ currentContent.reportReason || '未填写' }}</p>
        <el-divider />
        
        <h4>被举报内容详情</h4>
        
        <div v-if="currentContent.type === '帖子' && currentContent.reportedPost">
          <p><strong>标题：</strong>{{ currentContent.reportedPost.postTitle }}</p>
          <p><strong>作者：</strong>{{ currentContent.reportedUser.username }}</p>
          <hr>
          <p v-html="currentContent.reportedPost.postContent"></p>
        </div>

        <div v-else-if="currentContent.type === '评论' && currentContent.reportedComment">
            <p><strong>评论内容：</strong></p>
            <div class="report-content-preview">
                <p>{{ currentContent.reportedComment.commentContent }}</p>
            </div>
            <p class="mt-2"><strong>评论人：</strong>{{ currentContent.reportedUser.username }}</p>
        </div>

        <div v-else>
          <p><i>内容加载失败或无内容。</i></p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed} from 'vue';
import { 
  ElMessage, 
  ElMessageBox 
} from 'element-plus';
import { 
  Warning, 
  CircleCheck, 
  CircleClose,
  View,
  Document,
  Search,
  Filter,
  Refresh,
  User
} from '@element-plus/icons-vue';
import AdminHeaderNavbar from '../components/AdminHeaderNavbar.vue';
import { 
  getPostReports,
  processPostReport,
  getCommentReports,
  processCommentReport,
  deletePost,
  deleteComment,
} from '../utils/api.js'; 

// --- 举报管理状态 ---
const reportsLoading = ref(true);
const reportFilters = ref({ type: '', status: '', keyword: '' });
const reportCurrentPage = ref(1);
const reportPageSize = ref(10);
const dialogVisible = ref(false);
const currentContent = ref(null);
const allReports = ref([]);

// 获取举报列表数据
const fetchAllReports = async () => {
  reportsLoading.value = true;
  try {
    const [postReportsRes, commentReportsRes] = await Promise.all([
      getPostReports({ page: 1, pageSize: 99999 }),
      getCommentReports({ page: 1, pageSize: 99999 })
    ]);
    const postReports = postReportsRes.data.list.map(report => ({ ...report, type: '帖子' }));
    const commentReports = commentReportsRes.data.list.map(report => ({ ...report, type: '评论' }));
    allReports.value = [...postReports, ...commentReports];
  } catch (error) {
    console.error("请求所有举报列表失败:", error);
    ElMessage.error('请求所有举报列表时发生错误');
  } finally {
    reportsLoading.value = false;
  }
};

const filteredReports = computed(() => {
  let reports = allReports.value;

  if (reportFilters.value.status) {
    reports = reports.filter(r => r.reportStatus === reportFilters.value.status);
  }
  if (reportFilters.value.type) {
    reports = reports.filter(r => r.type === reportFilters.value.type);
  }
  if (reportFilters.value.keyword) {
    const keyword = reportFilters.value.keyword.toLowerCase();
    reports = reports.filter(r => {
      const reasonMatch = r.reportReason && r.reportReason.toLowerCase().includes(keyword);
      const reporterMatch = r.reporter.username && r.reporter.username.toLowerCase().includes(keyword);
      if (r.type === '帖子') {
        return (r.reportedPost.postTitle && r.reportedPost.postTitle.toLowerCase().includes(keyword)) || reasonMatch || reporterMatch;
      } else if (r.type === '评论') {
        return (r.reportedComment.commentContent && r.reportedComment.commentContent.toLowerCase().includes(keyword)) || reasonMatch || reporterMatch;
      }
      return false;
    });
  }
  return reports;
});

const reportTotal = computed(() => filteredReports.value.length);

const tableReports = computed(() => {
  const start = (reportCurrentPage.value - 1) * reportPageSize.value;
  const end = start + reportPageSize.value;
  return filteredReports.value.slice(start, end);
});

const pendingReportsCount = computed(() => allReports.value.filter(r => r.reportStatus === 'checking').length);
const rejectedReportsCount = computed(() => allReports.value.filter(r => r.reportStatus === 'rejected').length);
const totalReportsCount = computed(() => allReports.value.length);
const reportedUsersCount = computed(() => {
  if (!allReports.value || allReports.value.length === 0) {
    return 0;
  }
  const userIds = allReports.value.map(report => report.reportedUser.userId);
  const uniqueUserIds = new Set(userIds);
  return uniqueUserIds.size;
});

// --- 事件处理 ---

// 处理举报
const handleProcessReport = async (result, report) => {
 
  const adminId = localStorage.getItem('userId'); 

  if (!adminId) {
    ElMessage.error('管理员ID无效，请重新登录');
    return;
  }


  const processApi = report.type === '帖子' ? processPostReport : processCommentReport;
  const actionText = result === 'accepted' ? '接受' : '驳回';
  let reasons = '';

  if (result === 'rejected') {
    try {
      const { value } = await ElMessageBox.prompt(
        `请输入驳回该举报的理由：`,
        `确认驳回`,
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          inputPattern: /.+/, 
          inputErrorMessage: '必须填写驳回理由',
        }
      );
      reasons = value; 
    } catch {
      ElMessage.info('操作已取消');
      return; 
    }
  } else {
    reasons = '举报内容经核实有效，已接受处理。'; 
  }

  const data = {
    result,   
    reason: reasons,  
  };

  try {
    const res = await processApi(report.reportId, adminId, data);
    if (res.status === 200) {
      ElMessage.success(res.data.message || `${actionText}操作成功`);
      if (result === 'accepted') {
        try {
          if (report.type === '帖子') {
            const deleteRes = await deletePost(report.reportedPost.postId);
            if (deleteRes.status === 200) {
              ElMessage.success('违规帖子已成功删除');
            }
          } else if (report.type === '评论') {
            const deleteRes = await deleteComment(report.reportedComment.commentId);
            if (deleteRes.status === 200) {
              ElMessage.success('违规评论已成功删除');
            }
          }
        } catch (deleteError) {
          console.error("删除内容失败:", deleteError);
          ElMessage.error('删除被举报内容时发生错误');
        }
      }
      await fetchAllReports();
    } else {
      ElMessage.error(res.data.message || '操作失败');
    }
  } catch (e) {
    console.error("处理举报失败:", e);
    ElMessage.error('处理举报请求失败');
  }
};

const applyReportFilters = () => {
  reportCurrentPage.value = 1;
};

const resetReportFilters = () => {
  reportFilters.value = { type: '', status: '', keyword: '' };
  reportCurrentPage.value = 1;
};

const viewDetails = (item) => {
  currentContent.value = item;
  dialogVisible.value = true;
};

onMounted(() => {
  fetchAllReports();
});


// --- 辅助函数 ---
const getStatusText = (status) => {
  const reportMap = { 'checking': '待处理', 'accepted': '已接受', 'rejected': '已驳回' };
  return reportMap[status] || '未知';
};

const getStatusType = (status) => {
  const typeMap = { 'checking': 'warning', 'accepted': 'success', 'rejected': 'danger' };
  return typeMap[status] || 'info';
};
</script>

<style src="../styles/post-management.css" scoped></style>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-content {
  padding: 30px;
  background: #fff;
  margin-top: 80px;
  min-height: calc(100vh - 80px);
}

.post-management-container {
  max-width: 1400px;
  margin: 0 auto;
}

.statistics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #fff;
}

.stat-icon.pending { background-color: #e6a23c; }
.stat-icon.approved { background-color: #67c23a; }
.stat-icon.rejected { background-color: #f56c6c; }
.stat-icon.reports { background-color: #909399; }

.stat-number {
  font-size: 24px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.main-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.post-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.text-placeholder {
  color: #909399;
}

.status-text {
    vertical-align: middle;
    margin-left: 5px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons .el-button {
  margin: 0;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.pagination-container .el-pagination {
  --el-pagination-font-size: 14px;
  --el-pagination-bg-color: #fff;
  --el-pagination-text-color: #606266;
  --el-pagination-border-radius: 4px;
  --el-pagination-button-disabled-color: #c0c4cc;
  --el-pagination-button-disabled-bg-color: #fff;
  --el-pagination-hover-color: #2062ea;
}

/* 修复分页按钮样式 */
.pagination-container .el-pagination .el-pager li {
  min-width: 30px;
  height: 32px;
  line-height: 30px;
  margin: 0 2px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-container .el-pagination .el-pager li:hover {
  color: #2062ea;
  border-color: #2062ea;
}

.pagination-container .el-pagination .el-pager li.is-active {
  background-color: #2062ea;
  border-color: #2062ea;
  color: #fff;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

.report-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.report-content-preview {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-style: italic;
  color: #606266;
}
.stat-icon.reported-users { background-color: #409EFF; } 
.stat-icon.rejected { background-color: #f56c6c; }
.stat-icon.reports { background-color: #909399; }
</style>