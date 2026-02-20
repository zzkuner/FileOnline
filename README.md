# 阅迹 ViewTrace - 智能文件追踪平台

## 项目简介

阅迹 ViewTrace 是一个智能文件追踪平台，专注于解决文件分享后的“信息黑洞”问题。通过为每个分享创建唯一的追踪链接，用户可以实时了解：
- 📊 谁查看了文件
- ⏰ 何时查看
- 👀 查看了多久
- 📍 访客的设备和位置信息
- 🔥 对哪些内容最感兴趣（热力图）

## 核心功能

### 1. 一文多链
- 为同一个文件创建无限个追踪链接
- 精准识别每个访客来源
- 例如：同一份简历可以创建"投递腾讯"、"投递阿里"等不同链接

### 2. 访客画像
- 自动识别访客设备类型（桌面/移动）
- 浏览器和操作系统信息
- IP 地址和地理位置

### 3. 内容热力图
- PDF：每页停留时长分析
- 视频：播放进度和重复观看片段
- 深度了解访客兴趣点

### 4. 实时追踪
- 链接被打开时实时记录
- 访问时长统计
- 事件时间线

### 5. 访问控制
- 设置链接密码保护
- 设置有效期限制
- 一键启用/禁用链接

## 技术栈

### 前端
- **Next.js 14+** - React 框架（App Router）
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Shadcn/UI** - UI 组件库
- **Lucide React** - 图标库

### 后端
- **Next.js API Routes** - 服务端 API
- **Prisma** - ORM 数据库工具
- **SQLite** - 数据库（MVP，可轻松切换到 PostgreSQL/MySQL）

### 核心库
- **bcryptjs** - 密码加密
- **nanoid** - 唯一 ID 生成
- **ua-parser-js** - User Agent 解析
- **date-fns** - 日期处理
### 6. 移动端适配
- 全面优化的移动端界面
- 响应式仪表盘与文件详情页
- 完美支持手机端文件预览与管理

### 7. 系统管理
- 完善的后台管理系统
- 存储配置（S3/R2/本地）
- 邮件服务配置
- 用户与文件管理

## 部署指南

详细的服务器部署教程请参考 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)。

## 技术栈
## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

数据库配置已在 `prisma.config.ts` 中设置，使用 SQLite：

```bash
# 运行数据库迁移
npx prisma migrate dev

# 生成 Prisma 客户端
npx prisma generate
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 使用流程

### 1. 注册账户
- 访问首页，点击"开始使用"或"注册"
- 填写邮箱、密码和姓名
- 注册成功后自动跳转到登录页

### 2. 登录系统
- 使用注册的邮箱和密码登录
- 登录成功后进入仪表盘

### 3. 上传文件
- 在仪表盘点击"选择文件"
- 支持的格式：PDF、视频（MP4/MOV）、图片（JPG/PNG）、PPT
- 上传后文件会显示在"我的文件"列表中

### 4. 创建追踪链接
- 点击文件卡片进入文件详情页
- 点击"创建追踪链接"
- 输入链接名称（如"投递腾讯"）和描述
- 创建成功后会生成唯一的追踪链接

### 5. 分享链接
- 复制追踪链接发送给目标访客
- 访客打开链接后会自动开始追踪
- 支持通过二维码分享（移动端友好）

### 6. 查看分析
- 在文件详情页查看所有链接的访问统计
- 点击"查看分析"进入详细分析页面
- 查看访客设备、浏览器、访问时长等信息
- 查看访问时间线和事件记录

## 应用场景

### 💼 求职/升学
- 为每个投递的公司创建专属简历链接
- 了解 HR 是否查看、查看时长
- 把握面试邀请时机

### 📊 商务/销售
- 为每个客户创建专属报价单链接
- 追踪客户对哪些产品感兴趣
- 优化销售策略，提升成交率

### 🎓 教育/培训
- 教师分享试讲视频
- 追踪学生学习进度
- 分析观看热点，改进教学内容

### 🎨 创意/设计
- 设计师分享作品集
- 保护原创作品（禁止下载）
- 了解客户偏好，优化设计方向

## 项目结构

```
online/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证相关
│   │   │   ├── login/            # 登录
│   │   │   └── register/         # 注册
│   │   ├── files/                # 文件管理
│   │   ├── links/                # 链接管理
│   │   ├── track/                # 追踪数据收集
│   │   ├── analytics/            # 分析数据
│   │   ├── upload/               # 文件上传
│   │   ├── viewer/               # 查看器数据
│   │   └── uploads/              # 静态文件服务
│   ├── dashboard/                # 用户仪表盘
│   │   ├── file/[id]/            # 文件详情
│   │   └── link/[id]/            # 链接分析
│   ├── v/[slug]/                 # 公共查看器
│   ├── login/                    # 登录页
│   ├── register/                 # 注册页
│   ├── page.tsx                  # 首页
│   └── globals.css               # 全局样式
├── lib/                          # 工具库
│   ├── db.ts                     # Prisma 客户端
│   ├── auth.ts                   # 认证工具
│   ├── file-storage.ts           # 文件存储
│   └── tracking.ts               # 追踪工具
├── prisma/                       # Prisma 配置
│   ├── schema.prisma             # 数据库模型
│   └── migrations/               # 数据库迁移
├── uploads/                      # 上传文件存储目录
└── public/                       # 静态资源
```

## 数据库模型

### User（用户）
- 邮箱、密码、姓名
- 角色（USER/ADMIN）

### File（文件）
- 原始文件名、存储路径
- 文件类型、大小
- 处理状态（PROCESSING/READY）

### Link（追踪链接）
- 唯一 slug、自定义名称
- 密码保护、有效期
- 启用/禁用状态

### Visit（访问记录）
- 访客 IP、User Agent
- 设备类型、浏览器、操作系统
- 访问时长

### Event（事件记录）
- 事件类型（PAGE_VIEW、VIDEO_PROGRESS 等）
- 事件数据（JSON）
- 时间戳

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 文件管理
- `GET /api/files?userId={id}` - 获取用户文件列表
- `GET /api/files/{id}` - 获取文件详情
- `POST /api/upload` - 上传文件

### 链接管理
- `POST /api/links` - 创建追踪链接
- `GET /api/links?fileId={id}` - 获取文件的所有链接

### 追踪与分析
- `POST /api/track` - 记录追踪事件
- `GET /api/analytics/{linkId}` - 获取链接分析数据
- `GET /api/viewer/{slug}` - 获取查看器数据

## 环境变量配置

本项目依赖环境变量进行配置。

1.  复制示例文件：
    ```bash
    cp .env.example .env
    ```
2.  编辑 `.env` 文件，填入您的实际配置（数据库、存储、域名等）。详细说明请参考 `.env.example` 文件中的注释。

## 部署

**详细部署指南请见 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)**

### 快速概览 (PM2)

1.  **服务器环境**：Node.js 18+, PM2, Git
2.  **获取代码**：
    ```bash
    git clone https://github.com/zzkuner/FileOnline.git
    cd FileOnline
    ```
3.  **配置**：复制 `.env.example` 到 `.env` 并填写配置。
4.  **安装与启动**：
    ```bash
    npm install
    npx prisma generate
    npm run build
    pm2 start ecosystem.config.js
    ```

### Docker 部署

```bash
docker build -t viewtrace .
docker run -d -p 3000:3000 --env-file .env viewtrace
```

## 待优化功能

- [ ] 完整的 PDF 查看器集成（react-pdf）
- [ ] HLS 视频流支持
- [ ] IP 地理位置解析（MaxMind GeoIP）
- [ ] 实时通知（WebSocket/邮件/微信）
- [ ] 二维码生成功能
- [ ] 管理员后台
- [ ] 数据导出功能
- [ ] 更详细的热力图可视化

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue。

---

**阅迹 ViewTrace** - 让每一次分享都有迹可循 🚀
