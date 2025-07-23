<template>
    <el-dialog
      :model-value="visible"
      @close="handleClose"
      title="二维码入场"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="qrcode-box">
        <qrcode-vue :value="displayDetail.qrcode_data" :size="180" level="H" />
      </div>

      <div class="info">
        <p><strong>场馆：</strong>{{ displayDetail.venue_name }} {{ displayDetail.venue_subname }}</p>
        <p><strong>时间：</strong>{{ displayDetail.formattedDate }}（{{ displayDetail.formattedWeekday }}） {{ displayDetail.formattedTimeRange }}</p>
        <p><strong>预约人：</strong>{{ displayDetail.user_name }}</p>
        <p><strong>申请时间：</strong>{{ displayDetail.formattedApplyTime }}</p>
      </div>
    </el-dialog>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    visible: Boolean,
    displayDetail: {
      type: Object,
      required: true
    }
})

const emit = defineEmits(['close'])

const handleClose = () => {
    emit('close')
}
</script>

<style>
.qrcode-box {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.info p {
  margin: 4px 0;
}
</style>