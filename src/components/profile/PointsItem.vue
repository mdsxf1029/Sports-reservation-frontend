<template>
  <div class="points-item">
    <div class="points-content">
      <p>{{ content }}</p>
      <span class="points-change" :class="changeType">{{ pointsChange }}</span>
    </div>
    <span class="time">{{ time }}</span>
  </div>
</template>

<script>
export default {
  name: 'PointsItem',
  props: {
    content: {
      type: String,
      required: true
    },
    pointsChange: {
      type: String,
      required: true
    },
    changeType: {
      type: String,
      default: 'increase', // 'increase' 或 'decrease'
      validator: value => ['increase', 'decrease'].includes(value)
    },
    time: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.points-item {
  background: #f8f9fa;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border-left: 4px solid #ff9500;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.points-content p {
  margin: 0;
  color: #444;
  font-size: 16px;
}

.points-change {
  font-weight: bold;
  font-size: 16px;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 60px;
  text-align: center;
}

.points-change.increase {
  color: #52c41a;
  background: #f6ffed;
}

.points-change.decrease {
  color: #ff4d4f;
  background: #fff2f0;
}

.time {
  color: #888;
  font-size: 14px;
  margin-left: 16px;
}
</style>
