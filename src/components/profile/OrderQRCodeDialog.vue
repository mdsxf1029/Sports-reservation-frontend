<template>
    <el-dialog
      :model-value="visible"
      @close="handleClose"
      title="二维码入场"
      width="400px"
      :close-on-click-modal="false"
    >
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">正在获取订单详情...</p>
        </div>
      </div>

      <!-- 正常内容 -->
      <div v-else>
        <div class="qrcode-box">
          <qrcode-vue :value="displayDetail.qrcode_data" :size="180" level="H" />
        </div>

        <div class="info">
          <p><strong>场馆：</strong>{{ displayDetail.venue_name }} {{ displayDetail.venue_subname }}</p>
          <p><strong>时间：</strong>{{ displayDetail.formattedDate }}（{{ displayDetail.formattedWeekday }}） {{ displayDetail.formattedTimeRange }}</p>
          <p><strong>预约人：</strong>{{ displayDetail.user_name }}</p>
          <p><strong>申请时间：</strong>{{ displayDetail.formattedApplyTime }}</p>
        </div>
      </div>
    </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'


const props = defineProps({
    visible: Boolean,
    displayDetail: {
      type: Object,
      required: true
    }
})

const emit = defineEmits(['close'])

// 计算loading状态
const isLoading = computed(() => {
  return props.displayDetail.loading || 
         !props.displayDetail.qrcode_data || 
         !props.displayDetail.venue_name
})

const handleClose = () => {
    emit('close')
}
</script>

<style scoped>
.qrcode-box {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.info p {
  margin: 4px 0;
}

/* 加载状态样式 */
.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e4e7ed;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: #666;
  font-size: 14px;
  margin: 0;
  margin-top: 10px;
}

/* 旋转动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>