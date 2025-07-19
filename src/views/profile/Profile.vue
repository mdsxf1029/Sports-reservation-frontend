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
import {ref} from 'vue'
import { getUserInfo, fetchMyOrderSummary, fetchUserPoints, fetchPointsHistory, fetchUserNotifications } from '@/utils/api'
import { ElMessage } from 'element-plus'
import HeaderNavbar from '@/components/HeaderNavbar.vue'
import FooterNavbar from '@/components/FooterNavbar.vue'
import ReservationItem from '@/components/profile/ReservationItem.vue'
import NotificationItem from '@/components/profile/NotificationItem.vue'
import PointsItem from '@/components/profile/PointsItem.vue'
import TabContent from '@/components/profile/TabContent.vue'
import BackToTop from '../../components/BackToTop.vue'
import EditProfileDialog from '@/components/profile/EditProfileDialog.vue'

        
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
    
    // 为了测试，临时设置一些登录信息（如果没有的话）
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'test-token-123')
      localStorage.setItem('userId', '1')
      localStorage.setItem('userName', 'testUser')
      console.log('设置了测试用的登录信息')
    }
    
    await this.checkLoginAndLoadProfile()
    
    // 根据当前活跃标签页加载相应数据
    switch(this.activeTab) {
      case 'reservations':
        this.loadReservationData()
        break
      case 'points':
        await this.loadUserPoints()
        this.loadPointsData()
        break
      case 'notifications':
        this.loadNotificationData()
        break
    }
  },
  watch: {
    // 监听tab切换，当切换到不同tab时加载相应数据
    activeTab(newTab) {
      switch(newTab) {
        case 'reservations':
          if (!this.reservations || this.reservations.length === 0) {
            this.loadReservationData()
          }
          break
        case 'points':
          if (!this.pointsList || this.pointsList.length === 0) {
            this.loadUserPoints()
            this.loadPointsData()
          }
          break
        case 'notifications':
          if (!this.notifications || this.notifications.length === 0) {
            this.loadNotificationData()
          }
          break
      }
    }
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
        
        if (response && response.code === 0 && response.data) {
          let userData
          
          // 处理不同的API响应格式 - 统一处理逻辑
          if (response.code === 0 || response.code === 200) {
            userData = response.data
          } else if (response.data && !response.data.code) {
            // 直接返回数据的格式
            userData = response.data
          } else {
            throw new Error(response.data.msg || response.data.message || '获取用户信息失败')
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
        console.log('开始获取用户订单，用户ID:', userId, '页码:', page)
        
        // 传递分页参数
        const response = await fetchMyOrderSummary(userId, {
          page: page,
          pageSize: this.reservationPagination.pageSize
        })
        console.log('订单API响应:', response)

        if (response && response.code === 0 && response.data) {
          let orderData = []
          const responseData = response.data.data
          
          // 根据你提供的API格式处理数据
          if (responseData && responseData.list) {
            // 如果list是数组
            if (Array.isArray(responseData.list)) {
              orderData = responseData.list
            } 
            // 如果list是单个对象，转换为数组
            else if (typeof responseData.list === 'object') {
              orderData = [responseData.list]
            }
          }
          
          console.log('解析出的订单数据:', orderData)

          // 更新分页信息
          this.reservationPagination = {
            total: responseData.total || 0,
            page: responseData.page || page,
            pageSize: this.reservationPagination.pageSize
          }

          // 转换订单数据格式
          this.reservationList = orderData.map(order => this.formatOrderData(order))
          
          console.log('订单数据加载成功:', this.reservationList)
          console.log('分页信息:', this.reservationPagination)
        } else {
          throw new Error(`API返回错误: ${response.data?.msg || '未知错误'}`)
        }
      } catch (error) {
        console.error('获取订单数据失败:', error)
        ElMessage.error('获取订单数据失败，请稍后重试')
        
        // 使用示例数据作为后备方案
        this.reservationList = [
          { 
            appointmentId: 'demo1',
            content: '🏀 篮球场地 - 明天 15:00-17:00', 
            status: '已确认', 
            statusType: 'active',
            facilityName: '篮球场A',
            appointmentDate: '2024-01-20',
            startTime: '15:00',
            endTime: '17:00'
          },
          { 
            appointmentId: 'demo2',
            content: '🏊‍♂️ 游泳池 - 本周六 09:00-11:00', 
            status: '待确认', 
            statusType: 'pending',
            facilityName: '游泳池B',
            appointmentDate: '2024-01-22',
            startTime: '09:00',
            endTime: '11:00'
          }
        ]
        
        // 设置默认分页信息
        this.reservationPagination = {
          total: 2,
          page: 1,
          pageSize: 10
        }
      } finally {
        this.reservationLoading = false
      }
    },

    // 格式化订单数据
    formatOrderData(order) {
      // 根据你提供的API响应字段进行映射
      const facilityName = order.venueName || order.facilityName || order.venue_name || '未知场地'
      const appointmentStatus = order.appointmentStatus || order.status || 'unknown'
      const applyTime = order.applyTime || order.apply_time || ''
      const beginTime = order.beginTime || order.begin_time || order.startTime || ''
      const endTime = order.endTime || order.end_time || ''
      
      // 生成显示内容
      let icon = '📅' // 默认图标
      if (facilityName.includes('篮球')) icon = '🏀'
      else if (facilityName.includes('游泳')) icon = '🏊‍♂️'
      else if (facilityName.includes('网球')) icon = '🎾'
      else if (facilityName.includes('羽毛球')) icon = '🏸'
      else if (facilityName.includes('足球')) icon = '⚽'
      
      // 格式化时间显示
      const timeDisplay = this.formatTimeRange(beginTime, endTime)
      const content = `${icon} ${facilityName} - ${timeDisplay}`
      
      // 状态映射 - 根据API返回的appointmentStatus进行映射
      let statusText = '未知'
      let statusType = 'info'
      
      switch (appointmentStatus.toLowerCase()) {
        case 'upcoming':
        case 'confirmed':
        case 'active':
          statusText = '已确认'
          statusType = 'active'
          break
        case 'pending':
        case 'waiting':
          statusText = '待确认'
          statusType = 'pending'
          break
        case 'canceled':
        case 'cancelled':
          statusText = '已取消'
          statusType = 'cancelled'
          break
        case 'completed':
        case 'finished':
          statusText = '已完成'
          statusType = 'completed'
          break
        case 'ongoing':
          statusText = '进行中'
          statusType = 'active'
          break
        default:
          statusText = appointmentStatus || '未知'
          statusType = 'info'
      }

      return {
        appointmentId: order.appointmentId || order.id,
        content: content,
        status: statusText,
        statusType: statusType,
        facilityName: facilityName,
        appointmentStatus: appointmentStatus,
        applyTime: applyTime,
        beginTime: beginTime,
        endTime: endTime,
        originalData: order // 保存原始数据以备需要
      }
    },

    // 格式化时间范围显示
    formatTimeRange(beginTime, endTime) {
      if (!beginTime) return '时间待定'
      
      try {
        const beginDate = new Date(beginTime)
        const endDate = endTime ? new Date(endTime) : null
        
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        let dateStr = ''
        if (beginDate.toDateString() === today.toDateString()) {
          dateStr = '今天'
        } else if (beginDate.toDateString() === tomorrow.toDateString()) {
          dateStr = '明天'
        } else {
          dateStr = beginDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
        }
        
        const beginTimeStr = beginDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        
        if (endDate) {
          const endTimeStr = endDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          return `${dateStr} ${beginTimeStr}-${endTimeStr}`
        } else {
          return `${dateStr} ${beginTimeStr}`
        }
      } catch (error) {
        console.error('时间格式化错误:', error)
        return beginTime + (endTime ? ` - ${endTime}` : '')
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
        console.log('开始获取用户当前积分，用户ID:', userId)
        const response = await fetchUserPoints(userId)
        console.log('用户积分API响应:', response)

        if (response && response.code === 0 && response.data) {
          this.currentPoints = response.data.points || response.data.currentPoints || 0
          console.log('用户当前积分:', this.currentPoints)
        } else {
          throw new Error(`API返回错误: ${response.data?.msg || '未知错误'}`)
        }
      } catch (error) {
        console.error('获取用户积分失败:', error)
        // 不显示错误消息，使用默认值
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
        console.log('开始获取用户积分记录，用户ID:', userId, '页码:', page)
        const response = await fetchPointsHistory(userId, {
          page: page,
          pageSize: this.pointsPagination.pageSize
        })
        console.log('积分API响应:', response)

        if (response && response.code === 0 && response.data) {
          let pointsData = []
          
          // 处理不同的API响应格式
          if (response.data.list && Array.isArray(response.data.list)) {
            pointsData = response.data.list
            this.pointsPagination.total = response.data.total || 0
          } else if (Array.isArray(response.data)) {
            pointsData = response.data
          }

          // 转换积分数据格式
          this.pointsList = pointsData.map(point => this.formatPointsData(point))
          this.pointsPagination.page = page
          
          console.log('积分数据加载成功:', this.pointsList)
          console.log('分页信息:', this.pointsPagination)
        } else {
          throw new Error(`API返回错误: ${response.data?.msg || '未知错误'}`)
        }
      } catch (error) {
        console.error('获取积分数据失败:', error)
        ElMessage.error('获取积分数据失败，请稍后重试')
        
        // 使用示例数据作为后备方案
        this.pointsList = [
          { 
            changeId: 'demo1',
            content: '完成篮球场预约', 
            pointsChange: '+50', 
            changeType: 'increase', 
            time: '2小时前' 
          },
          { 
            changeId: 'demo2',
            content: '取消羽毛球预约', 
            pointsChange: '-20', 
            changeType: 'decrease', 
            time: '1天前' 
          },
          { 
            changeId: 'demo3',
            content: '首次注册奖励', 
            pointsChange: '+100', 
            changeType: 'increase', 
            time: '3天前' 
          },
          { 
            changeId: 'demo4',
            content: '连续签到奖励', 
            pointsChange: '+30', 
            changeType: 'increase', 
            time: '5天前' 
          }
        ]

        // 设置默认分页信息
        this.pointsPagination = {
          total: 4,
          page: page,
          pageSize: this.pointsPagination.pageSize
        }
      } finally {
        this.pointsLoading = false
      }
    },

    // 格式化积分数据
    formatPointsData(point) {
      const changeAmount = point.changeAmount || point.change_amount || point.points || 0
      const changeReason = point.changeReason || point.change_reason || point.reason || point.description || '积分变化'
      const changeTime = point.changeTime || point.change_time || point.time || point.createTime || ''
      
      // 格式化积分变化显示
      const pointsChange = changeAmount > 0 ? `+${changeAmount}` : `${changeAmount}`
      const changeType = changeAmount > 0 ? 'increase' : 'decrease'
      
      // 格式化时间显示
      const timeDisplay = this.formatRelativeTime(changeTime)

      return {
        changeId: point.changeId || point.id || Math.random().toString(),
        content: changeReason,
        pointsChange: pointsChange,
        changeType: changeType,
        time: timeDisplay,
        originalData: point
      }
    },

    // 加载通知数据
    async loadNotificationData() {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        console.error('用户ID不存在，无法加载通知数据')
        return
      }

      this.notificationLoading = true
      try {
        console.log('开始获取用户通知，用户ID:', userId)
        const response = await fetchUserNotifications(userId, {
          page: 1,
          pageSize: 50 // 获取更多通知
        })
        console.log('通知API响应:', response)

        if (response && response.code === 0 && response.data) {
          let notificationData = []
          
          // 处理不同的API响应格式
          if (response.data.list && Array.isArray(response.data.list)) {
            notificationData = response.data.list
          } else if (Array.isArray(response.data)) {
            notificationData = response.data
          }

          // 转换通知数据格式
          this.notificationList = notificationData.map(notification => this.formatNotificationData(notification))
          
          console.log('通知数据加载成功:', this.notificationList)
        } else {
          throw new Error(`API返回错误: ${response.data?.msg || '未知错误'}`)
        }
      } catch (error) {
        console.error('获取通知数据失败:', error)
        ElMessage.error('获取通知数据失败，请稍后重试')
        
        // 使用示例数据作为后备方案
        this.notificationList = [
          { 
            notificationId: 'demo1',
            content: '📢 您的篮球场预约已确认', 
            time: '30分钟前', 
            isRead: false 
          },
          { 
            notificationId: 'demo2',
            content: '💰 会员积分+50，继续加油！', 
            time: '2小时前', 
            isRead: true 
          }
        ]
      } finally {
        this.notificationLoading = false
      }
    },

    // 格式化通知数据
    formatNotificationData(notification) {
      const content = notification.content || notification.message || notification.title || '系统通知'
      const isRead = notification.isRead || notification.is_read || false
      const createTime = notification.createTime || notification.create_time || notification.time || ''
      
      // 格式化时间显示
      const timeDisplay = this.formatRelativeTime(createTime)

      return {
        notificationId: notification.notificationId || notification.id || Math.random().toString(),
        content: content,
        time: timeDisplay,
        isRead: isRead,
        originalData: notification
      }
    },

    // 格式化相对时间显示
    formatRelativeTime(timeString) {
      if (!timeString) return '刚刚'
      
      try {
        const time = new Date(timeString)
        const now = new Date()
        const diffInSeconds = Math.floor((now - time) / 1000)
        
        if (diffInSeconds < 60) {
          return '刚刚'
        } else if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60)
          return `${minutes}分钟前`
        } else if (diffInSeconds < 86400) {
          const hours = Math.floor(diffInSeconds / 3600)
          return `${hours}小时前`
        } else if (diffInSeconds < 604800) {
          const days = Math.floor(diffInSeconds / 86400)
          return `${days}天前`
        } else {
          return time.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
        }
      } catch (error) {
        return timeString
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
      this.notificationPagination.pageSize = pageSize
      this.notificationPagination.page = 1
      this.loadNotificationData(1)
    },

    // 加载预约数据
    async loadReservationData(page = 1) {
      this.reservationsLoading = true
      try {
        // 这里调用实际的API，目前使用模拟数据
        console.log(`加载预约数据 - 页码: ${page}, 每页数量: ${this.reservationPagination.pageSize}`)
        
        // TODO: 替换为实际的API调用
        // const response = await fetchUserReservations({
        //   page: page,
        //   pageSize: this.reservationPagination.pageSize
        // })
        // this.reservations = response.data
        // this.reservationPagination.total = response.total
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.reservationPagination.page = page
      } catch (error) {
        console.error('加载预约数据失败:', error)
        this.$message.error('加载预约数据失败')
      } finally {
        this.reservationsLoading = false
      }
    },

    // 加载通知数据
    async loadNotificationData(page = 1) {
      this.notificationsLoading = true
      try {
        const params = {
          page: page,
          pageSize: this.notificationPagination.pageSize
        }
        
        const notificationsResponse = await fetchUserNotifications(params)
        if (notificationsResponse && notificationsResponse.data) {
          this.notifications = notificationsResponse.data
          this.notificationPagination.total = notificationsResponse.total || 0
          this.notificationPagination.page = page
        }
      } catch (error) {
        console.error('加载通知数据失败:', error)
        this.$message.error('加载通知数据失败')
      } finally {
        this.notificationsLoading = false
      }
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
