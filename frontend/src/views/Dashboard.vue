<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>仪表板</h2>
      <div class="user-info">
        <div class="subscription-status" :class="subscriptionClass">
          {{ subscriptionLabel }}
        </div>
        <div class="user-avatar">
          {{ userInitials }}
        </div>
      </div>
    </div>
    
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ fileCount }}</div>
          <div class="stat-label">我的文件</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 14.5a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zM3 4a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H4v9a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H7v9a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H10V13a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H13v9a.5.5 0 0 1-1 0V4z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalViews }}</div>
          <div class="stat-label">总访问量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ uniqueVisitors }}</div>
          <div class="stat-label">独立访客</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatDuration(avgSessionDuration) }}</div>
          <div class="stat-label">平均停留</div>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="content-section">
        <div class="section-header">
          <h3>最近上传的文件</h3>
          <router-link to="/upload" class="upload-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
            </svg>
            上传文件
          </router-link>
        </div>
        
        <div class="files-list">
          <div 
            v-for="file in recentFiles" 
            :key="file.id" 
            class="file-item"
          >
            <div class="file-icon">
              <svg v-if="file.file_type.startsWith('image/')" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
              </svg>
              <svg v-else-if="file.file_type.startsWith('video/')" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="m10.813 14.826 3.435-2.146a1.002 1.002 0 0 0 0-1.718L10.814 8.816A1 1 0 0 0 10 9.667v4.667a1 1 0 0 0 1.185 1.005c.236-.062.452-.18.628-.349z"/>
                <path d="M6.75 6.5 10 8.898V7a1 1 0 0 1 1.712-.7l4.004 2.8a1 1 0 0 1 0 1.6l-4.004 2.8A1 1 0 0 1 10 12.5V10.602l-3.25 2.398A1 1 0 0 1 5 12.5V6.9a1 1 0 0 1 .5-.434l.75-.316V6.5z"/>
                <path d="M1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z"/>
              </svg>
              <svg v-else-if="file.file_type === 'application/pdf'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.3v5.88c0 .43.35.78.78.78h5.88V.3H1.08A.78.78 0 0 0 .3 1.08Zm6.48 0v6.66c0 .43.35.78.78.78h6.66V1.08a.78.78 0 0 0-.78-.78H.78a.78.78 0 0 0-.78.78v11.84a.78.78 0 0 0 .78.78h11.84a.78.78 0 0 0 .78-.78V6.78a.78.78 0 0 0-.78-.78H7.56a.78.78 0 0 1-.78-.78V.3Z"/>
              </svg>
            </div>
            <div class="file-info">
              <div class="file-name">{{ file.original_filename }}</div>
              <div class="file-meta">{{ formatDate(file.created_at) }} · {{ formatFileSize(file.file_size) }}</div>
            </div>
            <div class="file-stats">
              <span class="stat-badge">{{ file.current_access_count || 0 }} 次访问</span>
            </div>
          </div>
          
          <div v-if="recentFiles.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
              </svg>
            </div>
            <p>暂无文件</p>
            <router-link to="/upload" class="upload-link">立即上传</router-link>
          </div>
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-header">
          <h3>访问趋势</h3>
          <router-link to="/files" class="view-all-link">查看全部</router-link>
        </div>
        
        <div class="chart-container">
          <div class="chart-placeholder">
            <div class="chart-grid">
              <div 
                v-for="(day, index) in dailyAccessTrend" 
                :key="index" 
                class="chart-bar"
              >
                <div 
                  class="bar-fill" 
                  :style="{ height: (day.count / maxAccessCount * 100) + '%' }"
                ></div>
                <div class="bar-label">{{ day.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="upgrade-banner" v-if="authStore.user?.subscription_type === 'free'">
      <div class="banner-content">
        <div class="banner-text">
          <h4>升级到付费版</h4>
          <p>享受无限制文件上传、高级访问控制和详细统计功能</p>
        </div>
        <router-link to="/payment" class="upgrade-btn">立即升级</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'Dashboard',
  setup() {
    const fileCount = ref(0)
    const totalViews = ref(0)
    const uniqueVisitors = ref(0)
    const avgSessionDuration = ref(0)
    const recentFiles = ref([])
    const dailyAccessTrend = ref([])
    const maxAccessCount = ref(0)
    const authStore = useAuthStore()
    const router = useRouter()

    const subscriptionLabel = computed(() => {
      const labels = {
        'free': '免费用户',
        'monthly': '月度订阅',
        'yearly': '年度订阅'
      }
      return labels[authStore.user?.subscription_type] || '免费用户'
    })

    const subscriptionClass = computed(() => {
      const classes = {
        'free': 'status-free',
        'monthly': 'status-monthly',
        'yearly': 'status-yearly'
      }
      return classes[authStore.user?.subscription_type] || 'status-free'
    })

    const userInitials = computed(() => {
      if (authStore.user?.username) {
        return authStore.user.username.substring(0, 2).toUpperCase()
      }
      return 'U'
    })

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token')
        
        // 获取文件统计
        const filesResponse = await axios.get('/api/files/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        recentFiles.value = filesResponse.data.slice(0, 5) // 只取最近5个文件
        fileCount.value = filesResponse.data.length
        
        // 获取整体统计
        const statsResponse = await axios.get('/api/stats/overall', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        totalViews.value = statsResponse.data.total_access_count
        uniqueVisitors.value = statsResponse.data.unique_visitors
        avgSessionDuration.value = statsResponse.data.average_session_duration || 0
        dailyAccessTrend.value = statsResponse.data.daily_access_trend
        
        // 计算最大访问次数用于图表
        maxAccessCount.value = Math.max(...dailyAccessTrend.value.map(day => day.count), 1)
      } catch (error) {
        console.error('获取仪表板数据失败:', error)
        if (error.response?.status === 401) {
          router.push('/login')
        }
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
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

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      fileCount,
      totalViews,
      uniqueVisitors,
      avgSessionDuration,
      recentFiles,
      dailyAccessTrend,
      maxAccessCount,
      authStore,
      subscriptionLabel,
      subscriptionClass,
      userInitials,
      formatDate,
      formatFileSize,
      formatDuration
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h2 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.subscription-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.subscription-status.status-free {
  background-color: #e9ecef;
  color: #495057;
}

.subscription-status.status-monthly {
  background-color: #d1ecf1;
  color: #0c5460;
}

.subscription-status.status-yearly {
  background-color: #d4edda;
  color: #155724;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.content-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 25px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.upload-link,
.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.upload-link:hover,
.view-all-link:hover {
  color: #0056b3;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.file-item:hover {
  background-color: #f8f9fa;
}

.file-icon {
  color: #007bff;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 13px;
  color: #666;
}

.file-stats .stat-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  margin-bottom: 20px;
  color: #ccc;
}

.empty-state p {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.chart-container {
  height: 250px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 20px 0;
}

.chart-grid {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  height: 100%;
  width: 100%;
  justify-content: space-around;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  max-width: 40px;
}

.bar-fill {
  width: 100%;
  background-color: #007bff;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

.bar-label {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.upgrade-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 25px;
  color: white;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.banner-text h4 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.banner-text p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.upgrade-btn {
  padding: 12px 25px;
  background-color: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .stats-overview {
    grid-template-columns: 1fr 1fr;
  }
  
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .content-section {
    padding: 20px;
  }
  
  .banner-content {
    flex-direction: column;
    text-align: center;
  }
  
  .chart-grid {
    gap: 8px;
  }
  
  .chart-bar {
    max-width: 25px;
  }
}
</style>