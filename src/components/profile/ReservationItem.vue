<template>
  <div class="reservation-card">
    <div class="reservation-item">
      <div class="content-info">
        <p>{{ content }}</p>
      </div>
      <div class="status-and-actions">
        <span class="status" :class="statusClass">{{ status }}</span>
        
        <!-- 按钮组 -->
        <div class="button-group">
          <!-- 取消预约按钮 -->
          <el-button 
            size="small" 
            type="danger" 
            class="cancel-button"
            @click="confirmCancelReservation"
            v-if="statusType === 'upcoming'"
            :loading="cancelling"
          >
            取消预约
          </el-button>
          
          <!-- 查看二维码按钮 -->
          <el-button 
            size="small" 
            type="primary" 
            class="qr-button"
            @click="showQRCode"
            v-if="['upcoming', 'ongoing'].includes(statusType)"
          >
            查看二维码
          </el-button>

          <!-- 申诉订单按钮 -->
          <el-button 
            size="small" 
            type="danger" 
            class="appeal-button"
            @click="appealOrder"
            v-if="statusType === 'overtime'" 
          >
            申诉订单
          </el-button>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessageBox, ElMessage } from 'element-plus'

export default {
  name: 'ReservationItem',
  props: {
    appointmentId: {
      type: [String, Number],
      required: true
    },
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
      default: 'upcoming',
    },
    orderDetail: {
      type: Object,
      default: () => ({})
    },
  },
  
  data() {
    return {
      cancelling: false 
    }
  },
  
  computed: {
    statusClass() {
      return `${this.statusType}-status`
    }
  },
  
  //  添加申诉事件
  emits: ['show-qr-code', 'cancel-reservation', 'appeal-order'],  
  
  methods: {
    showQRCode() {
      this.$emit('show-qr-code', this.orderDetail)
    },
    
    //  新增申诉方法
    appealOrder() {
      this.$emit('appeal-order', {
        appointmentId: this.appointmentId,
        orderDetail: this.orderDetail
      })
    },
    
    // 确认取消预约
    async confirmCancelReservation() {
      try {
        await ElMessageBox.confirm(
          '确定要取消这个预约吗？取消后无法恢复。',
          '确认取消',
          {
            confirmButtonText: '确定取消',
            cancelButtonText: '我再想想',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          }
        )
        
        await this.cancelReservation()
      } catch (error) {
        console.log('用户取消了操作')
      }
    },

    // 执行取消预约
    async cancelReservation() {
      this.cancelling = true
      try {
        this.$emit('cancel-reservation', {
          appointmentId: this.appointmentId
        })
      } catch (error) {
        console.error('取消预约失败:', error)
        ElMessage.error('取消预约失败，请稍后重试')
      } finally {
        this.cancelling = false
      }
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

.active-status, .upcoming-status, .ongoing-status {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.pending-status, .warning-status {
  background: linear-gradient(135deg, #e6a23c 0%, #f0a020 100%);
  color: white;
}

.cancelled-status, .error-status {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: white;
}

.completed-status, .success-status {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
}

.expired-status {
  background: linear-gradient(135deg, #909399 0%, #b1b3b8 100%);
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

/* ✅ 新增按钮组样式 */
.button-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ✅ 新增取消按钮样式 */
.cancel-button {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3);
}

.cancel-button:hover {
  background: linear-gradient(135deg, #f78989 0%, #f56c6c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
}

.cancel-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3);
}

/* 修改响应式设计 */
@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .cancel-button,
  .qr-button {
    width: 100%;
  }
}
</style>
