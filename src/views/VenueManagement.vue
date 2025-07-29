<template>
  <div class="venue-management-container">
    <div class="header-controls">
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

      <div class="button-group">
        <el-button type="info" @click="handleCreate">发布场地</el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table v-loading="loading" :data="filteredVenueData" stripe style="width: 100%">
        <el-table-column prop="name" label="场地名称" />
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="openingHours" label="开放时间" />
        <el-table-column prop="bookingHours" label="预约时间段" />
        <el-table-column prop="maxOccupancy" label="最大预约人数" />
        <el-table-column prop="status" label="状态" class-name="status-column-cell">
            <template #default="scope">
                <el-tag :type="scope.row.status === '开放' ? 'success' : 'info'" text>
                    {{ scope.row.status }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180" class-name="status-column-cell">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">修改</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

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
import { Search } from '@element-plus/icons-vue';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../utils/api';
import '../styles/venue-management.css';
import { ElMessage, ElMessageBox } from 'element-plus';

const searchKeyword = ref('');
const loading = ref(true);
const allVenueData = ref([]);
const dialogVisible = ref(false);
const dialogMode = ref('create');
const dialogTitle = computed(() => dialogMode.value === 'create' ? '发布新场地' : '修改场地信息');
const currentVenueId = ref(null);

const form = ref({
  name: '', location: '', openingHours: '',
  bookingHours: '', maxOccupancy: 0, status: '开放',
});

const resetForm = () => {
  form.value = {
    name: '', location: '', openingHours: '',
    bookingHours: '', maxOccupancy: 0, status: '开放',
  };
  currentVenueId.value = null;
};

const filteredVenueData = computed(() => {
  if (!searchKeyword.value) {
    return allVenueData.value;
  }
  return allVenueData.value.filter(venue => venue.name.includes(searchKeyword.value));
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
</script>