# 文件在线展示平台 - 部署文档

## 1. 系统架构

本系统采用前后端分离的架构：

- **前端**: Vue 3 + Element Plus
- **后端**: FastAPI (Python)
- **数据库**: PostgreSQL
- **缓存**: Redis
- **存储**: MinIO (兼容S3)
- **反向代理**: Nginx
- **容器化**: Docker + Docker Compose

## 2. 环境要求

- Docker (版本 20.10.0 或更高)
- Docker Compose (版本 2.0.0 或更高)
- Node.js (版本 16 或更高，仅用于构建前端)
- Git

## 3. 部署步骤

### 3.1 克隆代码仓库

```bash
git clone <your-repo-url>
cd file-online
```

### 3.2 配置环境变量

复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下参数：

```env
# 数据库配置
POSTGRES_DB=file_online
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/file_online

# Redis配置
REDIS_URL=redis://redis:6379/0

# MinIO/S3存储配置
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=file-online-bucket

# JWT密钥（请使用强随机字符串）
SECRET_KEY=your-super-secret-jwt-key-change-in-production

# 邮件配置
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=your-email@example.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_STARTTLS=true
MAIL_SSL_TLS=false

# 微信支付配置（可选）
WECHAT_PAY_MCH_ID=your_wechat_mch_id
WECHAT_PAY_MCH_KEY=your_wechat_mch_key
WECHAT_PAY_APP_ID=your_wechat_app_id
WECHAT_PAY_NOTIFY_URL=https://your-domain.com/api/payments/wechat/callback

# 支付宝配置（可选）
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY_PATH=/app/alipay/private_key.pem
ALIPAY_PUBLIC_KEY_PATH=/app/alipay/public_key.pem
ALIPAY_NOTIFY_URL=https://your-domain.com/api/payments/alipay/callback

# 支付测试模式（开发环境设为true，生产环境设为false）
PAYMENT_TEST_MODE=true

# 管理员初始化配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com
```

**重要提示**：
- 请使用强密码替换所有默认密码
- 生成安全的 JWT SECRET_KEY：`openssl rand -base64 32`
- 如需生产环境支付功能，请配置真实的支付API密钥
- 如需SSL证书，请将证书文件放置在 `ssl/` 目录下

### 3.3 构建并启动服务

使用生产环境配置启动服务：

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3.4 初始化数据库（首次部署）

如果需要初始化数据库，可以手动执行初始化脚本：

```bash
# 查看容器状态
docker-compose -f docker-compose.prod.yml ps

# 进入后端容器执行初始化脚本（如果有）
docker-compose -f docker-compose.prod.yml exec backend python init_admin.py
```

## 4. 系统配置

### 4.1 MinIO 配置

首次启动后，访问 `http://your-server-ip:9001` 访问 MinIO 控制台：

- 用户名: `minioadmin`
- 密码: `minioadmin`

请在控制台中创建一个名为 `file-online-bucket` 的存储桶。

### 4.2 支付功能配置

如需启用支付功能：

1. **微信支付**：
   - 在微信支付平台注册商户
   - 配置回调URL: `https://your-domain.com/api/payments/wechat/callback`

2. **支付宝**：
   - 在支付宝开放平台注册应用
   - 配置回调URL: `https://your-domain.com/api/payments/alipay/callback`
   - 将私钥和公钥文件复制到容器中的正确位置

### 4.3 邮件功能配置

如需启用邮件功能：
- 配置SMTP服务器信息
- 验证邮箱验证和密码重置功能

## 5. SSL 证书配置（HTTPS）

如需启用HTTPS，请将SSL证书文件放置在 `ssl/` 目录下，并修改 `nginx.conf` 中的证书路径：

```nginx
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

然后重启Nginx服务：

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

## 6. 常用命令

```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 停止服务并删除数据卷（谨慎使用）
docker-compose -f docker-compose.prod.yml down -v

# 更新镜像后重新部署
docker-compose -f docker-compose.prod.yml up -d --build

# 进入特定容器
docker-compose -f docker-compose.prod.yml exec backend bash
docker-compose -f docker-compose.prod.yml exec db psql -U postgres
```

## 7. 监控和维护

### 7.1 日志监控

Nginx访问和错误日志：

```bash
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/access.log
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/error.log
```

### 7.2 数据库备份

```bash
# 创建备份
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres file_online > backup.sql

# 恢复备份
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres file_online < backup.sql
```

### 7.3 存储空间清理

定期清理MinIO中的过期文件和数据库中的访问日志。

## 8. 安全建议

1. **环境变量安全**：
   - 不要将 `.env` 文件提交到版本控制系统
   - 定期更换JWT密钥和数据库密码
   - 使用强密码

2. **容器安全**：
   - 定期更新基础镜像
   - 不使用root用户运行容器
   - 限制容器资源使用

3. **网络配置**：
   - 限制外部访问数据库和Redis
   - 使用HTTPS加密传输
   - 配置防火墙规则

## 9. 故障排除

### 9.1 服务无法启动
- 检查 `.env` 文件配置是否正确
- 确认端口是否被占用
- 查看具体错误日志

### 9.2 数据库连接问题
- 检查数据库服务是否正在运行
- 验证数据库连接字符串
- 确认数据库用户权限

### 9.3 文件上传失败
- 检查MinIO服务状态
- 验证存储桶是否存在
- 确认存储空间是否充足

### 9.4 支付功能异常
- 检查支付API配置
- 验证回调URL是否可访问
- 查看支付服务日志

## 10. 扩展配置

### 10.1 负载均衡
如需更高可用性，可以使用多个后端实例：

```yaml
backend:
  replicas: 3
  # ... 其他配置
```

### 10.2 监控
可集成Prometheus和Grafana进行系统监控。

### 10.3 日志分析
可集成ELK（Elasticsearch, Logstash, Kibana）进行日志分析。

## 11. 更新应用

要更新到新版本：

```bash
# 拉取最新代码
git pull

# 重新构建并启动服务
docker-compose -f docker-compose.prod.yml up -d --build

# 清理旧镜像（可选）
docker image prune
```

---
**注意**：生产环境中部署前请务必测试所有功能并确保安全配置正确。