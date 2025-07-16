<template>
  <div class="login-form">
    <h1>欢迎登录</h1>
    <h2>运动场地预约系统</h2>
    <p>请填写以下信息进行登录:</p>
    <el-form
      :model="form"
      :rules="rules"
      ref="loginFormRef"
      label-width="100px"
      size="large"
      @submit.prevent="login"
      hide-required-asterisk
    >
      <el-form-item label="身　份" prop="identity">
        <el-select v-model="form.identity" placeholder="请选择身份">
          <el-option label="用户" value="user"></el-option>
          <el-option label="管理员" value="admin"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密　码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password></el-input>
      </el-form-item>
      <p>没有账号吗？<router-link to="/register">去注册</router-link></p>
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          native-type="submit"
          class="login-btn"
          style="width: 100%; background-color: #000; color: white;"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/utils/api'

const router = useRouter()  // 路由实例
const loginFormRef = ref()  // 引用表单实例
const form = ref({
  identity: '',  
  username: '',
  password: ''
})
const rules = {
  identity: [
    { required: true, message: '请选择身份', trigger: 'change' }
  ],
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' }
  ]
}
const login = () => {
  console.log('登录请求开始...')
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    console.log('表单校验通过，开始登录请求...')
    try {

      const res = await loginUser({
        username: form.value.username,
        password: form.value.password,
        identity: form.value.identity
      })
      if (res.data.token) {
        alert('登录成功')
        localStorage.setItem('token', res.data.token)
        router.push('/home')
      } else {
        alert(res.data.message || '登录失败')
      }
    } catch (err) {
      alert('网络请求出错！')
    }
  })
}
</script>
 


<style scoped>
     
    .login-form {
        width: 90%;             
        max-width: 420px;        /* 放大宽度 */
        padding: 48px 40px 36px 40px;
        margin: 0 auto;
        border-radius: 12px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.08);
        display: flex;
        flex-direction: column;
        align-items: stretch;
        background: #fff;
    }
    /* 标题样式 */
    .login-form h1 {        
        font-size: 2.5rem;       /* 更大标题 */
        font-weight: bold;
        margin-bottom: 8px;
    }
    .login-form h2 {
        font-size: 1.75rem;
        font-weight: 500;
        margin-bottom: 24px;
        color: #222;
    }
    /* 段落样式 */
    .login-form p {
        margin-bottom: 20px;
        color: #666;
        font-size: 20px;
    }
    /* 针对 Element Plus 输入框、下拉框、按钮的字体大小 */

    .login-form :deep(.el-form-item__label) {
      font-size: 20px !important;
    }
    .login-form :deep(.el-input__inner) {
      font-size: 20px !important;
    }
    .login-form :deep(.el-select__selected-item) {
      font-size: 20px !important;
    }
    .login-form :deep(.el-select-dropdown__item) {
      font-size: 20px !important;
    }
    .login-form :deep(.el-button) {
      font-size: 20px !important;
    }
    .login-btn {
      font-size: 20px !important;
    }

</style>
