
<template>
  <el-menu :default-active='activeIndex' class='header-navbar' mode='horizontal' :ellipsis='false'>
    <el-container>
      <h1>运动场地预约系统</h1>
    </el-container>
    <el-menu-item class="navbar-item" index="1"@click="$router.push('/news')">
      运动社区
    </el-menu-item>
    <el-menu-item class="navbar-item" index="2"@click="$router.push('/community')">
      运动新闻
    </el-menu-item>
    <el-menu-item class="navbar-item" index="3"@click="$router.push('/reservation')">
      运动场地预约
    </el-menu-item>

    <div class="flex-grow"/>

    <el-switch size="large"
               v-model="isDarkMode"
               style='margin-right: 10px; margin-bottom: 2px; outline: none'
               @change="toggleDarkMode">
      <template #active-action>
        <el-icon>
          <Moon/>
        </el-icon>
      </template>
      <template #inactive-action>
        <el-icon>
          <Sunny/>
        </el-icon>
      </template>
    </el-switch>

    <el-dropdown size="large"
                 style='margin-right: 10px; margin-bottom: 2px; outline: none'>
      <el-icon :size="30">
        <Operation />
      </el-icon>
      <template #dropdown>

      </template>
    </el-dropdown>

    <el-dropdown size="large"
                 style='margin-right: 20px; margin-bottom: 2px; outline: none'>
      <el-avatar :size="40">
        <el-icon>
          <Avatar />
        </el-icon>
      </el-avatar>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            个人空间
          </el-dropdown-item>
          <el-dropdown-item>
            退出账号
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Operation, Avatar, Sunny, Moon, Edit, } from '@element-plus/icons-vue'
const activeIndex = ref('0')
const isDarkMode = ref(false)

const handleScroll = () => {
  const header = document.querySelector('.header-navbar')
  if (window.scrollY > 60) {
    header.classList.add('transparent-header')
  } else {
    header.classList.remove('transparent-header')
  }
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
document.addEventListener('DOMContentLoaded', () => {
  const htmlElement = document.documentElement
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    htmlElement.classList.add('dark')
  } else {
    htmlElement.classList.remove('dark')
  }
})
const toggleDarkMode = () => {
  const htmlElement = document.documentElement
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  if (isDarkMode.value) {
    htmlElement.classList.add('dark')
  } else {
    htmlElement.classList.remove('dark')
  }
}
</script>

<style scoped>
:global(:root) {
  --header-background-initial-color: rgba(255, 255, 255, 1);
  --header-background-transparent-color: rgba(255, 255, 255, 0.8);
  --header-shadow-color-1: rgba(0, 0, 0, 0.1);
  --header-shadow-color-2: rgba(0, 0, 0, 0.06);
  --header-text-color: #000000;
}

:global(.dark) {
  --header-background-initial-color: rgba(0, 0, 0, 0.9);
  --header-background-transparent-color: rgba(0, 0, 0, 0.8);
  --header-shadow-color-1: rgba(255, 255, 255, 0.1);
  --header-shadow-color-2: rgba(255, 255, 255, 0.06);
  --header-text-color: #ffffff;
}

.header-navbar {
  align-items: center;
  min-width: 1200px;
  background-color: var(--header-background-initial-color);
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 6px -1px var(--header-shadow-color-1), 0 2px 4px -1px var(--header-shadow-color-2);
  color: var(--header-text-color);
}

.transparent-header {
  background-color: var(--header-background-transparent-color);
}

h1 {
  font-size: 24px;
  margin : 10px 20px;
}

.flex-grow {
  flex-grow: 1;
}

.navbar-item {
  font-size: 16px;
}

</style>
