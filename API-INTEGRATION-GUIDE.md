# 前后端API集成指南

## 🎯 已完成的工作

### 1. 新闻管理功能
- ✅ 替换模拟API为真实后端API调用
- ✅ 实现新闻列表获取 (`/api/news`)
- ✅ 实现新闻创建 (`POST /api/news`)
- ✅ 实现新闻更新 (`PUT /api/news/{id}`)
- ✅ 实现新闻删除 (`DELETE /api/news/{id}`)
- ✅ 实现封面图片上传 (`POST /api/news/upload-cover`)

### 2. 违约管理功能
- ✅ 替换模拟API为真实后端API调用
- ✅ 实现违约记录列表获取 (`/api/violations`)
- ✅ 实现违约记录添加 (`POST /api/violations`)
- ✅ 数据格式转换适配前端组件

### 3. 申诉/黑名单管理功能
- ✅ 替换模拟API为真实后端API调用
- ✅ 实现黑名单列表获取 (`/api/blacklist`)
- ✅ 实现添加用户到黑名单 (`POST /api/blacklist/add`)
- ✅ 数据格式转换适配前端组件

## 🚀 启动步骤

### 1. 启动后端服务
```bash
cd Sports-reservation-backend
dotnet run
```
确保后端服务运行在 `http://localhost:5000`

### 2. 启动前端服务
```bash
cd Sports-reservation-frontend
npm run dev
```

### 3. 测试API连接
```bash
cd Sports-reservation-frontend
node test-api.js
```

## 📋 测试功能

### 新闻管理测试
1. 访问前端管理页面
2. 测试新闻列表加载
3. 测试创建新闻
4. 测试编辑新闻
5. 测试发布新闻
6. 测试删除新闻
7. 测试图片上传

### 违约管理测试
1. 访问违约管理页面
2. 测试违约记录列表加载
3. 测试筛选功能
4. 测试查看详情功能

### 申诉/黑名单管理测试
1. 访问申诉管理页面
2. 测试黑名单列表加载
3. 测试添加用户到黑名单
4. 测试移除黑名单用户

## 🔧 配置说明

### API基础URL配置
前端API基础URL已设置为: `http://localhost:5000`

如需修改，请编辑:
```
Sports-reservation-frontend/src/utils/api.js
```

修改第8行的baseURL:
```javascript
baseURL: 'http://localhost:5000', // 修改为你的后端地址
```

### 认证Token
所有需要认证的API请求都会自动添加Authorization头:
```javascript
headers: { 'Authorization': `Bearer ${token}` }
```

## 📊 数据格式说明

### 新闻数据格式
```javascript
{
  newsId: number,
  newsTitle: string,
  newsContent: string,
  newsStatus: string, // 'draft', 'published', 'scheduled'
  newsTime: string,
  coverUrl: string
}
```

### 违约记录数据格式
```javascript
{
  id: number,
  userName: string,
  userId: number,
  violationReason: string,
  venue: string,
  timeSlot: string,
  violationDate: string,
  isBlacklisted: boolean
}
```

### 黑名单数据格式
```javascript
{
  userId: number,
  managerId: number,
  beginTime: string,
  endTime: string,
  bannedReason: string,
  bannedStatus: string
}
```

## ⚠️ 注意事项

1. **后端服务必须运行**: 确保后端服务正在运行在指定端口
2. **数据库连接**: 确保后端数据库连接正常
3. **CORS配置**: 后端需要配置CORS允许前端访问
4. **认证Token**: 某些操作需要有效的用户认证Token

## 🐛 故障排除

### 常见问题
1. **API连接失败**: 检查后端服务是否运行
2. **401未授权**: 检查用户是否已登录
3. **数据格式错误**: 检查后端返回数据格式是否匹配
4. **CORS错误**: 检查后端CORS配置

### 调试方法
1. 打开浏览器开发者工具查看网络请求
2. 检查控制台错误信息
3. 使用测试脚本验证API连接
4. 查看后端日志输出

## 📞 技术支持

如遇到问题，请检查:
1. 后端服务状态
2. 数据库连接
3. 网络连接
4. 控制台错误信息
