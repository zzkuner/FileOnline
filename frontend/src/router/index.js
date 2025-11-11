import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import FileUpload from '../views/FileUpload.vue'
import FileList from '../views/FileList.vue'
import FileStats from '../views/FileStats.vue'
import Payment from '../views/Payment.vue'
import Admin from '../views/Admin.vue'
import Home from '../views/Home.vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/upload',
    name: 'FileUpload',
    component: FileUpload,
    meta: { requiresAuth: true }
  },
  {
    path: '/files',
    name: 'FileList',
    component: FileList,
    meta: { requiresAuth: true }
  },
  {
    path: '/stats/:fileId',
    name: 'FileStats',
    component: FileStats,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/payment',
    name: 'Payment',
    component: Payment,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果有token但没有用户信息，尝试获取用户信息
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，清除token
      authStore.logout()
    }
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !authStore.user?.is_admin) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router