import { defineStore } from 'pinia'
import axios from 'axios'

// 使用环境变量或默认值
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8000'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('access_token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.is_admin || false
  },

  actions: {
    init() {
      // 初始化认证状态
      const token = localStorage.getItem('access_token')
      if (token) {
        this.token = token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        // 获取用户信息
        this.fetchUser()
      }
    },
    
    async login(username, password) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          username,
          password
        })
        
        this.token = response.data.access_token
        localStorage.setItem('access_token', this.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        
        // 获取用户信息
        await this.fetchUser()
        
        return { success: true }
      } catch (error) {
        return { success: false, error: error.response?.data?.detail || '登录失败' }
      }
    },

    async register(username, email, password) {
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          username,
          email,
          password
        })
        return { success: true }
      } catch (error) {
        return { success: false, error: error.response?.data?.detail || '注册失败' }
      }
    },

    async fetchUser() {
      if (!this.token) return
      
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.user = response.data
        return response.data
      } catch (error) {
        // 如果获取用户信息失败，清除token
        this.logout()
        throw error
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('access_token')
      delete axios.defaults.headers.common['Authorization']
    }
  }
})