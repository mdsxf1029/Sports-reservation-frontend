<template>
  <div class="login-form">
    <h1>欢迎登录</h1>
    <h2>运动场地预约系统</h2>

    <p>请填写以下信息进行登录:</p>
    <p>没有账号吗？<router-link to="/register">去注册</router-link></p>

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
     
      <div class ="remember-row">
        <el-checkbox v-model="rememberMe">记住账号</el-checkbox>
        <span style="text-align:right; color: darkgray;">
        <el-link @click="openDialog" type="primary">忘记密码？</el-link>
          <el-dialog
            v-model="dialogVisible"
            width="340px"
            :show-close="false"
            class="custom-dialog"
            center
          >
            <template #header>
              <div class="dialog-header">
                <el-icon style="color: #f6c343; font-size: 26px; margin-right: 8px;">
                  <el-icon-warning />
                </el-icon>
                <span style="font-weight: bold; font-size: 20px;">温馨提示</span>
              </div>
            </template>
            <div class="dialog-content">
              请联系管理员重置密码，<br>或稍后再试。
            </div>
            <template #footer>
              <el-button type="primary" style="width: 100%;" @click="dialogVisible = false">确 定</el-button>
            </template>
          </el-dialog>


        </span>
      </div>
     
      <el-button
        type="primary"
        size="large"
        native-type="submit"
        class="login-btn"
        style="width: 100%; background-color: #000; color: white;"
      >
        登录
      </el-button> 
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/utils/api'
const dialogVisible = ref(false)
const router = useRouter()  // 路由实例
const loginFormRef = ref()  // 引用表单实例

const form = ref({
  identity: '',  
  username: '',
  password: ''
})
// 记住用户名的复选框
const rememberMe = ref(false)  // 记住
// 页面加载时自动读取本地保存的用户名
onMounted(() => {
  const savedUsername = localStorage.getItem('saved_username')
  const savedIdentity = localStorage.getItem('saved_identity')
  const savedPassword = localStorage.getItem('saved_password')
  if (savedUsername) {
    form.value.username = savedUsername
    form.value.identity = savedIdentity || 'user'  // 默认身份为用户
    form.value.password = savedPassword || ''
    rememberMe.value = true
  }
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
        // 记住账号逻辑
        if (rememberMe.value) {
          localStorage.setItem('saved_username', form.value.username)
          localStorage.setItem('saved_identity', form.value.identity)
          localStorage.setItem('saved_password', form.value.password)
        } else {
          localStorage.removeItem('saved_username')
          localStorage.removeItem('saved_identity')
          localStorage.removeItem('saved_password')
        }
        router.push('/home')
      } else {
        alert(res.data.message || '登录失败')
      }
    } catch (err) {
      alert('网络请求出错！')
    }
  })
}

const openDialog = () => {
  dialogVisible.value = true
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
      margin-bottom: px;
      color: #222;
  }
  /* 段落样式 */
  .login-form p {
      margin-bottom: 4px;/* 段落底部间距 */
      color: #666;
      font-size: 20px;
      padding : 0 0 0 20px; /* 指定左内边距 */
  }
  /* 针对 Element Plus 输入框、下拉框、复选框、按钮的字体大小 */

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
  .login-form :deep(.el-checkbox__label) {
    font-size: 18px !important;
  }
  .login-btn {
    font-size: 20px !important;
  }

  .remember-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: auto;
  }

  /* 忘记密码链接样式 */
  .custom-dialog .el-dialog__header {
    border-bottom: none;
    padding-bottom: 0;
  }
  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0;
  }
  .dialog-content {
    text-align: center;
    font-size: 18px;
    color: #444;
    margin: 24px 0 8px 0;
    line-height: 1.8;
  }
  .custom-dialog .el-dialog__footer {
    border-top: none;
    padding-top: 0;
  }



</style>
