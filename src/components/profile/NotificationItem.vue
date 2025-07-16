<template>
  <div class="notification-item" :class="{ 'unread': !isRead }">
    <p>{{ content }}</p>
    <span class="time">{{ time }}</span>
  </div>
</template>

<script>
export default {
  name: 'NotificationItem',
  props: {
    content: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.notification-item {
  background: #f8f9fa;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border-left: 4px solid #2062ea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.notification-item.unread {
  background: #e3f2fd;
  border-left-color: #1976d2;
}

.notification-item p {
  margin: 0;
  color: #444;
  font-size: 16px;
}

.time {
  color: #888;
  font-size: 14px;
}
</style>
