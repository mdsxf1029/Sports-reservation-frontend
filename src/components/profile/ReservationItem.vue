<template>
  <div class="reservation-card">
    <div class="reservation-item">
      <div class="content-info">
        <p>{{ content }}</p>
      </div>
      <div class="status-and-actions">
        <span class="status" :class="statusClass">{{ status }}</span>
        <div class="reservation-actions">
          <el-button 
            size="small" 
            type="primary" 
            class="qr-button"
            @click="showQRCode"
          >
            📱 查看二维码
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReservationItem',
  props: {
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    statusType: {
      type: String,
      default: 'pending',
      validator: (value) => ['active', 'pending', 'cancelled'].includes(value)
    },
    orderDetail: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    statusClass() {
      return `${this.statusType}-status`
    }
  },
  emits: ['show-qr-code'],
  methods: {
    showQRCode() {
      this.$emit('show-qr-code', this.orderDetail)
    }
  }
}
</script>

<style scoped>
.reservation-card {
  margin-bottom: 16px;
}

.reservation-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #409eff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reservation-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.content-info p {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
}

.status-and-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.active-status {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.pending-status {
  background: linear-gradient(135deg, #e6a23c 0%, #f0a020 100%);
  color: white;
}

.cancelled-status {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: white;
}

.reservation-actions {
  display: flex;
  align-items: center;
}

.qr-button {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.qr-button:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.qr-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reservation-item {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }
  
  .status-and-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }
  
  .content-info p {
    font-size: 15px;
  }
}
</style>
