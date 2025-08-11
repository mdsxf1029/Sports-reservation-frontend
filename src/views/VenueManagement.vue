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
        <el-form-item label="场地类型">
          <el-select v-model="form.type" placeholder="请选择场地类型">
            <el-option v-for="type in venueTypes" :key="type" :label="type" :value="type" />
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

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  Search, Location, CircleCheck, CircleClose, Menu,
  Plus, Unlock, Lock, Filter, Refresh, Edit, Delete, View
} from '@element-plus/icons-vue';
// import { getVenues, createVenue, updateVenue, deleteVenue, batchUpdateVenueStatus } from '../utils/api'; // 真实API
import '../styles/venue-management.css';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminHeaderNavbar from '../components/AdminHeaderNavbar.vue';

// =================================================================
// START: MOCK DATA & API (后端API完成后，请删除或注释掉此部分)
// =================================================================

const mockDatabase = {
  venues: Array.from({ length: 38 }, (_, i) => {
    const types = ['篮球场', '羽毛球场', '乒乓球场', '网球场', '健身房', '瑜伽室'];
    const type = types[i % types.length];
    const prices = [50, 30, 20, 40, 25, 60];
    return {
      id: i + 1,
      name: `${type} #${Math.floor(i / types.length) + 1}`,
      type: type,
      location: `体育馆 ${['A', 'B', 'C'][i % 3]}区`,
      openingHours: '08:00-22:00',
      bookingHours: '08:00-22:00',
      price: prices[i % types.length],
      price_unit: '小时',
      maxOccupancy: [12, 4, 4, 4, 30, 15][i % types.length],
      status: i % 5 === 0 ? '关闭' : '开放',
    };
  }),
};

// 模拟获取所有场地类型
const getMockVenueTypes = () => {
  const types = new Set(mockDatabase.venues.map(v => v.type));
  return Array.from(types);
};

// 模拟API调用
const getVenues = (params) => {
  return new Promise(resolve => {
    setTimeout(() => {
      let { page, pageSize, keyword, status, type } = params;
      let filteredData = [...mockDatabase.venues];

      // 筛选
      if (keyword) {
        filteredData = filteredData.filter(v => v.name.includes(keyword));
      }
      if (status) {
        filteredData = filteredData.filter(v => v.status === status);
      }
      if (type) {
        filteredData = filteredData.filter(v => v.type === type);
      }

      const total = filteredData.length;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const list = filteredData.slice(start, end);
      
      resolve({
        data: {
          code: 200,
          data: {
            list: list,
            total: total,
            types: getMockVenueTypes(), // 动态返回所有类型
          }
        }
      });
    }, 500); // 模拟网络延迟
  });
};

const createVenue = (data) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newVenue = {
        ...data,
        id: Math.max(0, ...mockDatabase.venues.map(v => v.id)) + 1,
        price_unit: '小时', // 确保新创建的单位正确
      };
      mockDatabase.venues.unshift(newVenue);
      resolve({ data: { code: 200, message: '创建成功' } });
    }, 300);
  });
};

const updateVenue = (id, data) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockDatabase.venues.findIndex(v => v.id === id);
      if (index !== -1) {
        mockDatabase.venues[index] = { ...mockDatabase.venues[index], ...data, price_unit: '小时' };
        resolve({ data: { code: 200, message: '更新成功' } });
      } else {
        resolve({ data: { code: 500, message: '未找到场地' } });
      }
    }, 300);
  });
};

const deleteVenue = (id) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockDatabase.venues.findIndex(v => v.id === id);
      if (index !== -1) {
        mockDatabase.venues.splice(index, 1);
        resolve({ data: { code: 200, message: '删除成功' } });
      } else {
        resolve({ data: { code: 500, message: '未找到场地' } });
      }
    }, 300);
  });
};

const batchUpdateVenueStatus = (ids, status) => {
    return new Promise(resolve => {
        setTimeout(() => {
            mockDatabase.venues.forEach(venue => {
                if (ids.includes(venue.id)) {
                    venue.status = status;
                }
            });
            resolve({ data: { code: 200, message: '批量更新成功' } });
        }, 300);
    });
};

// =================================================================
// END: MOCK DATA & API
// =================================================================


// 筛选和搜索响应式引用
const searchKeyword = ref('');
const statusFilter = ref('');
const venueTypeFilter = ref('');

// 表格和分页数据
const loading = ref(true);
const tableData = ref([]);
const venueTypes = ref([]); // 动态场地类型列表
const selectedVenues = ref([]); // 用于存储表格中选中的行数据

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);
const totalVenues = ref(0); // 总场地数，由API提供

// 对话框状态
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const dialogMode = ref('create');
const dialogTitle = computed(() => dialogMode.value === 'create' ? '发布新场地' : '修改场地信息');
const currentVenueId = ref(null);
const selectedVenue = ref(null);

const form = ref({
  name: '', type: '', location: '', openingHours: '',
  bookingHours: '', maxOccupancy: 0, status: '开放',
  price: 0
});

// 统计计算
const allVenuesList = ref([]); // 存储所有场地的列表，用于统计
const openVenues = computed(() => allVenuesList.value.filter(v => v.status === '开放').length);
const closedVenues = computed(() => allVenuesList.value.filter(v => v.status === '关闭').length);

const resetForm = () => {
  form.value = {
    name: '', type: '', location: '', openingHours: '',
    bookingHours: '', maxOccupancy: 0, status: '开放',
    price: 0
  };
  currentVenueId.value = null;
};

// 获取场地数据 (核心逻辑修改)
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
      tableData.value = apiData?.list ?? [];
      totalVenues.value = apiData?.total ?? 0;
      if (apiData?.types) {
        venueTypes.value = apiData.types;
      }
      // 为了精确统计，可以请求所有数据一次，或者后端直接返回统计数据
      // 这里我们用模拟数据中的全量数据来统计
      allVenuesList.value = mockDatabase.venues;
    } else {
      ElMessage.error(response?.data?.message || "获取场地列表失败");
      tableData.value = [];
      totalVenues.value = 0;
    }
  } catch (error) {
    ElMessage.error("请求失败，请检查网络");
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
            await fetchVenueData();
        } else {
            ElMessage.error(response?.data?.message || "操作失败");
        }
    } catch (error) {
        ElMessage.error("请求失败");
    }
}

// CRUD 操作
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
  if (!form.value.name || !form.value.type) {
      ElMessage.warning('场地名称和类型不能为空');
      return;
  }
  if (dialogMode.value === 'create') {
    handleApiRequest(createVenue(form.value), '发布成功');
  } else {
    handleApiRequest(updateVenue(currentVenueId.value, form.value), '修改成功');
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除场地【${row.name}】吗？`, '警告', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning',
  }).then(() => {
    handleApiRequest(deleteVenue(row.id), '删除成功');
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
  currentPage.value = 1;
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
  fetchVenueData();
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  fetchVenueData();
};
</script>

<style src="../styles/admin-sidebar.css"></style>
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
</style>