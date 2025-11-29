# InsightLink 服务器部署指南

本指南将帮助您使用 Docker 和 Docker Compose 将 InsightLink 部署到 Linux 服务器（如阿里云、腾讯云、AWS）。

## 1. 准备工作

### 服务器要求
*   **系统**：Ubuntu 20.04+ / Debian 11+ / CentOS 7+
*   **配置**：建议 2核 4G 以上（视频转码和 Next.js 构建需要一定资源）
*   **端口**：需开放 3000 (应用), 9000 (MinIO API), 9001 (MinIO Console)

### 安装 Docker
在服务器上执行以下命令安装 Docker 和 Docker Compose：

```bash
curl -fsSL https://get.docker.com | bash
sudo systemctl enable --now docker
```

## 2. 部署步骤

### 第一步：上传代码
将整个项目文件夹上传到服务器，或者在服务器上克隆代码仓库。
确保包含以下关键文件：
*   `Dockerfile`
*   `docker-compose.prod.yml`
*   `package.json`
*   `next.config.ts`
*   `prisma/`
*   `public/`
*   `app/` (及其他源码目录)

### 第二步：启动服务
在项目根目录下运行以下命令。这会构建镜像并启动应用、MinIO 对象存储服务和 PostgreSQL 数据库。

```bash
# 使用生产环境配置启动
docker compose -f docker-compose.prod.yml up -d --build
```

### 第三步：初始化数据库
容器启动后，需要初始化数据库结构。运行以下命令：

```bash
# 推送数据库结构到生产数据库 (PostgreSQL)
docker exec -it insightlink-app npx prisma db push
```

## 3. 验证部署

1.  **访问应用**：打开浏览器访问 `http://服务器IP:3000`。您应该能看到登录页面。
2.  **访问 MinIO 控制台**：访问 `http://服务器IP:9001`。
    *   默认账号：`admin`
    *   默认密码：`password123` (可在 `docker-compose.prod.yml` 中修改)
3.  **访问数据库**：如果需要，可以使用数据库管理工具连接到 `http://服务器IP:5432`。
    *   默认账号：`admin`
    *   默认密码：`password123`
    *   数据库名：`fileonline`
3.  **测试功能**：尝试注册账号、上传文件、创建分享链接。

## 4. 常用维护命令

*   **查看日志**：
    ```bash
    docker compose -f docker-compose.prod.yml logs -f
    ```
*   **重启服务**：
    ```bash
    docker compose -f docker-compose.prod.yml restart
    ```
*   **停止服务**：
    ```bash
    docker compose -f docker-compose.prod.yml down
    ```
*   **更新代码后重新部署**：
    ```bash
    git pull # 拉取新代码
    docker compose -f docker-compose.prod.yml up -d --build # 重新构建并启动
    docker exec -it insightlink-app npx prisma db push # 如果有数据库变更
    ```

## 5. 环境变量配置 (可选)
如果需要修改默认配置（如 MinIO 密码、端口等），请直接修改 `docker-compose.prod.yml` 文件中的 `environment` 部分。
