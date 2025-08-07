// src/utils/api.js
import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  baseURL: '',
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

// 上传头像（注册时无需token，登录后需要token）
export function uploadAvatar(formData) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'multipart/form-data'
  };
  
  // 如果有token就添加到headers中
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;  // ✅ 标准Bearer格式
  }
  
  return instance.post('/api/upload/avatar', formData, {
    headers: headers
  });
}

// 获取用户信息 用于个人中心
export function getUserInfo(userId) {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;  // ✅ 标准Bearer格式
  }
  
  return instance.get(`/api/user/${userId}`, { headers });
}

// 更新用户信息
export function updateUserInfo(userId, userData) {
  const token = localStorage.getItem('token');
  return instance.put(`/api/user/${userId}`, userData, {
    headers: { 'Authorization': `Bearer ${token}` }  // ✅ 标准Bearer格式
  });
}

// 获取我的订单信息（根据用户ID和其他参数）
export const fetchMyOrderSummary = (userId, params = {}) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return instance.get(`/api/appointments`, {
    params: { userId, ...params },
    headers
  });
};

// 获取用户积分记录
export const fetchUserPoints = (userId, params = {}) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return instance.get(`/api/user/${userId}/points`, {
    params: { ...params },
    headers
  });
};

// 获取积分变化记录
export const fetchPointsHistory = (userId, params = {}) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return instance.get(`/api/user/${userId}/points/history`, {
    params: { ...params },
    headers
  });
};

// 获取用户通知列表
export const fetchUserNotifications = (userId, params = {}) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return instance.get(`/api/user/${userId}/notifications`, {
    params: { ...params },
    headers
  });
};



/* 用户账户与信息相关结束 */

// 获取社区帖子列表
export const fetchCommunityPosts = (params) => {
  return instance.get('/api/community/posts', {
    params: params,
  });
};

// 点赞社区帖子
export const likeCommunityPost = (postId) => {
  return instance.post(`/api/community/posts/${postId}/like`);
};

// 取消点赞社区帖子
export const unlikeCommunityPost = (postId) => {
  return instance.delete(`/api/community/posts/${postId}/like`);
};

// 收藏社区帖子
export const collectCommunityPost = (postId) => {
  return instance.post(`/api/community/posts/${postId}/collect`);
};

// 取消收藏社区帖子
export const uncollectCommunityPost = (postId) => {
  return instance.delete(`/api/community/posts/${postId}/collect`);
};

// 获取我收藏的帖子列表
export const fetchMyCollectedPosts = (params) => {
  return instance.get('/api/community/posts/collections', {
    params: params,
  });
};

// 举报社区帖子
export const reportCommunityPost = (postId, data) => {
  return instance.post(`/api/community/posts/${postId}/report`, data);
};

// 获取帖子详情页
export const fetchPostById = (postId) => {
  return instance.get(`/api/community/posts/${postId}`);
};

// 获取订单详情（根据预约 ID）
export const fetchOrderDetail = (appointmentId) => {
  /*return instance.get(`/api/appointments/${appointmentId}`);*/
  return axios.get(`http://127.0.0.1:4523/m1/6319279-6014567-default/api/appointments/1`);
};



// 获取预约是否成功信息
export const fetchConfirmInfo = (appointmentId) => {
  /*return instance.get(`/api/appointments/{appointmentId}/confirm-info`);*/
  return axios.get(`http://127.0.0.1:4523/m1/6319279-6014567-default/api/appointments/1/confirm-info`);
};

//帖子管理相关
export const getPendingPosts = () => instance.get('/api/posts/pending');
export const approvePost = (id) => instance.put(`/api/posts/${id}/approve`);
export const rejectPost = (id) => instance.put(`/api/posts/${id}/reject`)

//举报管理相关
export const getPendingReports = () => instance.get('/api/reports/pending');
export const processReport = (id, data) => instance.put(`/api/reports/${id}/process`, data);

//管理员发布公告
export const publishAnnouncement = (data) => instance.post('/api/announcements', data);