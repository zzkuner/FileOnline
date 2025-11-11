<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
          </svg>
        </div>
        <h2>欢迎回来</h2>
        <p>登录您的账户</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入用户名"
            required 
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码"
            required 
          />
        </div>
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="!loading">登录</span>
          <span v-else>登录中...</span>
        </button>
      </form>
      
      <div class="login-footer">
        <p>没有账号？<router-link to="/register" class="signup-link">立即注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Login',
  setup() {
    const username = ref('')
    const password = ref('')
    const loading = ref(false)
    const router = useRouter()
    const authStore = useAuthStore()

    const handleLogin = async () => {
      if (!username.value || !password.value) {
        alert('请填写所有字段')
        return
      }
      
      loading.value = true
      try {
        const result = await authStore.login(username.value, password.value)
        if (result.success) {
          router.push('/dashboard')
        } else {
          alert(result.error)
        }
      } catch (error) {
        alert('登录失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      password,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 40px 30px 20px;
  background-color: #f8f9fa;
}

.logo {
  margin-bottom: 15px;
  color: #007bff;
}

.login-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.login-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
}

.login-btn {
  width: 100%;
  padding: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #0069d9;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  padding: 0 30px 30px;
  border-top: 1px solid #eee;
}

.login-footer p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.signup-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;
}

.signup-link:hover {
  text-decoration: underline;
}
</style>