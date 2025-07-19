<template>
  <div class="dynamic-item">
    <p>{{ content }}</p>
    <span class="time">{{ time }}</span>
  </div>
</template>

<script>
export default {
  name: 'DynamicItem',
  props: {
    content: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.dynamic-item {
  background: #f8f9fa;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border-left: 4px solid #2062ea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dynamic-item p {
  margin: 0;
  color: #444;
  font-size: 16px;
}

.time {
  color: #888;
  font-size: 14px;
}
</style>
