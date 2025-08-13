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

  // 邮箱验证器
  static validateEmail(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入邮箱地址'))
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(value)) {
        callback(new Error('请输入有效的邮箱地址'))
      } else {
        callback()
      }
    }
  }

  // 手机号验证器
  static validatePhone(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入电话号码'))
    } else {
      const phonePattern = /^1[3-9]\d{9}$/
      if (!phonePattern.test(value)) {
        callback(new Error('请输入有效的手机号码'))
      } else {
        callback()
      }
    }
  }

  // 密码确认验证器
  static validateConfirmPassword(newPassword) {
    return (rule, value, callback) => {
      if (newPassword && !value) {
        callback(new Error('请确认新密码'))
      } else if (value && value !== newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
  }

  // 用户名验证器
  static validateUserName(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入用户名'))
    } else if (value.length < 2 || value.length > 20) {
      callback(new Error('用户名长度在 2 到 20 个字符'))
    } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(value)) {
      callback(new Error('用户名只能包含中文、字母、数字和下划线'))
    } else {
      callback()
    }
  }

  // 密码验证器
  static validatePassword(rule, value, callback) {
    if (!value) {
      callback(new Error('请输入密码'))
    } else if (value.length < 6 || value.length > 20) {
      callback(new Error('密码长度在 6 到 20 个字符'))
    } else {
      callback()
    }
  }

  // 获取表单验证规则
  static getFormRules(newPassword = '') {
    return {
      // 用户名规则
      userName: [
        { validator: this.validateUserName, trigger: 'blur' }
      ],
      
      // 邮箱规则
      email: [
        { validator: this.validateEmail, trigger: 'blur' }
      ],
      
      // 手机号规则
      telephone: [
        { validator: this.validatePhone, trigger: 'blur' }
      ],
      
      // 密码规则
      password: [
        { validator: this.validatePassword, trigger: 'blur' }
      ],
      
      // 新密码规则（可选）
      newPassword: [
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      
      // 确认密码规则
      confirmPassword: [
        { validator: this.validateConfirmPassword(newPassword), trigger: 'blur' }
      ]
    }
  }

}
