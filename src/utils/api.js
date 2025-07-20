// src/utils/api.js
import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/',
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

//获取场地信息
export const getVenues = () => {
  return instance.get('/api/venues');
};

//发布场地
export const createVenue = (data) => {
  return instance.post('/api/venues', data);
};

//更新场地
export const updateVenue = (id, data) => {
  return instance.put(`/api/venues/${id}`, data);
};

//删除场地
export const deleteVenue = (id) => {
  return instance.delete(`/api/venues/${id}`);
};

// 你可以根据需要继续添加其他接口方法

/* 用户相关 */

// 注册（创建用户）
export function registerUser(userData) {
  return instance.post('/api/auth/register', userData);
}

// 登录（创建会话/令牌）
export function loginUser(credentials) {
  return instance.post('/api/auth/login', credentials);
}

// 上传头像
export function uploadAvatar(formData) {
  return instance.post('/api/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 获取用户头像 用户头像可以公开获取 不用token
export function getAvatar(userId) { 
  return instance.get(`/api/user/${userId}/avatar`,userId);
}

// 获取用户信息 用于个人中心
export function getUserInfo(userId) {
  const token = localStorage.getItem('token');
  return instance.get(`/api/user/${userId}`, {
    headers: {
      'token': token
    }
  });
}

// 更新用户信息
export function updateUserInfo(userId, userData) {
  const token = localStorage.getItem('token');
  return instance.put(`/api/user/${userId}`, userData, {
    headers: {
      'token': token
    }
  });
}

// 获取我的订单信息（根据用户ID和其他参数）
export const fetchMyOrderSummary = (userId, params = {}) => {
  return instance.get(`/api/appointments`, {
    params: { 
      userId,
      ...params // 支持传入额外的查询参数，如page、appointmentStatus、beginTime、endTime等
    }
  });
};
