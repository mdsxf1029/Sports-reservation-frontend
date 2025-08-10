<template>
  <el-menu :default-active='activeIndex' class='admin-header-navbar' mode='horizontal' :ellipsis='false'>
    <el-container>
      <h1>
        <router-link to="/admin"  class="title-link">运动场地预约系统 - 管理后台</router-link>
      </h1>
    </el-container>

    <!-- 管理功能导航 -->
    <div class="admin-nav-section">
      <el-menu-item 
        index="/venue" 
        @click="$router.push('/venue')"
        :class="{ 'is-active': $route.path === '/venue' }"
      >
        <el-icon><Location /></el-icon>
        <span>场地管理</span>
      </el-menu-item>
      
      <el-menu-item 
        index="/violation" 
        @click="$router.push('/violation')"
        :class="{ 'is-active': $route.path === '/violation' }"
      >
        <el-icon><Warning /></el-icon>
        <span>违约管理</span>
      </el-menu-item>
      
      <el-menu-item 
        index="/post" 
        @click="$router.push('/post')"
        :class="{ 'is-active': $route.path === '/post' }"
      >
        <el-icon><Document /></el-icon>
        <span>帖子管理</span>
      </el-menu-item>
      
      <el-menu-item 
        index="/appeal" 
        @click="$router.push('/appeal')"
        :class="{ 'is-active': $route.path === '/appeal' }"
      >
        <el-icon><ChatDotRound /></el-icon>
        <span>申诉管理</span>
      </el-menu-item>
    </div>

    <div class="flex-grow"/>

    <!-- 右侧控制区域 -->
    <div class="right-controls">
      <el-switch size="large"
                 v-model="isDarkMode"
                 style='margin-right: 15px; margin-bottom: 2px; outline: none'
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
                   style='margin-right: 15px; margin-bottom: 2px; outline: none'>
        <el-icon :size="30">
          <Operation />
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$router.push('/admin/dashboard')">
              <el-icon><DataBoard /></el-icon>
              数据概览
            </el-dropdown-item>
            <el-dropdown-item @click="$router.push('/admin/settings')">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item @click="$router.push('/admin/logs')">
              <el-icon><Document /></el-icon>
              操作日志
            </el-dropdown-item>
          </el-dropdown-menu>
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
            <el-dropdown-item @click="$router.push('/profile')">
              <el-icon><User /></el-icon>
              管理员信息
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-menu>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Operation, 
  Avatar, 
  Sunny, 
  Moon, 
  Location,
  Warning,
  Document,
  ChatDotRound,
  DataBoard,
  Setting,
  User,
  Key,
  SwitchButton
} from '@element-plus/icons-vue'
import { getUserInfo } from '@/utils/api'

const router = useRouter()
const route = useRoute()
const isDarkMode = ref(false)
const userAvatar = ref('') // 用户头像URL

// 计算当前激活的菜单项
const activeIndex = computed(() => {
  return route.path
})

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
  router.push('/login')
  
  // 可以添加提示消息
  alert('已退出登录')
}

onMounted(() => {
  loadUserAvatar() // 组件挂载时加载用户头像
})

// 监听路由变化，当从登录页面跳转到其他页面时重新加载头像
watch(() => route.path, () => {
  loadUserAvatar()
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

/* 让 header 里的所有文字都用变量色 */
.admin-header-navbar,
.admin-header-navbar h1,
.admin-header-navbar .navbar-item,
.admin-header-navbar .el-menu-item,
.admin-header-navbar .el-menu-item.is-active,
.admin-header-navbar .el-menu-item:hover {
  color: var(--header-text-color) !important;
}

.admin-header-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  align-items: center;
  min-width: 1200px;
  height: 80px; /* 增加导航栏高度 */
  background-color: var(--header-background-initial-color);
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 6px -1px var(--header-shadow-color-1), 0 2px 4px -1px var(--header-shadow-color-2);
  color: var(--header-text-color);
  padding: 0 20px;
}



h1 {
  font-size: 24px;
  margin: 0 20px 0 0;
}

.flex-grow {
  flex-grow: 1;
}

.navbar-item {
  font-size: 16px;
}

/* 管理功能导航区域 */
.admin-nav-section {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.admin-nav-section .el-menu-item {
  height: 80px;
  line-height: 80px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 500;
  border-bottom: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-nav-section .el-menu-item:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff !important;
}

.admin-nav-section .el-menu-item.is-active {
  background-color: rgba(64, 158, 255, 0.15);
  color: #409eff !important;
  border-bottom: 3px solid #409eff;
}

.admin-nav-section .el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 4px;
}

/* 右侧控制区域 */
.right-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 新增：重置router-link样式，保持原文字样式 */
.title-link {
  color: inherit;           /* 继承父元素的颜色 */
  text-decoration: none;    /* 去除下划线 */
  font-size: inherit;       /* 继承父元素的字体大小 */
  font-weight: inherit;     /* 继承父元素的字体粗细 */
  display: inline;          /* 保持行内显示 */
}

.title-link:hover {
  color: inherit;           /* 悬停时也保持原色 */
}

.title-link:visited {
  color: inherit;           /* 访问后保持原色 */
}

.title-link:active {
  color: inherit;           /* 点击时保持原色 */
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .admin-header-navbar {
    min-width: 1000px;
  }
  
  .admin-nav-section .el-menu-item {
    padding: 0 15px;
    font-size: 14px;
  }
  
  .admin-nav-section .el-menu-item .el-icon {
    font-size: 16px;
  }
}

@media (max-width: 1200px) {
  .admin-header-navbar {
    min-width: 800px;
  }
  
  .admin-nav-section .el-menu-item {
    padding: 0 10px;
    font-size: 13px;
  }
  
  .admin-nav-section .el-menu-item .el-icon {
    font-size: 14px;
  }
}
</style> 