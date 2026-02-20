# FileOnline 服务器部署指南

本文档详细说明了如何将 FileOnline 部署到生产服务器，支持 **Docker 部署（推荐）** 和 PM2 直接部署两种方式。

---

## 🐳 Docker 部署（推荐）

Docker 部署是最简单、最稳定的方式，无需手动管理 Node.js 版本、PM2 或数据库安装。

### 前置条件
- 服务器已安装 Docker 和 Docker Compose
- 克隆了代码仓库并配置好了 `.env` 文件（参考 `.env.example`，注意 `DATABASE_URL` 连接字符串中 host 应为 `postgres`，不是 `localhost`）

### 首次部署
```bash
cd /www/wwwroot/link.piupa.com
docker compose -f docker-compose.prod.yml up -d --build
```

### 查看日志
```bash
docker compose -f docker-compose.prod.yml logs app -f
```
启动成功时应看到：
```
✅ Database schema is up to date.
✓ Ready in xxxms
✅ Seeded N config values from .env into SystemConfig
✅ Default admin created: your@email.com
```

### 日常更新
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

### 常用管理命令
```bash
# 查看容器状态
docker compose -f docker-compose.prod.yml ps

# 停止服务
docker compose -f docker-compose.prod.yml down

# 查看实时日志
docker compose -f docker-compose.prod.yml logs app -f
```

### 数据持久化
所有数据存储在网站目录下的 `data/` 文件夹：
- `data/postgres/` — 数据库文件
- `data/uploads/` — 用户上传文件

---


## 1. 环境准备

确保您的服务器已安装以下软件：
-   **Node.js**: 建议版本 v18 或更高。
-   **Git**: 用于代码版本控制。
-   **PM2**: 用于进程守护和管理 (推荐安装: `npm install -g pm2`)。

## 6. 验证环境配置
应用启动后，您可以按以下方法检查环境变量是否正确已生效：

### 6.1 查看 PM2 加载的变量
```bash
# 查看进程 ID 为 0 的全部变量 (更可靠)
pm2 show 0
# 或者
pm2 env 0
```
如果不正确，请先修改 `.env` 配置文件，然后执行：
```bash
pm2 restart fileonline
```

### 6.2 在线测试 (Admin Panel) (推荐)
1.  登录管理员后台 -> 设置。
2.  使用“邮件配置”的 **发送测试邮件** 按钮 (Test Email) 验证 SMTP 配置。
3.  使用“存储配置”的 **测试存储连接** 按钮 (Test Storage) 验证 R2/S3 配置。
4.  如果任何报错，系统会显示详细的错误原因。

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
# 在此处填入您的真实数据库 URL、S3 配置、NEXTAUTH_SECRET 等
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

### Git 提示 "fatal: detected dubious ownership"
这是因为当前用户（如 root）不是该目录的所有者。Git 为了安全禁止了操作。
解决方法（直接运行报错提示中的命令）：
```bash
git config --global --add safe.directory /www/wwwroot/link.piupa.com
```
或者允许所有目录（更方便）：
```bash
git config --global --add safe.directory '*'
```

### Git 提示 "fatal: $HOME not set"
如果提示找不到 HOME 变量，请先设置它（临时）：
```bash
export HOME=/root
git config --global --add safe.directory '*'
```

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

### 常见的构建/启动错误
-   **Permission denied (node_modules/.bin/next OR @prisma/engines)**:
    如果构建或启动时提示 `EACCES` 权限错误，请运行以下修复命令：
    ```bash
    chmod +x node_modules/.bin/*
    chmod -R +x node_modules/@prisma/engines
    ```
-   **pm2: command not found**:
    说明没有安装 PM2，请运行：
    ```bash
    npm install -g pm2
    ```
    ```
-   **PM2 提示 "Process or Namespace not found"**:
    说明应用当前没有在运行（可能被杀掉了，或者 PM2 守护进程刚重启）。请使用 `start` 命令重新启动：
    ```bash
    pm2 start ecosystem.config.js
    ```
-   **Node.js Version Mismatch**:
    如果提示 `Node.js version ">=20.9.0" is required`，您需要升级 Node.js。
    
    **推荐使用 `n` 工具升级：**
    ```bash
    npm install -g n
    n 20
    hash -r  # 刷新路径
    ```
  
### **严重：命令执行提示 "Killed" (系统内存不足/OOM)**
如果运行 `pm2`, `npm`, 甚至 `bt` 命令都直接显示 `Killed`，说明系统内存耗尽，触发了 Linux 的自我保护机制。

**解决方法：增加虚拟内存 (Swap)**
请依次运行以下命令（即使您的物理内存很大，Node.js 启动瞬间也可能触发杀手）：
```bash
# 1. 停止所有占用内存的进程
pkill -f node
pkill -f pm2

# 2. 创建 2GB 的 Swap 分区
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 3. 验证 (确宝 Swap 行不为 0)
free -h

# 4. 重新启动
export HOME=/root
pm2 start ecosystem.config.js
```

---

## 5. 常用 PM2 命令

-   查看状态：`pm2 status`
-   查看日志：`pm2 logs fileonline`
-   重启应用：`pm2 restart fileonline`
-   停止应用：`pm2 stop fileonline`
-   删除应用（如果配置错了想重来）：`pm2 delete fileonline`
-   保存当前进程列表（开机自启）：`pm2 save`
