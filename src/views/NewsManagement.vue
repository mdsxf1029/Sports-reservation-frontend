<template>
  <div class="page-layout">
    <AdminHeaderNavbar />
    <div class="page-content">
      <div class="news-management-container">
        <!-- 统计概览卡片 -->
        <div class="statistics-section">
          <div class="stat-card">
            <div class="stat-icon news">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalNews }}</div>
              <div class="stat-label">新闻总数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon published">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ publishedNews }}</div>
              <div class="stat-label">已发布</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon draft">
              <el-icon><Edit /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ draftNews }}</div>
              <div class="stat-label">草稿</div>
            </div>
          </div>
        </div>

        <!-- 快速操作区域 -->
        <div class="quick-actions">
          <el-button type="primary" size="large" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建新闻
          </el-button>
          <el-button type="success" size="large" @click="handleBatchPublish">
            <el-icon><Upload /></el-icon>
            批量发布
          </el-button>
          <el-button type="danger" size="large" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="search-filter-section">
          <div class="search-area">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入标题"
              class="search-input"
              clearable
              @clear="searchKeyword = ''"
            >
              <template #prepend>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="filter-area">
            <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 180px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已删除" value="deleted" />
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

        <!-- 数据表格区域 -->
        <div class="table-section">
          <div class="table-header">
            <h3>新闻列表</h3>
            <el-tag type="info" size="small">{{ totalCount }} 篇</el-tag>
          </div>

          <el-table ref="tableRef" v-loading="loading" :data="allNews" stripe style="width: 100%" @selection-change="onSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="标题" min-width="220">
              <template #default="scope">
                <div class="news-title">
                  <el-icon><Document /></el-icon>
                  <span>{{ scope.row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="来源" width="180" />
            <el-table-column prop="publishTime" label="发布时间" width="220">
              <template #default="scope">
                {{ formatNewsTime(scope.row.publishTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="150">
              <template #default="scope">
                <el-tag 
                  :type="scope.row.status === 'published' 
                    ? 'success' 
                    : (scope.row.status === 'updated' 
                      ? 'warning' 
                      : (scope.row.status === 'deleted' 
                        ? 'danger' 
                        : 'info'))" 
                  size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleEdit(scope.row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" type="success" @click="handlePublish(scope.row)" :disabled="scope.row.status === 'published'">
                  <el-icon><Upload /></el-icon>
                  发布
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row)" :disabled="scope.row.status === 'deleted'">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="totalCount > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :small="false"
              :disabled="loading"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalCount"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>

          <div v-if="allNews.length === 0" class="no-data">
            <el-empty description="暂无新闻" :image-size="200">
              <el-button type="primary" @click="handleCreate">新建新闻</el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        
        <el-form-item label="来源">
          <el-input v-model="form.source" />
        </el-form-item>
        <el-form-item label="封面图">
          <div style="display:flex; align-items:center; gap:12px; flex-wrap: wrap;">
            <el-input v-model="form.coverUrl" placeholder="可手动粘贴图片URL（可为空）" style="width: 320px;" />
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="onCoverFileChange"
            >
              <el-button type="primary">本地上传</el-button>
            </el-upload>
            <el-button v-if="form.coverUrl" @click="form.coverUrl = ''">清除</el-button>
          </div>
          <div v-if="form.coverUrl" style="margin-top: 10px;">
            <el-image :src="form.coverUrl" fit="cover" style="width: 160px; height: 100px; border-radius: 6px;" />
          </div>
        </el-form-item>
        <el-form-item label="正文">
          <el-input v-model="form.content" type="textarea" :rows="8" />
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker v-model="form.publishTime" type="datetime" placeholder="选择发布时间" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import AdminHeaderNavbar from '../components/AdminHeaderNavbar.vue';
import { 
  Document,
  CircleCheck,
  Edit,
  Timer,
  Plus,
  Upload,
  Delete,
  Download,
  Filter,
  Refresh,
  Search,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import { getNewsList, getNewsByStatus, createNews, updateNews, deleteNews, uploadNewsCover } from '../utils/api';
import { formatNewsTime } from '../utils/formatters';

const loading = ref(true);
const tableRef = ref(null);
const selectedNews = ref([]);
const allNews = ref([]);

const searchKeyword = ref('');
const statusFilter = ref('');
// 已移除类别筛选
const dateRange = ref([]);

const dialogVisible = ref(false);
const dialogMode = ref('create');
const dialogTitle = computed(() => dialogMode.value === 'create' ? '新建新闻' : '编辑新闻');
const currentNewsId = ref(null);

const form = ref({
  title: '',
  // 移除 category
  source: '',
  coverUrl: '',
  content: '',
  publishTime: '',
  status: 'draft',
  publishedBy: ''
});

// 统计
const totalNews = ref(0);
const publishedNews = ref(0);
const draftNews = ref(0);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const totalCount = ref(0);

const getStatusText = (status) => {
  const map = {
    published: '已发布',
    draft: '草稿',
    updated: '已更新',
    deleted: '已删除'
  }
  return map[status] || '未知'
};

const fetchNewsData = async () => {
  loading.value = true;
  try {
    const response = await getNewsList({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: statusFilter.value || null,
      keyword: searchKeyword.value,
      dateRange: dateRange.value
    });
    
    if (response && response.data) {
      // 后端返回的数据结构: { page, pageSize, totalCount, totalPages, list }
      totalCount.value = response.data.totalCount || 0;
      totalNews.value = response.data.allNewsCount || 0;
      publishedNews.value = response.data.publishedNewsCount || 0;
      draftNews.value = response.data.draftNewsCount || 0;
      
      // 转换数据格式以匹配前端组件
      allNews.value = (response.data.list || []).map(news => ({
        id: news.newsId,
        title: news.newsTitle,
        source: news.newsSource || '系统管理员', // 使用后端来源字段
        content: news.newsContent,
        coverUrl: news.coverUrl || '',
        publishTime: news.newsTime,
        status: news.newsStatus,
      }));
    } else {
      allNews.value = [];
      totalCount.value = 0;
    }
  } catch (e) {
    console.error('获取新闻失败:', e);
    ElMessage.error('获取新闻失败');
    allNews.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchNewsData);

const resetForm = () => {
  form.value = { title: '', source: '', coverUrl: '', content: '', publishTime: '', status: 'draft', publishedBy: '' };
  currentNewsId.value = null;
};

const handleCreate = () => {
  resetForm();
  dialogMode.value = 'create';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  resetForm();
  dialogMode.value = 'edit';
  form.value = JSON.parse(JSON.stringify(row));
  currentNewsId.value = row.id;
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (dialogMode.value === 'create') {
      const newsData = {
        newsTitle: form.value.title,
        newsContent: form.value.content,
        newsStatus: form.value.status,
        coverUrl: form.value.coverUrl || '',
        newsSource: form.value.source || '系统管理员',
      };
      
      await createNews(newsData);
      ElMessage.success('新闻创建成功');
    } else {
      const newsData = {
        newsTitle: form.value.title,
        newsContent: form.value.content,
        newsStatus: form.value.status,
        coverUrl: form.value.coverUrl || '',
        newsSource: form.value.source || '系统管理员',
        newsTime: form.value.publishTime || null,
      };
      
      await updateNews(currentNewsId.value, newsData);
      ElMessage.success('新闻更新成功');
    }
    dialogVisible.value = false;
    await fetchNewsData();
  } catch (e) {
    console.error('操作失败:', e);
    ElMessage.error('操作失败');
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除新闻【${row.title}】吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteNews(row.id);
      ElMessage.success('新闻删除成功');
      await fetchNewsData();
    } catch (e) {
      console.error('删除失败:', e);
      ElMessage.error('删除失败');
    }
  });
};

const handlePublish = async (row) => {
  try {
    const newsData = {
      newsTitle: row.title,
      newsContent: row.content,
      newsStatus: 'published',
      coverUrl: row.coverUrl || ''
    };
    
    await updateNews(row.id, newsData);
    ElMessage.success('新闻发布成功');
    await fetchNewsData();
  } catch (e) {
    console.error('发布失败:', e);
    ElMessage.error('发布失败');
  }
};

// 处理封面图本地上传
const onCoverFileChange = async (file) => {
  const raw = file.raw || file;
  if (!raw) return;
  
  try {
    // 上传到后端服务器
    const response = await uploadNewsCover(raw);
    if (response && response.data && response.data.coverUrl) {
      form.value.coverUrl = response.data.coverUrl;
      ElMessage.success('图片上传成功');
    } else {
      throw new Error('上传响应格式错误');
    }
  } catch (error) {
    console.error('图片上传失败:', error);
    ElMessage.error('图片上传失败，将使用本地预览');
    
    // 如果上传失败，使用本地预览作为备选方案
    const reader = new FileReader();
    reader.onload = () => {
      form.value.coverUrl = reader.result;
    };
    reader.readAsDataURL(raw);
  }
};

const onSelectionChange = (rows) => {
  selectedNews.value = rows || [];
};

// 批量发布
const handleBatchPublish = async () => {
  if (!selectedNews.value.length) {
    ElMessage.warning('请先选择要发布的新闻');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定发布选中的 ${selectedNews.value.length} 篇新闻吗？`,
      '确认操作',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
    );

    // 如果后端没有批量接口，可以循环调用单条 updateNews
    for (const news of selectedNews.value) {
      const newsData = {
        newsTitle: news.title,
        newsContent: news.content,
        newsStatus: 'published',
        coverUrl: news.coverUrl || '',
      };
      await updateNews(news.id, newsData);
    }

    ElMessage.success('批量发布成功');
    tableRef.value && tableRef.value.clearSelection();
    selectedNews.value = [];
    await fetchNewsData(); // 刷新表格
  } catch (e) {
    if (e !== 'cancel') {
      console.error('批量发布失败:', e);
      ElMessage.error('批量发布失败');
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedNews.value.length) {
    ElMessage.warning('请先选择要删除的新闻');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedNews.value.length} 篇新闻吗？此操作不可恢复`,
      '警告',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    );

    // 循环调用 deleteNews 接口
    for (const news of selectedNews.value) {
      await deleteNews(news.id);
    }

    ElMessage.success('批量删除成功');
    tableRef.value && tableRef.value.clearSelection();
    selectedNews.value = [];
    await fetchNewsData(); // 刷新表格
  } catch (e) {
    if (e !== 'cancel') {
      console.error('批量删除失败:', e);
      ElMessage.error('批量删除失败');
    }
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchNewsData();
  ElMessage.success('筛选已应用');
};

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = '';
  dateRange.value = [];
  currentPage.value = 1;
  fetchNewsData();
  ElMessage.success('筛选已重置');
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchNewsData();
};
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchNewsData();
};
</script>

<style src="../styles/news-management.css" scoped></style>

<style>
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
</style>
