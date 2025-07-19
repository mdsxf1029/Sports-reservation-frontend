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
            accept="image/*"
            drag
          >
            <el-icon class="uploader-icon"><Plus /></el-icon>
            <div class="el-upload__text">
              拖拽头像到此处或<em>点击上传</em>
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
import { Plus, Link, Delete } from '@element-plus/icons-vue'

// 定义组件的 props 和 emits
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: 'O'
  }
})

const emit = defineEmits(['update:modelValue'])

// 响应式数据
const activeTab = ref('upload')
const urlInput = ref('')

// 根据性别计算默认头像
const avatarDefaults = computed(() => {
  const allDefaults = [
    {
      label: '男性默认',
      url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    {
      label: '女性默认', 
      url: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    },
    {
      label: '通用默认',
      url: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
    }
  ]
  
  // 根据性别调整默认头像顺序
  if (props.gender === 'M') {
    return [allDefaults[0], allDefaults[2], allDefaults[1]]
  } else if (props.gender === 'F') {
    return [allDefaults[1], allDefaults[2], allDefaults[0]]
  } else {
    return allDefaults
  }
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
  return false // 阻止自动上传，我们手动处理
}

// 处理文件选择
const handleFileChange = (file) => {
  if (!file.raw) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    emit('update:modelValue', base64)
    ElMessage.success('头像上传成功!')
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败!')
  }
  reader.readAsDataURL(file.raw)
}

// 处理URL输入
const handleUrlChange = () => {
  const url = urlInput.value.trim()
  if (!url) {
    clearAvatar()
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
    ElMessage.success('头像链接设置成功!')
  }
  img.onerror = () => {
    ElMessage.error('图片链接无法访问，请检查链接是否正确')
  }
  img.src = url
}

// 选择默认头像
const selectDefaultAvatar = (avatarUrl) => {
  emit('update:modelValue', avatarUrl)
  ElMessage.success('头像选择成功!')
}

// 清除头像
const clearAvatar = () => {
  emit('update:modelValue', '')
  urlInput.value = ''
  ElMessage.info('头像已清除')
}

// 如果没有头像且有性别信息，设置默认头像
if (!props.modelValue && props.gender && avatarDefaults.value.length > 0) {
  emit('update:modelValue', avatarDefaults.value[0].url)
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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


