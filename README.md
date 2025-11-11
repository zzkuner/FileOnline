# FileOnline
# 文件在线展示平台

一个为用户设计的在线文件展示平台，支持PDF、视频、图片等文件的上传、分享和管理，具有访问控制和统计功能。
<img width="1912" height="922" alt="image" src="https://github.com/user-attachments/assets/71a2a79a-1fb0-499c-bad4-57eba0569d64" />

## 功能特性

### 用户功能
- ✅ 用户注册/登录 (JWT认证)
- ✅ 邮箱验证与密码重置
- ✅ 文件上传与管理 (PDF, 视频, 图片)
- ✅ 生成唯一公开链接和二维码
- ✅ 访问策略配置 (密码、次数、时间限制)
- ✅ 访问统计与数据分析
- ✅ 微信/支付宝支付订阅


### 管理员功能
- 👔 用户管理
- 📁 文件管理
- 💳 支付信息管理
- 📊 系统统计
- ⚙️ 系统配置

### 技术特性
- 🚀 Docker容器化部署
- 📱 响应式设计 (手机+电脑端)
- 🔐 安全的认证授权
- 📈 详细的访问统计
- 💳 多种支付方式

## 技术栈

### 后端
- **框架**: FastAPI (Python 3.8+)
- **数据库**: PostgreSQL
- **缓存**: Redis
- **存储**: MinIO (兼容S3)
- **认证**: JWT + Bcrypt
- **支付**: 微信支付 + 支付宝

### 前端
- **框架**: Vue 3 + Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI组件**: Element Plus

## 快速开始

### 开发环境

1. 克隆项目
   ```bash
   git clone <your-repo-url>
   cd file-online
   ```

2. 后端设置
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. 前端设置
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 生产环境部署

使用Docker Compose进行一键部署：

1. 复制环境配置文件
   ```bash
   cp .env.example .env
   # 编辑 .env 文件配置环境变量
   ```

2. 启动服务
   ```bash
   # 使用部署脚本（推荐）
   ./deploy.bat
   # 或直接使用docker-compose
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

访问 `http://localhost` 即可使用应用。

## 项目结构

```
file-online/
├── backend/              # 后端服务
│   ├── main.py          # 应用入口
│   ├── models.py        # 数据模型
│   ├── auth.py          # 认证功能
│   ├── storage.py       # 存储服务
│   ├── mail.py          # 邮件服务
│   ├── routes/          # API路由
│   │   ├── auth.py      # 认证路由
│   │   ├── files.py     # 文件路由
│   │   ├── access.py    # 访问控制路由
│   │   ├── payments.py  # 支付路由
│   │   ├── stats.py     # 统计路由
│   │   └── admin.py     # 管理员路由
│   └── requirements.txt # 依赖列表
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── views/       # 页面组件
│   │   ├── stores/      # 状态管理
│   │   └── router/      # 路由配置
│   └── package.json     # 前端依赖
├── docker-compose.yml    # Docker编排
├── docker-compose.prod.yml # 生产环境Docker编排
├── nginx.conf           # Nginx配置
├── .env.example         # 环境变量示例
├── deploy.bat           # Windows部署脚本
└── DEPLOY.md            # 部署文档
```

## API文档

服务启动后，访问 `http://localhost/docs` 查看交互式API文档。

## 部署说明

详细部署说明请参见 [DEPLOY.md](./DEPLOY.md)。

## 安全措施

- JWT令牌认证
- 密码加密存储
- 输入验证和XSS防护
- API速率限制
- 文件类型和大小限制
- 访问日志记录

## 维护

- 定期备份数据库
- 监控系统性能
- 更新安全补丁
- 清理过期文件

## 许可证

MIT License
