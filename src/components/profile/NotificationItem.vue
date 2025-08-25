<template>
  <div 
    class="notification-item" 
    :class="{ 'unread': !isread, 'read': isread }"
  >
    <!-- 未读红点 -->
    <div v-if="!isread" class="unread-dot"></div>
    
    <!-- 主要内容区域 -->
    <div class="notification-content">
      <div class="notification-header">
        <h4 class="notification-title">{{ content }}</h4>
        <span class="notification-time">{{ time }}</span>
      </div>
      
      <div class="notification-footer">
        <span v-if="!isread" class="status-unread">未读</span>
        <span v-else class="status-read">已读</span>
        
        <el-button 
          v-if="!isread" 
          type="primary" 
          size="small" 
          plain
          @click="markAsRead"
          class="mark-read-btn"
        >
          标记已读
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { markNotificationAsRead } from '@/utils/api'
import { ElMessage } from 'element-plus'

const props = defineProps({
  notificationId: {
    type: Number,
    required: true
  },
  isread: {
    type: Boolean,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:isread', 'read'])

// 响应式数据
const isReadState = ref(props.isread)

// 标记已读
const markAsRead = async () => {
  if (isReadState.value) return
  
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      ElMessage.error('用户信息不存在，请重新登录')
      return
    }
    
    const res = await markNotificationAsRead(userId, props.notificationId)
    console.log('标记已读结果:', res)
    if(res.data.code == 0){
      isReadState.value = true
      emit('update:isread', true)
      emit('read', props.notificationId)
      ElMessage.success('已标记为已读')
    }else{
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败，请稍后重试')
  }
}
</script>

<style scoped>
.notification-item {
  position: relative;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  background: #ffffff;
  transition: all 0.2s;
}

/* 未读通知 */
.notification-item.unread {
  border-left: 4px solid #1890ff;
  background: #fafbff;
}

.notification-item.unread:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 已读通知 */
.notification-item.read {
  background: #f8f8f8;
  opacity: 0.8;
}

.notification-item.read .notification-title {
  color: #999;
}

/* 未读红点 */
.unread-dot {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
}

/* 内容区域 */
.notification-content {
  margin-left: 16px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notification-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-unread {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
}

.status-read {
  font-size: 12px;
  color: #52c41a;
}

.mark-read-btn {
  font-size: 12px;
  padding: 4px 8px;
  height: auto;
}
</style>
