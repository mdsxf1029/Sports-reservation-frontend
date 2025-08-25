
<template>
  <el-menu :default-active='activeIndex' class='header-navbar' mode='horizontal' :ellipsis='false'>
    <el-container>
      <h1>
        <router-link to="/home"  class="title-link">运动场地预约系统</router-link>
      </h1>
    </el-container>
    <el-menu-item class="navbar-item" index="1" @click="$router.push('/home')">
      首页
    </el-menu-item>
    <el-menu-item class="navbar-item" index="2" @click="$router.push('/news')">
      运动新闻
    </el-menu-item>
    <el-menu-item class="navbar-item" index="3" @click="$router.push('/community')">
      运动社区
    </el-menu-item>
    <el-menu-item class="navbar-item" index="4"@click="$router.push('/venuelist')">
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
      <el-avatar :size="40" :src="userAvatar">
        <el-icon v-if="!userAvatar">
          <Avatar />
        </el-icon>
      </el-avatar>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="$router.push('/profile')">
            个人空间
          </el-dropdown-item>
          <el-dropdown-item @click="$router.push('/login')">
            登录
          </el-dropdown-item>
          <el-dropdown-item @click="$router.push('/register')">
            注册
          </el-dropdown-item>
          <el-dropdown-item @click="logout">
            退出账号
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Operation, Avatar, Sunny, Moon, Edit, } from '@element-plus/icons-vue'
import { getUserInfo } from '@/utils/api'

const router = useRouter()
const route = useRoute()
const activeIndex = ref('0')
const isDarkMode = ref(false)
const userAvatar = ref('') // 用户头像URL

// 加载用户头像 - 通过API获取
const loadUserAvatar = async () => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')
  
  if (token && userId) {
    try {
      // 首先检查是否已经有缓存的头像
      const cachedAvatar = localStorage.getItem('userAvatar')
      if (cachedAvatar) {
        console.log('使用缓存的头像:', cachedAvatar)
        userAvatar.value = cachedAvatar
        return
      }
      
      // 如果没有缓存，通过API获取用户信息
      const res = await getUserInfo(userId)
      console.log('获取用户信息:', res)
      const response = res.data
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
  const header = document.querySelector('.header-navbar')
  if (window.scrollY > 60) {
    header.classList.add('transparent-header')
  } else {
    header.classList.remove('transparent-header')
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
/* 让 header 里的所有文字都用变量色 */
.header-navbar,
.header-navbar h1,
.header-navbar .navbar-item,
.header-navbar .el-menu-item,
.header-navbar .el-menu-item.is-active,
.header-navbar .el-menu-item:hover {
  color: var(--header-text-color) !important;
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

</style>
