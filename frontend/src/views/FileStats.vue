<template>
  <div class="file-stats-container">
    <div class="stats-header">
      <h2>文件统计</h2>
      <button class="back-btn" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.285-.753l-4-8.5c-.373-.86-.987-1.21-1.649-.74l-5.482 4.796c-.646.566-.646 1.52 0 2.086Z"/>
        </svg>
        返回文件列表
      </button>
    </div>
    
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 14.5a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zM3 4a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H4v9a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H7v9a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H10V13a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H13v9a.5.5 0 0 1-1 0V4z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.total_access_count || 0 }}</div>
          <div class="stat-label">总访问次数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.unique_visitors || 0 }}</div>
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
          <div class="stat-value">{{ formatDuration(stats?.average_session_duration || 0) }}</div>
          <div class="stat-label">平均停留</div>
        </div>
      </div>
    </div>
    
    <div class="stats-details">
      <div class="detail-section">
        <h3>设备类型分布</h3>
        <div class="device-stats" v-if="stats?.device_stats">
          <div 
            v-for="(count, device) in stats.device_stats" 
            :key="device" 
            class="device-item"
          >
            <div class="device-name">{{ getDeviceLabel(device) }}</div>
            <div class="device-bar">
              <div 
                class="bar-fill" 
                :style="{ width: getDevicePercentage(device) + '%' }"
              ></div>
            </div>
            <div class="device-count">{{ count }}</div>
          </div>
        </div>
        <div v-else class="no-data">暂无设备统计数据</div>
      </div>
      
      <div class="detail-section">
        <h3>访问日志</h3>
        <div class="access-logs-container">
          <table class="logs-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>IP地址</th>
                <th>设备类型</th>
                <th>访问时间</th>
                <th>停留时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in accessLogs" :key="log.id">
                <td>{{ index + 1 }}</td>
                <td>{{ log.ip_address }}</td>
                <td>{{ getDeviceLabel(log.device_type) }}</td>
                <td>{{ formatDate(log.access_time) }}</td>
                <td>{{ log.session_duration > 0 ? formatDuration(log.session_duration) : '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="accessLogs.length === 0" class="no-data">暂无访问日志</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

export default {
  name: 'FileStats',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const stats = ref(null)
    const accessLogs = ref([])
    const fileId = route.params.fileId

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token')
        
        const statsResponse = await axios.get(`/api/stats/file/${fileId}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        stats.value = statsResponse.data
        
        const logsResponse = await axios.get(`/api/stats/file/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        accessLogs.value = logsResponse.data
      } catch (error) {
        console.error('获取统计信息失败:', error)
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
          alert('获取统计信息失败: ' + (error.response?.data?.detail || error.message))
        }
      }
    }

    const goBack = () => {
      router.push('/files')
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDuration = (seconds) => {
      if (seconds < 60) {
        return Math.round(seconds) + '秒'
      } else if (seconds < 3600) {
        return Math.round(seconds / 60) + '分钟'
      } else {
        return Math.round(seconds / 3600) + '小时'
      }
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
      if (!stats.value?.device_stats) return 0
      const total = Object.values(stats.value.device_stats).reduce((sum, count) => sum + count, 0)
      return total > 0 ? (stats.value.device_stats[device] / total) * 100 : 0
    }

    onMounted(() => {
      fetchStats()
    })

    return {
      stats,
      accessLogs,
      router,
      goBack,
      formatDate,
      formatDuration,
      getDeviceLabel,
      getDevicePercentage
    }
  }
}
</script>

<style scoped>
.file-stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.stats-header h2 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #5a6268;
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

.stats-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
}

.detail-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 25px;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.device-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.device-name {
  width: 100px;
  font-weight: 500;
  color: #333;
}

.device-bar {
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
  font-weight: 500;
  color: #333;
}

.access-logs-container {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th,
.logs-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.logs-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

@media (max-width: 768px) {
  .stats-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .stats-details {
    grid-template-columns: 1fr;
  }
  
  .device-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .device-bar {
    width: 100%;
  }
  
  .logs-table,
  .logs-table thead,
  .logs-table tbody,
  .logs-table th,
  .logs-table td,
  .logs-table tr {
    display: block;
  }
  
  .logs-table thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }
  
  .logs-table tr {
    border: 1px solid #ccc;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 8px;
  }
  
  .logs-table td {
    border: none;
    position: relative;
    padding-left: 50% !important;
  }
  
  .logs-table td:before {
    content: attr(data-label) ": ";
    position: absolute;
    left: 6px;
    width: 45%;
    padding-right: 10px;
    white-space: nowrap;
    font-weight: 600;
  }
}
</style>