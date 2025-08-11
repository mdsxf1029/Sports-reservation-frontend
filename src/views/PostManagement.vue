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
              <div class="stat-number">{{ allReports.filter(r => r.status === 'pending').length }}</div>
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
                
                <el-table :data="paginatedPosts" v-loading="postLoading" style="width: 100%">
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
                  <el-table-column prop="status" label="审核状态" width="120">
                    <template #default="scope">
                      <el-tag :type="getStatusType(scope.row.status)" size="small" effect="light">
                        <el-icon v-if="scope.row.status === 'pending'"><Clock /></el-icon>
                        <el-icon v-else-if="scope.row.status === 'approved'"><CircleCheck /></el-icon>
                        <el-icon v-else-if="scope.row.status === 'rejected'"><CircleClose /></el-icon>
                        <span class="status-text">{{ getStatusText(scope.row.status, 'post') }}</span>
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
                        <template v-if="scope.row.status === 'pending'">
                          <el-button size="small" type="success" @click="handleApprove(scope.row)">通过</el-button>
                          <el-button size="small" type="danger" @click="handleReject(scope.row)">拒绝</el-button>
                        </template>
                        <template v-else-if="scope.row.status === 'approved'">
                          <el-button size="small" type="danger" @click="handleReject(scope.row)">置为不通过</el-button>
                        </template>
                        <template v-else-if="scope.row.status === 'rejected'">
                           <el-button size="small" type="success" @click="handleApprove(scope.row)">重新通过</el-button>
                        </template>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div v-if="!postLoading && paginatedPosts.length === 0" class="no-data">
                  <el-empty description="暂无匹配的帖子记录" />
                </div>

                <div class="pagination-section" v-if="filteredPosts.length > 0">
                  <el-pagination
                    v-model:current-page="postCurrentPage"
                    v-model:page-size="postPageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="filteredPosts.length"
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
                
                <el-table :data="paginatedReports" v-loading="reportsLoading" style="width: 100%">
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
                
                <div v-if="!reportsLoading && paginatedReports.length === 0" class="no-data">
                  <el-empty description="暂无匹配的举报记录" />
                </div>

                <div class="pagination-section" v-if="filteredReports.length > 0">
                  <el-pagination
                    v-model:current-page="reportCurrentPage"
                    v-model:page-size="reportPageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="filteredReports.length"
                    layout="total, sizes, prev, pager, next, jumper"
                    @update:current-page="val => reportCurrentPage = val"
                    @update:page-size="val => reportPageSize = val"
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
            <p>{{ currentContent.reported_post_data.post_content }}</p>
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

const activeTab = ref('review');

// --- 帖子管理状态 ---
const postLoading = ref(true);
const allPosts = ref([]);
const filteredPosts = ref([]);
const filters = ref({ status: '', processor: '', keyword: '' });
const postCurrentPage = ref(1);
const postPageSize = ref(5);

// --- 举报管理状态 ---
const reportsLoading = ref(true);
const allReports = ref([]);
const filteredReports = ref([]);
const reportFilters = ref({ type: '', status: '', keyword: '' });
const reportCurrentPage = ref(1);
const reportPageSize = ref(5);

// =================================================================
// START: MOCK DATA & API (后端API完成后，请删除或注释掉此部分)
// =================================================================

const mockDatabase = {
  posts: [
    { post_id: 1, post_title: '关于我的思考', post_content: '我觉得要自律', author: '张三', post_time: '2025-08-10 10:00:00', status: 'pending', processor: null },
    { post_id: 2, post_title: '今天健身房人好多啊', post_content: '胸肌日，人山人海。', author: '李四', post_time: '2025-08-10 11:30:00', status: 'pending', processor: null },
    { post_id: 5, post_title: '求一份新手友好的蛋白粉推荐', post_content: '刚开始健身，求大佬推荐一款入门蛋白粉。', author: '王二麻', post_time: '2025-08-10 14:00:00', status: 'pending', processor: null },
    { post_id: 3, post_title: '羽毛球场地预约攻略', post_content: '周末想打球，场地总是约不到？教你几招。', author: '王五', post_time: '2025-08-09 09:00:00', status: 'approved', processor: '管理员A' },
    { post_id: 6, post_title: '【测评】新款筋膜枪深度体验', post_content: '对比了市面上三款主流筋膜枪，这是我的体验报告。', author: '测评家', post_time: '2025-08-08 20:15:00', status: 'approved', processor: '管理员B' },
    { post_id: 7, post_title: '篮球爱好者交流区', post_content: '明天下午有人一起组队打球吗？', author: '篮球小子', post_time: '2025-08-08 18:00:00', status: 'approved', processor: '管理员C' },
    { post_id: 4, post_title: '一个包含广告信息的帖子', post_content: '违规广告内容', author: '赵六', post_time: '2025-08-07 15:00:00', status: 'rejected', processor: '管理员A' },
    { post_id: 8, post_title: '寻狗启事：我的爱犬昨天走丢了', post_content: '违规，因为这是体育论坛。', author: '焦急的主人', post_time: '2025-08-06 12:00:00', status: 'rejected', processor: '管理员C' },
  ],
  reports: [
    { report_id: 101, type: '帖子', post_id: 4, content_summary: '一个包含广告信息的帖子', reporter: '热心用户A', reported_user: '赵六', report_reason: '垃圾广告', report_time: '2025-08-10 16:00:00', status: 'pending', processor: null },
    { report_id: 102, type: '评论', content_summary: '你懂个锤子，乱说！', reporter: '用户B', reported_user: '杠精', report_reason: '人身攻击', report_time: '2025-08-10 15:30:00', status: 'pending', processor: null },
    { report_id: 103, type: '帖子', post_id: 3, content_summary: '羽毛球场地预约攻略', reporter: '小报告', reported_user: '王五', report_reason: '', report_time: '2025-08-09 10:00:00', status: 'accepted', processor: '管理员A' },
    { report_id: 104, type: '评论', content_summary: '这个蛋白粉不好用，别买。', reporter: '体验者C', reported_user: '王二麻', report_reason: '虚假信息', report_time: '2025-08-09 11:00:00', status: 'rejected', processor: '管理员B' },
  ]
};

// 帖子API
const fetchPosts = async () => {
  postLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 500));
  allPosts.value = JSON.parse(JSON.stringify(mockDatabase.posts));
  applyFilters(); 
  postLoading.value = false;
};
const approvePost = async (postId) => {
  const post = allPosts.value.find(p => p.post_id === postId);
  if (post) { post.status = 'approved'; post.processor = '管理员x'; }
  return Promise.resolve({ data: { code: 200 } });
};
const rejectPost = async (postId) => {
  const post = allPosts.value.find(p => p.post_id === postId);
  if (post) { post.status = 'rejected'; post.processor = '管理员x'; }
  return Promise.resolve({ data: { code: 200 } });
};

// 举报API
const fetchReports = async () => {
  reportsLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 500));
  allReports.value = JSON.parse(JSON.stringify(mockDatabase.reports));
  applyReportFilters(); 
  reportsLoading.value = false;
};
const processReport = async (reportId, action) => {
  const report = allReports.value.find(r => r.report_id === reportId);
  if (report) { report.status = action; report.processor = '管理员x'; }
  return Promise.resolve({ data: { code: 200 } });
};

// =================================================================
// END: MOCK DATA & API
// =================================================================


//计算属性

const availableProcessors = computed(() => {
  const processors = allPosts.value.map(post => post.processor).filter(p => p);
  return [...new Set(processors)];
});

const pendingCount = computed(() => allPosts.value.filter(p => p.status === 'pending').length);
const approvedCount = computed(() => allPosts.value.filter(p => p.status === 'approved').length);
const rejectedCount = computed(() => allPosts.value.filter(p => p.status === 'rejected').length);

const paginatedPosts = computed(() => {
  const start = (postCurrentPage.value - 1) * postPageSize.value;
  return filteredPosts.value.slice(start, start + postPageSize.value);
});

const paginatedReports = computed(() => {
  const start = (reportCurrentPage.value - 1) * reportPageSize.value;
  return filteredReports.value.slice(start, start + reportPageSize.value);
});


// 事件处理

const handleApprove = (post) => {
  const confirmMessage = post.status === 'rejected' ? `确定要将已拒绝的帖子【${post.post_title}】重新设置为通过吗？` : `确定要通过帖子【${post.post_title}】吗？`;
  ElMessageBox.confirm(confirmMessage, '确认操作', { type: 'warning' }).then(() => handleReviewAction('approved', post));
};

const handleReject = (post) => {
  const confirmMessage = post.status === 'approved' ? `确定要将已通过的帖子【${post.post_title}】重新置为不通过吗？` : `确定要拒绝帖子【${post.post_title}】吗？`;
  ElMessageBox.confirm(confirmMessage, '确认操作', { type: 'warning' }).then(() => handleReviewAction('rejected', post));
};

const handleReviewAction = async (action, post) => {
  const apiCall = action === 'approved' ? approvePost : rejectPost;
  try {
    const res = await apiCall(post.post_id);
    if (res.data.code === 200) { ElMessage.success('操作成功'); applyFilters(); }
  } catch (e) { ElMessage.error('操作失败'); }
};

const applyFilters = () => {
  let temp = [...allPosts.value];
  if (filters.value.status) { temp = temp.filter(p => p.status === filters.value.status); }
  if (filters.value.processor) { temp = temp.filter(p => p.processor === filters.value.processor); }
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase();
    temp = temp.filter(p => p.post_title.toLowerCase().includes(keyword) || p.author.toLowerCase().includes(keyword));
  }
  filteredPosts.value = temp;
  postCurrentPage.value = 1;
};

const resetFilters = () => {
  filters.value = { status: '', processor: '', keyword: '' };
  applyFilters();
};

const handleProcessReport = (action, report) => {
  const actionText = action === 'accepted' ? '接受' : '驳回';
  const confirmMessage = `确定要"${actionText}"这条关于【${report.content_summary}】的举报吗?`;
  ElMessageBox.confirm(confirmMessage, '确认操作', { type: 'warning' }).then(async () => {
    try {
      const res = await processReport(report.report_id, action);
      if (res.data.code === 200) { ElMessage.success('操作成功'); applyReportFilters(); }
    } catch (e) { ElMessage.error('操作失败'); }
  });
};

const applyReportFilters = () => {
  let temp = [...allReports.value];
  if (reportFilters.value.type) { temp = temp.filter(r => r.type === reportFilters.value.type); }
  if (reportFilters.value.status) { temp = temp.filter(r => r.status === reportFilters.value.status); }
  if (reportFilters.value.keyword) {
    const keyword = reportFilters.value.keyword.toLowerCase();
    temp = temp.filter(r => 
      r.content_summary.toLowerCase().includes(keyword) ||
      r.reporter.toLowerCase().includes(keyword) ||
      (r.report_reason && r.report_reason.toLowerCase().includes(keyword))
    );
  }
  filteredReports.value = temp;
  reportCurrentPage.value = 1;
};

const resetReportFilters = () => {
  reportFilters.value = { type: '', status: '', keyword: '' };
  applyReportFilters();
};

const dialogVisible = ref(false);
const dialogTitle = ref('');
const currentContent = ref({});
const viewDetails = (item, type) => {
  dialogTitle.value = type === 'post' ? '帖子内容详情' : '举报内容详情';
  
  let content = { view_type: type, ...item };

  // 如果是查看举报，并且举报类型是帖子，则查找并附加完整的帖子数据
  if (type === 'report' && item.type === '帖子' && item.post_id) {
    const fullPost = allPosts.value.find(p => p.post_id === item.post_id);
    if (fullPost) {
      content.reported_post_data = fullPost; // 将找到的帖子数据附加到要显示的内容上
    }
  }
  
  currentContent.value = content;
  dialogVisible.value = true;
};

onMounted(() => {
  fetchPosts();
  fetchReports();
});

// 辅助函数 
const getStatusText = (status, type) => {
  const postMap = { 'pending': '待审核', 'approved': '已通过', 'rejected': '已拒绝' };
  const reportMap = { 'pending': '待处理', 'accepted': '已接受', 'rejected': '已驳回' };
  return type === 'post' ? postMap[status] : reportMap[status];
};
const getStatusType = (status) => {
  const typeMap = { 'pending': 'warning', 'approved': 'success', 'accepted': 'success', 'rejected': 'danger', 'info': 'info' };
  return typeMap[status] || 'primary';
};
</script>

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