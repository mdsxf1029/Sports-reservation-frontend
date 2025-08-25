<template>
  <div class="page-layout">
    <AdminHeaderNavbar />
    <div class="page-content">
      <div class="post-management-container">
        <div class="statistics-section">
          <div class="stat-card">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingCount }}</div>
              <div class="stat-label">待审核帖子</div>
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
          <div class="stat-card">
            <div class="stat-icon reports">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingReportsCount }}</div>
              <div class="stat-label">待处理举报</div>
            </div>
          </div>
        </div>

        <div class="main-content">
          <el-tabs v-model="activeTab" class="demo-tabs">
            <el-tab-pane label="帖子审核" name="review">
              <div class="tab-content">
                <div class="tab-header">
                  <h3>帖子列表</h3>
                </div>
                
                <div class="filter-section">
                  <el-select v-model="filters.status" placeholder="审核状态" clearable style="width: 140px; margin-right: 10px;">
                    <el-option label="全部" value="" />
                    <el-option label="待审核" value="pending" />
                    <el-option label="已通过" value="approved" />
                    <el-option label="已拒绝" value="rejected" />
                  </el-select>
                  
                  <el-select v-model="filters.processor" placeholder="处理人" clearable style="width: 140px; margin-right: 10px;">
                    <el-option label="全部" value="" />
                    <el-option 
                      v-for="processor in availableProcessors" 
                      :key="processor" 
                      :label="processor" 
                      :value="processor" 
                    />
                  </el-select>
                  
                  <el-input
                    v-model="filters.keyword"
                    placeholder="搜索标题或作者"
                    style="width: 240px; margin-right: 10px;"
                    clearable
                    @keyup.enter="applyFilters"
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
                
                <el-table :data="tablePosts" v-loading="postLoading" style="width: 100%">
                  <el-table-column prop="post_title" label="帖子标题" min-width="250">
                    <template #default="scope">
                      <div class="post-title-cell">
                        <el-icon><Document /></el-icon>
                        <span>{{ scope.row.post_title }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="author" label="发布者" width="120" />
                  <el-table-column prop="post_time" label="发布时间" width="180" />
                  <el-table-column prop="processor" label="处理人" width="120">
                     <template #default="scope">
                      <span v-if="scope.row.processor">{{ scope.row.processor }}</span>
                      <span v-else class="text-placeholder">--</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="review_status" label="审核状态" width="120">
                    <template #default="scope">
                      <el-tag :type="getStatusType(scope.row.review_status)" size="small" effect="light">
                        <el-icon v-if="scope.row.review_status === 'pending'"><Clock /></el-icon>
                        <el-icon v-else-if="scope.row.review_status === 'approved'"><CircleCheck /></el-icon>
                        <el-icon v-else-if="scope.row.review_status === 'rejected'"><CircleClose /></el-icon>
                        <span class="status-text">{{ getStatusText(scope.row.review_status, 'post') }}</span>
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="220" fixed="right">
                    <template #default="scope">
                      <div class="action-buttons">
                        <el-button size="small" type="info" link @click="viewDetails(scope.row, 'post')">
                          <el-icon><View /></el-icon>
                          详情
                        </el-button>
                        <template v-if="scope.row.review_status === 'pending'">
                          <el-button size="small" type="success" @click="handleApprove(scope.row)">通过</el-button>
                          <el-button size="small" type="danger" @click="handleReject(scope.row)">拒绝</el-button>
                        </template>
                        <template v-else-if="scope.row.review_status === 'approved'">
                          <el-button size="small" type="danger" @click="handleReject(scope.row)">置为不通过</el-button>
                        </template>
                        <template v-else-if="scope.row.review_status === 'rejected'">
                           <el-button size="small" type="success" @click="handleApprove(scope.row)">重新通过</el-button>
                        </template>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div v-if="!postLoading && tablePosts.length === 0" class="no-data">
                  <el-empty description="暂无匹配的帖子记录" />
                </div>

                <div class="pagination-section" v-if="postTotal > 0">
                  <el-pagination
                    v-model:current-page="postCurrentPage"
                    v-model:page-size="postPageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="postTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                  />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="举报信息" name="reports">
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
                    <el-option label="待处理" value="pending" />
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
                      <el-tag :type="scope.row.type === '帖子' ? 'primary' : 'success'" size="small">
                        {{ scope.row.type }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="content_summary" label="被举报内容" min-width="250">
                    <template #default="scope">
                      <span class="report-content">{{ scope.row.content_summary }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="report_reason" label="举报原因" min-width="200">
                    <template #default="scope">
                      <span v-if="scope.row.report_reason">{{ scope.row.report_reason }}</span>
                      <span v-else class="text-placeholder">未填写</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="reporter" label="举报人" width="120" />
                  <el-table-column prop="status" label="处理状态" width="120">
                     <template #default="scope">
                      <el-tag :type="getStatusType(scope.row.status)" size="small" effect="light">
                        {{ getStatusText(scope.row.status, 'report') }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="220" fixed="right">
                    <template #default="scope">
                       <div class="action-buttons">
                        <el-button size="small" type="primary" link @click="viewDetails(scope.row, 'report')">
                          <el-icon><View /></el-icon>
                          详情
                        </el-button>
                        <template v-if="scope.row.status === 'pending'">
                          <el-button size="small" type="success" @click="handleProcessReport('accepted', scope.row)">接受</el-button>
                          <el-button size="small" type="danger" @click="handleProcessReport('rejected', scope.row)">驳回</el-button>
                        </template>
                        <template v-else-if="scope.row.status === 'accepted'">
                          <el-button size="small" type="danger" @click="handleProcessReport('rejected', scope.row)">撤销并驳回</el-button>
                        </template>
                        <template v-else-if="scope.row.status === 'rejected'">
                           <el-button size="small" type="success" @click="handleProcessReport('accepted', scope.row)">撤销并接受</el-button>
                        </template>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div v-if="!reportsLoading && tableReports.length === 0" class="no-data">
                  <el-empty description="暂无匹配的举报记录" />
                </div>

                <div class="pagination-section" v-if="reportTotal > 0">
                  <el-pagination
                    v-model:current-page="reportCurrentPage"
                    v-model:page-size="reportPageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="reportTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <div v-if="currentContent.view_type === 'post'">
        <h3>{{ currentContent.post_title }}</h3>
        <p><strong>作者：</strong> {{ currentContent.author }}</p>
        <p><strong>发布时间：</strong> {{ currentContent.post_time }}</p>
        <el-divider />
        <div v-html="currentContent.post_content"></div>
      </div>

      <div v-else-if="currentContent.view_type === 'report'">
          <p><strong>举报类型：</strong> <el-tag size="small" :type="currentContent.type === '帖子' ? 'primary' : 'success'">{{ currentContent.type }}</el-tag></p>
          <p><strong>举报人：</strong> {{ currentContent.reporter }}</p>
          <p><strong>被举报人：</strong> {{ currentContent.reported_user }}</p>
          <p><strong>举报时间：</strong> {{ currentContent.report_time }}</p>
          <p><strong>举报原因：</strong> {{ currentContent.report_reason || '未填写' }}</p>
          <el-divider />
          
          <h4>被举报内容详情</h4>
          
          <div v-if="currentContent.type === '帖子' && currentContent.reported_post_data" >
            <p><strong>标题：</strong>{{ currentContent.reported_post_data.post_title }}</p>
            <p><strong>作者：</strong>{{ currentContent.reported_post_data.author }}</p>
            <hr>
            <p v-html="currentContent.reported_post_data.post_content"></p>
          </div>

          <div v-else-if="currentContent.type === '评论'" >
            <p>{{ currentContent.full_content || currentContent.content_summary }}</p>
          </div>

          <div v-else>
            <p><i>内容摘要：{{ currentContent.content_summary }}</i></p>
          </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
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
  Document,
  Search,
  Filter,
  Refresh
} from '@element-plus/icons-vue';
import AdminHeaderNavbar from '../components/AdminHeaderNavbar.vue';
import { 
  getPosts, 
  approvePost,
  rejectPost,
  getReports,
  processReport,
  fetchPostID
} from '../utils/api.js'; 

const activeTab = ref('review');

// --- 帖子管理状态 ---
const postLoading = ref(true);
const tablePosts = ref([]);
const postTotal = ref(0); 
const filters = ref({ status: '', processor: '', keyword: '' });
const postCurrentPage = ref(1);
const postPageSize = ref(5);

// --- 举报管理状态 ---
const reportsLoading = ref(true);
const tableReports = ref([]);
const reportTotal = ref(0);
const reportFilters = ref({ type: '', status: '', keyword: '' });
const reportCurrentPage = ref(1);
const reportPageSize = ref(5);

// --- 顶部统计卡片状态 ---
const pendingCount = ref(0);
const approvedCount = ref(0);
const rejectedCount = ref(0);
const pendingReportsCount = ref(0);

// --- 详情弹窗状态 ---
const dialogVisible = ref(false);
const dialogTitle = ref('');
const currentContent = ref({});
// 获取帖子列表数据
const fetchPosts = async () => {
  postLoading.value = true;
  try {
    const params = {
      page: postCurrentPage.value,
      pageSize: postPageSize.value,
      review_status: filters.value.status || undefined, // 如果为空字符串，则不传递该参数
      processor: filters.value.processor || undefined,
      keyword: filters.value.keyword || undefined,
    };
    const res = await getPosts(params);
    if (res.data.code === 200) {
      tablePosts.value = res.data.data.list;
      postTotal.value = res.data.data.total;
    } else {
      ElMessage.error(res.data.message || '获取帖子列表失败');
    }
  } catch (error) {
    console.error("请求帖子列表失败:", error);
    ElMessage.error('请求帖子列表时发生错误');
  } finally {
    postLoading.value = false;
  }
};

// 获取举报列表数据
const fetchReports = async () => {
  reportsLoading.value = true;
  try {
    const params = {
      page: reportCurrentPage.value,
      pageSize: reportPageSize.value,
      type: reportFilters.value.type || undefined,
      status: reportFilters.value.status || undefined,
      keyword: reportFilters.value.keyword || undefined,
    };
    const res = await getReports(params);
    if (res.data.code === 200) {
      tableReports.value = res.data.data.list;
      reportTotal.value = res.data.data.total;
    } else {
      ElMessage.error(res.data.message || '获取举报列表失败');
    }
  } catch (error) {
    console.error("请求举报列表失败:", error);
    ElMessage.error('请求举报列表时发生错误');
  } finally {
    reportsLoading.value = false;
  }
};

// 获取顶部统计卡片的数据
const fetchStats = async () => {
  try {
    const [pendingRes, approvedRes, rejectedRes, reportsRes] = await Promise.all([
      getPosts({ review_status: 'pending', pageSize: 1 }),
      getPosts({ review_status: 'approved', pageSize: 1 }),
      getPosts({ review_status: 'rejected', pageSize: 1 }),
      getReports({ status: 'pending', pageSize: 1 })
    ]);
    if (pendingRes.data.code === 200) pendingCount.value = pendingRes.data.data.total;
    if (approvedRes.data.code === 200) approvedCount.value = approvedRes.data.data.total;
    if (rejectedRes.data.code === 200) rejectedCount.value = rejectedRes.data.data.total;
    if (reportsRes.data.code === 200) pendingReportsCount.value = reportsRes.data.data.total;
  } catch (error) {
    console.error("获取统计数据失败:", error);
  }
};


//计算属性
//page
const availableProcessors = computed(() => {
  const processors = tablePosts.value.map(post => post.processor).filter(p => p);
  return [...new Set(processors)];
});

// --- 事件处理 ---

// 统一处理帖子审核通过/重新通过操作
const handleApprove = (post) => {
  const confirmMessage = post.review_status === 'rejected' 
    ? `确定要将已拒绝的帖子【${post.post_title}】重新设置为通过吗？` 
    : `确定要通过帖子【${post.post_title}】吗？`;
  ElMessageBox.confirm(confirmMessage, '确认操作', { type: 'warning' }).then(() => {
    handleReviewAction(approvePost, post.post_id);
  });
};

// 统一处理帖子拒绝/置为不通过操作
const handleReject = (post) => {
  const confirmMessage = post.review_status === 'approved' 
    ? `确定要将已通过的帖子【${post.post_title}】重新置为不通过吗？` 
    : `确定要拒绝帖子【${post.post_title}】吗？`;
  ElMessageBox.confirm(confirmMessage, '确认操作', { type: 'warning' }).then(() => {
    handleReviewAction(rejectPost, post.post_id);
  });
};

// 执行帖子审核的API调用
const handleReviewAction = async (apiCall, postId) => {
  try {
    const res = await apiCall(postId);
    if (res.data.code === 200) {
      ElMessage.success(res.data.message || '操作成功');
      fetchPosts(); // 重新加载当前页的帖子列表
      fetchStats(); // 更新顶部的统计数据
    } else {
      ElMessage.error(res.data.message || '操作失败');
    }
  } catch (e) {
    console.error("帖子审核操作失败:", e);
    ElMessage.error('操作请求失败');
  }
};

// 应用帖子筛选
const applyFilters = () => {
  postCurrentPage.value = 1; // 每次筛选都回到第一页
  fetchPosts();
};

// 重置帖子筛选
const resetFilters = () => {
  filters.value = { status: '', processor: '', keyword: '' };
  applyFilters(); // 重置后重新加载数据
};

// 处理举报
const handleProcessReport = (action, report) => {
  const actionText = action === 'accepted' ? '接受' : '驳回';
  const confirmMessage = `确定要"${actionText}"这条关于【${report.content_summary}】的举报吗?`;
  
  ElMessageBox.confirm(confirmMessage, '确认操作', { type: 'warning' }).then(async () => {
    try {
      const res = await processReport(report.report_id, { action });
      if (res.data.code === 200) {
        ElMessage.success(res.data.message || '操作成功');
        fetchReports(); // 重新加载举报列表
        fetchStats();   // 更新统计数据
      } else {
        ElMessage.error(res.data.message || '操作失败');
      }
    } catch (e) {
      console.error("处理举报失败:", e);
      ElMessage.error('处理举报请求失败');
    }
  });
};

// 应用举报筛选
const applyReportFilters = () => {
  reportCurrentPage.value = 1; // 每次筛选都回到第一页
  fetchReports();
};

// 重置举报筛选
const resetReportFilters = () => {
  reportFilters.value = { type: '', status: '', keyword: '' };
  applyReportFilters();
};

// 查看详情弹窗
const viewDetails = async (item, type) => {
  dialogTitle.value = type === 'post' ? '帖子内容详情' : '举报内容详情';
  
  let content = { view_type: type, ...item };

  if (type === 'report' && item.type === '帖子' && item.post_id) {
    try {
      const res = await fetchPostID(item.post_id); 
      if (res && res.data) { 
          content.reported_post_data = res.data; 
      } else {
          content.reported_post_data = { post_title: '帖子详情加载失败', post_content: '无法获取内容。' };
      }
    } catch (e) {
      console.error("获取被举报的帖子详情失败:", e);
      content.reported_post_data = { post_title: '帖子详情加载失败', post_content: '网络错误或接口异常。' };
    }
  }
  
  currentContent.value = content;
  dialogVisible.value = true;
};


onMounted(() => {
  // 页面加载时，初始化所有数据
  fetchStats();
  fetchPosts();
  fetchReports();
});

// 侦听分页变化，自动重新加载数据
watch([postCurrentPage, postPageSize], fetchPosts);
watch([reportCurrentPage, reportPageSize], fetchReports);


// --- 辅助函数 ---
const getStatusText = (status, type) => {
  const postMap = { 'pending': '待审核', 'approved': '已通过', 'rejected': '已拒绝' };
  const reportMap = { 'pending': '待处理', 'accepted': '已接受', 'rejected': '已驳回' };
  return type === 'post' ? (postMap[status] || '未知') : (reportMap[status] || '未知');
};

const getStatusType = (status) => {
  const typeMap = { 'pending': 'warning', 'approved': 'success', 'accepted': 'success', 'rejected': 'danger' };
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

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
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
</style>