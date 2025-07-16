<template>
  <div class="venue-management-container">
    <div class="header-controls">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入场地名称进行搜索"
        class="search-input"
        clearable
      >
        <template #prepend>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <div class="button-group">
        <el-button type="default">发布</el-button>
        <el-button type="default">修改</el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="venueData" stripe style="width: 100%">
        <el-table-column prop="name" label="场地名称" />
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="openingHours" label="开放时间" />
        <el-table-column prop="bookingHours" label="预约时间段" />
        <el-table-column prop="maxOccupancy" label="最大预约人数" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === '开放' ? 'success' : 'info'"
              text
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import "../styles/venue-management.css"; // 导入样式文件

// 搜索关键词
const searchKeyword = ref("");

// 表格的静态数据
const venueData = ref([
  {
    name: "乒乓球馆",
    location: "体育中心",
    openingHours: "每周日 8:00-17:00",
    bookingHours: "8:00-20:00",
    maxOccupancy: 20,
    status: "开放",
  },
  {
    name: "羽毛球馆",
    location: "一·二九训练馆",
    openingHours: "每日 9:00-21:00",
    bookingHours: "9:00-21:00",
    maxOccupancy: 40,
    status: "开放",
  },
  {
    name: "篮球场",
    location: "室外篮球场",
    openingHours: "每日 8:00-20:00",
    bookingHours: "8:00-20:00",
    maxOccupancy: 50,
    status: "维修中",
  },
  {
    name: "游泳馆",
    location: "游泳馆",
    openingHours: "每日 13:00-21:00",
    bookingHours: "13:00-21:00",
    maxOccupancy: 100,
    status: "已关闭",
  },
]);
</script>
