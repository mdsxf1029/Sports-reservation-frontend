<template>
  <div class="avatar-upload-container">
    <!-- 头像预览区域 -->
    <div class="avatar-preview" v-if="modelValue">
      <div class="preview-wrapper">
        <img 
          :src="modelValue" 
          alt="用户头像"
          class="preview-image"
        />
        <div class="preview-overlay">
          <el-button 
            @click="clearAvatar" 
            :icon="Delete" 
            circle 
            size="small"
            type="danger"
          />
        </div>
      </div>
      <div class="avatar-info">
        <span class="avatar-text">头像预览</span>
        <span class="avatar-size-tip">建议尺寸: 80x80</span>
      </div>
    </div>
    
    <!-- 上传选项区域 -->
    <div class="upload-options">
      <el-tabs v-model="activeTab" class="upload-tabs">
        <!-- 本地上传 -->
        <el-tab-pane label="本地上传" name="upload">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            :on-change="handleFileChange"
            :auto-upload="false"
            :disabled="loading"
            accept="image/*"
            drag
          >
            <el-icon class="uploader-icon" v-if="!loading"><Plus /></el-icon>
            <el-icon class="uploader-icon is-loading" v-else>
              <Loading />
            </el-icon>
            <div class="el-upload__text">
              <span v-if="!loading">拖拽头像到此处或<em>点击上传</em></span>
              <span v-else>正在上传中...</span>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png/gif 格式，文件大小不超过 2MB
              </div>
            </template>
          </el-upload>
        </el-tab-pane>
        
        <!-- 网络链接 -->
        <el-tab-pane label="网络链接" name="url">
          <el-input
            v-model="urlInput"
            placeholder="请输入头像链接"
            @blur="handleUrlChange"
            @keyup.enter="handleUrlChange"
          >
            <template #append>
              <el-button @click="handleUrlChange" :icon="Link">确认</el-button>
            </template>
          </el-input>
          <div class="url-tip">
            💡 提示: 请输入有效的图片链接
          </div>
        </el-tab-pane>
        
        <!-- 默认头像 -->
        <el-tab-pane label="推荐头像" name="default">
          <div class="default-avatars">
            <div class="avatar-grid">
              <div 
                v-for="(avatar, index) in avatarDefaults" 
                :key="index"
                class="default-avatar-item"
                :class="{ active: modelValue === avatar.url }"
                @click="selectDefaultAvatar(avatar.url)"
              >
                <img 
                  :src="avatar.url" 
                  :alt="avatar.label"
                  class="default-avatar-thumb"
                />
                <span class="default-avatar-label">{{ avatar.label }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Link, Delete, Loading } from '@element-plus/icons-vue'
import { uploadAvatar } from '@/utils/api'

// 定义组件的 props 和 emits
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: 'unknown' 
  }
})

const emit = defineEmits(['update:modelValue'])

// 响应式数据
const activeTab = ref('upload')
const urlInput = ref('')
const loading = ref(false)
const lastUploadedFile = ref(null) // 记录上次上传的文件信息

// 根据性别计算默认头像
const avatarDefaults = computed(() => {
  return [
    {
      label: '默认头像',
      url: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
    }
  ]
})

// 文件上传前的验证
const handleBeforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传文件只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像大小不能超过 2MB!')
    return false
  }
  return false // 继续阻止自动上传，使用我们的自定义上传逻辑
}

// 处理文件选择 - 最佳方案：直接上传到服务器
const handleFileChange = async (file) => {
  if (!file.raw) return
  ElMessage.info('开始上传头像...')
  // 文件去重检查
  const currentFileInfo = {
    name: file.raw.name,
    size: file.raw.size,
    lastModified: file.raw.lastModified,
    type: file.raw.type
  }
  
  // 检查是否是同一个文件
  if (lastUploadedFile.value && 
      lastUploadedFile.value.name === currentFileInfo.name &&
      lastUploadedFile.value.size === currentFileInfo.size &&
      lastUploadedFile.value.lastModified === currentFileInfo.lastModified &&
      lastUploadedFile.value.type === currentFileInfo.type) {
    ElMessage.info('检测到相同文件，无需重复上传')
    return
  }
  
  try {
    loading.value = true
    
    // 创建FormData对象
    const formData = new FormData()
    formData.append('avatar', file.raw)
    
    // 上传文件到服务器
    const response = await uploadAvatar(formData)
    
    if (response && response.data && response.data.code === 0) {
      // 服务器返回图片URL
      const avatarUrl = response.data.data.avatarUrl 
      emit('update:modelValue', avatarUrl)
      
      // 记录上传成功的文件信息
      lastUploadedFile.value = currentFileInfo
      
      ElMessage.success(response.data.msg || '头像上传成功!')
    } else {
      ElMessage.error(response.data?.msg || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传错误:', error)
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 413:
          ElMessage.error('文件太大，请选择小于2MB的图片')
          break
        case 415:
          ElMessage.error('不支持的文件格式')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error('上传失败，请重试')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}

// 处理URL输入
const handleUrlChange = () => {
  const url = urlInput.value.trim()
  if (!url) {
    clearAvatar()
    return
  }
  
  // URL去重检查
  if (lastUploadedFile.value && lastUploadedFile.value.url === url) {
    ElMessage.info('检测到相同URL，无需重复设置')
    return
  }
  
  // 验证URL格式
  if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
    ElMessage.error('请输入正确的图片链接格式')
    return
  }
  
  // 测试图片是否可以加载
  const img = new Image()
  img.onload = () => {
    emit('update:modelValue', url)
    
    // 记录成功设置的URL信息
    lastUploadedFile.value = { url: url }
    
    ElMessage.success('头像链接设置成功!')
  }
  img.onerror = () => {
    ElMessage.error('图片链接无法访问，请检查链接是否正确')
  }
  img.src = url
}

// 选择默认头像
const selectDefaultAvatar = (avatarUrl) => {
  // 默认头像去重检查
  if (lastUploadedFile.value && lastUploadedFile.value.defaultAvatar === avatarUrl) {
    ElMessage.info('已选择此默认头像，无需重复设置')
    return
  }
  
  emit('update:modelValue', avatarUrl)
  
  // 记录选择的默认头像信息
  lastUploadedFile.value = { defaultAvatar: avatarUrl }
  
  ElMessage.success('头像选择成功!')
}

// 清除头像
const clearAvatar = () => {
  emit('update:modelValue', '')
  urlInput.value = ''
  
  // 清除去重记录
  lastUploadedFile.value = null
  
  ElMessage.info('头像已清除')
}
 
</script>

<style scoped>
.avatar-upload-container {
  width: 100%;
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dcdfe6;
}

.preview-wrapper {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-wrapper:hover .preview-overlay {
  opacity: 1;
}

.avatar-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.avatar-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.avatar-size-tip {
  font-size: 12px;
  color: #909399;
}

.upload-options {
  margin-bottom: 16px;
}

.upload-tabs :deep(.el-tabs__nav-wrap) {
  margin-bottom: 16px;
}

.avatar-uploader :deep(.el-upload) {
  border: 2px dashed #d3dce6;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409EFF;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.url-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  padding-left: 8px;
}

.default-avatars {
  padding: 16px 0;
}

.avatar-grid {
  display: flex;
  justify-content: center;
  gap: 16px;
  max-width: 400px;
}

.default-avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.default-avatar-item:hover {
  background: #f0f2f5;
  border-color: #c6e2ff;
}

.default-avatar-item.active {
  background: #e6f7ff;
  border-color: #409EFF;
}

.default-avatar-thumb {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #dcdfe6;
}

.default-avatar-label {
  font-size: 12px;
  color: #606266;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .avatar-preview {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .default-avatar-thumb {
    width: 50px;
    height: 50px;
  }
}
</style>


