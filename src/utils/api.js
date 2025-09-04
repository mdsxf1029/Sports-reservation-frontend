// src/utils/api.js
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { AuthService } from './auth';

// 创建 axios 实例
const instance = axios.create({
  baseURL: '',
  timeout: 5000
});

// 在 api.js 中添加响应拦截器
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 处理401未授权错误（通常表示token过期）
    if (error.response && error.response.status === 401) {
      const errorMsg = error.response.data?.msg || error.response.data?.message;

      ElMessage.warning('登录已过期，请重新登录');
      console.log('token401未授权，清除token，清除本地存储，跳转到登录页');
      // 清除本地存储
      AuthService.clearLoginData();

      // 跳转到登录页
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }

    return Promise.reject(error);
  }
);


// 获取用户违约记录
export function getViolations() {
  return instance.get('/api/violations');
}

// 加入黑名单
export function addToBlacklist(userId) {
  return instance.post('/api/blacklist/add', { userId });
}

// 获取场地信息
export const getVenues = (params) => {
  console.log('获取场地信息参数:', params);
  const token = localStorage.getItem('token');
  return instance.get('/api/venues/get', {
    params,
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 发布场地
export const createVenue = (data) => {
  const token = localStorage.getItem('token');
  // 对于 POST 和 PUT 请求, headers 是第三个参数
  return instance.post('/api/venues', data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 更新场地
export const updateVenue = (id, data) => {
  const token = localStorage.getItem('token');
  return instance.put(`/api/venues/${id}`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 删除场地
export const deleteVenue = (id) => {
  const token = localStorage.getItem('token');
  // 对于 DELETE 请求, headers 在第二个参数对象中
  return instance.delete(`/api/venues/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 批量更新场地状态
export const batchUpdateVenueStatus = (ids, status) => {
  const token = localStorage.getItem('token');
  return instance.put('/api/venues/batch-status', { ids, status }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
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
// 改进版本的前端代码
export function uploadAvatar(formData) {
  const token = localStorage.getItem('token');
  const headers = {};

  // 如果有token就添加到headers中
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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

export const cancelMyOrder = (userId, appointmentId) => {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return instance.put(`/api/appointments/${appointmentId}/cancel`, {
    AppointmentId: appointmentId,  
    UserId: userId
  }, {
    headers
  });
};

//申诉订单
export const createOrderAppeal = (userId, appointmentId, appealData) => {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return instance.post(`/api/appointments/${appointmentId}/appeal`, { userId, ...appealData }, { headers });
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

// 标记通知为已读
export const markNotificationAsRead = (userId, notificationId) => {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return instance.put(`/api/user/${userId}/notifications/${notificationId}/read`, {}, { headers });
};

/* 违约管理相关API */

// 获取违约记录列表
export const getViolationRecords = (params = {}) => {
  return instance.get('/api/violations', {
    params: {
      ...params // 支持传入page、pageSize、status、venue、dateRange等参数
    }
  });
};

// 获取违约详情
export const getViolationDetail = (violationId) => {
  return instance.get(`/api/violations/${violationId}`);
};

// 确认违约
export const confirmViolation = (violationId) => {
  return instance.put(`/api/violations/${violationId}/confirm`);
};

// 取消违约
export const cancelViolation = (violationId) => {
  return instance.put(`/api/violations/${violationId}/cancel`);
};

/* 申诉管理相关API */

// 获取申诉列表
export const getAppealRecords = (params = {}) => {
  return instance.get('/api/appeals', {
    params: {
      ...params // 支持传入page、pageSize、status、venue等参数
    }
  });
};

// 获取申诉详情
export const getAppealDetail = (appealId) => {
  return instance.get(`/api/appeals/${appealId}`);
};

// 处理申诉（通过或拒绝）
export const processAppeal = (appealId, action, reason = '') => {
  return instance.put(`/api/appeals/${appealId}/process`, {
    action, // 'approve' 或 'reject'
    reason  // 拒绝理由（可选）
  });
};

// 批量处理申诉
export const batchProcessAppeals = (appealIds, action, reason = '') => {
  return instance.put('/api/appeals/batch-process', {
    appealIds,
    action,
    reason
  });
};

/* 黑名单管理相关API */

// 获取黑名单用户列表
export const getBlacklistUsers = (params = {}) => {
  return instance.get('/api/blacklist', {
    params: {
      ...params // 支持传入page、pageSize等参数
    }
  });
};

// 添加用户到黑名单
export const addUserToBlacklist = (userData) => {
  return instance.post('/api/blacklist/add', userData);
};

// 从黑名单移除用户
export const removeUserFromBlacklist = (userId) => {
  return instance.delete(`/api/blacklist/${userId}`);
};

// 批量移除黑名单用户
export const batchRemoveFromBlacklist = (userIds) => {
  return instance.put('/api/blacklist/batch-remove', {
    userIds
  });
};

/* 用户账户与信息相关结束 */

// 获取社区帖子列表
export const fetchCommunityPosts = (params) => {
  const token = localStorage.getItem('token');
  const headers = {};

  // 如果用户已登录（即存在token），则在请求头中添加Authorization
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return instance.get(`/api/post/public`, {
    params: params,
    headers: headers, // 添加headers
  });
};

// 点赞社区帖子
export const likeCommunityPost = (postId) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  return instance.post(`/api/post-like/${postId}-${userId}`, null, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 取消点赞社区帖子
export const unlikeCommunityPost = (postId) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  return instance.delete(`/api/post-like/${postId}-${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 收藏社区帖子
export const collectCommunityPost = (postId) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  return instance.post(`/api/post-collection/${userId}-${postId}`, null, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 取消收藏社区帖子
export const uncollectCommunityPost = (postId) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  return instance.delete(`/api/post-collection/${userId}-${postId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 获取我收藏的帖子列表
export const fetchMyCollectedPosts = (params) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  return instance.get(`/api/post-collection/user/${userId}/posts`, {
    params: params,
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 举报社区帖子
export const reportCommunityPost = (postId, data) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  return instance.post(`/api/post-report/${postId}-${userId}`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 获取帖子详情页
// 获取帖子内容
export const fetchPostById = (id) => {
  const token = localStorage.getItem('token');
  const headers = {};

  // 如果用户已登录（即存在token），则在请求头中添加Authorization
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return instance.get(`/api/post/${id}`, {
    headers: headers, // 添加headers
  });
};

//获取帖子评论内容
export const fetchPostComments = (postId) => {
  const token = localStorage.getItem('token');
  const headers = {};

  // 如果用户已登录（即存在token），则在请求头中添加Authorization
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return instance.get(`/api/comment/post/${postId}`, {
    headers: headers, // 添加headers
  });
};

// 发布社区帖子
export const createCommunityPost = (postData) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return instance.post(`/api/post/user/${userId}`, postData, { headers });
};

// 帖子评论点赞、点踩、发布
// 点赞评论
export const likeComment = (commentId, userId) => {
  return instance.post(`/api/comment-like/${commentId}-${userId}`);
};

// 取消点赞评论
export const unlikeComment = (commentId, userId) => {
  return instance.delete(`/api/comment-like/${commentId}-${userId}`);
};

// 点踩评论
export const dislikeComment = (commentId, userId) => {
  return instance.post(`/api/comment-dislike/${commentId}-${userId}`);
};

// 取消点踩评论
export const undislikeComment = (commentId, userId) => {
  return instance.delete(`/api/comment-dislike/${commentId}-${userId}`);
};

// 发布评论
export const createCommunityComment = (postId, commentContent) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  return instance.post(`/api/comment/post/${postId}-${userId}`, {
    commentContent: commentContent  // 只传递必要的评论内容
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// 举报评论
export const reportCommunityComment = (CommentId, data) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  return instance.post(`/api/comment-report/${CommentId}-${userId}`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// 获取订单详情（根据预约 ID）
export const fetchOrderDetail = (appointmentId) => {
  const token = localStorage.getItem('token');
  return instance.get(`/api/appointments/${appointmentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

//帖子管理相关
export const getPosts = (params) => {
  /* params - 包含过滤和分页参数的对象
      e.g., { page: 1, pageSize: 10, status: 'pending', keyword: 'Vue' } */
  return instance.get('/api/posts', {
    params,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};
export const approvePost = (id) => {
  return instance.put(`/api/posts/${id}/approve`, null, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};
export const rejectPost = (id) => {
  return instance.put(`/api/posts/${id}/reject`, null, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};

//举报管理相关
export const getPostReports = (params) => {
  return instance.get('/api/post-report', {
    params,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};
export const processPostReport = (reportId, userId, data) => {
  return instance.put(`/api/post-report/${reportId}/manager/${userId}`, data, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};
export const fetchPostID = (postId) => {
  return instance.get(`/api/posts/${postId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};
export const getCommentReports = (params) => {
  return instance.get('/api/comment-report', { params, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
};

export const processCommentReport = (reportId, userId, data) => {
  return instance.put(`/api/comment-report/${reportId}/manager/${userId}`, data, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
};