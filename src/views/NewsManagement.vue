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
          <div class="stat-card">
            <div class="stat-icon scheduled">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ scheduledNews }}</div>
              <div class="stat-label">定时发布</div>
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
          <el-button type="info" size="large" @click="exportNewsData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="search-filter-section">
          <div class="search-area">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入标题或来源"
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
            <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="定时" value="scheduled" />
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
            <el-tag type="info" size="small">{{ filteredNews.length }} 篇</el-tag>
          </div>

          <el-table ref="tableRef" v-loading="loading" :data="filteredNews" stripe style="width: 100%" @selection-change="onSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="标题" min-width="220">
              <template #default="scope">
                <div class="news-title">
                  <el-icon><Document /></el-icon>
                  <span>{{ scope.row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="来源" width="160" />
            <el-table-column prop="publishedBy" label="发布管理员" width="140" />
            <el-table-column prop="publishTime" label="发布时间" width="180" />
            <el-table-column prop="status" label="状态" width="110">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'published' ? 'success' : (scope.row.status === 'scheduled' ? 'warning' : 'info')" size="small">
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
                <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="filteredNews.length === 0" class="no-data">
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
        <el-form-item label="发布管理员">
          <el-input v-model="form.publishedBy" :disabled="true" placeholder="将自动填充当前管理员" />
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
            <el-option label="定时" value="scheduled" />
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

// TODO: 替换为真实 API
// import { getNewsList, createNews, updateNews, deleteNews, publishNews } from '../utils/api';

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
const totalNews = computed(() => allNews.value.length);
const publishedNews = computed(() => allNews.value.filter(n => n.status === 'published').length);
const draftNews = computed(() => allNews.value.filter(n => n.status === 'draft').length);
const scheduledNews = computed(() => allNews.value.filter(n => n.status === 'scheduled').length);

const getStatusText = (status) => {
  const map = { published: '已发布', draft: '草稿', scheduled: '定时' };
  return map[status] || '未知';
};

const filteredNews = computed(() => {
  let filtered = [...allNews.value];

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(kw) ||
      (n.source || '').toLowerCase().includes(kw)
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter(n => n.status === statusFilter.value);
  }

  // 已移除类别过滤

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value;
    filtered = filtered.filter(n => {
      const date = (n.publishTime || '').slice(0, 10);
      return (!start || date >= start) && (!end || date <= end);
    });
  }

  return filtered;
});

const fetchNewsData = async () => {
  loading.value = true;
  try {
    // const response = await getNewsList();
    // allNews.value = response?.data?.data ?? [];
    allNews.value = [];
  } catch (e) {
    ElMessage.error('获取新闻失败');
    allNews.value = [];
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
  form.value.publishedBy = localStorage.getItem('userName') || '当前管理员';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  resetForm();
  dialogMode.value = 'edit';
  form.value = JSON.parse(JSON.stringify(row));
  currentNewsId.value = row.id;
  if (!form.value.publishedBy) {
    form.value.publishedBy = localStorage.getItem('userName') || '当前管理员';
  }
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (dialogMode.value === 'create') {
      // await createNews(form.value)
      ElMessage.success('已创建（模拟）');
    } else {
      // await updateNews(currentNewsId.value, form.value)
      ElMessage.success('已保存（模拟）');
    }
    dialogVisible.value = false;
    await fetchNewsData();
  } catch (e) {
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
      // await deleteNews(row.id)
      ElMessage.success('已删除（模拟）');
      await fetchNewsData();
    } catch (e) {
      ElMessage.error('删除失败');
    }
  });
};

const handlePublish = async (row) => {
  try {
    // await publishNews(row.id)
    ElMessage.success('已发布（模拟）');
    await fetchNewsData();
  } catch (e) {
    ElMessage.error('发布失败');
  }
};

// 处理封面图本地上传（允许为空）：转换为 dataURL 直接预览或上传到你的服务器
const onCoverFileChange = (file) => {
  const raw = file.raw || file;
  if (!raw) return;
  const reader = new FileReader();
  reader.onload = () => {
    // 这里将本地文件转换为 base64 预览。若后端需要文件上传，请在此改为表单上传并设置返回的 URL。
    form.value.coverUrl = reader.result;
    ElMessage.success('已选择图片');
  };
  reader.onerror = () => ElMessage.error('读取图片失败');
  reader.readAsDataURL(raw);
};

const onSelectionChange = (rows) => {
  selectedNews.value = rows || [];
};

const handleBatchPublish = async () => {
  if (!selectedNews.value.length) {
    ElMessage.warning('请先选择要发布的新闻');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定发布选中的 ${selectedNews.value.length} 篇新闻吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });
    const ids = new Set(selectedNews.value.map(n => n.id));
    allNews.value = allNews.value.map(n => ids.has(n.id) ? { ...n, status: 'published' } : n);
    ElMessage.success('批量发布成功（模拟）');
    tableRef.value && tableRef.value.clearSelection();
    selectedNews.value = [];
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('批量发布失败');
  }
};

const handleBatchDelete = async () => {
  if (!selectedNews.value.length) {
    ElMessage.warning('请先选择要删除的新闻');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedNews.value.length} 篇新闻吗？此操作不可恢复`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const ids = new Set(selectedNews.value.map(n => n.id));
    allNews.value = allNews.value.filter(n => !ids.has(n.id));
    ElMessage.success('批量删除成功（模拟）');
    tableRef.value && tableRef.value.clearSelection();
    selectedNews.value = [];
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('批量删除失败');
  }
};

const exportNewsData = () => {
  ElMessage.success('导出功能待实现');
};

const applyFilters = () => {
  ElMessage.success('筛选已应用');
};

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = '';
  dateRange.value = [];
  ElMessage.success('筛选已重置');
};
</script>

<style src="../styles/news-management.css" scoped></style>


