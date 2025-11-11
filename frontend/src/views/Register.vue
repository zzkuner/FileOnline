<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
          </svg>
        </div>
        <h2>创建账户</h2>
        <p>开始您的文件分享之旅</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
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
          <label>邮箱</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="请输入邮箱"
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
        <div class="form-group">
          <label>确认密码</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            required 
          />
        </div>
        <button type="submit" class="register-btn" :disabled="loading">
          <span v-if="!loading">注册</span>
          <span v-else>注册中...</span>
        </button>
      </form>
      
      <div class="register-footer">
        <p>已有账号？<router-link to="/login" class="login-link">立即登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Register',
  setup() {
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const loading = ref(false)
    const router = useRouter()
    const authStore = useAuthStore()

    const handleRegister = async () => {
      if (!username.value || !email.value || !password.value || !confirmPassword.value) {
        alert('请填写所有字段')
        return
      }
      
      if (password.value !== confirmPassword.value) {
        alert('密码不匹配')
        return
      }
      
      if (password.value.length < 6) {
        alert('密码长度至少为6位')
        return
      }
      
      loading.value = true
      try {
        const result = await authStore.register(username.value, email.value, password.value)
        if (result.success) {
          alert('注册成功！请登录。')
          router.push('/login')
        } else {
          alert(result.error)
        }
      } catch (error) {
        alert('注册失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      email,
      password,
      confirmPassword,
      loading,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

.register-header {
  text-align: center;
  padding: 40px 30px 20px;
  background-color: #f8f9fa;
}

.logo {
  margin-bottom: 15px;
  color: #007bff;
}

.register-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.register-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.register-form {
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

.register-btn {
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
  margin-top: 10px;
}

.register-btn:hover:not(:disabled) {
  background-color: #0069d9;
}

.register-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-footer {
  text-align: center;
  padding: 0 30px 30px;
  border-top: 1px solid #eee;
}

.register-footer p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.login-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;
}

.login-link:hover {
  text-decoration: underline;
}
</style>