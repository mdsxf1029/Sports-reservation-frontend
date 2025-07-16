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

// 获取订单详情（根据预约 ID）
export const fetchOrderDetail = (appointmentId) => {
  return instance.get(`/api/appointments/${appointmentId}`);
  /*return axios.get(`http://127.0.0.1:4523/m1/6319279-6014567-default/api/appointments/1`);*/
};