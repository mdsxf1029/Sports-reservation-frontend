// src/utils/api.js
import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'https://m1.apifoxmock.com/m1/6799481-6512616-default', // 这里可以写你的后端基础路径，比如 http://localhost:5000/
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