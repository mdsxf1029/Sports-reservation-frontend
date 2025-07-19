<template>
  <div class="all-page"> 
    <div class="main-content">
    <HeaderNavbar class="navbar"/>
    <div class = "top-bar"> 
        <!-- 背景图区域 -->
        <div class="profile-bg"></div>
        <!-- 个人信息卡片 -->
        <div class="profile-card">
            <img class="avatar" :src="userProfile.avatarUrl || '@/assets/Backgrounds/Flower2.jpg'" alt="头像"/>
                <div class="profile-info">
                <div class="name">{{ userProfile.userName || '加载中...' }}</div>
                <div class="desc">{{ userProfile.email || '加载中...' }} | {{ getRoleText(userProfile.role) || '加载中...' }}</div>
            </div>
            <button class="edit-btn" @click="editProfile">编辑个人资料</button>
        </div>
    </div>
    <!-- Tab栏 -->
    <div class="tab-card">
        <div class="tabs">
        <span class="tab" :class="{active: activeTab === 'profile'}" @click="activeTab = 'profile'">个人资料</span>
        <span class="tab" :class="{active: activeTab === 'favorite'}" @click="activeTab = 'favorite'">收藏</span>
        <span class="tab" :class="{active: activeTab === 'reservation'}" @click="activeTab = 'reservation'">预约</span>
        <span class="tab" :class="{active: activeTab === 'points'}" @click="activeTab = 'points'">积分</span>
        <span class="tab" :class="{active: activeTab === 'notification'}" @click="activeTab = 'notification'">信息通知中心</span>
        
    </div>
        <div class="tab-content">
        <!-- 个人资料内容 -->
        <TabContent 
          v-if="activeTab === 'profile'" 
          title="个人资料" 
          :showAddButton="false"
        >
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <span style="margin-left: 10px;">加载中...</span>
          </div>
          <div v-else class="profile-details">
            <div class="profile-section">
              <h3>基本信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>用户名：</label>
                  <span>{{ userProfile.userName || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>用户ID：</label>
                  <span>{{ userProfile.userId || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>电话号码：</label>
                  <span>{{ userProfile.telephone || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>邮箱：</label>
                  <span>{{ userProfile.email || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>性别：</label>
                  <span>{{ getGenderText(userProfile.gender) }}</span>
                </div>
                <div class="info-item">
                  <label>出生日期：</label>
                  <span>{{ formatDate(userProfile.birthday) || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>所在地区：</label>
                  <span>{{ userProfile.region || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>用户角色：</label>
                  <span>{{ getRoleText(userProfile.role) }}</span>
                </div>
                <div class="info-item">
                  <label>注册时间：</label>
                  <span>{{ formatDate(userProfile.register_time) || '未知' }}</span>
                </div>
                <div class="info-item">
                  <label>当前积分：</label>
                  <span class="points-highlight">{{ userProfile.points || 0 }}</span>
                </div>
              </div>
            </div>
            
            <div class="profile-section">
              <h3>个人简介</h3>
              <p class="bio">{{ userProfile.profile || '这个人很懒，什么都没有留下...' }}</p>
            </div>
          </div>
        </TabContent>
        
        <!-- 收藏内容 -->
        <TabContent 
          v-if="activeTab === 'favorite'" 
          title="我的收藏"
          :showAddButton="true"
          @add="addFavorite"
        >
          <FavoriteItem 
            v-for="(item, index) in favoriteList" 
            :key="index"
            :content="item.content"
            :removable="true"
            @remove="removeFavorite(index)"
          />
        </TabContent>
        
        <!-- 预约内容 -->
        <TabContent 
          v-if="activeTab === 'reservation'" 
          title="我的预约"
        >
          <ReservationItem 
            v-for="(item, index) in reservationList" 
            :key="index"
            :content="item.content"
            :status="item.status"
            :statusType="item.statusType"
          />
        </TabContent>
        
        <!-- 通知内容 -->
        <TabContent 
          v-if="activeTab === 'notification'" 
          title="信息通知中心"
        >
          <NotificationItem 
            v-for="(item, index) in notificationList" 
            :key="index"
            :content="item.content"
            :time="item.time"
            :isRead="item.isRead"
          />
        </TabContent>
        
        <!-- 积分内容 -->
        <TabContent 
          v-if="activeTab === 'points'" 
          title="我的积分"
          :showAddButton="false"
        >
          <div class="points-summary">
            <div class="current-points">
              <span class="points-label">当前积分</span>
              <span class="points-value">{{ currentPoints }}</span>
            </div>
          </div>
          <PointsItem 
            v-for="(item, index) in pointsList" 
            :key="index"
            :content="item.content"
            :pointsChange="item.pointsChange"
            :changeType="item.changeType"
            :time="item.time"
          />
        </TabContent>
        </div>
    </div>
    </div>
    <BackToTop/>
    <footer>
        <FooterNavbar/>
    </footer>
    </div>
</template>

<script>
import {ref} from 'vue'
import { getUserInfo,updateUserInfo } from '@/utils/api'
import { ElMessage } from 'element-plus'
import HeaderNavbar from '@/components/HeaderNavbar.vue'
import FooterNavbar from '@/components/FooterNavbar.vue'
import FavoriteItem from '@/components/profile/FavoriteItem.vue'
import ReservationItem from '@/components/profile/ReservationItem.vue'
import NotificationItem from '@/components/profile/NotificationItem.vue'
import PointsItem from '@/components/profile/PointsItem.vue'
import TabContent from '@/components/profile/TabContent.vue'
import BackToTop from '../../components/BackToTop.vue'

        
export default {
  components: { 
    HeaderNavbar, 
    FooterNavbar,
    FavoriteItem,
    ReservationItem,
    NotificationItem,
    PointsItem,
    TabContent,
    BackToTop
  },
  data() {
    return {
      activeTab: 'profile', // 默认显示个人资料选项卡
      currentPoints: 0, // 当前积分总数
      isLoading: false, // 加载状态
      
      // 用户个人资料数据（初始化为空，将从API获取）
      userProfile: {
        userName: '',
        userId: '',
        telephone: '',
        email: '',
        password: '', // 密码通常不显示，仅用于更新操作
        gender: '',
        birthday: '',
        avatarUrl: '',
        region: '',
        profile: '',
        role: '',
        register_time: '',
        points: 0
      },
      
      // 收藏数据
      favoriteList: [
        { content: '⭐ 羽毛球馆A - 环境优美，设施齐全' },
        { content: '⭐ 游泳馆B - 水质清澈，教练专业' }
      ],
      // 预约数据
      reservationList: [
        { content: '🏀 篮球场地 - 明天 15:00-17:00', status: '已确认', statusType: 'active' },
        { content: '🏊‍♂️ 游泳池 - 本周六 09:00-11:00', status: '待确认', statusType: 'pending' }
      ],
      // 通知数据
      notificationList: [
        { content: '📢 您的篮球场预约已确认', time: '30分钟前', isRead: false },
        { content: '💰 会员积分+50，继续加油！', time: '2小时前', isRead: true }
      ],
      // 积分数据
      pointsList: [
        { content: '完成篮球场预约', pointsChange: '+50', changeType: 'increase', time: '2小时前' },
        { content: '取消羽毛球预约', pointsChange: '-20', changeType: 'decrease', time: '1天前' },
        { content: '首次注册奖励', pointsChange: '+100', changeType: 'increase', time: '3天前' },
        { content: '连续签到奖励', pointsChange: '+30', changeType: 'increase', time: '5天前' }
      ]
    }
  },
  mounted() {
    console.log('Profile页面已加载，开始检查登录状态...')
    
    // 为了测试，临时设置一些登录信息（如果没有的话）
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'test-token-123')
      localStorage.setItem('userId', '1')
      localStorage.setItem('userName', 'testUser')
      console.log('设置了测试用的登录信息')
    }
    
    this.checkLoginAndLoadProfile()
  },
  methods: {
    // 检查登录状态并加载用户资料
    async checkLoginAndLoadProfile() {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      console.log('登录检查:', { token: !!token, userId: userId })
      
      if (!token || !userId) {
        ElMessage.warning('请先登录后再访问个人中心')
        setTimeout(() => {
          this.$router.push('/login')
        }, 3000)
        return
      }
      
      // 检查token是否过期
      const expires = localStorage.getItem('expires')
      if (expires && new Date(expires) < new Date()) {
        ElMessage.warning('登录已过期，请重新登录')
        this.clearLoginData()
        setTimeout(() => {
          this.$router.push('/login')
        }, 3000)
        return
      }
      
      // 如果登录状态正常，加载用户资料
      await this.loadUserProfile(userId)
    },

    // 加载用户资料
    async loadUserProfile(userId) {
      this.isLoading = true
      try {
        console.log('开始获取用户信息，用户ID:', userId)
        const response = await getUserInfo(userId)
        console.log('API响应:', response)
        
        if (response && response.code === 0) {
          let userData
          
          // 处理不同的API响应格式  为了兼容
          if (response.data.code === 0 || response.data.code === 200) {
            userData = response.data.data
          } else if (response.data.code) {
            ElMessage.error(response.data.msg || response.data.message || '获取用户信息失败')
            return
          } else { 
            userData = response.data
          }
          
          // 更新用户资料数据
          this.updateUserProfile(userData)
          this.currentPoints = userData.points || 0
          
          console.log('用户信息更新成功:', this.userProfile)
          ElMessage.success('用户信息加载成功')
        } else {
          throw new Error('API响应格式错误')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败，请稍后重试')
        
        // 在API调用失败时，使用一些默认的示例数据
        this.useDefaultUserProfile()
      } finally {
        this.isLoading = false
      }
    },

    // 使用默认用户资料（API调用失败时的后备方案）
    useDefaultUserProfile() {
      this.userProfile = {
        userName: '示例用户',
        userId: '20240001',
        telephone: '138****8888',
        email: 'example@university.edu.cn',
        password: '',
        gender: 'male',
        birthday: '1995-06-15',
        avatarUrl: '',
        region: '上海市',
        profile: '热爱运动的大学生',
        role: 'normal',
        register_time: '2024-01-01T00:00:00Z',
        points: 1250
      }
      this.currentPoints = 1250
      console.log('使用默认用户资料')
    },

    // 更新用户资料数据
    updateUserProfile(userData) {
      this.userProfile = {
        userName: userData.userName || userData.name || '未设置',
        userId: userData.userId || userData.id || userData.studentId || userData.workId || '未设置',
        telephone: userData.telephone || userData.phone || userData.mobile || '未设置',
        email: userData.email || '未设置',
        password: '', // 密码不显示
        gender: userData.gender || 'unknown',
        birthday: userData.birthday || userData.birthDate || '',
        avatarUrl: userData.avatarUrl || userData.avatar || userData.profilePicture || '',
        region: userData.region || userData.location || userData.city || '未设置',
        profile: userData.profile || userData.bio || userData.description || userData.introduction || '这个人很懒，什么都没有留下...',
        role: userData.role || 'normal',
        register_time: userData.register_time || userData.registerTime || userData.createdAt || '',
        points: userData.points || 0
      }
    },

    // 清除登录数据
    clearLoginData() {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      localStorage.removeItem('expires')
      localStorage.removeItem('userAvatar')
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '未设置'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },

    // 获取性别文本
    getGenderText(gender) {
      switch (gender) {
        case 'male':
          return '男'
        case 'female':
          return '女'
        case 'unknown':
        default:
          return '未设置'
      }
    },

    // 获取角色文本
    getRoleText(role) {
      switch (role) {
        case 'normal':
          return '普通用户'
        case 'manager':
        case 'manager':
          return '管理员'
        default:
          return role || '未设置'
      }
    },

    // 编辑个人资料
    editProfile() {
      ElMessage.info('编辑功能开发中...')
    },
    // 添加收藏
    addFavorite() {
      const newFavorite = {
        content: `⭐ 新收藏场馆 - ${new Date().toLocaleString()}`
      }
      this.favoriteList.unshift(newFavorite)
    },
    // 移除收藏
    removeFavorite(index) {
      this.favoriteList.splice(index, 1)
    }
  }
}
</script>

<style scoped>
/*全局样式*/
.all-page {
  display: flex; 
  min-height: 100vh;
  width: 100%; /* 改为100%而不是100vw */
  max-width: 100vw; /* 确保不超出视口 */
  margin: 0 auto;
  background: #F5F5F5;
  flex-direction: column;
  padding-top: 90px;   /* 顶栏高度+适当间距 */
  overflow-x: hidden; /* 防止水平溢出 */
  box-sizing: border-box; /* 确保padding计算在宽度内 */
} 
/* 顶栏导航 */
.navbar {
  width: 100%; /* 改为100%而不是99vw */
  position: fixed;
  margin: 0 auto;
  top: 0; 
  z-index: 100; /* 顶层 */
}
/* 主内容区域 */
.main-content {
  
  padding-top: 4px; /* 顶栏高度 */
}
/* 顶部工具栏 */
.top-bar {
  padding: 4px 24px;  
  max-width: 100%; /* 改为100%确保不超出容器 */
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box; /* 确保padding计算在宽度内 */
}
/* 背景图区域 */
.profile-bg { 
  height: 20vh;
  width: 90%;
  margin: 0 auto;
  background: url('@/assets/Backgrounds/Flower1.jpg') center/cover no-repeat; 
}
/* 个人信息卡片 */
.profile-card {
  position: relative;  
  width: 90%;
  margin: 0 auto 30px auto; /* 增加30px下边距 */
  background: #fff;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12); 
  border-radius: 12px; /* 圆角 */
  display: flex;
  align-items: center;
  padding: 30px ;
  box-sizing: border-box; /* padding包含在width内 */
  z-index: 10;
}

/* 头像样式 */
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #f7f7f7;
  margin-right: 32px;
  object-fit: cover;
}
/* 个人信息样式 */
.profile-info {
  flex: 1;
}
/* 个人信息文本样式 */
.name {
  font-size: 32px;
  font-weight: bold;
  color: #222;
  margin-bottom: 6px;
}
/* 个人信息描述 */
.desc {
  font-size: 18px;
  color: #444;
}
/* 编辑按钮 */
.edit-btn {
  padding: 8px 20px;
  border: 1.5px solid #2062ea;
  background: #fff;
  color: #2062ea;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background .2s;
  margin-left: 20px;
}
/* 鼠标悬停效果 */
.edit-btn:hover {
  background: #f0f6ff;
}
/* Tab栏 */
.tab-card {
  width: 75%;
  margin: 0 auto 40px auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 20px 24px 32px 24px;
}
/* Tab标题样式 */
.tabs {
  display: flex;
  border-bottom: 1.5px solid #ececec;
  margin-bottom: 8px; /* 从12px减少到8px */
}
/* Tab按钮样式 */
.tab {
  margin-right: 48px;
  font-size: 17px;
  color: #222;
  cursor: pointer;
  padding: 6px 16px 4px 16px; /* 减少上下padding */
  transition: color .2s, border .2s;
  border-bottom: 2.5px solid transparent;
  border-radius: 4px;
}
/* Tab按钮悬停效果 */
.tab.active {
  color: #2062ea;
  border-bottom: 2.5px solid #2062ea;
  font-weight: 600;
}
/* Tab内容区 */
.tab-content {
  min-height: 200px;
  margin-top: 4px; /* 添加很小的上边距 */
}

/* 积分摘要样式 */
.points-summary {
  background: linear-gradient(135deg, #ff9500, #ffad33);
  padding: 20px; /* 从24px减少到20px */
  margin-bottom: 16px; /* 从20px减少到16px */
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 16px rgba(255, 149, 0, 0.3);
}

.current-points {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-label {
  font-size: 18px;
  font-weight: 500;
}

.points-value {
  font-size: 32px;
  font-weight: bold;
}

/* 个人资料详情样式 */
.profile-details {
  padding: 0;
}

.profile-section {
  margin-bottom: 24px; /* 从32px减少到24px */
  padding: 16px; /* 从20px减少到16px */
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.profile-section h3 {
  color: #2062ea;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0; /* 从16px减少到12px */
  padding-bottom: 6px; /* 从8px减少到6px */
  border-bottom: 2px solid #e8f4ff;
}

/* 信息网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px; /* 从16px减少到12px */
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0; /* 从12px减少到8px */
}

.info-item label {
  font-weight: 600;
  color: #555;
  min-width: 100px;
  margin-right: 2px; /* 从12px减少到10px */
}

.info-item span {
  color: #333;
  font-size: 15px;
}


.preference-tag {
  background: linear-gradient(135deg, #2062ea, #4b82f6);
  color: white;
  padding: 6px 12px; /* 从8px 16px减少到6px 12px */
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(32, 98, 234, 0.3);
}

/* 个人简介 */
.bio {
  color: #666;
  line-height: 1.6;
  font-size: 15px;
  margin: 0;
  padding: 12px; /* 从16px减少到12px */
  background: white;
  border-radius: 8px;
  border-left: 4px solid #2062ea;
}

/* 统计信息网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #2062ea;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

/* 积分高亮样式 */
.points-highlight {
  color: #ff6b35;
  font-weight: bold;
  font-size: 18px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2062ea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 底部footer */
footer {
  margin-top: auto;
  width: 100%;
  text-align: center;
  padding: 8px 0 4px 0; /* 上下各10px和8px的内边距 */
  background: #FFF;
  font-size: 14px;
}

</style>
