<template>
  <div class="register-form">    
    <h1>欢迎注册</h1>
    <h2>运动场地预约系统</h2>
    <p>请填写以下信息进行注册:</p>
    <el-form
      :model="form"
      :rules="rules"
      ref="registerFormRef"
      label-width="100px"
      size="large"
      @submit.prevent="register"
      hide-required-asterisk
    >
      <el-form-item label="身　份" prop="identity">
        <el-select v-model="form.identity" placeholder="请选择身份" disabled="true">
          <el-option label="用户" value="user"></el-option> 
        </el-select>
      </el-form-item>
      
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
        ></el-input>
      </el-form-item>
      <el-form-item label="密　码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请输入确认密码"
          show-password
        ></el-input>
      </el-form-item> 
      <p>已有账号？<router-link to="/login">去登录</router-link></p>
      <el-form-item>
        <el-button type="primary" size="large" native-type="submit" class="register-btn" style="width: 100%; background-color: #000; color: white;">
            注册
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue' 
import { registerUser } from '../utils/api'
import { useRouter } from 'vue-router'

const router = useRouter()  // 路由实例
const registerFormRef = ref()  // 引用表单实例

const form = ref({
  identity: 'user',
  username: '',
  password: '',
  confirmPassword: ''
})

// 自定义确认密码校验
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
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 注册方法 
const register = async () => {
  const formRef = registerFormRef.value
  if (!formRef) return
  console.log('运行了register方法');
  try { 
    // validate 返回 Promise，校验不通过会 throw error
    await formRef.validate()
    // 校验通过后发起请求
    const res = await registerUser({
      username: form.value.username,
      password: form.value.password,
      identity: form.value.identity, 
    })
    if (res && res.data && res.data.token) {
      alert('注册成功')
      localStorage.setItem('token', res.data.token)
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
  }
}
</script>

<style scoped>
.register-form {
    width: 90%;
    max-width: 420px;
    padding: 48px 40px 36px 40px;
    margin: 0 auto;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: #fff;
}
.register-form h1 {        
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 8px;
}
.register-form h2 {
    font-size: 1.75rem;
    font-weight: 500;
    margin-bottom: 24px;
    color: #222;
}
.register-form p {
    margin-bottom: 20px;
    color: #666;
    font-size: 20px;
}
.register-form :deep(.el-form-item__label) {
  font-size: 20px !important;
}
.register-form :deep(.el-input__inner) {
  font-size: 20px !important;
}
.register-form :deep(.el-select__selected-item) {
  font-size: 20px !important;
}
.register-form :deep(.el-select-dropdown__item) {
  font-size: 20px !important;
}
.register-form :deep(.el-button) {
  font-size: 20px !important;
}
.register-btn {
  font-size: 20px !important;
}
</style>
