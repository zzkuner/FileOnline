<template>
  <div class="admin-container">
    <div class="admin-header">
      <h2>管理员后台</h2>
    </div>
    
    <div class="admin-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'files' }"
        @click="activeTab = 'files'"
      >
        文件管理
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        用户管理
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'payments' }"
        @click="activeTab = 'payments'"
      >
        支付信息
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'system' }"
        @click="activeTab = 'system'"
      >
        系统统计
      </div>
    </div>
    
    <!-- 文件管理标签页 -->
    <div v-if="activeTab === 'files'" class="tab-content">
      <div class="controls">
        <input 
          v-model="fileSearch" 
          placeholder="搜索文件..." 
          class="search-input"
        />
        <div class="filter-group">
          <select v-model="fileTypeFilter" class="filter-select">
            <option value="">所有类型</option>
            <option value="application/pdf">PDF</option>
            <option value="video/mp4">视频</option>
            <option value="image/jpeg">图片 (JPEG)</option>
            <option value="image/png">图片 (PNG)</option>
          </select>
          <select v-model="userFilter" class="filter-select">
            <option value="">所有用户</option>
            <option 
              v-for="user in allUsers" 
              :key="user.id" 
              :value="user.id"
            >
              {{ user.username }} ({{ user.email }})
            </option>
          </select>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>文件名</th>
              <th>用户</th>
              <th>文件类型</th>
              <th>文件大小</th>
              <th>访问次数</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in filteredFiles" :key="file.id">
              <td>{{ file.id }}</td>
              <td>{{ file.original_filename }}</td>
              <td>{{ getUserById(file.user_id)?.username || file.user_id }}</td>
              <td>{{ getFileTypeLabel(file.file_type) }}</td>
              <td>{{ formatFileSize(file.file_size) }}</td>
              <td>{{ file.current_access_count || 0 }}</td>
              <td>{{ formatDate(file.created_at) }}</td>
              <td>
                <button @click="viewFileStats(file)" class="action-btn stats-btn">统计</button>
                <button @click="deleteFile(file)" class="action-btn delete-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination" v-if="filteredFiles.length > 0">
        <button 
          @click="prevPage" 
          :disabled="filePage === 1"
          class="page-btn"
        >
          上一页
        </button>
        <span class="page-info">第 {{ filePage }} 页，共 {{ totalPages }} 页</span>
        <button 
          @click="nextPage" 
          :disabled="filePage === totalPages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>
    
    <!-- 用户管理标签页 -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="controls">
        <input 
          v-model="userSearch" 
          placeholder="搜索用户..." 
          class="search-input"
        />
        <div class="filter-group">
          <select v-model="subscriptionFilter" class="filter-select">
            <option value="">所有订阅</option>
            <option value="free">免费</option>
            <option value="monthly">月度</option>
            <option value="yearly">年度</option>
          </select>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>订阅类型</th>
              <th>订阅到期</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="getSubscriptionClass(user.subscription_type)">
                  {{ getSubscriptionLabel(user.subscription_type) }}
                </span>
              </td>
              <td>{{ user.subscription_end_date ? formatDate(user.subscription_end_date) : '-' }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <button @click="toggleUserAdmin(user)" class="action-btn admin-btn">
                  {{ user.is_admin ? '取消管理员' : '设为管理员' }}
                </button>
                <button @click="deleteUser(user)" class="action-btn delete-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 支付信息标签页 -->
    <div v-if="activeTab === 'payments'" class="tab-content">
      <div class="controls">
        <input 
          v-model="paymentSearch" 
          placeholder="搜索订单..." 
          class="search-input"
        />
        <div class="filter-group">
          <select v-model="paymentStatusFilter" class="filter-select">
            <option value="">所有状态</option>
            <option value="pending">待支付</option>
            <option value="success">成功</option>
            <option value="failed">失败</option>
            <option value="refunded">已退款</option>
          </select>
          <select v-model="paymentTypeFilter" class="filter-select">
            <option value="">所有类型</option>
            <option value="monthly">月度</option>
            <option value="yearly">年度</option>
          </select>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>订单ID</th>
              <th>用户</th>
              <th>金额</th>
              <th>支付方式</th>
              <th>订阅类型</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id">
              <td>{{ payment.order_id }}</td>
              <td>{{ getUserById(payment.user_id)?.username || payment.user_id }}</td>
              <td>¥{{ payment.amount }}</td>
              <td>{{ getPaymentMethodLabel(payment.payment_method) }}</td>
              <td>{{ getSubscriptionLabel(payment.subscription_type) }}</td>
              <td>
                <span :class="getPaymentStatusClass(payment.payment_status)">
                  {{ getPaymentStatusLabel(payment.payment_status) }}
                </span>
              </td>
              <td>{{ formatDate(payment.created_at) }}</td>
              <td>
                <button @click="refundPayment(payment)" class="action-btn refund-btn" v-if="payment.payment_status === 'success'">
                  退款
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 系统统计标签页 -->
    <div v-if="activeTab === 'system'" class="tab-content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalFiles }}</div>
          <div class="stat-label">总文件数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">¥{{ totalRevenue }}</div>
          <div class="stat-label">总收入</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalAccesses }}</div>
          <div class="stat-label">总访问量</div>
        </div>
      </div>
      
      <div class="charts-section">
        <div class="chart-container">
          <h3>用户注册趋势</h3>
          <div class="chart-placeholder">注册趋势图表</div>
        </div>
        <div class="chart-container">
          <h3>文件类型分布</h3>
          <div class="chart-placeholder">文件类型分布图表</div>
        </div>
      </div>
    </div>
    
    <!-- 统计模态框 -->
    <div v-if="showStatsModal" class="modal-overlay" @click="closeStatsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>文件统计 - {{ currentFileStats?.filename }}</h3>
          <button class="close-btn" @click="closeStatsModal">&times;</button>
        </div>
        <div class="modal-body">
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
          
          <div class="access-logs">
            <h4>访问日志</h4>
            <table class="logs-table">
              <thead>
                <tr>
                  <th>IP地址</th>
                  <th>设备类型</th>
                  <th>访问时间</th>
                  <th>停留时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in accessLogs" :key="log.id">
                  <td>{{ log.ip_address }}</td>
                  <td>{{ getDeviceLabel(log.device_type) }}</td>
                  <td>{{ formatDate(log.access_time) }}</td>
                  <td>{{ log.session_duration > 0 ? formatDuration(log.session_duration) : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'Admin',
  setup() {
    const activeTab = ref('files')
    const files = ref([])
    const users = ref([])
    const payments = ref([])
    const allUsers = ref([])
    const accessLogs = ref([])
    const showStatsModal = ref(false)
    const currentFileStats = ref(null)
    
    // 文件管理相关
    const fileSearch = ref('')
    const fileTypeFilter = ref('')
    const userFilter = ref('')
    const filePage = ref(1)
    const itemsPerPage = 10
    
    // 用户管理相关
    const userSearch = ref('')
    const subscriptionFilter = ref('')
    
    // 支付信息相关
    const paymentSearch = ref('')
    const paymentStatusFilter = ref('')
    const paymentTypeFilter = ref('')
    
    // 统计数据
    const totalUsers = ref(0)
    const totalFiles = ref(0)
    const totalRevenue = ref(0)
    const totalAccesses = ref(0)

    // 计算属性
    const filteredFiles = computed(() => {
      let result = files.value.filter(file => {
        const matchesSearch = file.original_filename.toLowerCase().includes(fileSearch.value.toLowerCase()) ||
                             file.unique_code.toLowerCase().includes(fileSearch.value.toLowerCase())
        const matchesType = !fileTypeFilter.value || file.file_type === fileTypeFilter.value
        const matchesUser = !userFilter.value || file.user_id == userFilter.value
        
        return matchesSearch && matchesType && matchesUser
      })
      
      // 计算分页
      const start = (filePage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return result.slice(start, end)
    })
    
    const totalPages = computed(() => {
      const totalItems = files.value.filter(file => {
        const matchesSearch = file.original_filename.toLowerCase().includes(fileSearch.value.toLowerCase()) ||
                             file.unique_code.toLowerCase().includes(fileSearch.value.toLowerCase())
        const matchesType = !fileTypeFilter.value || file.file_type === fileTypeFilter.value
        const matchesUser = !userFilter.value || file.user_id == userFilter.value
        return matchesSearch && matchesType && matchesUser
      }).length
      
      return Math.ceil(totalItems / itemsPerPage)
    })
    
    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(userSearch.value.toLowerCase()) ||
                             user.email.toLowerCase().includes(userSearch.value.toLowerCase())
        const matchesSubscription = !subscriptionFilter.value || user.subscription_type === subscriptionFilter.value
        
        return matchesSearch && matchesSubscription
      })
    })
    
    const filteredPayments = computed(() => {
      return payments.value.filter(payment => {
        const matchesSearch = payment.order_id.toLowerCase().includes(paymentSearch.value.toLowerCase()) ||
                             getUserById(payment.user_id)?.username.toLowerCase().includes(paymentSearch.value.toLowerCase())
        const matchesStatus = !paymentStatusFilter.value || payment.payment_status === paymentStatusFilter.value
        const matchesType = !paymentTypeFilter.value || payment.subscription_type === paymentTypeFilter.value
        
        return matchesSearch && matchesStatus && matchesType
      })
    })

    // 获取数据
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get('/api/admin/files', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        files.value = response.data
      } catch (error) {
        console.error('获取文件列表失败:', error)
        alert('获取文件列表失败: ' + (error.response?.data?.detail || error.message))
      }
    }
    
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        users.value = response.data
      } catch (error) {
        console.error('获取用户列表失败:', error)
        alert('获取用户列表失败: ' + (error.response?.data?.detail || error.message))
      }
    }
    
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get('/api/admin/payments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        payments.value = response.data
      } catch (error) {
        console.error('获取支付列表失败:', error)
        alert('获取支付列表失败: ' + (error.response?.data?.detail || error.message))
      }
    }
    
    const fetchAllUsers = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        allUsers.value = response.data
      } catch (error) {
        console.error('获取所有用户失败:', error)
      }
    }
    
    const fetchSystemStats = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // 假设API返回统计数据
        totalUsers.value = response.data.total_users || 0
        totalFiles.value = response.data.total_files || 0
        totalRevenue.value = response.data.total_revenue || 0
        totalAccesses.value = response.data.total_accesses || 0
      } catch (error) {
        console.error('获取系统统计失败:', error)
        // 设置默认值
        totalUsers.value = 0
        totalFiles.value = 0
        totalRevenue.value = 0
        totalAccesses.value = 0
      }
    }

    const getUserById = (userId) => {
      return allUsers.value.find(user => user.id == userId)
    }

    // 文件操作
    const viewFileStats = async (file) => {
      try {
        const token = localStorage.getItem('access_token')
        const statsResponse = await axios.get(`/api/stats/file/${file.id}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        currentFileStats.value = statsResponse.data
        
        const logsResponse = await axios.get(`/api/stats/file/${file.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        accessLogs.value = logsResponse.data
        
        showStatsModal.value = true
      } catch (error) {
        console.error('获取文件统计失败:', error)
        alert('获取文件统计失败: ' + (error.response?.data?.detail || error.message))
      }
    }
    
    const deleteFile = async (file) => {
      if (!confirm(`确定要删除文件 "${file.original_filename}" 吗？此操作不可撤销。`)) {
        return
      }
      
      try {
        const token = localStorage.getItem('access_token')
        await axios.delete(`/api/admin/files/${file.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // 从本地列表中移除
        files.value = files.value.filter(f => f.id !== file.id)
        alert('文件删除成功')
      } catch (error) {
        console.error('删除文件失败:', error)
        alert('删除文件失败: ' + (error.response?.data?.detail || error.message))
      }
    }

    // 用户操作
    const toggleUserAdmin = async (user) => {
      try {
        const token = localStorage.getItem('access_token')
        await axios.patch(`/api/admin/users/${user.id}/admin`, {
          is_admin: !user.is_admin
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // 更新本地用户数据
        user.is_admin = !user.is_admin
        alert(user.is_admin ? '用户已设为管理员' : '用户已取消管理员权限')
      } catch (error) {
        console.error('更新用户权限失败:', error)
        alert('更新用户权限失败: ' + (error.response?.data?.detail || error.message))
      }
    }
    
    const deleteUser = async (user) => {
      if (!confirm(`确定要删除用户 "${user.username}" 吗？此操作不可撤销。`)) {
        return
      }
      
      try {
        const token = localStorage.getItem('access_token')
        await axios.delete(`/api/admin/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // 从本地列表中移除
        users.value = users.value.filter(u => u.id !== user.id)
        alert('用户删除成功')
      } catch (error) {
        console.error('删除用户失败:', error)
        alert('删除用户失败: ' + (error.response?.data?.detail || error.message))
      }
    }

    // 支付操作
    const refundPayment = async (payment) => {
      if (!confirm(`确定要为订单 "${payment.order_id}" 进行退款吗？`)) {
        return
      }
      
      try {
        const token = localStorage.getItem('access_token')
        await axios.post(`/api/admin/payments/${payment.id}/refund`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // 更新本地支付状态
        payment.payment_status = 'refunded'
        alert('退款操作成功')
      } catch (error) {
        console.error('退款失败:', error)
        alert('退款失败: ' + (error.response?.data?.detail || error.message))
      }
    }

    // 分页操作
    const prevPage = () => {
      if (filePage.value > 1) {
        filePage.value--
      }
    }
    
    const nextPage = () => {
      if (filePage.value < totalPages.value) {
        filePage.value++
      }
    }

    // 关闭模态框
    const closeStatsModal = () => {
      showStatsModal.value = false
      currentFileStats.value = null
      accessLogs.value = []
    }

    // 格式化函数
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
    
    const getFileTypeLabel = (fileType) => {
      const labels = {
        'application/pdf': 'PDF',
        'video/mp4': '视频',
        'image/jpeg': '图片(JPG)',
        'image/png': '图片(PNG)',
        'application/vnd.ms-powerpoint': 'PPT',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX'
      }
      return labels[fileType] || fileType
    }
    
    const getSubscriptionLabel = (type) => {
      const labels = {
        'free': '免费',
        'monthly': '月度',
        'yearly': '年度'
      }
      return labels[type] || type
    }
    
    const getSubscriptionClass = (type) => {
      const classes = {
        'free': 'subscription-free',
        'monthly': 'subscription-monthly',
        'yearly': 'subscription-yearly'
      }
      return classes[type] || ''
    }
    
    const getPaymentMethodLabel = (method) => {
      const labels = {
        'wechat': '微信支付',
        'alipay': '支付宝'
      }
      return labels[method] || method
    }
    
    const getPaymentStatusLabel = (status) => {
      const labels = {
        'pending': '待支付',
        'success': '成功',
        'failed': '失败',
        'refunded': '已退款'
      }
      return labels[status] || status
    }
    
    const getPaymentStatusClass = (status) => {
      const classes = {
        'pending': 'status-pending',
        'success': 'status-success',
        'failed': 'status-failed',
        'refunded': 'status-refunded'
      }
      return classes[status] || ''
    }
    
    const getDeviceLabel = (device) => {
      const labels = {
        'mobile': '移动端',
        'desktop': '桌面端',
        'tablet': '平板端'
      }
      return labels[device] || device
    }

    onMounted(() => {
      fetchFiles()
      fetchUsers()
      fetchPayments()
      fetchAllUsers()
      fetchSystemStats()
    })

    return {
      activeTab,
      files,
      users,
      payments,
      allUsers,
      accessLogs,
      showStatsModal,
      currentFileStats,
      fileSearch,
      fileTypeFilter,
      userFilter,
      filePage,
      totalPages,
      userSearch,
      subscriptionFilter,
      paymentSearch,
      paymentStatusFilter,
      paymentTypeFilter,
      totalUsers,
      totalFiles,
      totalRevenue,
      totalAccesses,
      filteredFiles,
      filteredUsers,
      filteredPayments,
      getUserById,
      viewFileStats,
      deleteFile,
      toggleUserAdmin,
      deleteUser,
      refundPayment,
      prevPage,
      nextPage,
      closeStatsModal,
      formatFileSize,
      formatDate,
      formatDuration,
      getFileTypeLabel,
      getSubscriptionLabel,
      getSubscriptionClass,
      getPaymentMethodLabel,
      getPaymentStatusLabel,
      getPaymentStatusClass,
      getDeviceLabel
    }
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
}

.admin-header h2 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.admin-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  color: #666;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #333;
}

.tab-item.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  transition: background-color 0.3s;
}

.stats-btn {
  background-color: #17a2b8;
  color: white;
}

.stats-btn:hover {
  background-color: #138496;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

.admin-btn {
  background-color: #ffc107;
  color: #212529;
}

.admin-btn:hover {
  background-color: #e0a800;
}

.refund-btn {
  background-color: #6f42c1;
  color: white;
}

.refund-btn:hover {
  background-color: #5a32a3;
}

.subscription-free {
  color: #6c757d;
}

.subscription-monthly {
  color: #17a2b8;
}

.subscription-yearly {
  color: #28a745;
}

.status-pending {
  color: #ffc107;
}

.status-success {
  color: #28a745;
}

.status-failed {
  color: #dc3545;
}

.status-refunded {
  color: #6f42c1;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.page-btn {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
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
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

.access-logs h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th,
.logs-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.logs-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-container h3 {
  margin-top: 0;
  color: #333;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #666;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-wrap: wrap;
  }
  
  .data-table,
  .logs-table {
    font-size: 14px;
  }
  
  .data-table th,
  .data-table td,
  .logs-table th,
  .logs-table td {
    padding: 8px 4px;
  }
  
  .action-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .admin-tabs {
    overflow-x: auto;
  }
  
  .tab-item {
    white-space: nowrap;
  }
}
</style>