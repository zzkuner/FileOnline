<template>
  <div id="app">
    <nav class="navbar" v-if="$route.name !== 'Login' && $route.name !== 'Register'">
      <div class="nav-container">
        <div class="nav-logo">
          <router-link to="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
            </svg>
            <span>文件在线</span>
          </router-link>
        </div>
        
        <div class="nav-menu">
          <router-link to="/dashboard" class="nav-link" :class="{ active: $route.name === 'Dashboard' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            仪表板
          </router-link>
          <router-link to="/upload" class="nav-link" :class="{ active: $route.name === 'FileUpload' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
            </svg>
            上传
          </router-link>
          <router-link to="/files" class="nav-link" :class="{ active: $route.name === 'FileList' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
            </svg>
            文件
          </router-link>
          <router-link to="/payment" class="nav-link" :class="{ active: $route.name === 'Payment' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/>
            </svg>
            订阅
          </router-link>
          <router-link to="/admin" class="nav-link" :class="{ active: $route.name === 'Admin' }" v-if="isAdmin">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
            管理
          </router-link>
        </div>
        
        <div class="nav-user">
          <div class="user-menu" v-if="user">
            <div class="user-info" @click="toggleUserMenu">
              <div class="user-avatar">{{ userInitials }}</div>
              <span class="username">{{ user.username }}</span>
            </div>
            <div class="user-dropdown" v-show="showUserMenu">
              <div class="dropdown-item" @click="viewProfile">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                </svg>
                个人资料
              </div>
              <div class="dropdown-item" @click="logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                  <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
                退出登录
              </div>
            </div>
          </div>
          <div class="auth-links" v-else>
            <router-link to="/login" class="auth-link">登录</router-link>
            <router-link to="/register" class="auth-link signup">注册</router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer" v-if="$route.name !== 'Login' && $route.name !== 'Register'">
      <div class="footer-container">
        <div class="footer-section">
          <h4>文件在线</h4>
          <p>专业的文件分享与展示平台</p>
        </div>
        <div class="footer-section">
          <h4>功能</h4>
          <ul>
            <li><a href="#">文件上传</a></li>
            <li><a href="#">在线预览</a></li>
            <li><a href="#">访问统计</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>支持</h4>
          <ul>
            <li><a href="#">帮助中心</a></li>
            <li><a href="#">联系我们</a></li>
            <li><a href="#">反馈建议</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 文件在线. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const showUserMenu = ref(false)
    
    const user = computed(() => authStore.user)
    const isAdmin = computed(() => authStore.user?.is_admin)
    const userInitials = computed(() => {
      if (authStore.user?.username) {
        return authStore.user.username.substring(0, 2).toUpperCase()
      }
      return 'U'
    })
    
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }
    
    const viewProfile = () => {
      // 这里可以跳转到个人资料页面
      showUserMenu.value = false
    }
    
    const logout = () => {
      authStore.logout()
      router.push('/login')
      showUserMenu.value = false
    }
    
    const handleClickOutside = (event) => {
      if (showUserMenu.value && !event.target.closest('.user-menu')) {
        showUserMenu.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      // 初始化认证状态
      authStore.init()
    })
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      user,
      isAdmin,
      userInitials,
      showUserMenu,
      toggleUserMenu,
      viewProfile,
      logout
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f5f7fa;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.nav-logo a {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 18px;
}

.nav-logo svg {
  color: #007bff;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #007bff;
  background-color: #f8f9fa;
}

.nav-link.active {
  color: #007bff;
  background-color: #e6f7ff;
}

.nav-user {
  display: flex;
  align-items: center;
}

.auth-links {
  display: flex;
  gap: 15px;
}

.auth-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 8px 15px;
  border-radius: 6px;
  transition: all 0.3s;
}

.auth-link:hover {
  color: #007bff;
  background-color: #f8f9fa;
}

.auth-link.signup {
  background-color: #007bff;
  color: white;
}

.auth-link.signup:hover {
  background-color: #0069d9;
  color: white;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 30px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f8f9fa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.username {
  font-weight: 500;
  color: #333;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 10px 0;
  min-width: 150px;
  z-index: 1001;
  margin-top: 5px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.main-content {
  flex: 1;
  padding: 20px 0;
}

.footer {
  background-color: #2c3e50;
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.footer-section h4 {
  margin-bottom: 15px;
  font-size: 18px;
}

.footer-section p {
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 10px;
}

.footer-section a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding: 20px;
  text-align: center;
  color: #bdc3c7;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
  }
  
  .nav-menu {
    gap: 15px;
  }
  
  .nav-link span {
    display: none;
  }
  
  .nav-link svg {
    margin-right: 0;
  }
  
  .username {
    display: none;
  }
  
  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .footer-section ul {
    padding: 0;
  }
}
</style>