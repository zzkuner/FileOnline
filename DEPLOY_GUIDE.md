# 阅迹 ViewTrace 部署指南

> **推荐方式：Docker 部署**
> 所有依赖（数据库、文件存储）均通过容器管理，一键启动，无需在服务器手动安装 Node.js 或数据库。

---

## 一、Docker 部署

### 前置要求

| 软件 | 版本 | 安装命令 |
|---|---|---|
| Docker | ≥ 20.x | [官方文档](https://docs.docker.com/engine/install/) |
| Docker Compose | ≥ 2.x | 通常随 Docker 安装 |
| Git | 任意 | `apt install git` |

---

### 第一步：拉取代码

```bash
mkdir -p /opt/viewtrace && cd /opt/viewtrace
git clone https://github.com/zzkuner/FileOnline.git .
```

---

### 第二步：配置 `.env`

```bash
cp .env.production.example .env
nano .env
```

**必填项说明：**

```bash
# 您的真实域名
NEXTAUTH_URL=https://link.yourdomain.com
NEXT_PUBLIC_APP_URL=https://link.yourdomain.com

# 随机密钥，用命令生成: openssl rand -base64 32
NEXTAUTH_SECRET=xxxxxx

# 数据库密码（与下面 POSTGRES_PASSWORD 保持一致）
POSTGRES_PASSWORD=your_db_password
DATABASE_URL=postgresql://admin:your_db_password@postgres:5432/viewtrace?schema=public

# 对象存储 (推荐 Cloudflare R2 或 AWS S3)
STORAGE_TYPE=s3
S3_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
S3_BUCKET=your-bucket
S3_REGION=auto
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_PUBLIC_DOMAIN=https://pub.yourdomain.com

# 首次启动自动创建的管理员
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

---

### 第三步：启动服务

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

等待 1~3 分钟（首次构建 Next.js 需要时间）。

**启动流程说明：**
1. Docker 构建应用镜像（含 Next.js 编译）
2. 启动 PostgreSQL 数据库（等待健康检查通过）
3. 启动应用容器，自动执行数据库同步 (`prisma db push`)
4. 应用启动，自动创建管理员账号（通过 `ADMIN_EMAIL` / `ADMIN_PASSWORD`）

---

### 第四步：配置 Nginx 反向代理

创建或编辑 Nginx 站点配置 `/etc/nginx/conf.d/viewtrace.conf`：

```nginx
server {
    listen 80;
    server_name link.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name link.yourdomain.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 允许上传最大 500MB 文件
    client_max_body_size 500M;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;

        # WebSocket 支持
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # 传递真实 IP
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
nginx -t && nginx -s reload
```

---

### 验证部署

```bash
# 查看容器状态（app、postgres 应均为 Up）
docker compose -f docker-compose.prod.yml ps

# 查看应用启动日志
docker logs viewtrace-app --tail 50
```

正常输出应包含：
```
✅ Database schema is up to date.
✅ Default admin created: admin@example.com
🚀 Starting ViewTrace 阅迹...
```

---

## 二、日常更新

```bash
cd /opt/insightlink

# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并重启
docker compose -f docker-compose.prod.yml up -d --build
```

新版本启动时，`docker-entrypoint.sh` 会自动同步数据库 schema 变更，无需手动操作。

---

## 三、常用运维命令

```bash
# 查看实时日志
docker logs -f viewtrace-app

# 重启应用
docker compose -f docker-compose.prod.yml restart app

# 进入容器调试
docker exec -it viewtrace-app sh

# 停止所有服务
docker compose -f docker-compose.prod.yml down

# 停止并清除数据库数据（⚠️ 危险，不可恢复）
docker compose -f docker-compose.prod.yml down -v
```

---

## 四、常见问题

### 启动报错：`database "viewtrace" does not exist`
PostgreSQL 容器初次启动需要几秒初始化，docker-compose 的 healthcheck 会自动等待。如果还是报错，等待 30 秒后重试：
```bash
docker compose -f docker-compose.prod.yml restart app
```

### 上传大文件报 `413 Payload Too Large`
确保 Nginx 配置了 `client_max_body_size 500M;` 并已 `nginx -s reload`。

### 无法登录管理员账号
检查 `.env` 中 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 是否配置，查看启动日志确认是否创建成功：
```bash
docker logs viewtrace-app | grep -i admin
```

---

## 五、本地 MinIO（替代 S3/R2）

如果您不想使用云端对象存储，可以启用 `docker-compose.prod.yml` 中被注释的 `minio` 服务，并在 `.env` 中设置 `STORAGE_TYPE=minio`。
