<template>
  <el-dialog
    v-model="visible"
    title="编辑个人资料"
    width="700px"
    :before-close="handleClose"
    destroy-on-close
    class="edit-profile-dialog"
  >
    <div class="dialog-content">
      <el-form
        ref="profileForm"
        :model="editForm"
        :rules="formRules"
        label-width="100px"
        class="profile-form"
        v-loading="loading"
      >
        <!-- 头像上传 -->
        <div class="avatar-section">
          <h4>头像设置</h4> 
            <AvatarUpload 
              v-model="editForm.avatarUrl"
              :gender="editForm.gender"
            />  
        </div>
        
        <!-- 基本信息 -->
        <div class="form-section">
          <h4>基本信息</h4>
          
          <el-form-item label="用户名" prop="userName">
            <el-input
              v-model="editForm.userName"
              placeholder="请输入用户名"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="用户ID" prop="userId">
            <el-input
              v-model="editForm.userId"
              placeholder="用户ID"
              disabled
              class="disabled-input"
            />
            <div class="field-tip">用户ID无法修改</div>
          </el-form-item>
          
          <el-form-item label="电话号码" prop="telephone">
            <el-input
              v-model="editForm.telephone"
              placeholder="请输入电话号码"
              maxlength="11"
            />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="editForm.email"
              placeholder="请输入邮箱地址"
            />
          </el-form-item>
          
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="editForm.gender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
              <el-radio value="unknown">保密</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="出生日期" prop="birthday">
            <el-date-picker
              v-model="editForm.birthday"
              type="date"
              placeholder="选择出生日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="所在地区" prop="region">
            <el-input
              v-model="editForm.region"
              placeholder="请输入所在地区"
              maxlength="50"
            />
          </el-form-item>
          
          <el-form-item label="个人简介" prop="profile">
            <el-input
              v-model="editForm.profile"
              type="textarea"
              placeholder="介绍一下你自己吧..."
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </div>
        
        <!-- 密码修改 -->
        <div class="form-section">
          <h4>安全设置</h4>
          
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input
              v-model="editForm.currentPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
            />
            <div class="field-tip">如需修改密码，请先输入当前密码</div>
          </el-form-item>
          
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="editForm.newPassword"
              type="password"
              placeholder="请输入新密码（可选）"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="editForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>
        </div>
      </el-form>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resetForm">重置</el-button>
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="saving"
          @click="saveProfile"
        >
          保存更改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { getUserInfo, updateUserInfo } from '@/utils/api'
import { AuthService } from '@/utils/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import AvatarUpload from '@/components/AvatarUpload.vue'

export default {
  name: 'EditProfileDialog',
  components: {
    Plus,
    AvatarUpload
  },
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    userProfile: {
      type: Object,
      default: () => ({})
    }
  },
  
  emits: ['update:modelValue', 'success'],
  
  data() {
    return {
      loading: false,
      saving: false,
      
      // 编辑表单数据
      editForm: {
        userName: '',
        userId: '',
        telephone: '',
        email: '',
        gender: '',
        birthday: '',
        avatarUrl: '',
        region: '',
        profile: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      
      // 原始数据，用于重置
      originalData: {...this.userProfile}
    }
  },
  
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    
    // 动态获取表单验证规则
    formRules() {
      // 自定义确认密码验证器
      const validateConfirmPassword = (rule, value, callback) => {
        if (this.editForm.newPassword && !value) {
          return callback(new Error('请确认新密码'))
        }
        if (value && value !== this.editForm.newPassword) {
          return callback(new Error('两次输入的密码不一致'))
        }
        callback()
      }
      return {
        // 用户名 
        userName: [
          {validator: AuthService.validateUserName, trigger: 'blur' }
        ],
        
        // 电话 
        telephone: [
          {validator: AuthService.validatePhone, trigger: 'blur' }
        ],
        
        // 邮箱 
        email: [
          {validator: AuthService.validateEmail, trigger: 'blur' }
        ],
        
        
        
        // 确认密码 - 只有在设置新密码时才需要
        confirmPassword: [
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
         
        // 地区 - 可选，但不能为空字符串
        region: [
          { 
            validator: (rule, value, callback) => {
              if (value && value.trim().length === 0) {
                callback(new Error('地区不能为空格'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        
        // 个人简介 - 可选，但有长度限制
        profile: [
          { max: 200, message: '个人简介不能超过200个字符', trigger: 'blur' }
        ]
      }
    }
  },
  
  watch: {
    modelValue(newValue) {
      if (newValue) {
        this.initFormData()
      }
    }
  },
  
  methods: {
    // 初始化表单数据
    initFormData() {
      this.editForm = {
        userName: this.userProfile.userName || '',
        userId: this.userProfile.userId || '',
        telephone: this.userProfile.telephone || '',
        email: this.userProfile.email || '',
        gender: this.userProfile.gender || 'unknown',
        birthday: this.userProfile.birthday || '',
        avatarUrl: this.userProfile.avatarUrl || '',
        region: this.userProfile.region || '',
        profile: this.userProfile.profile || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      console.log('初始化edit表单数据:', this.editForm)
      // 保存原始数据
      this.originalData = { ...this.editForm }
    },
    
    // 关闭弹窗
    handleClose() {
      // 检查是否有未保存的更改
      const hasChanges = this.checkForChanges()
      
      if (hasChanges) {
        ElMessageBox.confirm('有未保存的更改，确定要关闭吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.visible = false
          this.resetFormData()
        }).catch(() => {
          // 取消关闭
        })
      } else {
        this.visible = false
        this.resetFormData()
      }
    },
    
    // 检查是否有更改
    checkForChanges() {
      const currentData = { ...this.editForm }
      // 不检查密码字段
      delete currentData.currentPassword
      delete currentData.newPassword
      delete currentData.confirmPassword
      
      const originalData = { ...this.originalData }
      delete originalData.currentPassword
      delete originalData.newPassword
      delete originalData.confirmPassword
      
      return JSON.stringify(currentData) !== JSON.stringify(originalData)
    },
    
    // 重置表单数据
    resetFormData() {
      // 清空所有数据
      this.editForm = {
        userName: '',
        userId: '',
        telephone: '',
        email: '',
        gender: '',
        birthday: '',
        avatarUrl: '',
        region: '',
        profile: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      
      // 清空原始数据引用
      this.originalData = {}
      
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.profileForm) {
          this.$refs.profileForm.clearValidate()
        }
      })
    },
    
    // 重置表单
    resetForm() {
      ElMessageBox.confirm('确定要重置所有更改吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.editForm = { ...this.originalData }
        this.editForm.currentPassword = ''
        this.editForm.newPassword = ''
        this.editForm.confirmPassword = ''
        ElMessage.success('已重置所有更改')
      }).catch(() => {
        // 取消重置
      })
    },
    
    // 保存个人资料
    async saveProfile() {
      try {
        // 表单验证
        console.log('开始表单验证...')
        await this.$refs.profileForm.validate()
        console.log('表单验证通过')
        
        this.saving = true
        
        // 准备更新数据
        const updateData = {
          userName: this.editForm.userName,
          telephone: this.editForm.telephone,
          email: this.editForm.email,
          gender: this.editForm.gender,
          birthday: this.editForm.birthday,
          avatarUrl: this.editForm.avatarUrl,
          region: this.editForm.region,
          profile: this.editForm.profile
        }
        
        // 如果要修改密码
        if (this.editForm.currentPassword && this.editForm.newPassword) {
          updateData.currentPassword = this.editForm.currentPassword
          updateData.newPassword = this.editForm.newPassword
        }
        
        const userId = localStorage.getItem('userId')
        const res = await updateUserInfo(userId, updateData) 
        const response = res.data
        if (response && response.code === 0) {
          ElMessage.success('个人资料更新成功')
          console.log('个人资料更新成功')
          // 更新本地存储的用户信息
          if (this.editForm.userName) {
            localStorage.setItem('userName', this.editForm.userName)
          }
          if (this.editForm.avatarUrl) {
            localStorage.setItem('userAvatar', this.editForm.avatarUrl)
          }
          
          // 通知父组件更新成功
          this.$emit('success', updateData)
          
          // 关闭弹窗
          this.visible = false
          this.resetFormData()
          
        } else {
          console.error('更新个人资料失败:', response.msg)  
          ElMessage.error(response.msg || '个人资料更新失败')
        }
        
      } catch (error) {
        console.error('保存个人资料失败:', error)
        if (error.message) {
          ElMessage.error(error.message)
        } else {
          ElMessage.error('保存失败，请检查网络连接')
        }
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
/* 弹窗内容样式 */
.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 4px;
}

/* 表单区块 */
.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #2062ea;
}

/* 头像上传区域 */
.avatar-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #2062ea;
}
/* 头像上传区域 - 简单修复边框显示 */
.avatar-section :deep(.el-upload) {
  margin: 0 auto;
  width: 90% !important;
}

@media (max-width: 768px) {
  .avatar-section {
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
  .avatar-section :deep(.el-upload) {
    width: 100% !important;
  }
}

/* 表单项样式 */
.el-form-item {
  margin-bottom: 20px;
}

.disabled-input :deep(.el-input__inner) {
  background-color: #f5f7fa;
  color: #909399;
}

.field-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

/* 弹窗底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 弹窗样式 */
:deep(.edit-profile-dialog .el-dialog__header) {
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

:deep(.edit-profile-dialog .el-dialog__body) {
  padding: 20px 24px;
}

:deep(.edit-profile-dialog .el-dialog__footer) {
  padding: 16px 24px 20px 24px;
  border-top: 1px solid #e8e8e8;
}

/* 滚动条样式 */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .avatar-upload {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .dialog-footer {
    flex-direction: column;
  }
  
  :deep(.edit-profile-dialog) {
    width: 95% !important;
    margin: 0 !important;
  }
}
</style>
