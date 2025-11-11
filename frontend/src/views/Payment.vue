<template>
  <div class="payment-container">
    <div class="payment-header">
      <h2>订阅服务</h2>
      <p class="subtitle">解锁全部功能，享受更好的文件分享体验</p>
    </div>
    
    <div class="subscription-plans">
      <div class="plan-card recommended">
        <div class="plan-badge">推荐</div>
        <h3>年度订阅</h3>
        <div class="price-container">
          <p class="original-price">¥12.00</p>
          <p class="price">¥9.90<span>/年</span></p>
        </div>
        <ul class="features">
          <li class="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            无文件大小限制
          </li>
          <li class="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            可上传多个文件
          </li>
          <li class="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            高级访问控制
          </li>
          <li class="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            详细统计信息
          </li>
          <li class="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            优先技术支持
          </li>
        </ul>
        <button @click="createPayment('yearly', 'wechat')" class="subscribe-btn primary">微信支付</button>
        <button @click="createPayment('yearly', 'alipay')" class="subscribe-btn secondary">支付宝支付</button>
      </div>
      
      <div class="plan-card">
        <h3>月度订阅</h3>
        <div class="price-container">
          <p class="price">¥1.00<span>/月</span></p>
        </div>
        <ul class="features">
          <li class="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            无文件大小限制
          </li>
          <li class="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            可上传多个文件
          </li>
          <li class="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            高级访问控制
          </li>
          <li class="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            详细统计信息
          </li>
          <li class="feature-item disabled">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            优先技术支持
          </li>
        </ul>
        <button @click="createPayment('monthly', 'wechat')" class="subscribe-btn primary">微信支付</button>
        <button @click="createPayment('monthly', 'alipay')" class="subscribe-btn secondary">支付宝支付</button>
      </div>
    </div>
    
    <div class="free-features">
      <h3>免费用户功能</h3>
      <div class="free-features-grid">
        <div class="free-feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4.754a3.303 3.303 0 0 0-2.288.783A3.303 3.303 0 0 0 4.5 7.794a3.303 3.303 0 0 0 .783 2.257 3.303 3.303 0 0 0 2.257 1.216 3.303 3.303 0 0 0 2.257-1.216 3.303 3.303 0 0 0 1.216-2.257 3.303 3.303 0 0 0-1.216-2.257A3.303 3.303 0 0 0 8 4.754zm0 5.5a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z"/>
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0z"/>
            </svg>
          </div>
          <p>单个20MB以下文件</p>
        </div>
        <div class="free-feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
            </svg>
          </div>
          <p>基础访问链接</p>
        </div>
        <div class="free-feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1H2zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
            </svg>
          </div>
          <p>基础访问统计</p>
        </div>
      </div>
    </div>
    
    <div v-if="paymentUrl" class="payment-section">
      <div class="payment-header">
        <h3>完成支付</h3>
        <button class="close-btn" @click="closePayment">&times;</button>
      </div>
      
      <div class="payment-content">
        <div class="qr-code" v-if="isQRCode">
          <img :src="paymentUrl" alt="支付二维码" />
          <p>请使用{{ selectedPaymentMethod === 'wechat' ? '微信' : '支付宝' }}扫描二维码完成支付</p>
        </div>
        <div class="payment-link" v-else>
          <a :href="paymentUrl" target="_blank" class="pay-link">点击跳转支付页面</a>
          <p>将在新窗口打开{{ selectedPaymentMethod === 'wechat' ? '微信' : '支付宝' }}支付页面</p>
        </div>
      </div>
      
      <div class="payment-footer">
        <button @click="checkPaymentStatus" class="check-status-btn">检查支付状态</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'Payment',
  setup() {
    const paymentUrl = ref('')
    const isQRCode = ref(false)
    const currentOrderId = ref('')
    const selectedPaymentMethod = ref('wechat')
    const router = useRouter()

    const createPayment = async (subscriptionType, paymentMethod) => {
      selectedPaymentMethod.value = paymentMethod
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.post('/api/payments/create', {
          subscription_type: subscriptionType,
          payment_method: paymentMethod
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        currentOrderId.value = response.data.order_id
        paymentUrl.value = response.data.payment_url
        
        // 判断是否为二维码URL
        isQRCode.value = response.data.payment_url.startsWith('data:image') || 
                         response.data.payment_url.includes('weixin.qq.com') ||
                         response.data.payment_url.includes('alipay.com')
        
        // 如果是测试支付，直接跳转到测试成功页面
        if (response.data.payment_url.startsWith('/test-payment-success')) {
          window.location.href = response.data.payment_url
        }
      } catch (error) {
        console.error('创建支付订单失败:', error)
        alert('创建支付订单失败: ' + (error.response?.data?.detail || error.message))
      }
    }

    const checkPaymentStatus = async () => {
      if (!currentOrderId.value) {
        alert('没有正在进行的支付订单')
        return
      }
      
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get(`/api/payments/status/${currentOrderId.value}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.data.payment_status === 'success') {
          alert('支付成功！您的订阅已生效。')
          paymentUrl.value = ''
          // 刷新页面以更新用户状态
          window.location.reload()
        } else {
          alert('支付尚未完成，请继续支付或稍后再次检查。')
        }
      } catch (error) {
        console.error('检查支付状态失败:', error)
        alert('检查支付状态失败: ' + (error.response?.data?.detail || error.message))
      }
    }

    const closePayment = () => {
      paymentUrl.value = ''
      currentOrderId.value = ''
    }

    return {
      paymentUrl,
      isQRCode,
      currentOrderId,
      selectedPaymentMethod,
      createPayment,
      checkPaymentStatus,
      closePayment
    }
  }
}
</script>

<style scoped>
.payment-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.payment-header {
  text-align: center;
  margin-bottom: 40px;
}

.payment-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.subscription-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.plan-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.plan-card.recommended {
  border-color: #007bff;
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.15);
}

.plan-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background-color: #007bff;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.plan-card h3 {
  margin-top: 0;
  color: #333;
  font-size: 20px;
}

.price-container {
  margin: 25px 0;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 16px;
  margin: 0 0 5px 0;
}

.price {
  font-size: 36px;
  font-weight: bold;
  color: #007bff;
  margin: 0;
}

.price span {
  font-size: 16px;
  color: #666;
  font-weight: normal;
}

.features {
  list-style: none;
  padding: 0;
  text-align: left;
  margin: 30px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  color: #333;
}

.feature-item.disabled {
  color: #999;
}

.feature-item svg {
  color: #28a745;
  flex-shrink: 0;
}

.feature-item.disabled svg {
  color: #ccc;
}

.subscribe-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  margin-bottom: 8px;
}

.subscribe-btn.primary {
  background-color: #07c160;
  color: white;
}

.subscribe-btn.primary:hover {
  background-color: #06a050;
}

.subscribe-btn.secondary {
  background-color: #1677ff;
  color: white;
}

.subscribe-btn.secondary:hover {
  background-color: #095cb5;
}

.free-features {
  margin-bottom: 40px;
}

.free-features h3 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.free-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.free-feature {
  text-align: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #f8f9fa;
}

.feature-icon {
  margin-bottom: 15px;
  color: #007bff;
}

.free-feature p {
  margin: 0;
  color: #333;
  font-size: 14px;
}

.payment-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-top: 30px;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.payment-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.payment-content {
  text-align: center;
  margin-bottom: 30px;
}

.qr-code img {
  max-width: 200px;
  height: auto;
  margin-bottom: 15px;
}

.payment-link {
  margin-bottom: 15px;
}

.pay-link {
  display: inline-block;
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 16px;
  transition: background-color 0.3s;
}

.pay-link:hover {
  background-color: #0069d9;
}

.payment-footer {
  text-align: center;
}

.check-status-btn {
  padding: 12px 30px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.check-status-btn:hover {
  background-color: #218838;
}

@media (max-width: 768px) {
  .subscription-plans {
    grid-template-columns: 1fr;
  }
  
  .free-features-grid {
    grid-template-columns: 1fr;
  }
}
</style>