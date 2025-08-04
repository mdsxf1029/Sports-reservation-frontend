帖子管理第二版
1839721
src\views\PostManagement.vue
@@ -1,68 +1,223 @@
<template>
  <div class="page-layout">
    <AdminMenuBar />
    <div class="page-content">
      <div class="post-management-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待审核帖子" name="pending">
        <el-table :data="pendingPosts" v-loading="postLoading" style="width: 100%">
          <el-table-column prop="title" label="帖子标题" width="300" />
          <el-table-column prop="publishTime" label="发布时间" width="180" />
          <el-table-column prop="status" label="审核状态" width="180" />
          <el-table-column label="操作">
            <template #default="scope">
              <a href="#" class="action-link" @click.prevent="viewPost(scope.row)">帖子内容</a>
              <a href="#" class="action-link" @click.prevent="handleApprove(scope.row)">通过</a>
              <a href="#" class="action-link" @click.prevent="handleReject(scope.row)">不通过</a>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="举报信息" name="reports">
        <el-table :data="pendingReports" v-loading="reportLoading" style="width: 100%">
          <el-table-column prop="reportTime" label="举报时间" width="200" />
          <el-table-column prop="reason" label="举报原因" width="250" />
          <el-table-column prop="reportedType" label="举报类型" width="120" />
          <el-table-column label="操作">
            <template #default="scope">
              <a href="#" class="action-link" @click.prevent="viewReport(scope.row)">查看内容</a>
              <a href="#" class="action-link" @click.prevent="handleIgnoreReport(scope.row)">忽略举报</a>
              <a href="#" class="action-link" @click.prevent="handleDeleteContent(scope.row)">删除内容</a>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <div class="post-content-display">
        <h3>{{ currentContent.title }}</h3>
        <p>{{ currentContent.content }}</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="dialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 导入所有需要的API函数
import { getPendingPosts, approvePost, rejectPost, getPendingReports, processReport } from '../utils/api';
import '../styles/post-management.css';
import AdminMenuBar from '../components/AdminMenuBar.vue';

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
const currentContent = ref({ title: '', content: '' });



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
      await fetchPendingPosts(); // 刷新帖子列表
    } else {
      ElMessage.error(response?.data?.message || "操作失败");
    }
  } catch (error) {
    ElMessage.error("请求失败，请联系管理员");
  }
};

// 举报信息相关函数
const fetchPendingReports = async () => {
  reportLoading.value = true;
  try {
    const response = await getPendingReports();
    pendingReports.value = response?.data?.data ?? [];
    hasLoadedReports.value = true; // 标记已加载
  } catch (error) {
    ElMessage.error("获取举报信息失败");
    pendingReports.value = [];
  } finally {
    reportLoading.value = false;
  }
};

const handleReportAction = async (report, action, remark, confirmText, successMessage) => {
    ElMessageBox.confirm(confirmText, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            const response = await processReport(report.id, { action, remark });
            if (response?.data?.code === 200) {
                ElMessage.success(successMessage);
                await fetchPendingReports(); // 刷新举报列表
            } else {
                ElMessage.error(response?.data?.message || "处理失败");
            }
        } catch (error) {
            ElMessage.error("请求失败，请联系管理员");
        }
    }).catch(() => {
        // 用户点击取消
    });
};


//事件处理函数

// 帖子审核的事件处理
onMounted(fetchPendingPosts); // 页面加载后，默认加载待审核帖子

const viewPost = (post) => {
  dialogTitle.value = '帖子内容详情';
  currentContent.value = { title: post.title, content: post.content };
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
        content: report.reportedContent 
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



// 监听标签页切换，按需加载举报信息数据
watch(activeTab, (newTab) => {
  if (newTab === 'reports' && !hasLoadedReports.value) {
    fetchPendingReports();
  }
});

</script>

<style src="../styles/admin-sidebar.css"></style>
<style scoped>
.page-layout {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
}
.page-content {
  flex: 1;
  padding: 20px;
  background: #fff;
  margin-left: 180px;
}

.post-content-display {
  max-height: 60vh;
  overflow-y: auto;
}
.post-content-display h3 {
  margin-top: 0;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}
.post-content-display p {
  font-size: 16px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
}
</style>