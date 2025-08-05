<template>
  <div class="page-layout">
    <AdminHeaderNavbar />
    <div class="page-content">
      <div class="venue-management-container">
        <!-- 统计概览卡片 -->
        <div class="statistics-section">
          <div class="stat-card">
            <div class="stat-icon venue">
              <el-icon><Location /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalVenues }}</div>
              <div class="stat-label">总场地数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon open">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ openVenues }}</div>
              <div class="stat-label">开放场地</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon closed">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ closedVenues }}</div>
              <div class="stat-label">关闭场地</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon popular">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ popularVenue }}</div>
              <div class="stat-label">最受欢迎</div>
            </div>
          </div>
        </div>

        <!-- 快速操作区域 -->
        <div class="quick-actions">
          <el-button type="primary" size="large" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            发布新场地
          </el-button>
          <el-button type="success" size="large" @click="handleBatchOpen">
            <el-icon><Unlock /></el-icon>
            批量开放
          </el-button>
          <el-button type="warning" size="large" @click="handleBatchClose">
            <el-icon><Lock /></el-icon>
            批量关闭
          </el-button>
          <el-button type="info" size="large" @click="exportVenueData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="search-filter-section">
          <div class="search-area">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入场地名称进行搜索"
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
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="开放" value="开放" />
              <el-option label="关闭" value="关闭" />
            </el-select>
            
            <el-select v-model="venueTypeFilter" placeholder="场地类型" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="篮球场" value="篮球场" />
              <el-option label="羽毛球场" value="羽毛球场" />
              <el-option label="乒乓球场" value="乒乓球场" />
              <el-option label="网球场" value="网球场" />
              <el-option label="健身房" value="健身房" />
            </el-select>
            
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
            <h3>场地列表</h3>
            <el-tag type="info" size="small">{{ filteredVenueData.length }} 个场地</el-tag>
          </div>
          
          <el-table v-loading="loading" :data="filteredVenueData" stripe style="width: 100%">
            <el-table-column prop="name" label="场地名称" min-width="150">
              <template #default="scope">
                <div class="venue-name">
                  <el-icon><Location /></el-icon>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="位置" width="120" />
            <el-table-column prop="openingHours" label="开放时间" width="150" />
            <el-table-column prop="bookingHours" label="预约时间段" width="150" />
            <el-table-column prop="maxOccupancy" label="最大预约人数" width="120">
              <template #default="scope">
                <el-tag type="info" size="small">{{ scope.row.maxOccupancy }} 人</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '开放' ? 'success' : 'danger'" size="small">
                  <el-icon v-if="scope.row.status === '开放'"><CircleCheck /></el-icon>
                  <el-icon v-else><CircleClose /></el-icon>
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleEdit(scope.row)">
                  <el-icon><Edit /></el-icon>
                  修改
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
                <el-button size="small" type="info" @click="viewVenueDetail(scope.row)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div v-if="filteredVenueData.length === 0" class="no-data">
            <el-empty description="暂无场地数据" :image-size="200">
              <el-button type="primary" @click="handleCreate">添加第一个场地</el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </div>

    <!-- 场地详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="场地详情" width="600px">
      <div v-if="selectedVenue" class="venue-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">场地名称：</span>
              <span class="value">{{ selectedVenue.name }}</span>
            </div>
            <div class="detail-item">
              <span class="label">位置：</span>
              <span class="value">{{ selectedVenue.location }}</span>
            </div>
            <div class="detail-item">
              <span class="label">开放时间：</span>
              <span class="value">{{ selectedVenue.openingHours }}</span>
            </div>
            <div class="detail-item">
              <span class="label">预约时间段：</span>
              <span class="value">{{ selectedVenue.bookingHours }}</span>
            </div>
            <div class="detail-item">
              <span class="label">最大预约人数：</span>
              <span class="value">{{ selectedVenue.maxOccupancy }} 人</span>
            </div>
            <div class="detail-item">
              <span class="label">状态：</span>
              <span class="value">
                <el-tag :type="selectedVenue.status === '开放' ? 'success' : 'danger'">
                  {{ selectedVenue.status }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关 闭</el-button>
        <el-button type="primary" @click="handleEdit(selectedVenue)">编 辑</el-button>
      </template>
    </el-dialog>

    <!-- 原有的添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="场地名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="form.location" />
        </el-form-item>
        <el-form-item label="开放时间">
          <el-input v-model="form.openingHours" />
        </el-form-item>
        <el-form-item label="预约时间段">
          <el-input v-model="form.bookingHours" />
        </el-form-item>
        <el-form-item label="最大预约人数">
          <el-input v-model.number="form.maxOccupancy" type="number" />
        </el-form-item>
        <el-form-item label="状态" class="aligned-form-item">
          <el-select v-model="form.status" placeholder="请选择场地状态">
            <el-option label="开放" value="开放" />
            <el-option label="关闭" value="关闭" />
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
import { 
  Search, 
  Location, 
  CircleCheck, 
  CircleClose, 
  TrendCharts,
  Plus,
  Unlock,
  Lock,
  Download,
  Filter,
  Refresh,
  Edit,
  Delete,
  View
} from '@element-plus/icons-vue';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../utils/api';
import '../styles/venue-management.css';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminHeaderNavbar from '../components/AdminHeaderNavbar.vue';

const searchKeyword = ref('');
const statusFilter = ref('');
const venueTypeFilter = ref('');
const loading = ref(true);
const allVenueData = ref([]);
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const dialogMode = ref('create');
const dialogTitle = computed(() => dialogMode.value === 'create' ? '发布新场地' : '修改场地信息');
const currentVenueId = ref(null);
const selectedVenue = ref(null);

const form = ref({
  name: '', location: '', openingHours: '',
  bookingHours: '', maxOccupancy: 0, status: '开放',
});

// 统计计算
const totalVenues = computed(() => allVenueData.value.length);
const openVenues = computed(() => allVenueData.value.filter(v => v.status === '开放').length);
const closedVenues = computed(() => allVenueData.value.filter(v => v.status === '关闭').length);
const popularVenue = computed(() => {
  if (allVenueData.value.length === 0) return '暂无';
  // 这里可以根据实际业务逻辑计算最受欢迎的场地
  return allVenueData.value[0]?.name || '暂无';
});

const resetForm = () => {
  form.value = {
    name: '', location: '', openingHours: '',
    bookingHours: '', maxOccupancy: 0, status: '开放',
  };
  currentVenueId.value = null;
};

const filteredVenueData = computed(() => {
  let filtered = [...allVenueData.value];
  
  // 关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(venue => venue.name.includes(searchKeyword.value));
  }
  
  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(venue => venue.status === statusFilter.value);
  }
  
  // 场地类型筛选
  if (venueTypeFilter.value) {
    filtered = filtered.filter(venue => venue.name.includes(venueTypeFilter.value));
  }
  
  return filtered;
});

const fetchVenueData = async () => {
  loading.value = true;
  try {
    const response = await getVenues();
    allVenueData.value = response?.data?.data ?? [];
  } catch (error) {
    ElMessage.error("获取场地列表失败");
    allVenueData.value = [];
  } finally {
    loading.value = false;
  }
};

const handleApiRequest = async (apiCall, successMessage) => {
    try {
        const response = await apiCall;
        if (response && response.data && response.data.code === 200) {
            ElMessage.success(successMessage);
            dialogVisible.value = false; // 成功后关闭对话框
            await fetchVenueData(); // 重新加载数据
        } else {
            ElMessage.error(response?.data?.message || "操作失败");
        }
    } catch (error) {
        ElMessage.error("请求失败");
    }
}

onMounted(fetchVenueData);

const handleCreate = () => {
  resetForm();
  dialogMode.value = 'create';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  resetForm();
  dialogMode.value = 'edit';
  form.value = JSON.parse(JSON.stringify(row));
  currentVenueId.value = row.id;
  dialogVisible.value = true;
};

const handleSubmit = () => {
  if (dialogMode.value === 'create') {
    handleApiRequest(createVenue(form.value), '发布成功');
  } else {
    handleApiRequest(updateVenue(currentVenueId.value, form.value), '修改成功');
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除场地【${row.name}】吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    handleApiRequest(deleteVenue(row.id), '删除成功');
  });
};

// 新增功能
const viewVenueDetail = (venue) => {
  selectedVenue.value = venue;
  detailDialogVisible.value = true;
};

const handleBatchOpen = () => {
  ElMessageBox.confirm('确定要批量开放所有场地吗？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    ElMessage.success('批量开放功能待实现');
  });
};

const handleBatchClose = () => {
  ElMessageBox.confirm('确定要批量关闭所有场地吗？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('批量关闭功能待实现');
  });
};

const exportVenueData = () => {
  ElMessage.success('导出功能待实现');
};

const applyFilters = () => {
  ElMessage.success('筛选已应用');
};

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = '';
  venueTypeFilter.value = '';
  ElMessage.success('筛选已重置');
};
</script>

<style src="../styles/admin-sidebar.css"></style>
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

.stat-icon.venue {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-icon.open {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-icon.closed {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-icon.popular {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
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

/* 搜索和筛选区域 */
.search-filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-area {
  flex: 1;
  min-width: 300px;
}

.filter-area {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 表格区域 */
.table-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.table-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.venue-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 40px;
}

/* 详情对话框样式 */
.venue-detail {
  max-height: 400px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-item .label {
  font-weight: 600;
  color: #606266;
  min-width: 120px;
  margin-right: 12px;
}

.detail-item .value {
  color: #303133;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-area {
    min-width: auto;
  }
  
  .filter-area {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .statistics-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions {
    justify-content: center;
  }
  
  .filter-area {
    justify-content: center;
  }
}
</style>