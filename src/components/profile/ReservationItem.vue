<template>
  <div class="reservation-item">
    <p>{{ content }}</p>
    <span class="status" :class="statusClass">{{ status }}</span>
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
    }
  },
  computed: {
    statusClass() {
      return {
        'active-status': this.statusType === 'active',
        'pending-status': this.statusType === 'pending',
        'cancelled-status': this.statusType === 'cancelled'
      }
    }
  }
}
</script>

<style scoped>
.reservation-item {
  background: #f8f9fa;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border-left: 4px solid #2062ea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reservation-item p {
  margin: 0;
  color: #444;
  font-size: 16px;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.active-status {
  background: #e8f5e8;
  color: #2d8f2d;
}

.pending-status {
  background: #fff3cd;
  color: #856404;
}

.cancelled-status {
  background: #f8d7da;
  color: #721c24;
}
</style>
