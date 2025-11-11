<template>
  <div class="files-container">
    <div class="files-header">
      <h2>我的文件</h2>
      <router-link to="/upload" class="upload-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
        </svg>
        上传文件
      </router-link>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="files.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
        </svg>
      </div>
      <p>暂无文件</p>
      <router-link to="/upload" class="upload-link">立即上传</router-link>
    </div>

    <div v-else class="files-grid">
      <div 
        v-for="file in files" 
        :key="file.id" 
        class="file-card"
      >
        <div class="file-header">
          <div class="file-icon">
            <svg v-if="file.file_type.startsWith('image/')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
            </svg>
            <svg v-else-if="file.file_type.startsWith('video/')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="m10.813 14.826 3.435-2.146a1.002 1.002 0 0 0 0-1.718L10.814 8.816A1 1 0 0 0 10 9.667v4.667a1 1 0 0 0 1.185 1.005c.236-.062.452-.18.628-.349z"/>
              <path d="M6.75 6.5 10 8.898V7a1 1 0 0 1 1.712-.7l4.004 2.8a1 1 0 0 1 0 1.6l-4.004 2.8A1 1 0 0 1 10 12.5V10.602l-3.25 2.398A1 1 0 0 1 5 12.5V6.9a1 1 0 0 1 .5-.434l.75-.316V6.5z"/>
              <path d="M1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z"/>
            </svg>
            <svg v-else-if="file.file_type === 'application/pdf'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.3v5.88c0 .43.35.78.78.78h5.88V.3H1.08A.78.78 0 0 0 .3 1.08Zm6.48 0v6.66c0 .43.35.78.78.78h6.66V1.08a.78.78 0 0 0-.78-.78H.78a.78.78 0 0 0-.78.78v11.84a.78.78 0 0 0 .78.78h11.84a.78.78 0 0 0 .78-.78V6.78a.78.78 0 0 0-.78-.78H7.56a.78.78 0 0 1-.78-.78V.3Z"/>
            </svg>
          </div>
          <div class="file-info">
            <h3 class="file-name">{{ file.original_filename }}</h3>
            <p class="file-meta">{{ formatDate(file.created_at) }} · {{ formatFileSize(file.file_size) }}</p>
          </div>
        </div>

        <div class="file-stats">
          <div class="stat-item">
            <span class="stat-label">访问次数</span>
            <span class="stat-value">{{ file.current_access_count || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">唯一访客</span>
            <span class="stat-value">{{ file.unique_visitors || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均停留</span>
            <span class="stat-value">{{ formatDuration(file.average_session_duration || 0) }}</span>
          </div>
        </div>

        <div class="file-actions">
          <button @click="copyLink(file)" class="action-btn copy-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            复制链接
          </button>
          <button @click="showQRCode(file)" class="action-btn qr-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 2h2v2H2V2Z"/>
              <path d="M6 2v2h2V2H6Z"/>
              <path d="M10 2h2v2h-2V2Z"/>
              <path d="M2 6h2v2H2V6Z"/>
              <path d="M6 6v2h2V6H6Z"/>
              <path d="M10 6h2v2h-2V6Z"/>
              <path d="M2 10h2v2H2v-2Z"/>
              <path d="M6 10v2h2v-2H6Z"/>
              <path d="M10 10h2v2h-2v-2Z"/>
              <path d="M14 2h2v2h-2V2Z"/>
              <path d="M14 6v2h2V6h-2Z"/>
              <path d="M14 10h2v2h-2v-2Z"/>
            </svg>
            二维码
          </button>
          <button @click="viewStats(file)" class="action-btn stats-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 14.5a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zM3 4a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H4v9a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H7v9a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H10V13a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H13v9a.5.5 0 0 1-1 0V4z"/>
            </svg>
            统计
          </button>
          <button @click="deleteFile(file)" class="action-btn delete-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQRModal" class="modal-overlay" @click="closeQRModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>文件二维码</h3>
          <button class="close-btn" @click="closeQRModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="qr-container">
            <img :src="currentQRCode" alt="QR Code" class="qr-image" v-if="currentQRCode" />
            <p v-else>加载中...</p>
          </div>
          <p class="qr-info">扫描二维码即可访问文件</p>
        </div>
      </div>
    </div>

    <!-- Stats Modal -->
    <div v-if="showStatsModal" class="modal-overlay" @click="closeStatsModal">
      <div class="modal-content stats-modal" @click.stop>
        <div class="modal-header">
          <h3>访问统计</h3>
          <button class="close-btn" @click="closeStatsModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="stats-header">
            <h4>{{ currentFileStats?.filename }}</h4>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ currentFileStats?.total_access_count || 0 }}</div>
              <div class="stat-label">总访问次数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ currentFileStats?.unique_visitors || 0 }}</div>
              <div class="stat-label">唯一访客</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ formatDuration(currentFileStats?.average_session_duration || 0) }}</div>
              <div class="stat-label">平均停留时间</div>
            </div>
          </div>
          <div class="device-stats" v-if="currentFileStats?.device_stats">
            <h5>设备类型分布</h5>
            <div class="device-bars">
              <div 
                v-for="(count, device) in currentFileStats.device_stats" 
                :key="device" 
                class="device-bar"
              >
                <div class="device-label">{{ getDeviceLabel(device) }}</div>
                <div class="bar-container">
                  <div 
                    class="bar-fill" 
                    :style="{ width: getDevicePercentage(device) + '%' }"
                  ></div>
                </div>
                <div class="device-count">{{ count }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'FileList',
  setup() {
    const files = ref([])
    const loading = ref(true)
    const showQRModal = ref(false)
    const showStatsModal = ref(false)
    const currentQRCode = ref('')
    const currentFileStats = ref(null)
    const router = useRouter()

    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get('/api/files/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        files.value = response.data
        
        // 获取每个文件的统计信息
        for (let i = 0; i < files.value.length; i++) {
          try {
            const statsResponse = await axios.get(`/api/stats/file/${files.value[i].id}/stats`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            files.value[i].current_access_count = statsResponse.data.total_access_count
            files.value[i].unique_visitors = statsResponse.data.unique_visitors
            files.value[i].average_session_duration = statsResponse.data.average_session_duration
          } catch (error) {
            console.error('获取文件统计信息失败:', error)
          }
        }
      } catch (error) {
        console.error('获取文件列表失败:', error)
        if (error.response?.status === 401) {
          router.push('/login')
        }
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDuration = (seconds) => {
      if (seconds < 60) {
        return Math.round(seconds) + '秒'
      } else {
        return Math.round(seconds / 60) + '分钟'
      }
    }

    const copyLink = (file) => {
      const link = `${window.location.origin}/file/${file.unique_code}`
      navigator.clipboard.writeText(link).then(() => {
        alert('链接已复制到剪贴板')
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = link
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('链接已复制到剪贴板')
      })
    }

    const showQRCode = async (file) => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get(`/api/file/qr/${file.unique_code}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        currentQRCode.value = response.data.qr_code
        showQRModal.value = true
      } catch (error) {
        console.error('获取二维码失败:', error)
        alert('获取二维码失败')
      }
    }

    const closeQRModal = () => {
      showQRModal.value = false
      currentQRCode.value = ''
    }

    const viewStats = async (file) => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get(`/api/stats/file/${file.id}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        currentFileStats.value = response.data
        
        // 获取设备统计信息
        try {
          const overallResponse = await axios.get(`/api/stats/overall`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          currentFileStats.value.device_stats = overallResponse.data.device_stats
        } catch (error) {
          console.error('获取设备统计信息失败:', error)
        }
        
        showStatsModal.value = true
      } catch (error) {
        console.error('获取统计信息失败:', error)
        alert('获取统计信息失败')
      }
    }

    const closeStatsModal = () => {
      showStatsModal.value = false
      currentFileStats.value = null
    }

    const getDeviceLabel = (device) => {
      const labels = {
        'mobile': '移动端',
        'desktop': '桌面端',
        'tablet': '平板端'
      }
      return labels[device] || device
    }

    const getDevicePercentage = (device) => {
      if (!currentFileStats.value?.device_stats) return 0
      const total = Object.values(currentFileStats.value.device_stats).reduce((sum, count) => sum + count, 0)
      return total > 0 ? (currentFileStats.value.device_stats[device] / total) * 100 : 0
    }

    const deleteFile = async (file) => {
      if (!confirm(`确定要删除文件 "${file.original_filename}" 吗？`)) {
        return
      }

      try {
        const token = localStorage.getItem('access_token')
        await axios.delete(`/api/files/${file.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        // 从列表中移除文件
        files.value = files.value.filter(f => f.id !== file.id)
        alert('文件删除成功')
      } catch (error) {
        console.error('删除文件失败:', error)
        alert('删除文件失败: ' + (error.response?.data?.detail || error.message))
      }
    }

    onMounted(() => {
      fetchFiles()
    })

    return {
      files,
      loading,
      showQRModal,
      showStatsModal,
      currentQRCode,
      currentFileStats,
      router,
      formatDate,
      formatFileSize,
      formatDuration,
      copyLink,
      showQRCode,
      closeQRModal,
      viewStats,
      closeStatsModal,
      getDeviceLabel,
      getDevicePercentage,
      deleteFile
    }
  }
}
</script>

<style scoped>
.files-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.files-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #0069d9;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  margin-bottom: 20px;
  color: #ccc;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.upload-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.upload-link:hover {
  background-color: #0069d9;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.file-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.file-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.file-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.file-icon {
  margin-right: 15px;
  color: #007bff;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
}

.file-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  word-break: break-all;
}

.file-meta {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.file-stats {
  display: flex;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.file-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  min-width: 70px;
  justify-content: center;
}

.action-btn:hover {
  background-color: #f8f9fa;
}

.copy-btn:hover {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.qr-btn:hover {
  background-color: #f9f0ff;
  border-color: #d3adf7;
}

.stats-btn:hover {
  background-color: #f6ffed;
  border-color: #b7eb8f;
}

.delete-btn:hover {
  background-color: #fff2f0;
  border-color: #ffccc7;
  color: #ff4d4f;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.stats-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.qr-container {
  text-align: center;
  margin-bottom: 15px;
}

.qr-image {
  max-width: 100%;
  height: auto;
}

.qr-info {
  text-align: center;
  color: #666;
  margin: 0;
}

.stats-header h4 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.device-stats h5 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.device-bars {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.device-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-label {
  width: 80px;
  font-size: 14px;
  color: #333;
}

.bar-container {
  flex: 1;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: #007bff;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.device-count {
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

@media (max-width: 768px) {
  .files-container {
    padding: 15px;
  }
  
  .files-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .files-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .device-bar {
    flex-wrap: wrap;
  }
  
  .bar-container {
    min-width: 100px;
  }
}
</style>