<template>
  <div class="notification-item">
    <div class="notification-content">
      <p>{{ content }}</p>
      <span class="time">{{ time }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationItem',
  props: {
    notificationId: {
      type: String,
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
    // 删除isRead prop
  }
  // 删除emit mark-read
}
</script>

<style scoped>
.notification-item {
  background: #f8f9fa;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border-left: 4px solid #2062ea;
  transition: all 0.2s;
}

.notification-content {
  width: 100%;
}

.notification-content p {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.time {
  font-size: 12px;
  color: #666;
}

.notification-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
