<template>
  <div class="login-form">
    <h1>欢迎登录</h1>
    <h2>运动场地预约系统</h2>

    <!--<p>请使用邮箱进行登录:</p>-->
    <p>没有账号吗？<router-link to="/register">去注册</router-link></p>
    <p class="space-below">暂时不想登录？这里返回到<router-link to="/">首页</router-link></p>

    <el-form
      :model="form"
      :rules="rules"
      ref="loginFormRef"
      label-width="80px"
      size="large"
      @submit.prevent="login"
      hide-required-asterisk
    >
      <el-form-item label="身　份" prop="role">
        <el-select v-model="form.role" placeholder="请选择身份">
          <el-option label="用户" value="normal"></el-option>
          <el-option label="管理员" value="manager"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="邮　箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
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
        style="width: 95%; background-color: #1c1c1c; color: white;"
        :loading="isLoading"
        :disabled="isLoading"
      >
        {{ isLoading ? '登录中...' : '登录' }}
      </el-button> 
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/utils/api'
import { ElMessage } from 'element-plus' 

const dialogVisible = ref(false)
const router = useRouter()  // 路由实例
const loginFormRef = ref()  // 引用表单实例

const form = ref({
  role: 'normal',  // 设置默认值为普通用户
  email: '',       // 改为email，仅支持邮箱登录
  password: ''
})
// 记住用户名的复选框
const rememberMe = ref(false)  // 记住
const isLoading = ref(false)   // 登录加载状态
// 页面加载时自动读取本地保存的账号信息
onMounted(() => {
  const savedEmail = localStorage.getItem('saved_email')  // 改为email
  const savedRole = localStorage.getItem('saved_role')
  if (savedEmail) {
    form.value.email = savedEmail    // 改为email
    form.value.role = savedRole || 'normal'
    rememberMe.value = true
  }
})
const rules = {
  role: [
    { required: true, message: '请选择身份', trigger: 'change' }
  ],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { 
      type: 'email', 
      message: '请输入正确的邮箱格式', 
      trigger: ['blur', 'change'] 
    }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' }
  ]
}
const login = () => {
  console.log('登录请求开始...')
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    isLoading.value = true // 开始加载
    console.log('表单校验通过，开始登录请求...')
    
    try {
      const res = await loginUser({
        role: form.value.role,
        email: form.value.email,       
        password: form.value.password,
        way: 'password' // API要求的登录方式参数
      })
      
      if (res.code === 0) {
        ElMessage.success('登录成功！')
        // 存储登录信息
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userId', res.data.userId)
        localStorage.setItem('userName', res.data.userName)
        localStorage.setItem('expires', res.data.expires)
        
        // 记住账号逻辑
        if (rememberMe.value) {
          localStorage.setItem('saved_email', form.value.email)  
          localStorage.setItem('saved_role', form.value.role)
        } else {
          localStorage.removeItem('saved_email')  
          localStorage.removeItem('saved_role')
        }
        router.push('/profile')
      } else {
        ElMessage.error(res.msg || '登录失败')
      }
    } catch (err) {
      console.error('登录错误:', err)
      
      // 更详细的错误处理
      if (err.response) {
        // 服务器响应错误
        const status = err.response.status
        switch (status) {
          case 400:
            ElMessage.error('请求参数错误')
            break
          case 401:
            ElMessage.error('账号或密码错误')
            break
          case 403:
            ElMessage.error('账号被禁用，请联系管理员')
            break
          case 500:
            ElMessage.error('服务器内部错误，请稍后重试')
            break
          default:
            ElMessage.error(`请求失败：${status}`)
        }
      } else if (err.request) {
        // 网络连接错误
        ElMessage.error('网络连接失败，请检查网络设置')
      } else {
        // 其他错误
        ElMessage.error('登录过程中发生未知错误')
      }
    } finally {
      isLoading.value = false // 结束加载
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
    padding: 0px 40px 34px 40px;
    margin: 0 auto;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: #fff;
    text-align: center;
  }
  /* 标题样式 */
  .login-form h1 {        
      font-size: 2rem;       /* 更大标题 */
      font-weight: bold;
      margin-bottom: 0px;
  }
  .login-form h2 {
      font-size: 1.35rem;
      font-weight: 500;
      margin-top: 12px;
      margin-bottom: 16px;
      color: #222;
  }
  /* 段落样式 */
  .login-form p {
      margin-bottom: 2px;/* 段落底部间距 */
      margin-top: 2px; /* 段落顶部间距 */
      color: #a1a1a1;
      font-size: 15px;
      padding : 0 0 0 20px; /* 指定左内边距 */
  }

  .login-form .space-below {
      margin-bottom: 26px;
  }
  /* 针对 Element Plus 输入框、下拉框、复选框、按钮的字体大小 */

  .login-form :deep(.el-form-item__label) {
    font-size: 18px !important;
  }
  /* 输入框内的文字 - 减小字体 */
  .login-form :deep(.el-input__inner) {
    font-size: 15px !important;     /* 从20px改为15px */ 
  }
  /* 下拉框选中项 - 减小字体 */
  .login-form :deep(.el-select__selected-item) {
    font-size: 15px !important;     /* 从20px改为15px */
  }

  .login-form :deep(.el-form-item) {
    margin-bottom: 26px !important;
  }

  /* 下拉框选项 - 减小字体 */
  .login-form :deep(.el-select-dropdown__item) {
    font-size: 15px !important;     /* 从20px改为15px */ 
  }
  
  /* 输入框占位符文字 */
  .login-form :deep(.el-input__inner::placeholder) {
    font-size: 15px !important;     /* 占位符更小 */
    color: #c0c4cc !important;      /* 占位符颜色 */
  }

  .login-form :deep(.el-button) {
    font-size: 17px !important;
  }
  .login-form :deep(.el-checkbox__label) {
    font-size: 14px !important;
  }

  .login-form .remember-row {
    display: flex;
    width: 400px;
    justify-content: space-between;
    align-items: center;
    margin: 25px auto 15px;
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
