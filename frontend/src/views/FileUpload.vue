<template>
  <div class="upload-container">
    <div class="upload-card">
      <h2>上传文件</h2>
      <p class="upload-description">支持PDF、视频、图片等格式文件</p>
      
      <div 
        class="upload-area" 
        @dragover="handleDragOver" 
        @drop="handleDrop"
        @dragleave="handleDragLeave"
        @click="triggerFileSelect"
        :class="{ 'drag-over': isDragOver }"
      >
        <div class="upload-content">
          <div class="upload-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
            </svg>
          </div>
          <p class="upload-text">点击选择文件或拖拽文件到此处</p>
          <p class="upload-hint">支持PDF、视频、图片等格式，免费用户单个文件不超过20MB</p>
          <input 
            type="file" 
            ref="fileInput" 
            @change="onFileChange" 
            style="display: none" 
            :accept="'.pdf,.mp4,.jpg,.jpeg,.png,.ppt,.pptx'"
          />
        </div>
      </div>
      
      <div v-if="selectedFile" class="file-info">
        <div class="file-preview">
          <div class="file-icon">
            <svg v-if="isImage" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
            </svg>
            <svg v-else-if="isVideo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="m10.813 14.826 3.435-2.146a1.002 1.002 0 0 0 0-1.718L10.814 8.816A1 1 0 0 0 10 9.667v4.667a1 1 0 0 0 1.185 1.005c.236-.062.452-.18.628-.349z"/>
              <path d="M6.75 6.5 10 8.898V7a1 1 0 0 1 1.712-.7l4.004 2.8a1 1 0 0 1 0 1.6l-4.004 2.8A1 1 0 0 1 10 12.5V10.602l-3.25 2.398A1 1 0 0 1 5 12.5V6.9a1 1 0 0 1 .5-.434l.75-.316V6.5z"/>
              <path d="M1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z"/>
            </svg>
            <svg v-else-if="isPDF" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.3v5.88c0 .43.35.78.78.78h5.88V.3H1.08A.78.78 0 0 0 .3 1.08Zm6.48 0v6.66c0 .43.35.78.78.78h6.66V1.08a.78.78 0 0 0-.78-.78H.78a.78.78 0 0 0-.78.78v11.84a.78.78 0 0 0 .78.78h11.84a.78.78 0 0 0 .78-.78V6.78a.78.78 0 0 0-.78-.78H7.56a.78.78 0 0 1-.78-.78V.3Z"/>
            </svg>
          </div>
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
      </div>
      
      <div class="access-controls">
        <h3>访问设置</h3>
        <div class="control-group">
          <label>访问密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="留空则无需密码" 
            class="control-input"
          />
        </div>
        
        <div class="control-group">
          <label>最大访问次数</label>
          <input 
            v-model.number="maxAccessCount" 
            type="number" 
            placeholder="留空则无限制" 
            class="control-input"
          />
        </div>
        
        <div class="control-row">
          <div class="control-group">
            <label>访问开始时间</label>
            <input 
              v-model="accessStartDate" 
              type="datetime-local" 
              class="control-input"
            />
          </div>
          
          <div class="control-group">
            <label>访问结束时间</label>
            <input 
              v-model="accessEndDate" 
              type="datetime-local" 
              class="control-input"
            />
          </div>
        </div>
      </div>
      
      <div class="upload-actions">
        <button 
          @click="handleUpload" 
          :disabled="!selectedFile || uploadProgress > 0" 
          class="upload-btn"
        >
          <span v-if="uploadProgress === 0">上传文件</span>
          <span v-else>上传中... {{ uploadProgress }}%</span>
        </button>
      </div>
    </div>
    
    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'FileUpload',
  setup() {
    const selectedFile = ref(null)
    const password = ref('')
    const maxAccessCount = ref(null)
    const accessStartDate = ref('')
    const accessEndDate = ref('')
    const uploadProgress = ref(0)
    const isDragOver = ref(false)
    const fileInput = ref(null)
    const router = useRouter()

    const isImage = computed(() => {
      return selectedFile.value && selectedFile.value.type.startsWith('image/')
    })

    const isVideo = computed(() => {
      return selectedFile.value && selectedFile.value.type.startsWith('video/')
    })

    const isPDF = computed(() => {
      return selectedFile.value && selectedFile.value.type === 'application/pdf'
    })

    const handleDragOver = (e) => {
      e.preventDefault()
      isDragOver.value = true
    }

    const handleDragLeave = (e) => {
      e.preventDefault()
      isDragOver.value = false
    }

    const handleDrop = (e) => {
      e.preventDefault()
      isDragOver.value = false
      if (e.dataTransfer.files.length) {
        selectedFile.value = e.dataTransfer.files[0]
      }
    }

    const triggerFileSelect = () => {
      fileInput.value.click()
    }

    const onFileChange = (event) => {
      selectedFile.value = event.target.files[0]
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleUpload = async () => {
      if (!selectedFile.value) {
        alert('请选择文件')
        return
      }

      // 检查文件大小（免费用户限制20MB）
      const maxSize = 20 * 1024 * 1024 // 20MB
      if (selectedFile.value.size > maxSize) {
        alert('免费用户单个文件不能超过20MB，请升级订阅以上传更大文件')
        return
      }

      const formData = new FormData()
      formData.append('file', selectedFile.value)
      if (password.value) formData.append('password', password.value)
      if (maxAccessCount.value) formData.append('max_access_count', maxAccessCount.value)
      if (accessStartDate.value) formData.append('access_start_date', accessStartDate.value)
      if (accessEndDate.value) formData.append('access_end_date', accessEndDate.value)

      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            uploadProgress.value = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
          }
        })

        alert('上传成功！')
        // 重置表单
        selectedFile.value = null
        password.value = ''
        maxAccessCount.value = null
        accessStartDate.value = ''
        accessEndDate.value = ''
        uploadProgress.value = 0
        router.push('/files')
      } catch (error) {
        console.error('上传失败:', error)
        let errorMessage = error.response?.data?.detail || error.message
        if (error.response?.status === 400 && errorMessage.includes('免费用户')) {
          errorMessage = '免费用户限制：只能上传1个文件且不超过20MB，请升级订阅服务以上传更多或更大的文件。'
        }
        alert('上传失败: ' + errorMessage)
      } finally {
        uploadProgress.value = 0
      }
    }

    return {
      selectedFile,
      password,
      maxAccessCount,
      accessStartDate,
      accessEndDate,
      uploadProgress,
      isDragOver,
      fileInput,
      router,
      isImage,
      isVideo,
      isPDF,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      triggerFileSelect,
      onFileChange,
      formatFileSize,
      handleUpload
    }
  }
}
</script>

<style scoped>
.upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 20px;
}

.upload-card h2 {
  margin-top: 0;
  color: #333;
  font-size: 24px;
  text-align: center;
}

.upload-description {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.upload-area.drag-over {
  border-color: #007bff;
  background-color: #e6f7ff;
}

.upload-icon {
  margin-bottom: 15px;
}

.upload-text {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.upload-hint {
  color: #666;
  font-size: 14px;
  margin-bottom: 0;
}

.file-info {
  margin: 20px 0;
}

.file-preview {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.file-icon {
  margin-right: 15px;
  color: #007bff;
}

.file-details {
  flex: 1;
}

.file-name {
  margin: 0 0 5px 0;
  font-weight: 500;
  color: #333;
}

.file-size {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.access-controls {
  margin: 30px 0;
}

.access-controls h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.control-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.control-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
}

.control-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 600px) {
  .control-row {
    grid-template-columns: 1fr;
  }
}

.upload-actions {
  text-align: center;
  margin-top: 20px;
}

.upload-btn {
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  min-width: 150px;
}

.upload-btn:hover:not(:disabled) {
  background-color: #0069d9;
}

.upload-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.progress-container {
  padding: 0 30px;
}

.progress-bar {
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}
</style>