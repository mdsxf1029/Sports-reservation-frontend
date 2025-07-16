- 2025年7月14日 
	明确负责板块：
	- 用户账户与信息模块
	- 登录注册 / 个⼈中⼼ / 我的积分 / 我的预约记录
	
	使用的UI框架：
	- Element Plus vue
	- 依据： "element-plus": "^2.10.0" [文件：package-lock.json]
	- 执行的指令 "npm install"

	页面划分：
	- 登录注册页面
	- 个人空间页面
	- 我的积分页面
	- 我的预约页面

	- 前端组件命名:大驼峰.
    - 路由路径:全部小写，动词为主
    - 后端 API接口:RESTfu命名， 
	- 动词为行为(路径是资源，动词是 HTTP 方法。路径写成名词,动词别放 URL 里。)


	明确项目结构：
	```
	📁 views/
	├── 📁 auth/
	│   ├── 📄 Login.vue          # 登录页面
	│   ├── 📄 Register.vue       # 注册页面
	├── 📁 bookings/
	│   └── 📄 Bookings.vue
	├── 📁 points/
	│   └── 📄 Points.vue
	├── 📁 profile/
    │   └── 📄 Profile.vue
	📁 components/
	├── 📁 auth/             # 认证相关组件文件夹
	│   ├── �📄 LoginForm.vue     # 登录表单组件
	│   ├── 📄 RegisterForm.vue  # 注册表单组件
	│	└── 📄 EmailForm.vue
	├── 📄 FooterNavbar.vue
	└── 📄 HeaderNavbar.vue

	```
	- 先做 登录注册页面	

- 2025年7月15日
  ```js
  resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
  }
  ```
  在vite.config.js 中做出的修改，是必要的，不然无法使得图片显示。

  一些疑问：
  什么时候进行登录？
  换句话是： 进入页面的时候是 登录注册页面还是 主页面，然后由用户自己选自是否登录？

  - 最终将注册和登录页面分开写

- 2025年7月16日
  - npm install axios //调用API时候要下载的库
  - 一些要点 
  - login（登录）表面上看像是“查数据”，但在RESTful API 设计中，登录通常用的是POST而不是GET
  - 登录和注册页面添加了API 目前提交后会显示 网络问题， （应该是没问题的吧，毕竟没有 后端
  - 对输入框细节进行了调整
  - 添加了记住账号 和 忘记密码（只是一个弹窗）。
  - 个人感觉 注册 和 忘记密码加一个 邮箱验证的比较好？（因为短信花钱） 不过目前计划先搭框架，初步完成下别的页面。 
  
