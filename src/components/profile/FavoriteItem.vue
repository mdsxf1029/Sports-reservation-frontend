<template>
  <div class="favorite-item">
    <p>{{ content }}</p>
    <button v-if="removable" @click="$emit('remove')" class="remove-btn">移除</button>
  </div>
</template>

<script>
export default {
  name: 'FavoriteItem',
  props: {
    content: {
      type: String,
      required: true
    },
    removable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['remove']
}
</script>

<style scoped>
.favorite-item {
  background: #f8f9fa;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border-left: 4px solid #2062ea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-item p {
  margin: 0;
  color: #444;
  font-size: 16px;
}

.remove-btn {
  padding: 4px 12px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background: #ff3742;
}
</style>
