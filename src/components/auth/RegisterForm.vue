<template>
  <div class="register-form">
    <div class="form-header">
      <h1>用户注册</h1>
      <p class="form-description">请填写以下信息进行注册</p>
      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>

    <el-form
      :model="form"
      :rules="rules"
      ref="registerFormRef"
      label-width="100px"
      size="large"
      @submit.prevent="register"
    >
      <el-form-item label="用户名" prop="userName">
        <el-input
          v-model="form.userName"
          placeholder="请输入用户名"
        />
      </el-form-item>

      <div class="form-row">
        <el-form-item label="电　话" prop="telephone" class="half-width">
          <el-input
            v-model="form.telephone"
            placeholder="请输入电话号码"
          />
        </el-form-item>
        
        <el-form-item label="邮　箱" prop="email" class="half-width">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item label="密　码" prop="password" class="half-width">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword" class="half-width">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请输入确认密码"
            show-password
          />
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item label="性　别" prop="gender" class="half-width">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option label="男" value="M" />
            <el-option label="女" value="F" />
            <el-option label="保密" value="O" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="出生日期" prop="birthday" class="half-width">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="请选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <el-form-item label="头　像" prop="avatarUrl">
        <AvatarUpload 
          v-model="form.avatarUrl" 
          :gender="form.gender"
        />
      </el-form-item>

      <el-form-item label="所在地区" prop="region">
        <el-input
          v-model="form.region"
          placeholder="请输入所在地区"
        />
      </el-form-item>

      <el-form-item label="个人简介" prop="profile">
        <el-input
          v-model="form.profile"
          type="textarea"
          :rows="3"
          placeholder="请输入个人简介（选填）"
        />
      </el-form-item>

      <el-form-item>
        <el-button 
          type="primary" 
          size="large" 
          native-type="submit" 
          :loading="isLoading"
          style="width: 100%;"
        >
          {{ isLoading ? '注册中...' : '立即注册' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue' 
import { registerUser } from '@/utils/api'
import { useRouter } from 'vue-router'
import AvatarUpload from '@/components/AvatarUpload.vue'

const router = useRouter()  // 路由实例
const registerFormRef = ref()  // 引用表单实例
const isLoading = ref(false)  // 加载状态

const form = ref({
  userName: '',        // 用户名 (遵循驼峰命名)
  telephone: '',       // 电话号码
  email: '',          // 邮箱
  password: '',       // 密码
  confirmPassword: '', // 确认密码
  gender: '',         // 性别
  birthday: '',       // 出生日期
  avatarUrl: '',      // 头像链接 (可选，默认使用系统头像)
  region: '',         // 所在地区
  profile: '',        // 个人简介
  role: 'normal'      // 角色，默认为普通用户
})

// 自定义邮箱校验
const validateEmail = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('邮箱不能为空'))
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  }
}

// 自定义电话号码校验
const validatePhone = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('电话号码不能为空'))
  } else {
    const phonePattern = /^1[3-9]\d{9}$/
    if (!phonePattern.test(value)) {
      callback(new Error('请输入正确的手机号码'))
    } else {
      callback()
    }
  }
}
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请确认密码'))
  } else if (value !== form.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = { 
  userName: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  telephone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ]
}
// 注册方法 
const register = async () => {
  const formRef = registerFormRef.value
  if (!formRef) return
  
  isLoading.value = true  // 开始加载
  console.log('运行了register方法');
  try { 
    // validate 返回 Promise，校验不通过会 throw error
    await formRef.validate()
    
    // 准备提交的数据（注意：不包含user_id，由后端自动生成）
    const userData = {
      userName: form.value.userName,
      telephone: form.value.telephone,
      email: form.value.email,
      password: form.value.password,
      gender: form.value.gender,
      birthday: form.value.birthday || null,
      // 头像URL由AvatarUpload组件处理，包含默认头像逻辑
      avatarUrl: form.value.avatarUrl,
      region: form.value.region || null,
      profile: form.value.profile || null,
      role: form.value.role,
      register_time: new Date().toISOString().split('T')[0], // 当前日期
      points: 100 // 新用户初始积分
      // 注意：user_id 由后端数据库自动生成，无需前端提供
    }
    
    // 校验通过后发起请求
    const res = await registerUser(userData)
    
    if (res && res.data && res.data.success) {
      alert('注册成功！已获得100积分奖励')
      router.push('/login') // 注册成功后跳转到登录页面
    } else {
      alert(res?.data?.message || '注册失败')
    }
  } catch (err) {
    // 如果是表单校验错误（Element Plus 校验错误是 Error 对象且有 message 字段） 
    if (err && err.name === 'Error' && err.message) {
      // 表单校验错误，不做处理
      console.error('表单校验错误:', err.message)
      return
    }
    // 其它错误（如网络异常）
    console.error('注册异常:', err)
    alert('网络请求出错！')
  } finally {
    isLoading.value = false  // 结束加载
  }
}
</script>

<style scoped>
.register-form {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.form-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #666;
  margin-bottom: 1rem;
}

.login-link {
  color: #666;
  font-size: 0.9rem;
}

.login-link a {
  color: #409EFF;
  text-decoration: none;
  margin-left: 0.5rem;
}

.login-link a:hover {
  text-decoration: underline;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half-width {
  flex: 1;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

.register-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

.register-form :deep(.el-select) {
  width: 100%;
}

/* 头像上传区域 - 简单修复边框显示 */
.register-form :deep(.el-upload) {
  width: 90% !important;
}

@media (max-width: 768px) {
  .register-form {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .half-width {
    flex: none;
  }
  
  .form-header h1 {
    font-size: 1.5rem;
  }
  
  /* 移动端调整 */
  .register-form :deep(.el-upload) {
    width: 100% !important;
  }
}
</style>
