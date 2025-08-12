<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="''"
    width="360px"
    class="login-dialog"
    :close-on-click-modal="false"
    center
  >
    <div class="login-content">
      <el-icon class="login-icon"><lock /></el-icon>
      <h3 class="login-title">请先登录</h3>
      <p class="login-subtext">{{ message }}</p>
      <el-button type="primary" class="login-btn" @click="$emit('login')">立即登录</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { Lock } from '@element-plus/icons-vue'
defineProps({
  modelValue: Boolean,        // 控制显示/隐藏
  message: {
    type: String,
    default: '登录后可进行操作' // 默认提示文字
  }
})
defineEmits(['update:modelValue', 'login'])
</script>

<style scoped>
.login-dialog .el-dialog__body {
  padding: 40px 30px 30px;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.login-icon {
  font-size: 40px;
  color: #409EFF;
  margin-bottom: 15px;
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.login-subtext {
  font-size: 14px;
  color: #666;
  margin-bottom: 25px;
}

.login-btn {
  width: 100%;
  height: 42px;
  font-size: 16px;
  border-radius: 8px;
}
</style>
