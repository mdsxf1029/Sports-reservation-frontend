<template>
  <div class="admin-menu-bar">
    <!-- 顶部导航栏部分 -->
    <div class="top-navbar">
      <div class="title-section">
        <h1>
          <router-link to="/admin" class="title-link">运动场地预约系统 - 管理后台</router-link>
        </h1>
      </div>

      <div class="right-controls">
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
          <el-avatar :size="40" :src="userAvatar">
            <el-icon v-if="!userAvatar">
              <Avatar />
            </el-icon>
          </el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/admin/profile')">
                管理员信息
              </el-dropdown-item>
              <el-dropdown-item @click="$router.push('/admin/settings')">
                系统设置
              </el-dropdown-item>
              <el-dropdown-item @click="logout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 侧边栏菜单部分 -->
    <aside class="sidebar-menu">
      <router-link
        v-for="item in menuList"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        :class="{ active: route.path === item.path }"
      >
        <el-icon class="menu-icon"><component :is="item.icon" /></el-icon>
        <span class="menu-label">{{ item.label }}</span>
      </router-link>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Operation, Avatar, Sunny, Moon, Edit, Location, Warning, Document, Message } from '@element-plus/icons-vue'
import { getUserInfo } from '@/utils/api'

const router = useRouter()
const route = useRoute()
const activeIndex = ref('0')
const isDarkMode = ref(false)
const userAvatar = ref('') // 用户头像URL

const menuList = [
  { label: '场地管理', path: '/venue', icon: Location },
  { label: '违约管理', path: '/violation', icon: Warning },
  { label: '帖子管理', path: '/post', icon: Document },
  { label: '申诉管理', path: '/appeal', icon: Message }
];

// 加载用户头像 - 通过API获取
const loadUserAvatar = async () => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')
  
  if (token && userId) {
    try {
      // 首先检查是否已经有缓存的头像
      const cachedAvatar = localStorage.getItem('userAvatar')
      if (cachedAvatar) {
        userAvatar.value = cachedAvatar
        return
      }
      
      // 如果没有缓存，通过API获取用户信息
      const response = await getUserInfo(userId)
      if (response && response.code === 0 && response.data) {
        const avatarUrl = response.data.avatarUrl
        if (avatarUrl) {
          // 存储到localStorage并显示
          localStorage.setItem('userAvatar', avatarUrl)
          userAvatar.value = avatarUrl
        } else {
          userAvatar.value = '' // 没有头像则显示默认图标
        }
      }
    } catch (error) {
      console.error('获取用户头像失败:', error)
      userAvatar.value = '' // 出错时显示默认图标
    }
  } else {
    userAvatar.value = '' // 未登录时显示默认图标
  }
}

// 退出登录方法
const logout = () => {
  // 清除本地存储的token和用户信息
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('userName')
  localStorage.removeItem('expires')
  localStorage.removeItem('userAvatar') // 清除缓存的头像
  
  // 清空头像显示
  userAvatar.value = ''
  
  // 跳转到登录页面
  router.push('/home')
  
  // 可以添加提示消息
  alert('已退出登录')
}

const handleScroll = () => {
  const menuBar = document.querySelector('.admin-menu-bar')
  if (window.scrollY > 60) {
    menuBar.classList.add('transparent-header')
  } else {
    menuBar.classList.remove('transparent-header')
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadUserAvatar() // 组件挂载时加载用户头像
})

// 监听路由变化，当从登录页面跳转到其他页面时重新加载头像
watch(() => route.path, () => {
  loadUserAvatar()
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

.admin-menu-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  pointer-events: auto;
}

.top-navbar {
  height: 60px;
  background-color: var(--header-background-initial-color);
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 6px -1px var(--header-shadow-color-1), 0 2px 4px -1px var(--header-shadow-color-2);
  color: var(--header-text-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  pointer-events: auto;
}

.transparent-header .top-navbar {
  background-color: var(--header-background-transparent-color);
}

.title-section h1 {
  font-size: 24px;
  margin: 0;
  color: var(--header-text-color);
}

.title-link {
  color: inherit;
  text-decoration: none;
  font-size: inherit;
  font-weight: inherit;
  display: inline;
}

.title-link:hover,
.title-link:visited,
.title-link:active {
  color: inherit;
}

.right-controls {
  display: flex;
  align-items: center;
}

.sidebar-menu {
  position: fixed;
  top: 63px; /* 脱开顶部导航 */
  left: 0;
  height: calc(100vh - 60px);
  width: 220px;
  background: linear-gradient(180deg, #f8f9fa, #ffffff);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  z-index: 999;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  color: #444;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  border-left: 4px solid transparent;
}

.menu-item:hover {
  background-color: #f0f4ff;
  color: #0056b3;
}

.menu-item.active {
  background-color: #e6f0ff;
  color: #0056b3;
  border-left: 4px solid #0056b3;
  font-weight: bold;
}

.menu-icon {
  margin-right: 12px;
  font-size: 18px;
  color: inherit;
}

.menu-label {
  flex: 1;
  font-size: 15px;
}
</style> 