<template>
  <div class="post-management-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待审核帖子" name="pending">
        <el-table :data="pendingPosts" style="width: 100%">
          <el-table-column prop="title" label="帖子标题" width="300" />
          <el-table-column prop="publishTime" label="发布时间" width="180" />
          <el-table-column prop="status" label="审核状态" width="180" />
          <el-table-column label="操作">
            <template #default="scope">
              <a href="#" class="action-link" @click.prevent="viewPost(scope.row)">帖子内容</a>
              <a href="#" class="action-link" @click.prevent="approvePost(scope.row)">通过</a>
              <a href="#" class="action-link" @click.prevent="rejectPost(scope.row)">不通过</a>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="举报信息" name="reports">
        <p>举报信息</p>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import '../styles/post-management.css';

const activeTab = ref('pending');

const pendingPosts = ref([
  {
    id: 1,
    title: '啪啦啦',
    publishTime: '2025-6-25',
    status: '未审核',
    content: '这是帖子的详细内容...'
  },
  {
    id: 2,
    title: '关于明天下午篮球场组队的帖子',
    publishTime: '2025-6-24',
    status: '未审核',
    content: '明天下午3点，有人一起在南区篮球场打球吗？'
  },
  {
    id: 3,
    title: '寻找一个羽毛球搭子',
    publishTime: '2025-6-23',
    status: '未审核',
    content: '本人水平中等，想找一个水平差不多的羽毛球搭子，每周三晚上一起打球。'
  }
]);

const viewPost = (post) => {
  ElMessage.info(`正在查看帖子【${post.title}】的内容`);
};

const approvePost = (post) => {
  ElMessage.success(`帖子【${post.title}】已审核通过`);
};

const rejectPost = (post) => {
  ElMessage.warning(`帖子【${post.title}】已审核不通过`);
};
</script>