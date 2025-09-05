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
              <el-icon><Menu /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ venueTypes.length }}</div>
              <div class="stat-label">场地类型数</div>
            </div>
          </div>
        </div>

        <!-- 快速操作区域 -->
        <div class="quick-actions">
          <el-button type="primary" size="large" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            发布新场地
          </el-button>
          <el-button type="success" size="large" @click="handleBatchUpdateStatus('开放')" :disabled="selectedVenues.length === 0">
            <el-icon><Unlock /></el-icon>
            批量开放
          </el-button>
          <el-button type="warning" size="large" @click="handleBatchUpdateStatus('关闭')" :disabled="selectedVenues.length === 0">
            <el-icon><Lock /></el-icon>
            批量关闭
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
              @clear="applyFilters"
              @keyup.enter="applyFilters"
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
            
            <el-select v-model="venueTypeFilter" placeholder="场地类型" clearable style="width: 140px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option v-for="type in venueTypes" :key="type" :label="type" :value="type" />
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
            <el-tag type="info" size="small">共 {{ totalVenues }} 个场地</el-tag>
          </div>
          
          <el-table 
            v-loading="loading" 
            :data="tableData" 
            stripe 
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="场地名称" min-width="150">
              <template #default="scope">
                <div class="venue-name">
                  <el-icon><Location /></el-icon>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="场地类型" width="120" />
            <el-table-column prop="price" label="价格" width="150">
                <template #default="scope">
                    <span style="color: #E6A23C; font-weight: bold;">¥ {{ scope.row.price }}</span>
                    <span> / {{ scope.row.price_unit }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="location" label="位置" width="120" />
            <el-table-column prop="maxOccupancy" label="最大容量" width="120">
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
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button size="small" type="primary" @click="handleEdit(scope.row)">
                    <el-icon><Edit /></el-icon>
                    修改
                  </el-button>
                  <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                  <el-button size="small" type="info" link @click="viewVenueDetail(scope.row)">
                    <el-icon><View /></el-icon>
                    详情
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-if="totalVenues > 0"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 50]"
            :total="totalVenues"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="pagination-container"
          />
          
          <div v-if="tableData.length === 0 && !loading" class="no-data">
            <el-empty description="暂无匹配的场地数据" :image-size="200">
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
            <div class="detail-item"><span class="label">场地名称：</span><span class="value">{{ selectedVenue.name }}</span></div>
            <div class="detail-item"><span class="label">场地类型：</span><span class="value">{{ selectedVenue.type }}</span></div>
            <div class="detail-item"><span class="label">价格：</span><span class="value">¥ {{ selectedVenue.price }} / {{ selectedVenue.price_unit }}</span></div>
            <div class="detail-item"><span class="label">位置：</span><span class="value">{{ selectedVenue.location }}</span></div>
            <div class="detail-item"><span class="label">开放时间：</span><span class="value">{{ selectedVenue.openingHours }}</span></div>
            <div class="detail-item"><span class="label">预约时间段：</span><span class="value">{{ selectedVenue.bookingHours }}</span></div>
            <div class="detail-item"><span class="label">最大容量：</span><span class="value">{{ selectedVenue.maxOccupancy }} 人</span></div>
            <div class="detail-item"><span class="label">状态：</span><span class="value"><el-tag :type="selectedVenue.status === '开放' ? 'success' : 'danger'">{{ selectedVenue.status }}</el-tag></span></div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关 闭</el-button>
        <el-button type="primary" @click="handleEdit(selectedVenue)">编 辑</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetForm">
      <el-form :model="form" label-width="120px">
        <el-form-item label="场地名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="子场地">
          <el-input v-model="form.subname" placeholder="请输入场地的子场地(如场地1)" />
        </el-form-item>
        <el-form-item label="场地图片">
          <el-upload
            name="File" class="avatar-uploader"  action="/api/upload/venue-image"        :headers="{ 'Authorization': `Bearer ${token}` }" :show-file-list="false"
            :on-success="handleUploadSuccess" :before-upload="beforeAvatarUpload"
          >
          <img v-if="form.pictureurl" :src="form.pictureurl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="el-upload__tip">
          建议上传大小不超过 2MB 的图片
          </div>
        </el-form-item>
        <el-form-item label="场地类型">
          <el-select v-model="form.type" placeholder="请选择场地类型">
            <el-option v-for="type in venueTypeOptions" :key="type" :label="type" :value="type" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="场地价格">
            <el-input v-model.number="form.price" type="number" placeholder="请输入每小时价格">
                 <template #prepend>¥</template>
            </el-input>
        </el-form-item>
        <el-form-item label="位置"><el-input v-model="form.location" /></el-form-item>
        <el-form-item label="开放时间"><el-input v-model="form.openingHours" placeholder="例如: 08:00-22:00" /></el-form-item>
        <el-form-item label="预约时间段"><el-input v-model="form.bookingHours" placeholder="例如: 08:00-22:00" /></el-form-item>
        <el-form-item label="最大容量"><el-input v-model.number="form.maxOccupancy" type="number" /></el-form-item>
        <el-form-item label="状态">
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

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Search, Location, CircleCheck, CircleClose, Menu,
  Plus, Unlock, Lock, Filter, Refresh, Edit, Delete, View
} from '@element-plus/icons-vue';
import { getVenues, createVenue, updateVenue, deleteVenue, batchUpdateVenueStatus } from '../utils/api'; 
import '../styles/venue-management.css';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadProps } from 'element-plus';
import AdminHeaderNavbar from '../components/AdminHeaderNavbar.vue';


// 筛选和搜索响应式引用
const searchKeyword = ref('');
const statusFilter = ref('');
const venueTypeFilter = ref('');

// 表格和分页数据
const loading = ref(true);
const tableData = ref([]);
const venueTypes = ref([]); // 动态场地类型列表, 由后端提供
const selectedVenues = ref([]); // 用于存储表格中选中的行数据

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);
const totalVenues = ref(0); // 总场地数

// 对话框状态
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const dialogMode = ref('create');
const dialogTitle = computed(() => dialogMode.value === 'create' ? '发布新场地' : '修改场地信息');
const currentVenueId = ref(null);
const selectedVenue = ref(null);

const token = localStorage.getItem('token');
const venueTypeOptions = ref([
  '羽毛球',
  '乒乓球',
  '网球',
  '健身',
  '足球',
  '田径',
  '排球',
  '篮球',
  '拳操'
]);

const form = ref({
  name: '',
  subname: '',
  pictureurl: '',
  type: '',
  price: 0,
  location: '',
  openingHours: '',
  bookingHours: '',
  maxOccupancy: 0,
  status: '开放',
  price_unit: '小时' // 默认单位
});

// 统计数据
const openVenues = ref(0);
const closedVenues = ref(0);

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    subname: '',
    pictureurl: '',
    type: '',
    price: 0,
    location: '',
    openingHours: '',
    bookingHours: '',
    maxOccupancy: 0,
    status: '开放',
    price_unit: '小时'
  };
  currentVenueId.value = null;
};

const handleUploadSuccess: UploadProps['onSuccess'] = (response) => {
  if (response && response.code == 0 && response.data && response.data.url) {
    form.value.pictureurl = response.data.url;
    ElMessage.success('图片上传成功！');
  } else {
    ElMessage.error(response.msg || '图片上传失败或返回格式不正确');
  }
};

// 上传前校验
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isJPGorPNG = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png';
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isJPGorPNG) {
    ElMessage.error('上传的图片只能是 JPG/PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
  }
  return isJPGorPNG && isLt2M;
};

// 获取场地数据
const fetchVenueData = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      status: statusFilter.value,
      type: venueTypeFilter.value,
    };
    const response = await getVenues(params);
    if (response && response.data && response.data.code === 200) {
      const apiData = response.data.data;
      
      // 更新表格数据和总数
      tableData.value = apiData?.list ?? [];
      totalVenues.value = apiData?.total ?? 0;

      // 更新统计数据和场地类型列表
      if (apiData?.summary) {
        openVenues.value = apiData.summary.open_venues ?? 0;
        closedVenues.value = apiData.summary.closed_venues ?? 0;
        venueTypes.value = apiData.summary.venue_types ?? [];
      }
    } else {
      ElMessage.error(response?.data?.message || "获取场地列表失败");
      tableData.value = [];
      totalVenues.value = 0;
    }
  } catch (error) {
    ElMessage.error("请求失败，请检查网络或联系管理员");
    console.error("Fetch venue data error:", error);
    tableData.value = [];
    totalVenues.value = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchVenueData);

// 通用API请求处理器
const handleApiRequest = async (apiCall, successMessage) => {
    try {
        const response = await apiCall;
        if (response && response.data && response.data.code === 200) {
            ElMessage.success(successMessage);
            dialogVisible.value = false;
            await fetchVenueData(); // 操作成功后刷新列表
        } else {
            ElMessage.error(response?.data?.message || "操作失败");
        }
    } catch (error) {
        ElMessage.error("请求执行异常，请稍后重试");
        console.error("API request error:", error);
    }
}

// CRUD 操作
const handleCreate = () => {
  resetForm();
  dialogMode.value = 'create';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  console.log('点击“修改”时，从表格获取的原始数据(row):', row); 
  resetForm(); 
  dialogMode.value = 'edit';
  currentVenueId.value = row.id;
  form.value = { ...form.value, ...JSON.parse(JSON.stringify(row)) };

  dialogVisible.value = true;
};

const handleSubmit = () => {
  const requiredFields = {
    name: '场地名称',
    subname: '子场地',
    pictureurl: '场地图片',
    type: '场地类型',
    price: '场地价格',
    location: '位置',
    openingHours: '开放时间',
    bookingHours: '预约时间段',
    maxOccupancy: '最大容量',
  };

  for (const key in requiredFields) {
    if (Object.prototype.hasOwnProperty.call(requiredFields, key)) {
      const value = form.value[key];
      if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        ElMessage.warning(`${requiredFields[key]}不能为空，请填写完整`);
        return; 
      }
    }
  }
  
  // 确保价格和容量是数字
  form.value.price = Number(form.value.price) || 0;
  form.value.maxOccupancy = Number(form.value.maxOccupancy) || 0;

  if (dialogMode.value === 'create') {
    handleApiRequest(createVenue(form.value), '发布成功');
  } else {
    handleApiRequest(updateVenue(currentVenueId.value, form.value), '修改成功');
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除场地【${row.name}】吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning',
  }).then(() => {
    handleApiRequest(deleteVenue(row.id), '删除成功');
  }).catch(() => {
    // 用户取消操作
  });
};

// 详情查看
const viewVenueDetail = (venue) => {
  selectedVenue.value = venue;
  detailDialogVisible.value = true;
};

// 批量操作
const handleSelectionChange = (selection) => {
  selectedVenues.value = selection;
};

const handleBatchUpdateStatus = (status) => {
  const selectedIds = selectedVenues.value.map(v => v.id);
  if (selectedIds.length === 0) {
    ElMessage.warning('请至少选择一个场地');
    return;
  }
  
  const actionText = status === '开放' ? '开放' : '关闭';
  ElMessageBox.confirm(`确定要批量${actionText}选中的 ${selectedIds.length} 个场地吗？`, '确认操作', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
  }).then(async () => {
    await handleApiRequest(batchUpdateVenueStatus(selectedIds, status), `批量${actionText}成功`);
  }).catch(() => {});
};

// 筛选和分页功能
const applyFilters = () => {
  currentPage.value = 1; // 每次应用新筛选时，都应该回到第一页
  fetchVenueData();
};

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = '';
  venueTypeFilter.value = '';
  applyFilters();
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 更改每页大小时，也回到第一页
  fetchVenueData();
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  fetchVenueData();
};
</script>


<style scoped>
.action-buttons {
  display: flex;
  gap: 6px;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
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
  font-size: 32px; font-weight: bold; color: #303133; margin-bottom: 8px; 
}

.stat-label { 
  font-size: 14px; color: #909399; 
}

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
  grid-template-columns: 1fr 1fr; 
  gap: 16px; 
}

.detail-item { 
  display: flex; 
  align-items: center; 
}

.detail-item .label { 
  font-weight: 600; 
  color: #606266; 
  min-width: 100px; 
  margin-right: 12px; 
}

.detail-item .value { 
  color: #303133; 
  flex: 1; 
}

.venue-management-container{
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .detail-grid { grid-template-columns: 1fr; }
}

.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>