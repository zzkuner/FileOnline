# FileOnline 服务器部署指南

本文档详细说明了如何将 InsightLink (FileOnline) 部署到生产服务器，包括首次安装和后续更新流程。

## 1. 环境准备

确保您的服务器已安装以下软件：
-   **Node.js**: 建议版本 v18 或更高。
-   **Git**: 用于代码版本控制。
-   **PM2**: 用于进程守护和管理 (推荐安装: `npm install -g pm2`)。

## 2. 首次部署 (Initial Setup)

如果您是第一次在服务器上部署该项目，请按照以下步骤操作。

### 2.1 获取代码

由于项目私有或重置过历史，推荐使用 Git 初始化方式：

```bash
# 创建并进入目录
mkdir -p /www/wwwroot/link
cd /www/wwwroot/link

# 初始化 Git
git init
git config --global --add safe.directory /www/wwwroot/link

# 添加远程仓库
git remote add origin https://github.com/zzkuner/FileOnline.git

# 拉取代码 (强制覆盖)
git fetch origin main
git reset --hard origin/main
```

### 2.2 配置环境变量

项目根目录下需要 `.env` 文件来存储敏感配置（如数据库、S3 密钥）。
**注意**：`.env` 文件**不会**随代码库下载，必须手动创建。

```bash
cp .env.example .env
nano .env
# 在此处填入您的真实数据库 URL、NEXTAUTH_SECRET 等

# --- Cloudflare R2 配置示例 ---
# STORAGE_TYPE="minio"
# MINIO_ENDPOINT="<ACCOUNT_ID>.r2.cloudflarestorage.com"
# MINIO_PORT=443
# MINIO_USE_SSL=true
# MINIO_ACCESS_KEY="<YOUR_R2_ACCESS_KEY_ID>"
# MINIO_SECRET_KEY="<YOUR_R2_SECRET_ACCESS_KEY>"
# MINIO_BUCKET_NAME="<YOUR_BUCKET_NAME>"

```

### 2.3 安装与构建

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npx prisma generate

# 构建项目
npm run build
```

### 2.4 启动服务 (使用 PM2)

我们已提供 `ecosystem.config.js`，可一键启动：

```bash
pm2 start ecosystem.config.js
```

服务启动后，默认运行在 `3000` 端口。

---

## 3. 日常更新 (Updating)

当您在本地开发并 Push 代码到 GitHub 后，请在服务器执行以下步骤更新：

### 3.1 拉取最新代码

```bash
cd /www/wwwroot/link
git pull origin main
```
*(如果遇到 "refusing to merge unrelated histories" 或冲突，可参考下方的故障排除)*

### 3.2 重新构建与重启

某些更新（如依赖变更、Prisma Schema 变更）需要重新安装或生成：

```bash
# 1. (可选) 如果 package.json 有变动
npm install

# 2. (可选) 如果 prisma/schema.prisma 有变动
npx prisma generate
npx prisma migrate deploy

# 3. 重新构建 (前端/后端变更都需要)
npm run build

# 4. 重启服务
pm2 restart fileonline
```

**简易更新命令组合：**
```bash
git pull && npm install && npm run build && pm2 restart fileonline
```

---

## 4. 故障排除

### Git 提示 "fatal: not a git repository"
服务器目录丢失了 `.git` 文件夹。请参照 [2.1 获取代码](#21-获取代码) 重新初始化。

### Git 拉取报错 (Head 冲突 / History Mismatch)
如果我们强制重置了 GitHub 仓库历史（Force Push），服务器端需要强制重置：

```bash
git fetch origin main
git reset --hard origin/main
```
*注意：这会丢弃服务器上所有未提交的本地修改（`.env` 文件不受影响）。*

### 启动后访问报错 / 500 Error
1.  检查日志：`pm2 logs fileonline`
2.  检查 `.env` 配置是否正确。
3.  确保执行了 `npx prisma generate`。

---

## 5. 常用 PM2 命令

-   查看状态：`pm2 status`
-   查看日志：`pm2 logs fileonline`
-   重启应用：`pm2 restart fileonline`
-   停止应用：`pm2 stop fileonline`
