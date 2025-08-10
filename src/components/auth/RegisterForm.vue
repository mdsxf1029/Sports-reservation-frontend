<template>
  <div class="register-form">
    <div class="form-header">
      <h1>用户注册</h1>
      <p class="form-description">请填写以下信息进行注册</p>
      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link> 
      </div>
      <div class="login-link"> 
        暂时不想注册？这里返回到<router-link to="/home">首页</router-link>
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
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="保密" value="unknown" />
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
        <el-select 
          v-model="form.region" 
          placeholder="请选择所在地区"
          style="width: 100%"
          clearable
        >
          <el-option label="北京市" value="北京市" />
          <el-option label="上海市" value="上海市" />
          <el-option label="天津市" value="天津市" />
          <el-option label="重庆市" value="重庆市" />
          <el-option label="河北省" value="河北省" />
          <el-option label="山西省" value="山西省" />
          <el-option label="辽宁省" value="辽宁省" />
          <el-option label="吉林省" value="吉林省" />
          <el-option label="黑龙江省" value="黑龙江省" />
          <el-option label="江苏省" value="江苏省" />
          <el-option label="浙江省" value="浙江省" />
          <el-option label="安徽省" value="安徽省" />
          <el-option label="福建省" value="福建省" />
          <el-option label="江西省" value="江西省" />
          <el-option label="山东省" value="山东省" />
          <el-option label="河南省" value="河南省" />
          <el-option label="湖北省" value="湖北省" />
          <el-option label="湖南省" value="湖南省" />
          <el-option label="广东省" value="广东省" />
          <el-option label="海南省" value="海南省" />
          <el-option label="四川省" value="四川省" />
          <el-option label="贵州省" value="贵州省" />
          <el-option label="云南省" value="云南省" />
          <el-option label="陕西省" value="陕西省" />
          <el-option label="甘肃省" value="甘肃省" />
          <el-option label="青海省" value="青海省" />
          <el-option label="台湾省" value="台湾省" />
          <el-option label="内蒙古自治区" value="内蒙古自治区" />
          <el-option label="广西壮族自治区" value="广西壮族自治区" />
          <el-option label="西藏自治区" value="西藏自治区" />
          <el-option label="宁夏回族自治区" value="宁夏回族自治区" />
          <el-option label="新疆维吾尔自治区" value="新疆维吾尔自治区" />
          <el-option label="香港特别行政区" value="香港特别行政区" />
          <el-option label="澳门特别行政区" value="澳门特别行政区" />
          <el-option label="其他" value="其他" />
        </el-select>
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
import { ElMessage } from 'element-plus'
import { AuthService } from '@/utils/auth'

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
    { required: true, validator: AuthService.validateEmail, trigger: 'blur' }
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
    
    // 准备提交的数据（前端使用驼峰命名风格）
    const userData = {
      userName: form.value.userName,
      telephone: form.value.telephone,
      email: form.value.email,
      password: form.value.password,
      gender: form.value.gender,
      birthday: form.value.birthday || '1990-01-01', // 提供默认日期而不是 null
      avatarUrl: form.value.avatarUrl,
      region: form.value.region || '其他',
      profile: form.value.profile || '这个用户很懒，什么都没有留下。',
      role: form.value.role,
      registerTime: new Date().toISOString().split('T')[0], // 当前日期 
      points: 0 // 新用户初始积分为0
      // 注意：后端会自动处理字段名转换和user_id生成
    }
    
    // 校验通过后发起请求
    const r = await registerUser(userData)
    const res = r.data
    if (res && res.code === 0) {
      // 注册成功
      ElMessage.success(res.msg)
      ElMessage.success('即将跳转到登录页')
      console.log('注册成功!')
      // 清空密码字段以提高安全性
      form.value.password = ''
      form.value.confirmPassword = ''
      
      // 如果后端返回了新用户ID和用户名，可以在这里处理
      if (res.data && res.data.userId) {
        console.log('新用户ID:', res.data.userId)
        console.log('用户名:', res.data.userName)
         
      }
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push('/login')
      }, 500)
    } else {
      // 注册失败 - 直接使用后端返回的错误消息
      const errorMsg = res?.msg || '注册失败，请重试'
      ElMessage.error(errorMsg)
      console.error('注册失败:', res)
    }
  } catch (err) {
    // 如果是表单校验错误（Element Plus 会抛出包含校验信息的错误） 
    if (err && typeof err === 'object' && !err.response) {
      // 表单校验错误，不需要特殊处理，Element Plus 会自动显示错误信息
      console.error('表单校验错误:', err)
      return
    }
    
    // 处理网络或服务器错误
    console.error('注册异常:', err)
    if (err.response) {
      const status = err.response.status
      switch (status) {
        case 400:
          ElMessage.error('请求参数错误，请检查输入信息')
          break
        case 409:
          ElMessage.error('用户名或邮箱已存在')
          break
        case 500:
          ElMessage.error('服务器内部错误，请稍后重试')
          break
        default:
          ElMessage.error(`注册失败：${status}`)
      }
    } else if (err.request) {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      ElMessage.error('注册过程中发生未知错误')
    }
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
