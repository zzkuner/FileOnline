import { defineStore } from 'pinia'
import axios from 'axios'

// 使用环境变量或默认值
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8000'

export const useFileStore = defineStore('files', {
  state: () => ({
    files: [],
    loading: false
  }),

  actions: {
    async fetchFiles() {
      this.loading = true
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get(`${API_BASE_URL}/files/list`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.files = response.data
        return { success: true }
      } catch (error) {
        return { success: false, error: error.response?.data?.detail || '获取文件列表失败' }
      } finally {
        this.loading = false
      }
    },

    async uploadFile(file, options = {}) {
      try {
        const token = localStorage.getItem('access_token')
        const formData = new FormData()
        formData.append('file', file)
        
        // 添加可选参数
        if (options.password) formData.append('password', options.password)
        if (options.maxAccessCount) formData.append('max_access_count', options.maxAccessCount)
        if (options.accessStartDate) formData.append('access_start_date', options.accessStartDate)
        if (options.accessEndDate) formData.append('access_end_date', options.accessEndDate)

        const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        })
        
        // 添加新文件到列表开头
        this.files.unshift(response.data)
        
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.detail || '上传文件失败' }
      }
    },

    async deleteFile(fileId) {
      try {
        const token = localStorage.getItem('access_token')
        await axios.delete(`${API_BASE_URL}/files/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // 从列表中移除文件
        this.files = this.files.filter(file => file.id !== fileId)
        
        return { success: true }
      } catch (error) {
        return { success: false, error: error.response?.data?.detail || '删除文件失败' }
      }
    }
  }
})