<!-- src/components/TopNavbar.vue -->
<template>
    <div class="top-navbar">
        <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
        <span class="title">{{ title }}</span>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
defineProps({ title: String })

const router = useRouter()
function goBack() {
  router.back()
}
</script>

<style scoped>
    .top-navbar {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        font-size: 18px;
        font-weight: bold;
        background-color: #ffffff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        margin-bottom: 16px;
    }

    .back-icon {
        margin-right: 12px;
        cursor: pointer;
        font-size: 20px;
        color: #409EFF;
    }

    .title {
        flex: 1;
    }
</style>
