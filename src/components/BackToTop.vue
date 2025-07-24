<template>
  <!-- Back to Top 按钮 -->
  <Transition name="fade">
    <button
      v-if="showBackToTop"
      @click="scrollToTop"
      class="back-to-top-btn"
      :style="buttonStyle"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Props 定义，提供自定义选项
const props = defineProps({
  // 显示按钮的滚动距离阈值
  threshold: {
    type: Number,
    default: 300
  },
  // 按钮位置
  bottom: {
    type: String,
    default: '2rem'
  },
  right: {
    type: String,
    default: '2rem'
  },
  // 按钮颜色
  backgroundColor: {
    type: String,
    default: 'white'
  },
  // 按钮大小
  size: {
    type: String,
    default: '3rem'
  }
})

const showBackToTop = ref(false)

const handleScroll = () => {
  showBackToTop.value = window.pageYOffset > props.threshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 计算按钮样式
const buttonStyle = computed(() => ({
  bottom: props.bottom,
  right: props.right,
  width: props.size,
  height: props.size,
  backgroundColor: props.backgroundColor
}))

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top-btn {
  position: fixed;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  color: #374151;
}

.back-to-top-btn:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  background-color: #f9fafb;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
