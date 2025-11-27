# 项目迁移指南

## 方案一：使用导出脚本（推荐）⭐

这是最快的方法，文件大小会从几百 MB 减少到几 MB。

### 步骤：

1. **在当前电脑上运行导出脚本：**
   ```powershell
   .\export-project.ps1
   ```
   
   这会创建一个 `online-export-[时间戳].zip` 文件，只包含必要文件，**不包含**：
   - `node_modules` 文件夹（通常 200MB+）
   - `.next` 构建文件夹
   - `dev.db` 数据库文件
   - 其他临时文件

2. **传输压缩包到新电脑**
   - 使用 U盘、网盘或其他方式

3. **在新电脑上：**
   ```powershell
   # 解压文件
   Expand-Archive -Path online-export-*.zip -DestinationPath online
   
   # 进入项目目录
   cd online
   
   # 安装依赖
   npm install
   
   # 生成 Prisma 客户端
   npx prisma generate
   
   # 初始化数据库
   npx prisma db push
   
   # 启动开发服务器
   npm run dev
   ```

---

## 方案二：使用 Git（最佳实践）

如果你有 GitHub/GitLab 账号，这是最专业的方法。

### 步骤：

1. **在当前电脑上提交代码：**
   ```powershell
   # 添加所有文件
   git add .
   
   # 提交
   git commit -m "项目完整版本"
   
   # 推送到远程仓库（如果已配置）
   git push origin main
   ```

2. **在新电脑上克隆：**
   ```powershell
   git clone <你的仓库地址>
   cd online
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

---

## 方案三：手动排除文件夹

如果不想用脚本，手动打包时排除这些文件夹：

### 要排除的文件夹：
- ❌ `node_modules/`（最大，200MB+）
- ❌ `.next/`（构建缓存，50MB+）
- ❌ `.git/`（版本历史）
- ❌ `coverage/`（测试覆盖率）
- ❌ `out/`（静态导出）

### 要排除的文件：
- ❌ `*.db`（数据库文件）
- ❌ `*.zip`（旧的压缩包）
- ❌ `*.log`（日志文件）

### 必须保留的：
- ✅ `package.json` 和 `package-lock.json`
- ✅ 所有 `.ts`、`.tsx`、`.js`、`.jsx` 源代码文件
- ✅ `prisma/` 文件夹
- ✅ `public/` 文件夹
- ✅ 配置文件（`tsconfig.json`、`next.config.ts` 等）
- ✅ `.env`（但要注意安全，不要泄漏敏感信息）

---

## 文件大小对比

| 方式 | 大小 | 时间 |
|------|------|------|
| 直接打包整个文件夹 | ~300-500MB | 慢 😫 |
| 使用导出脚本 | ~2-10MB | 快 ⚡ |
| Git clone | ~2-10MB | 快 ⚡ |

---

## 常见问题

### Q: 新电脑上运行出错怎么办？

A: 确保按顺序执行：
```powershell
npm install          # 安装依赖
npx prisma generate  # 生成 Prisma 客户端
npx prisma db push   # 初始化数据库
npm run dev          # 启动项目
```

### Q: 数据库数据怎么迁移？

A: 如果需要迁移数据：
1. 在旧电脑备份 `dev.db`
2. 复制到新电脑相同位置
3. 或使用 Prisma 的迁移功能

### Q: .env 文件需要复制吗？

A: 需要！但要注意：
- `.env` 包含敏感信息（密钥、密码等）
- 不要上传到公开仓库
- 手动复制或使用安全方式传输

---

## 推荐流程

**最快方式：**
```powershell
# 当前电脑
.\export-project.ps1

# 传输 zip 文件到新电脑

# 新电脑
Expand-Archive online-export-*.zip -DestinationPath online
cd online
npm install && npx prisma generate && npx prisma db push && npm run dev
```

**最专业方式：**
```powershell
# 当前电脑
git add .
git commit -m "完整项目"
git push

# 新电脑
git clone <仓库地址>
cd online
npm install && npx prisma generate && npx prisma db push && npm run dev
```
