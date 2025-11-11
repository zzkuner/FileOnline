<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="hero-content">
        <h1>专业的文件在线展示平台</h1>
        <p>轻松上传、分享和管理您的PDF、视频、图片等文件</p>
        <div class="hero-actions">
          <router-link to="/register" class="btn primary">免费注册</router-link>
          <router-link to="/login" class="btn secondary">立即登录</router-link>
        </div>
      </div>
      <div class="hero-image">
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4 1.5v13a.5.5 0 0 0 .5.5h5.79a1 1 0 0 1 .8.4l.64.86a.5.5 0 0 0 .75.13l2.6-2.1a.5.5 0 0 0 .13-.75l-.86-.64a1 1 0 0 1-.4-.8H14a.5.5 0 0 0 .5-.5v-13A1.5 1.5 0 0 0 13 2H4a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h1v-3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3h1v-3a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 10.5v3h.5a.5.5 0 0 1 .5.5v.5H4v-13z"/>
        </svg>
      </div>
    </div>
    
    <div class="features-section">
      <div class="section-header">
        <h2>核心功能</h2>
        <p>为您提供完整的文件管理和分享解决方案</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
            </svg>
          </div>
          <h3>文件上传</h3>
          <p>支持PDF、视频、图片等多种格式文件上传，操作简单便捷</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4.754a3.303 3.303 0 0 0-2.288.783A3.303 3.303 0 0 0 4.5 7.794a3.303 3.303 0 0 0 .783 2.257 3.303 3.303 0 0 0 2.257 1.216 3.303 3.303 0 0 0 2.257-1.216 3.303 3.303 0 0 0 1.216-2.257 3.303 3.303 0 0 0-1.216-2.257A3.303 3.303 0 0 0 8 4.754zm0 5.5a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z"/>
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0z"/>
            </svg>
          </div>
          <h3>在线访问</h3>
          <p>生成专属链接和二维码，方便分享给他人在线查看</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 14.5a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zM3 4a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H4v9a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H7v9a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H10V13a.5.5 0 0 1-1 0V4zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H13v9a.5.5 0 0 1-1 0V4z"/>
            </svg>
          </div>
          <h3>访问统计</h3>
          <p>详细记录文件访问次数、独立访客、停留时间等统计数据</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
          </div>
          <h3>访问控制</h3>
          <p>设置访问密码、次数限制、时间范围等访问控制策略</p>
        </div>
      </div>
    </div>
    
    <div class="pricing-section">
      <div class="section-header">
        <h2>灵活的订阅方案</h2>
        <p>满足不同用户的需求</p>
      </div>
      
      <div class="pricing-grid">
        <div class="pricing-card">
          <div class="pricing-header">
            <h3>免费版</h3>
            <div class="price">¥0<span>/月</span></div>
          </div>
          <ul class="pricing-features">
            <li>单个20MB以下文件</li>
            <li>基础访问链接</li>
            <li>基础访问统计</li>
            <li class="disabled">访问控制</li>
            <li class="disabled">多文件上传</li>
          </ul>
          <router-link to="/register" class="btn secondary">免费使用</router-link>
        </div>
        
        <div class="pricing-card popular">
          <div class="popular-badge">最受欢迎</div>
          <div class="pricing-header">
            <h3>年度订阅</h3>
            <div class="price">¥9.9<span>/年</span></div>
            <div class="original-price">¥12.00</div>
          </div>
          <ul class="pricing-features">
            <li>无文件大小限制</li>
            <li>多文件上传</li>
            <li>高级访问控制</li>
            <li>详细访问统计</li>
            <li>优先技术支持</li>
          </ul>
          <router-link to="/register" class="btn primary">立即订阅</router-link>
        </div>
        
        <div class="pricing-card">
          <div class="pricing-header">
            <h3>月度订阅</h3>
            <div class="price">¥1<span>/月</span></div>
          </div>
          <ul class="pricing-features">
            <li>无文件大小限制</li>
            <li>多文件上传</li>
            <li>高级访问控制</li>
            <li>详细访问统计</li>
            <li>标准技术支持</li>
          </ul>
          <router-link to="/register" class="btn secondary">立即订阅</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0 0 20px 20px;
  margin-bottom: 60px;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-content h1 {
  font-size: 48px;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-content p {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 20px;
}

.btn {
  padding: 14px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  display: inline-block;
  text-align: center;
}

.btn.primary {
  background-color: white;
  color: #667eea;
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn.secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn.secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 36px;
  margin-bottom: 15px;
  color: #333;
}

.section-header p {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.features-section {
  padding: 0 40px 80px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  margin-bottom: 25px;
  color: #007bff;
}

.feature-card h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 22px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.pricing-section {
  padding: 0 40px 80px;
  background-color: #f8f9fa;
  border-radius: 20px;
  margin: 0 40px 60px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.pricing-card {
  background: white;
  border-radius: 12px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.pricing-card.popular {
  border: 2px solid #007bff;
  transform: scale(1.05);
}

.pricing-card.popular:hover {
  transform: scale(1.05) translateY(-5px);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #007bff;
  color: white;
  padding: 5px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.pricing-header h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.price {
  font-size: 48px;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 10px;
}

.price span {
  font-size: 18px;
  font-weight: normal;
  color: #666;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 16px;
  margin-bottom: 20px;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 30px 0;
  text-align: left;
}

.pricing-features li {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.pricing-features li:before {
  content: "✓";
  color: #28a745;
  margin-right: 10px;
  font-weight: bold;
}

.pricing-features li.disabled {
  color: #999;
}

.pricing-features li.disabled:before {
  content: "✗";
  color: #dc3545;
}

@media (max-width: 992px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 60px 20px;
  }
  
  .hero-content {
    margin-bottom: 40px;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .features-section,
  .pricing-section {
    padding: 0 20px 60px;
  }
  
  .pricing-section {
    margin: 0 20px 40px;
  }
  
  .section-header h2 {
    font-size: 32px;
  }
  
  .hero-content h1 {
    font-size: 36px;
  }
  
  .hero-content p {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .pricing-card.popular {
    transform: scale(1);
  }
  
  .pricing-card.popular:hover {
    transform: scale(1) translateY(-5px);
  }
  
  .btn {
    padding: 12px 25px;
    font-size: 14px;
  }
}
</style>