/**
 * 格式化工具函数
 */

// 格式化日期
export const formatDate = (dateString) => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 获取性别文本
export const getGenderText = (gender) => {
  const genderMap = {
    'male': '男',
    'female': '女',
    'unknown': '未知',
  }
  return genderMap[gender] || '未设置'
}

// 获取角色文本
export const getRoleText = (role) => {
  const roleMap = {
    'normal': '普通用户',
    'manager': '管理员'
  }
  return roleMap[role] || role || '未设置'
}

// 格式化相对时间显示
export const formatRelativeTime = (timeString) => {
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
}

// 格式化时间范围显示
export const formatTimeRange = (beginTime, endTime) => {
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
}

// 格式化违约时间显示
export const formatViolationTime = (timeString) => {
  if (!timeString) return '未知时间'
  
  try {
    const date = new Date(timeString)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return timeString
    }
    
    // 格式化为中文日期时间格式：MM月DD日 HH:mm
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${month}月${day}日 ${hours}:${minutes}`
  } catch (error) {
    console.error('违约时间格式化错误:', error)
    return timeString
  }
}

// 格式化新闻时间显示
export const formatNewsTime = (timeString) => {
  if (!timeString) return '未知时间'
  
  try {
    const date = new Date(timeString)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return timeString
    }
    
    // 格式化为中文日期时间格式：MM月DD日 HH:mm
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${month}月${day}日 ${hours}:${minutes}`
  } catch (error) {
    console.error('新闻时间格式化错误:', error)
    return timeString
  }
}

// 格式化申诉时间显示
export const formatAppealTime = (timeString) => {
  if (!timeString) return '未知时间'
  
  try {
    const date = new Date(timeString)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return timeString
    }
    
    // 格式化为中文日期时间格式：MM月DD日 HH:mm
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${month}月${day}日 ${hours}:${minutes}`
  } catch (error) {
    console.error('申诉时间格式化错误:', error)
    return timeString
  }
}

// 格式化黑名单时间显示
export const formatBlacklistTime = (timeString) => {
  if (!timeString) return '未知时间'
  
  try {
    const date = new Date(timeString)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return timeString
    }
    
    // 格式化为中文日期时间格式：MM月DD日 HH:mm
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${month}月${day}日 ${hours}:${minutes}`
  } catch (error) {
    console.error('黑名单时间格式化错误:', error)
    return timeString
  }
}