<template>
  <div class="register-form">
    
    <h1>欢迎注册</h1>
    <h2>运动场地预约系统</h2>
    <p>请填写以下信息进行注册:</p>
    <el-form @submit.native.prevent="onSubmit" label-width="70px">
        <el-form-item label="身　份">
        <el-select v-model="form.identity" placeholder="请选择身份">
          <el-option label="用户" value="user"></el-option>
          <el-option label="管理员" value="admin"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="用户名">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          required
        ></el-input>
      </el-form-item>
      <el-form-item label="密　码">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          required
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请输入确认密码"
          required
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
    import { reactive } from 'vue'

    const form = reactive({
    username: '',
    password: ''
    })

    function onSubmit() {
    // 这里可以发起注册请求
    console.log('提交表单:', form)
    // 可以在这里调用API，或者用emit把数据传给父组件
    }
</script>

<style scoped>
    .register-form {
        width: 300px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
    } 
     .register-form {
        width: 90%;             /* 让其充满父容器 */
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
    .register-form h1 {        
        font-size: 2.5rem;       /* 更大标题 */
        font-weight: bold;
        margin-bottom: 8px;
    }
    .register-form h2 {
        font-size: 1.75rem;
        font-weight: 500;
        margin-bottom: 24px;
        color: #222;
    }
    /* 段落样式 */
    .register-form p {
        margin-bottom: 20px;
        color: #666;
        font-size: 20px;
    }
    /* 表单项和按钮样式 */
    .el-form-item {
        margin-bottom: 22px; /* 增加间距 */
    }
    /* 按钮样式 */
    .register-btn {
        font-size: 18px;
        height: 48px;
        border-radius: 6px;
        font-weight: 500;
    }

</style>
