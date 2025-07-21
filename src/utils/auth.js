/**
 * 认证相关工具函数
 */

import { ElMessage } from 'element-plus'

export class AuthService {
  // 检查登录状态
  static checkLoginStatus() {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    
    console.log('登录检查:', { token: !!token, userId: userId })
    
    if (!token || !userId) {
      return { isValid: false, reason: 'no_credentials' }
    }
    
    // 检查token是否过期
    const expires = localStorage.getItem('expires')
    if (expires && new Date(expires) < new Date()) {
      return { isValid: false, reason: 'expired' }
    }
    
    return { isValid: true, userId }
  }

  // 处理登录失效
  static handleAuthFailure(reason, router) {
    if (reason === 'expired') {
      ElMessage.warning('登录已过期，请重新登录')
    } else {
      ElMessage.warning('请先登录后再访问个人中心')
    }
    
    this.clearLoginData()
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }

  // 清除登录数据
  static clearLoginData() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('expires')
    localStorage.removeItem('userAvatar')
  }

  // 设置测试登录信息（开发用）
  static setTestLoginInfo() {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'test-token-123')
      localStorage.setItem('userId', '1')
      localStorage.setItem('userName', 'testUser')
      console.log('设置了测试用的登录信息')
    }
  }
}
