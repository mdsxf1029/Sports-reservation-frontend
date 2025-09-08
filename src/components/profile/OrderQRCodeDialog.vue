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

    <!-- 正常二维码展示 -->
    <div v-else-if="mode === 'qrcode'">
      <div class="qrcode-box">
        <qrcode-vue :value="displayDetail.qrcode_data" :size="180" level="H" />
      </div>

      <div class="info">
        <p><strong>场馆：</strong>{{ displayDetail.venue_name }} {{ displayDetail.venue_subname }}</p>
        <p><strong>时间：</strong>{{ displayDetail.formattedDate }}（{{ displayDetail.formattedWeekday }}） {{ displayDetail.formattedTimeRange }}</p>
        <p><strong>预约人：</strong>{{ displayDetail.user_name }}</p>
        <p><strong>申请时间：</strong>{{ displayDetail.formattedApplyTime }}</p>
      </div>

      <!-- 模拟扫码按钮 -->
      <div class="simulate-scan" style="margin-top:20px; text-align:center;">
        <el-button type="primary" @click="simulateCheckin">模拟扫码签到</el-button>
      </div>
    </div>

    <!-- 扫码签到结果 -->
    <div v-else-if="mode === 'checkin'">
      <div class="checkin-result" style="text-align:center;">
        <p v-if="checkinSuccess" style="color:green;font-size:18px;">✅ 签到成功！</p>
        <p v-else style="color:red;font-size:18px;">❌ 签到失败，请联系工作人员</p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  visible: Boolean,
  displayDetail: { type: Object, required: true }
})
const emit = defineEmits(['close'])

const mode = ref('qrcode') // 'qrcode' 或 'checkin'
const checkinSuccess = ref(false)

const isLoading = computed(() => {
  return props.displayDetail.loading || 
         !props.displayDetail.qrcode_data || 
         !props.displayDetail.venue_name
})

const handleClose = () => {
  mode.value = 'qrcode'
  checkinSuccess.value = false
  emit('close')
}

// 模拟扫码签到
const simulateCheckin = async () => {
  const appointmentId = props.displayDetail.appointmentId
  if (!appointmentId) return

  mode.value = 'checkin'
  try {
    const token = localStorage.getItem('token')
    const res = await axios.post('/api/appointments/check-in', {
      appointmentId: appointmentId
    }, { headers: { Authorization: `Bearer ${token}` } })

    console.log("当前 token:", token)
    console.log("签到 appointment_id:", appointmentId)

    checkinSuccess.value = res.data.success

    if (checkinSuccess.value) {
      emit('checkin-success')
    }
  } catch (err) {
    console.error('签到失败', err)
    checkinSuccess.value = false
  } 
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