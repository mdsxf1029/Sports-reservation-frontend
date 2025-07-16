<template>
  <div class="content-section">
    <h3>{{ title }}</h3>
    <div class="content-list">
      <slot />
    </div>
    <div v-if="showAddButton" class="add-section">
      <button @click="$emit('add')" class="add-btn">+ 添加新项目</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabContent',
  props: {
    title: {
      type: String,
      required: true
    },
    showAddButton: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add']
}
</script>

<style scoped>
.content-section h3 {
  color: #333;
  font-size: 20px;
  margin-bottom: 20px;
  font-weight: 600;
}

.content-list {
  margin-bottom: 20px;
}

.add-section {
  text-align: center;
  padding: 20px 0;
}

.add-btn {
  padding: 12px 24px;
  background: #2062ea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #1854d1;
}
</style>
