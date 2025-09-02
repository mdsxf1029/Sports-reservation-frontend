<template>
  <div class="all-page"> 
    <div class="main-content">
    <HeaderNavbar class="navbar"/>
    <div class = "top-bar"> 
        <!-- 背景图区域 -->
        <div class="profile-bg"></div>
        <!-- 个人信息卡片 -->
        <div class="profile-card">
                        <img 
              class="avatar" 
              :src="avatarUrl" 
              alt="头像"
              @error="handleAvatarError"
            />
                <div class="profile-info">
                <div class="name">{{ userProfile.userName || '加载中...' }}</div>
                <div class="desc">{{ userProfile.email || '加载中...' }} | {{ getRoleText(userProfile.role) || '加载中...' }}</div>
            </div>
            <button class="edit-btn" @click="editProfile">编辑个人资料</button>
            <button 
              v-if="['manager'].includes(userProfile.role)" 
              class="edit-btn" 
              @click="goToAdmin"
            >
              进入后台
            </button>
        </div>
    </div>
    <!-- Tab栏 -->
    <div class="tab-card">
        <div class="tabs">
        <span v-if="['normal', 'manager'].includes(userProfile.role)" class="tab" :class="{active: activeTab === 'profile'}" @click="activeTab = 'profile'">个人资料</span>
        <span v-if="userProfile.role === 'normal'" class="tab" :class="{active: activeTab === 'reservation'}" @click="activeTab = 'reservation'">预约</span>
        <span v-if="userProfile.role === 'normal'" class="tab" :class="{active: activeTab === 'points'}" @click="activeTab = 'points'">积分</span>
        <span v-if="['normal', 'manager'].includes(userProfile.role)" class="tab" :class="{active: activeTab === 'notification'}" @click="activeTab = 'notification'">信息通知中心
          <span v-if="unreadNum" class="notification-badge"></span>
        </span>

    </div>
        <div class="tab-content">
        <!-- 个人资料内容 -->
        <TabContent 
          v-if="activeTab === 'profile'" 
          title="个人资料" 
          :showAddButton="false"
        >
          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <span style="margin-left: 10px;">加载中...</span>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="profileError" class="error-state">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{{ profileErrorMessage }}</div>
            <div class="error-actions">
              <el-button type="primary" @click="retryLoadProfile" :loading="isLoading">
                重试
              </el-button>
            </div>
          </div>
          
          <!-- 正常状态 -->
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
                  <label>注册时间：</label>
                  <span>{{ formatDate(userProfile.register_time) || '未知' }}</span>
                </div>
                <div v-if="userProfile.role === 'normal'" class="info-item">
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
          <!-- 加载状态 -->
          <div v-if="reservationLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <span style="margin-left: 10px;">加载订单中...</span>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="reservationError" class="error-state">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{{ reservationErrorMessage }}</div>
            <div class="error-actions">
              <el-button type="primary" @click="retryLoadReservation" :loading="reservationLoading">
                重试
              </el-button>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="reservationList.length === 0" class="empty-state">
            <div class="empty-icon">📅</div>
            <div class="empty-text">暂无预约记录</div>
            <div class="empty-desc">去预约一个场地吧！</div>
          </div>
          <ReservationItem 
            v-else
            v-for="(item, index) in reservationList" 
            :key="item.appointmentId || index"
            :appointmentId="item.appointmentId"
            :content="item.content"
            :status="item.status"
            :statusType="item.appointmentStatus"
            :order-detail="item"
            @show-qr-code="openQRCodeDialog"
            @appeal-order="handleAppealOrder"
            @cancel-reservation="handleCancelReservation"
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
          
          <!-- 错误状态 -->
          <div v-else-if="notificationError" class="error-state">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{{ notificationErrorMessage }}</div>
            <div class="error-actions">
              <el-button type="primary" @click="retryLoadNotification" :loading="notificationLoading">
                重试
              </el-button>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="notificationList.length === 0" class="empty-state">
            <div class="empty-icon">🔔</div>
            <div class="empty-text">暂无通知消息</div>
            <div class="empty-desc">有新消息时会显示在这里</div>
          </div>
          
          <NotificationItem 
            v-else
            v-for="(item, index) in notificationList" 
            :key="`notif-${item.notificationId || index}`"
            :notificationId="item.notificationId"
            :content="item.content"
            :time="item.time"
            :isread="item.isRead"
            @read="handleNotificationRead"
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
          
          <!-- 错误状态 -->
          <div v-else-if="pointsError" class="error-state">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{{ pointsErrorMessage }}</div>
            <div class="error-actions">
              <el-button type="primary" @click="retryLoadPoints" :loading="pointsLoading">
                重试
              </el-button>
            </div>
          </div>
          
          <!-- 空状态 -->
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
    
    <!-- 固定底部导航 -->
    <FooterNavbar/>
    
    <!-- 编辑个人资料弹窗 -->
    <EditProfileDialog
      v-model="showEditDialog"
      :user-profile="userProfile"
      @success="onEditSuccess"
    />
    
    <!-- 订单二维码弹窗 -->
    <OrderQRCodeDialog
      :visible="showQRCodeDialog"
      :displayDetail="currentOrder"
      @close="showQRCodeDialog = false"
    />
    
    <!-- 申诉弹窗 -->
    <el-dialog
      title="申诉订单"
      v-model="showAppealDialog"
      width="500px"
      destroy-on-close
    >
      <!-- 订单信息 -->
      <div class="order-info" v-if="selectedOrderForAppeal">
        <p><strong>订单编号：</strong>{{ selectedOrderForAppeal.appointmentId }}</p>
        <p><strong>预约场地：</strong>{{ selectedOrderForAppeal.facilityName || '未知场地' }}</p>
        <p><strong>订单状态：</strong>{{ selectedOrderForAppeal.status }}</p>
      </div>

      <!-- 申诉表单 -->
      <el-form ref="appealForm" :model="appealForm" :rules="appealRules" label-width="120px">
        <el-form-item label="申诉标题" prop="title">
          <el-input
            v-model="appealForm.title"
            placeholder="请输入申诉标题"
            maxlength="10"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="申诉内容" prop="content">
          <el-input
            v-model="appealForm.content"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您遇到的问题"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAppealDialog = false">取消</el-button>
          <el-button type="primary" :loading="appealSubmitting" @click="submitAppeal">
            提交申诉
          </el-button>
        </div>
      </template>
    </el-dialog>
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
import OrderQRCodeDialog from '@/components/profile/OrderQRCodeDialog.vue'

// 导入默认头像
import defaultAvatar from '@/assets/Backgrounds/Flower2.jpg'

// 导入服务和工具类
import { UserProfileService, ReservationService, PointsService, NotificationService } from '@/utils/profileService'
import { AuthService } from '@/utils/auth'
import { formatDate, getGenderText, getRoleText } from '@/utils/formatters'
// 导入API方法
import { cancelMyOrder } from '@/utils/api'
import { fetchOrderDetail } from '@/utils/api'
        
export default {
  components: { 
    HeaderNavbar, 
    FooterNavbar,
    ReservationItem,
    NotificationItem,
    PointsItem,
    TabContent,
    BackToTop,
    EditProfileDialog,
    OrderQRCodeDialog
  },
  data() {
    return {
      activeTab: 'profile', // 默认显示个人资料选项卡
      currentPoints: 0, // 当前积分总数
      isLoading: false, // 加载状态
      reservationLoading: false, // 预约订单加载状态
      pointsLoading: false, // 积分记录加载状态
      notificationLoading: false, // 通知加载状态
      unreadNum: 0, // 是否有未读通知

      // 错误状态
      profileError: false,
      profileErrorMessage: '',
      reservationError: false,
      reservationErrorMessage: '',
      pointsError: false,
      pointsErrorMessage: '',
      notificationError: false,
      notificationErrorMessage: '',
      
      reservationPagination: {
        total: 0,
        page: 1,
        pageSize: 10
      }, // 预约分页信息
      pointsPagination: {
        total: 0,
        page: 1,
        pageSize: 10
      }, // 积分分页信息
      notificationPagination: {
        total: 0,
        page: 1,
        pageSize: 10
      }, // 通知分页信息
      showEditDialog: false, // 控制编辑弹窗显示
      showQRCodeDialog: false,  // 控制二维码弹窗显示
      currentOrder: {},         // 当前选中的订单信息
      showAppealDialog: false,  // 控制申诉弹窗显示
      selectedOrderForAppeal: {}, // 当前申诉的订单信息
      appealSubmitting: false,  // 申诉提交状态
      appealForm: {
        title: '',
        content: ''
      },
      appealRules: {
        title: [
          { required: true, message: '请输入申诉标题', trigger: 'blur' },
          { min: 2, max: 10, message: '标题长度在2到10个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入申诉内容', trigger: 'blur' },
          { min: 10, max: 500, message: '内容长度在10到500个字符', trigger: 'blur' }
        ]
      },
      
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
       
    // 检查路由参数，设置默认Tab
    this.setActiveTabFromRoute()
    
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
    
    // ✅ 主动检查未读消息
    await this.checkUnreadNotifications()
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
  computed: {
    // 添加计算属性
    avatarUrl() {
      // 如果有头像URL且不为空字符串，直接返回
      if (this.userProfile.avatarUrl && this.userProfile.avatarUrl.trim() !== '') {
        return this.userProfile.avatarUrl
      }
      
      // 使用与注册页面相同的默认头像URL
      return 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
    }
  },
  methods: {
    // 格式化工具方法（直接引用工具函数）
    formatDate,
    getGenderText,
    getRoleText,

    // 新增：根据路由参数设置活跃Tab
    setActiveTabFromRoute() {
      const tab = this.$route.query.activeTab //这里根据你添加的参数名修改 
      console.log('路由参数中的tab:', tab)
      const validTabs = ['profile', 'reservation', 'points', 'notification']
      
      if (tab && validTabs.includes(tab)) {
        this.activeTab = tab
        console.log('通过路由参数设置活跃Tab:', tab)
      } else {
        this.activeTab = 'profile' // 默认显示个人资料
      }
    },

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
        console.log('开始加载用户资料，用户ID:', userId)
        console.log('默认头像路径测试:', defaultAvatar)
        const userProfile = await UserProfileService.loadUserProfile(userId)
        this.userProfile = userProfile
        this.currentPoints = userProfile.points || 0
        console.log('用户信息加载成功:', this.userProfile)
        console.log('头像URL:', this.userProfile.avatarUrl)
        ElMessage.success('用户信息加载成功')
        this.profileError = false
      } catch (error) {
        console.error('获取用户信息失败:', error)  
 
        // 注意：401认证错误已在api.js拦截器中处理，这里只处理其他错误
        this.profileError = true
        this.profileErrorMessage = error.message || '获取用户信息失败'
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
        // 先尝试从API获取数据
        const pagination = { ...this.reservationPagination, page }
        const result = await ReservationService.loadReservationData(userId, pagination)
        
        if (result.reservationList && result.reservationList.length > 0) {
          this.reservationList = result.reservationList
          this.reservationPagination = result.paginationInfo
        } 
        
        this.reservationList = result.reservationList
        this.reservationPagination = result.paginationInfo
        this.reservationError = false
      } catch (error) {

        console.error('加载预约数据失败:', error)
        this.reservationError = true
        this.reservationErrorMessage = error.message || '获取预约数据失败'
        this.reservationList = []
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
        this.pointsError = false
      } catch (error) {
        console.error('加载积分数据失败:', error)
        this.pointsError = true
        this.pointsErrorMessage = error.message || '获取积分数据失败'
        this.pointsList = []
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
        this.unreadNum = result.unreadNum || 0
        this.notificationError = false
      } catch (error) {
        console.error('加载通知数据失败:', error)
        this.notificationError = true
        this.notificationErrorMessage = error.message || '获取通知数据失败'
        this.notificationList = []
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
    },

    //  openQRCodeDialog 方法
    async openQRCodeDialog(order) {
      try {
        console.log('点击查看二维码，Summary订单信息:', order)
        
        // 从Summary返回的order中获取appointmentId
        const appointmentId = order.appointmentId || order.originalData?.id || order.id
        
        if (!appointmentId) {
          ElMessage.error('订单ID不存在，无法获取详细信息')
          return
        }

        // 先显示弹窗和加载状态
        this.showQRCodeDialog = true
        this.currentOrder = { 
          ...order, 
          loading: true,
          appointmentId: appointmentId
        }
        
        console.log('设置loading状态:', this.currentOrder)

        console.log('开始获取订单详情，appointmentId:', appointmentId)

        // 🔥 关键：通过appointmentId调用Detail API获取完整信息
        let detailResponse
        detailResponse = await fetchOrderDetail(appointmentId)
        
        console.log('Detail API响应:', detailResponse)

        if (detailResponse && detailResponse.data) {
          // 🔥 将API返回的嵌套结构转换为OrderQRCodeDialog期望的扁平结构
          const apiData = detailResponse.data
          
          // 转换数据格式以适配OrderQRCodeDialog组件
          this.currentOrder = {
            // 保留Summary的一些字段（如果需要）
            summaryData: order,
            
            // 🔥 转换API数据为组件期望的格式
            // 场馆信息
            venue_name: apiData.venue?.venue_name || '未知场馆',
            venue_subname: apiData.venue?.venue_subname || '',
            venue_location: apiData.venue?.venue_location || '',
            venue_type: apiData.venue?.venue_type || '',
            
            // 用户信息
            user_name: apiData.user?.user_name || '未知用户',
            user_id: apiData.user?.user_id || '',
            
            // 时间信息（保持原始格式供组件使用）
            begin_time: apiData.appointment?.begin_time,
            end_time: apiData.appointment?.end_time,
            apply_time: apiData.appointment?.apply_time,
            
            // 格式化的时间信息（为组件提供）
            formattedDate: this.formatOrderDate(apiData.appointment?.begin_time),
            formattedWeekday: this.formatOrderWeekday(apiData.appointment?.begin_time),
            formattedTimeRange: this.formatOrderTimeRange(apiData.appointment?.begin_time, apiData.appointment?.end_time),
            formattedApplyTime: this.formatOrderDate(apiData.appointment?.apply_time),
            
            // 费用和状态
            price: apiData.bill?.bill_amount || 0,
            status: this.getAppointmentStatusText(apiData.appointment?.appointment_status),
            statusType: this.getAppointmentStatusType(apiData.appointment?.appointment_status),
            bill_status: apiData.bill?.bill_status,
            
            // ID信息
            appointmentId: apiData.appointment?.appointment_id || appointmentId,
            bill_id: apiData.bill?.bill_id,
            
            // 为二维码生成数据
            qrcode_data: `https://yourdomain.com/entry/${apiData.appointment?.appointment_id || appointmentId}`,
            
            // 清除加载状态
            loading: false 
          }

          console.log('加载状态已清除')
          console.log('传递给二维码组件的转换后订单信息:', this.currentOrder)
          
        } else {
          throw new Error('Detail API返回数据为空')
        }
        
      } catch (error) {
        console.error('获取订单详情失败:', error)
        ElMessage.error('获取订单详情失败，请稍后重试')
        
      }
    },
    

    getAppointmentStatusType(status) {
      const statusTypeMap = {
        'upcoming': 'upcoming',
        'ongoing': 'ongoing', 
        'canceled': 'cancelled',
        'cancelled': 'cancelled',
        'overtime': 'expired',
        'completed': 'completed'
      }
      return statusTypeMap[status] || 'pending'
    },

    // 获取预约状态文本
    getAppointmentStatusText(status) {
      const statusMap = {
        'upcoming': '即将开始',
        'ongoing': '进行中',
        'canceled': '已取消',
        'cancelled': '已取消',
        'overtime': '已超时',
        'completed': '已完成'
      }
      return statusMap[status] || status || '未知'
    },

    // 格式化订单日期
    formatOrderDate(dateString) {
      if (!dateString) return '未设置'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN')
      } catch (error) {
        return '日期格式错误'
      }
    },

    // 格式化订单星期
    formatOrderWeekday(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        return weekdays[date.getDay()]
      } catch (error) {
        return ''
      }
    },

    // 格式化订单时间范围
    formatOrderTimeRange(beginTime, endTime) {
      if (!beginTime || !endTime) return '时间未设置'
      try {
        const begin = new Date(beginTime)
        const end = new Date(endTime)
        const beginStr = begin.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        const endStr = end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        return `${beginStr}-${endStr}`
      } catch (error) {
        return '时间格式错误'
      }
    },


    // 处理二维码弹窗关闭
    handleQRCodeDialogClose() {
      this.showQRCodeDialog = false
      this.currentOrder = null
    },

    // 处理头像加载错误
    handleAvatarError(event) {
      console.error('头像加载失败，使用默认头像URL') 
      event.target.src = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
    },

    // 跳转到管理后台
    goToAdmin() {
      this.$router.push('/venue')
    },

    // 重试加载用户资料
    async retryLoadProfile() {
      const userId = localStorage.getItem('userId')
      if (userId) {
        this.profileError = false
        await this.loadUserProfile(userId)
      }
    },

    // 重试加载预约数据
    async retryLoadReservation() {
      const userId = localStorage.getItem('userId')
      if (userId) {
        this.reservationError = false
        await this.loadReservationData(this.reservationPagination.page)
      }
    },

    // 重试加载积分数据
    async retryLoadPoints() {
      const userId = localStorage.getItem('userId')
      if (userId) {
        this.pointsError = false
        await this.loadPointsData(this.pointsPagination.page)
      }
    },

    // 重试加载通知数据
    async retryLoadNotification() {
      const userId = localStorage.getItem('userId')
      if (userId) {
        this.notificationError = false
        await this.loadNotificationData(this.notificationPagination.page)
      }
    },

    // 新增方法
    async checkUnreadNotifications() {
      const userId = localStorage.getItem('userId')
      if (!userId) return
      
      try {
        // 只获取一条消息来检查是否有未读
        const result = await NotificationService.loadNotificationData(userId, {
          page: 1,
          pageSize: 1
        })
        console.log('检查未读状态结果:', result)
        this.unreadNum = result.unreadNum || 0
        console.log('🔍 初始未读状态:', this.unreadNum)
      } catch (error) {
        console.error('检查未读状态失败:', error)
      }
    },

    // 处理通知已读事件
    handleNotificationRead(notificationId) {
      console.log('通知已读:', notificationId)
      // 更新本地通知列表中的状态
      const notification = this.notificationList.find(item => item.notificationId == notificationId)
      if (notification) {
        notification.isRead = true
      }
      
      // 重新计算未读状态
      this.unreadNum = this.unreadNum - 1
      console.log('更新后的未读状态:', this.unreadNum)
    },

    // 处理申诉订单
    handleAppealOrder(data) {
      console.log('打开申诉弹窗:', data)
      this.selectedOrderForAppeal = data.orderDetail
      this.showAppealDialog = true
      // 重置表单
      this.appealForm = {
        title: '',
        content: ''
      }
    },

    // 处理取消预约
    async handleCancelReservation(data) {
      try {
        console.log('取消预约:', this.userProfile.userId, data.appointmentId)
        
        // 调用API取消预约
        const res = await cancelMyOrder(this.userProfile.userId, data.appointmentId)
        const resdata = res.data
        console.log('取消预约API响应:', resdata)
        if (resdata.success === false) {
          throw new Error(resdata.message || '取消预约失败')
        }
        ElMessage.success('预约取消成功')
        console.log('预约取消成功，预约ID:', data.appointmentId)
        // 重新加载预约数据
        await this.loadReservationData()
        
      } catch (error) {
        console.error('取消预约失败:', error)
        ElMessage.error(error.message || '取消预约失败，请稍后重试')
      }
    },

    // 提交申诉
    async submitAppeal() {
      try {
        // 表单验证
        await this.$refs.appealForm.validate()
        
        this.appealSubmitting = true

        // 准备申诉数据
        const appealData = {
          title: this.appealForm.title,
          content: this.appealForm.content
        }

        console.log('提交申诉数据:', appealData)

        // 这里调用申诉API
        const res = await createOrderAppeal(this.userProfile.userId, this.selectedOrderForAppeal.appointmentId, appealData)
        const resdata = res.data
        if(resdata.success === false) {
          throw new Error(resdata.message || '提交申诉失败')
        }
        ElMessage.success('申诉提交成功，我们将在3个工作日内处理')
        console.log('申诉提交成功，响应数据:', resdata)
        this.showAppealDialog = false
        
      } catch (error) {
        console.error('提交申诉失败:', error)
        if (error.message && !error.message.includes('validate')) {
          ElMessage.error('提交申诉失败，请稍后重试')
        }
      } finally {
        this.appealSubmitting = false
      }
    },

    // 处理申诉提交成功
    handleAppealSubmitted(data) {
      console.log('申诉已提交:', data)
      ElMessage.success('申诉提交成功，我们将在3个工作日内处理')
      
      // 可以更新订单状态或重新加载数据
      // this.loadReservationData()
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
  padding-top: 60px;   /* 顶栏高度+适当间距 */
  padding-bottom: 50px; /* 底部间距，避免被固定footer遮挡 */
  overflow-x: hidden; /* 防止水平溢出 */
  box-sizing: border-box; /* 确保padding计算在宽度内 */
} 
/* 顶栏导航 */
.navbar {
  width: 100%; 
  position: fixed;
  margin: 0 auto;
  left: 0;
  right: 0;
  top: 0; 
  z-index: 100; /* 顶层 */
}
/* 主内容区域 */
.main-content {
  padding-top: 1px; /* 顶栏高度 */
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* 增加最小宽度 */
  gap: 20px; /* 增加间距 */
  row-gap: 16px; /* 行间距稍小一些 */
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

/* 错误状态样式 */
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #f56c6c;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.error-text {
  font-size: 16px;
  font-weight: 500;
  color: #f56c6c;
  margin-bottom: 16px;
}

.error-actions {
  margin-top: 16px;
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

/* 红点提示样式 */
.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
}
 
/* Tab 相对定位，为红点提供定位基准 */
.tab {
  position: relative;
  /* ...其他样式保持不变... */
}

/* 申诉弹窗样式 */
.order-info {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.order-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.order-info strong {
  color: #303133;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
