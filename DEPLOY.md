# InsightLink 服务器部署指南

本指南将帮助您将 InsightLink 部署到 Linux 服务器（如阿里云、腾讯云、AWS）。

## 1. 准备工作

### 服务器要求
*   系统：Ubuntu 20.04+ / Debian 11+ / CentOS 7+
*   配置：至少 2核 4G（视频转码需要一定性能）
*   端口：开放 3000 (应用), 9000 (MinIO API), 9001 (MinIO Console)

### 安装 Docker
在服务器上执行以下命令安装 Docker：

```bash
curl -fsSL https://get.docker.com | bash
sudo systemctl enable --now docker
```

## 2. 部署步骤

### 第一步：上传代码
将整个项目文件夹上传到服务器，或者在服务器上克隆代码仓库。

### 第二步：配置环境变量
在项目根目录创建一个 `.env.production` 文件（或者直接修改 `docker-compose.prod.yml` 中的环境变量）：

```env
# MinIO 配置
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=复杂一点的密码
MINIO_BUCKET_NAME=files

# 应用配置
NEXT_PUBLIC_APP_URL=http://您的服务器IP:3000
```

### 第三步：启动服务
在项目根目录下运行：

```bash
# 构建并启动
docker compose -f docker-compose.prod.yml up -d --build
```

### 第四步：初始化数据库
容器启动后，需要初始化数据库结构：

```bash
# 进入容器执行迁移
docker exec -it insightlink-app npx prisma db push
```

## 3. 验证部署

1.  访问 `http://服务器IP:3000` -> 应该能看到登录页。
2.  访问 `http://服务器IP:9001` -> MinIO 控制台（账号密码为您设置的 admin/密码）。

## 4. 常见问题

*   **视频转码慢？** 
    *   这是因为服务器 CPU 性能限制。建议升级 CPU 或使用云点播服务。
*   **上传大文件失败？**
    *   检查 Nginx（如果有）的 `client_max_body_size` 配置。
