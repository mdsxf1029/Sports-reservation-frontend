// src/utils/api.js
import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/', // 这里可以写你的后端基础路径，比如 http://localhost:5000/
  timeout: 5000
});

// 获取用户违约记录
export function getViolations() {
  return instance.get('/api/violations');
}

// 加入黑名单
export function addToBlacklist(userId) {
  return instance.post('/api/blacklist/add', { userId });
}

// 你可以根据需要继续添加其他接口方法

/* 用户相关 */

// 注册（创建用户）
export function registerUser(userData) {
  return instance.post('/api/users', userData);
}

// 登录（创建会话/令牌）
export function loginUser(credentials) {
  return instance.post('/api/sessions', credentials);
}


/* 用户相关结束 */