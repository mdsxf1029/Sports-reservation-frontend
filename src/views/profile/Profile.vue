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
        
        <!-- 预约内容 -->
        <TabContent 
          v-if="activeTab === 'reservation'" 
          title="我的预约"
        >
          <div v-if="reservationLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <span style="margin-left: 10px;">加载订单中...</span>
          </div>
          <div v-else-if="reservationList.length === 0" class="empty-state">
            <div class="empty-icon">📅</div>
            <div class="empty-text">暂无预约记录</div>
            <div class="empty-desc">去预约一个场地吧！</div>
          </div>
          <ReservationItem 
            v-else
            v-for="(item, index) in reservationList" 
            :key="item.appointmentId || index"
            :content="item.content"
            :status="item.status"
            :statusType="item.statusType"
            :order-detail="item"
          />
          
          <!-- 分页组件 -->
          <div v-if="reservationList.length > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="reservationPagination.page"
              v-model:page-size="reservationPagination.pageSize"
              :page-sizes="[5, 10, 20, 50]"
              :small="false"
              :disabled="reservationLoading"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="reservationPagination.total"
              @size-change="handleReservationPageSizeChange"
              @current-change="handleReservationPageChange"
            />
          </div>
        </TabContent>
        
        <!-- 通知内容 -->
        <TabContent 
          v-if="activeTab === 'notification'" 
          title="信息通知中心"
        >
          <div v-if="notificationLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <span style="margin-left: 10px;">加载通知中...</span>
          </div>
          <div v-else-if="notificationList.length === 0" class="empty-state">
            <div class="empty-icon">🔔</div>
            <div class="empty-text">暂无通知消息</div>
            <div class="empty-desc">有新消息时会显示在这里</div>
          </div>
          <NotificationItem 
            v-else
            v-for="(item, index) in notificationList" 
            :key="item.notificationId || index"
            :content="item.content"
            :time="item.time"
            :isRead="item.isRead"
          />
          
          <!-- 通知分页组件 -->
          <div v-if="notificationList.length > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="notificationPagination.page"
              v-model:page-size="notificationPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :small="false"
              :disabled="notificationLoading"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="notificationPagination.total"
              @size-change="handleNotificationPageSizeChange"
              @current-change="handleNotificationPageChange"
            />
          </div>
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
          <div v-if="pointsLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <span style="margin-left: 10px;">加载积分记录中...</span>
          </div>
          <div v-else-if="pointsList.length === 0" class="empty-state">
            <div class="empty-icon">🎯</div>
            <div class="empty-text">暂无积分记录</div>
            <div class="empty-desc">使用系统获得积分后会显示在这里</div>
          </div>
          <PointsItem 
            v-else
            v-for="(item, index) in pointsList" 
            :key="item.changeId || index"
            :content="item.content"
            :pointsChange="item.pointsChange"
            :changeType="item.changeType"
            :time="item.time"
          />
          
          <!-- 积分分页组件 -->
          <div v-if="pointsList.length > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="pointsPagination.page"
              v-model:page-size="pointsPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :small="false"
              :disabled="pointsLoading"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pointsPagination.total"
              @size-change="handlePointsPageSizeChange"
              @current-change="handlePointsPageChange"
            />
          </div>
        </TabContent>
        </div>
    </div>
    </div>
    <BackToTop/>
    <footer>
        <FooterNavbar/>
    </footer>
    
    <!-- 编辑个人资料弹窗 -->
    <EditProfileDialog
      v-model="showEditDialog"
      :user-profile="userProfile"
      @success="onEditSuccess"
    />
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import HeaderNavbar from '@/components/HeaderNavbar.vue'
import FooterNavbar from '@/components/FooterNavbar.vue'
import ReservationItem from '@/components/profile/ReservationItem.vue'
import NotificationItem from '@/components/profile/NotificationItem.vue'
import PointsItem from '@/components/profile/PointsItem.vue'
import TabContent from '@/components/profile/TabContent.vue'
import BackToTop from '../../components/BackToTop.vue'
import EditProfileDialog from '@/components/profile/EditProfileDialog.vue'

// 导入服务和工具类
import { UserProfileService, ReservationService, PointsService, NotificationService } from '@/utils/profileService'
import { AuthService } from '@/utils/auth'
import { formatDate, getGenderText, getRoleText } from '@/utils/formatters'

        
export default {
  components: { 
    HeaderNavbar, 
    FooterNavbar,
    ReservationItem,
    NotificationItem,
    PointsItem,
    TabContent,
    BackToTop,
    EditProfileDialog
  },
  data() {
    return {
      activeTab: 'profile', // 默认显示个人资料选项卡
      currentPoints: 0, // 当前积分总数
      isLoading: false, // 加载状态
      reservationLoading: false, // 预约订单加载状态
      pointsLoading: false, // 积分记录加载状态
      notificationLoading: false, // 通知加载状态
      reservationPagination: {
        total: 0,
        page: 1,
        pageSize: 10
      }, // 预约分页信息
      pointsPagination: {
        total: 0,
        page: 1,
        pageSize: 20
      }, // 积分分页信息
      notificationPagination: {
        total: 0,
        page: 1,
        pageSize: 20
      }, // 通知分页信息
      showEditDialog: false, // 控制编辑弹窗显示
      
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
      
      // 预约数据（初始化为空，将从API获取）
      reservationList: [],
      // 通知数据（初始化为空，将从API获取）
      notificationList: [],
      // 积分数据（初始化为空，将从API获取）
      pointsList: [],
    }
  },
  
  async mounted() {
    console.log('Profile页面已加载，开始检查登录状态...')
    
    // 设置测试登录信息（开发用）
    AuthService.setTestLoginInfo()
    
    await this.checkLoginAndLoadProfile()
    
    // 根据当前活跃标签页加载相应数据
    switch(this.activeTab) {
      case 'reservation':
        this.loadReservationData()
        break
      case 'points':
        await this.loadUserPoints()
        this.loadPointsData()
        break
      case 'notification':
        this.loadNotificationData()
        break
    }
  },
  watch: {
    // 监听tab切换，当切换到不同tab时加载相应数据
    activeTab(newTab) {
      switch(newTab) {
        case 'reservation':
          if (!this.reservationList || this.reservationList.length === 0) {
            this.loadReservationData()
          }
          break
        case 'points':
          if (!this.pointsList || this.pointsList.length === 0) {
            this.loadUserPoints()
            this.loadPointsData()
          }
          break
        case 'notification':
          if (!this.notificationList || this.notificationList.length === 0) {
            this.loadNotificationData()
          }
          break
      }
    }
  },
  methods: {
    // 格式化工具方法（直接引用工具函数）
    formatDate,
    getGenderText,
    getRoleText,

    // 检查登录状态并加载用户资料
    async checkLoginAndLoadProfile() {
      const authResult = AuthService.checkLoginStatus()
      
      if (!authResult.isValid) {
        AuthService.handleAuthFailure(authResult.reason, this.$router)
        return
      }
      
      // 如果登录状态正常，加载用户资料
      await this.loadUserProfile(authResult.userId)
    },

    // 加载用户资料
    async loadUserProfile(userId) {
      this.isLoading = true
      try {
        const userProfile = await UserProfileService.loadUserProfile(userId)
        this.userProfile = userProfile
        this.currentPoints = userProfile.points || 0
        console.log('用户信息更新成功:', this.userProfile)
        ElMessage.success('用户信息加载成功')
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.userProfile = UserProfileService.getDefaultUserProfile()
        this.currentPoints = 1250
      } finally {
        this.isLoading = false
      }
    },

    // 编辑个人资料
    editProfile() {
      this.showEditDialog = true
    },
    
    // 编辑成功回调
    onEditSuccess(updatedData) {
      // 更新本地的用户资料数据
      this.userProfile = {
        ...this.userProfile,
        ...updatedData
      }
      this.currentPoints = updatedData.points || this.currentPoints
      
      ElMessage.success('个人资料已更新')
    },

    // 加载预约订单数据
    async loadReservationData(page = 1) {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        console.error('用户ID不存在，无法加载订单数据')
        return
      }

      this.reservationLoading = true
      try {
        const pagination = { ...this.reservationPagination, page }
        const result = await ReservationService.loadReservationData(userId, pagination)
        
        this.reservationList = result.reservationList
        this.reservationPagination = result.paginationInfo
      } catch (error) {
        console.error('加载预约数据失败:', error)
      } finally {
        this.reservationLoading = false
      }
    },

    // 加载用户当前积分
    async loadUserPoints() {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        console.error('用户ID不存在，无法加载用户积分')
        return
      }

      try {
        this.currentPoints = await PointsService.loadUserPoints(userId)
        console.log('用户当前积分:', this.currentPoints)
      } catch (error) {
        console.error('获取用户积分失败:', error)
        this.currentPoints = this.userProfile.points || 0
      }
    },

    // 加载积分数据
    async loadPointsData(page = 1) {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        console.error('用户ID不存在，无法加载积分数据')
        return
      }

      this.pointsLoading = true
      try {
        const pagination = { ...this.pointsPagination, page }
        const result = await PointsService.loadPointsData(userId, pagination)
        
        this.pointsList = result.pointsList
        this.pointsPagination = result.paginationInfo
      } catch (error) {
        console.error('加载积分数据失败:', error)
      } finally {
        this.pointsLoading = false
      }
    },

    // 加载通知数据
    async loadNotificationData(page = 1) {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        console.error('用户ID不存在，无法加载通知数据')
        return
      }

      this.notificationLoading = true
      try {
        const pagination = { ...this.notificationPagination, page }
        const result = await NotificationService.loadNotificationData(userId, pagination)
        
        this.notificationList = result.notificationList
        this.notificationPagination = result.paginationInfo
      } catch (error) {
        console.error('加载通知数据失败:', error)
      } finally {
        this.notificationLoading = false
      }
    },

    // 预约分页事件处理
    handleReservationPageChange(page) {
      console.log('预约页码改变:', page)
      this.loadReservationData(page)
    },
    
    handleReservationPageSizeChange(pageSize) {
      console.log('预约每页数量改变:', pageSize)
      this.reservationPagination.pageSize = pageSize
      this.reservationPagination.page = 1 // 重置到第一页
      this.loadReservationData(1)
    },

    // 积分分页事件处理
    handlePointsPageChange(page) {
      console.log('积分页码改变:', page)
      this.pointsPagination.page = page
      this.loadPointsData(page)
    },
    
    handlePointsPageSizeChange(pageSize) {
      console.log('积分每页数量改变:', pageSize)
      this.pointsPagination.pageSize = pageSize
      this.pointsPagination.page = 1
      this.loadPointsData(1)
    },

    // 通知分页事件处理
    handleNotificationPageChange(page) {
      console.log('通知页码改变:', page)
      this.notificationPagination.page = page
      this.loadNotificationData(page)
    },
    
    handleNotificationPageSizeChange(pageSize) {
      console.log('通知每页数量改变:', pageSize)
      this.notificationPagination.page = 1
      this.loadNotificationData(1)
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
  margin-right: 10px;
}

.info-item span {
  color: #333;
  font-size: 15px;
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

/* 积分高亮样式 */
.points-highlight {
  color: #ff6b35;
  font-weight: bold;
  font-size: 18px;
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

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #999;
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

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.pagination-container .el-pagination {
  --el-pagination-font-size: 14px;
  --el-pagination-bg-color: #fff;
  --el-pagination-text-color: #606266;
  --el-pagination-border-radius: 4px;
  --el-pagination-button-disabled-color: #c0c4cc;
  --el-pagination-button-disabled-bg-color: #fff;
  --el-pagination-hover-color: #2062ea;
}

/* 修复分页按钮样式 */
.pagination-container .el-pagination .el-pager li {
  min-width: 30px;
  height: 32px;
  line-height: 30px;
  margin: 0 2px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-container .el-pagination .el-pager li:hover {
  color: #2062ea;
  border-color: #2062ea;
}

.pagination-container .el-pagination .el-pager li.is-active {
  background-color: #2062ea;
  border-color: #2062ea;
  color: #fff;
}

</style>
