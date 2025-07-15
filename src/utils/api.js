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
