/**
 * 个人资料页数据服务
 */

import { getUserInfo, fetchMyOrderSummary, fetchUserPoints, fetchPointsHistory, fetchUserNotifications } from '@/utils/api'
import { ElMessage } from 'element-plus'
import { formatTimeRange, formatRelativeTime } from '@/utils/formatters'

// 用户资料服务
export class UserProfileService {
  // 加载用户资料
  static async loadUserProfile(userId) {
    try {
      console.log('开始获取用户信息，用户ID:', userId)
      const response = await getUserInfo(userId)
      console.log('API响应:', response)
      
      if (response && response.code === 0 && response.data) {
        return UserProfileService.updateUserProfile(response.data)
      } else {
        throw new Error('API响应格式错误')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      ElMessage.error('获取用户信息失败，请稍后重试')
      return UserProfileService.getDefaultUserProfile()
    }
  }

  // 更新用户资料数据
  static updateUserProfile(userData) {
    return {
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
  }

  // 默认用户资料
  static getDefaultUserProfile() {
    return {
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
  }
}

// 预约服务
export class ReservationService {
  // 加载预约订单数据
  static async loadReservationData(userId, pagination) {
    try {
      console.log('开始获取用户订单，用户ID:', userId, '页码:', pagination.page)
      
      const response = await fetchMyOrderSummary(userId, {
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      console.log('订单API响应:', response)

      if (response && response.code === 0 && response.data) {
        let orderData = []
        const responseData = response.data
        
        if (responseData && responseData.list) {
          if (Array.isArray(responseData.list)) {
            orderData = responseData.list
          } else if (typeof responseData.list === 'object') {
            orderData = [responseData.list]
          }
        }

        // 更新分页信息
        const paginationInfo = {
          total: responseData.total || 0,
          page: responseData.page || pagination.page,
          pageSize: pagination.pageSize
        }

        // 转换订单数据格式
        const reservationList = orderData.map(order => ReservationService.formatOrderData(order))
        
        console.log('订单数据加载成功:', reservationList)
        console.log('分页信息:', paginationInfo)

        return { reservationList, paginationInfo }
      } else {
        throw new Error(`API返回错误: ${response.data?.msg || '未知错误'}`)
      }
    } catch (error) {
      console.error('获取订单数据失败:', error)
      ElMessage.error('获取订单数据失败，请稍后重试')
      
      // 返回默认数据
      return {
        reservationList: ReservationService.getDefaultReservations(),
        paginationInfo: { total: 2, page: 1, pageSize: 10 }
      }
    }
  }

  // 格式化订单数据
  static formatOrderData(order) {
    // 场地名
    const facilityName = order.venueName || order.facilityName || order.venue_name || '未知场地'  
    // 预约状态
    const appointmentStatus = order.appointmentStatus || order.status || 'unknown'
    // 预约开始和结束时间
    const beginTime = order.beginTime || order.begin_time || order.startTime || ''
    const endTime = order.endTime || order.end_time || ''
    
    // 生成显示图标
    let icon = '📅'
    if (facilityName.includes('篮球')) icon = '🏀'
    else if (facilityName.includes('游泳')) icon = '🏊‍♂️'
    else if (facilityName.includes('网球')) icon = '🎾'
    else if (facilityName.includes('羽毛球')) icon = '🏸'
    else if (facilityName.includes('足球')) icon = '⚽'
    
    const timeDisplay = formatTimeRange(beginTime, endTime)
    const content = `${icon} ${facilityName} - ${timeDisplay}`
    
    // 状态映射
    const { statusText, statusType } = ReservationService.mapStatus(appointmentStatus)

    return {
      appointmentId: order.appointmentId || order.id,
      content: content,
      status: statusText,
      statusType: statusType,
      facilityName: facilityName,
      appointmentStatus: appointmentStatus,
      beginTime: beginTime,
      endTime: endTime,
      originalData: order
    }
  }

  // 状态映射
  static mapStatus(appointmentStatus) {
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

    return { statusText, statusType }
  }

  // 默认预约数据
  static getDefaultReservations() {
    return [
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
  }
}

// 积分服务
export class PointsService {
  // 加载用户当前积分
  static async loadUserPoints(userId) {
    try {
      console.log('开始获取用户当前积分，用户ID:', userId)
      const response = await fetchUserPoints(userId)
      console.log('用户积分API响应:', response)

      if (response && response.code === 0 && response.data) {
        return response.data.points || response.data.currentPoints || 0
      } else {
        throw new Error(`API返回错误: ${response.data?.msg || '未知错误'}`)
      }
    } catch (error) {
      console.error('获取用户积分失败:', error)
      return 0
    }
  }

  // 加载积分数据
  static async loadPointsData(userId, pagination) {
    try {
      console.log('开始获取用户积分记录，用户ID:', userId, '页码:', pagination.page)
      const response = await fetchPointsHistory(userId, {
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      console.log('积分API响应:', response)

      if (response && response.code === 0 && response.data) {
        let pointsData = []
        let paginationInfo = { ...pagination }
        
        if (response.data.list && Array.isArray(response.data.list)) {
          pointsData = response.data.list
          paginationInfo.total = response.data.total || 0
        } else if (Array.isArray(response.data)) {
          pointsData = response.data
        }

        const pointsList = pointsData.map(point => PointsService.formatPointsData(point))
        paginationInfo.page = pagination.page
        
        console.log('积分数据加载成功:', pointsList)
        return { pointsList, paginationInfo }
      } else {
        throw new Error(`API返回错误: ${response.data?.msg || '未知错误'}`)
      }
    } catch (error) {
      console.error('获取积分数据失败:', error)
      ElMessage.error('获取积分数据失败，请稍后重试')
      
      return {
        pointsList: PointsService.getDefaultPoints(),
        paginationInfo: { total: 4, page: pagination.page, pageSize: pagination.pageSize }
      }
    }
  }

  // 格式化积分数据
  static formatPointsData(point) {
    const changeAmount = point.changeAmount || point.change_amount || point.points || 0
    const changeReason = point.changeReason || point.change_reason || point.reason || point.description || '积分变化'
    const changeTime = point.changeTime || point.change_time || point.time || point.createTime || ''
    
    const pointsChange = changeAmount > 0 ? `+${changeAmount}` : `${changeAmount}`
    const changeType = changeAmount > 0 ? 'increase' : 'decrease'
    const timeDisplay = formatRelativeTime(changeTime)

    return {
      changeId: point.changeId || point.id || Math.random().toString(),
      content: changeReason,
      pointsChange: pointsChange,
      changeType: changeType,
      time: timeDisplay,
      originalData: point
    }
  }

  // 默认积分数据
  static getDefaultPoints() {
    return [
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
  }
}

// 通知服务
export class NotificationService {
  // 加载通知数据
  static async loadNotificationData(userId, pagination) {
    try {
      console.log('开始获取用户通知，用户ID:', userId)
      const response = await fetchUserNotifications(userId, {
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      console.log('通知API响应:', response)

      if (response && response.code === 0 && response.data) {
        let notificationData = []
        let paginationInfo = { ...pagination }
        
        if (response.data.list && Array.isArray(response.data.list)) {
          notificationData = response.data.list
          paginationInfo.total = response.data.total || 0
        } else if (Array.isArray(response.data)) {
          notificationData = response.data
        }

        const notificationList = notificationData.map(notification => NotificationService.formatNotificationData(notification))
        paginationInfo.page = pagination.page
        
        console.log('通知数据加载成功:', notificationList)
        return { notificationList, paginationInfo }
      } else {
        throw new Error(`API返回错误: ${response.data?.msg || '未知错误'}`)
      }
    } catch (error) {
      console.error('获取通知数据失败:', error)
      ElMessage.error('获取通知数据失败，请稍后重试')
      
      return {
        notificationList: NotificationService.getDefaultNotifications(),
        paginationInfo: { total: 2, page: pagination.page, pageSize: pagination.pageSize }
      }
    }
  }

  // 格式化通知数据
  static formatNotificationData(notification) {
    const content = notification.content || notification.message || notification.title || '系统通知'
    const isRead = notification.isRead || notification.is_read || false
    const createTime = notification.createTime || notification.create_time || notification.time || ''
    const timeDisplay = formatRelativeTime(createTime)

    return {
      notificationId: notification.notificationId || notification.id || Math.random().toString(),
      content: content,
      time: timeDisplay,
      isRead: isRead,
      originalData: notification
    }
  }

  // 默认通知数据
  static getDefaultNotifications() {
    return [
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
  }
}
