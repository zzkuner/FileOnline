# NextAuth.js 集成完成

## ✅ 已完成的工作

1. **安装 NextAuth**：`next-auth` 和 `@auth/prisma-adapter`
2. **创建认证配置**：`auth.ts` 文件配置了 Credentials 认证提供商
3. **API 路由**：`/app/api/auth/[...nextauth]/route.ts`
4. **更新登录页**：使用 `signIn()` 函数替代 localStorage
5. **添加 SessionProvider**：在 `layout.tsx` 中包裹应用

## 🔄 迁移说明

### 旧的认证方式（已弃用）
```typescript
// ❌ 旧方法 (localStorage)
localStorage.setItem('user', JSON.stringify(user))
const userStr = localStorage.getItem('user')
```

### 新的认证方式（推荐）
```typescript
// ✅ 新方法 (NextAuth)
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
if (status === 'authenticated') {
    console.log(session.user) // { id, email, name, role }
}
```

## 📝 TypeScript 类型扩展

如果遇到 `session.user.role` 类型错误，创建 `types/next-auth.d.ts`：

```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
```

## 🛡️ 保护路由

### 客户端保护（Client Component）
```typescript
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    if (status === 'loading') return <div>Loading...</div>

    return <div>Dashboard for {session?.user?.email}</div>
}
```

### 服务端保护（Server Component）
```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const session = await auth()
    
    if (!session) {
        redirect('/login')
    }

    return <div>Dashboard for {session.user?.email}</div>
}
```

### API 路由保护
```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await auth()
    
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 获取当前用户 ID
    const userId = session.user.id
    
    return NextResponse.json({ userId })
}
```

## ⚙️ 环境变量

在 `.env` 中添加（可选，已有默认值）：
```env
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

生成随机密钥：
```bash
openssl rand -base64 32
```

## 🔄 下一步迁移任务

需要将以下文件从 localStorage 迁移到 NextAuth：

1. **Dashboard 页面**
   - `app/dashboard/page.tsx`
   - 使用 `useSession()` 替代 `localStorage.getItem('user')`

2. **Admin 页面**
   - `app/admin/page.tsx`
   - 检查 `session.user.role === 'ADMIN'`

3. **API 路由**
   - 所有需要认证的 API
   - 使用 `await auth()` 获取 session

4. **注销功能**
   ```typescript
   import { signOut } from 'next-auth/react'
   
   <button onClick={() => signOut({ callbackUrl: '/' })}>
       登出
   </button>
   ```

## ✨ 优势

1. **更安全**：使用 HTTP-only cookies 而非 localStorage
2. **标准化**：符合 OAuth 标准，易于集成第三方登录
3. **类型安全**：完整的 TypeScript 支持
4. **会话管理**：自动处理 token 刷新和过期

## 🎯 当前状态

- ✅ 新用户注册（旧的 `/api/register` 仍然可用）
- ✅ 登录功能（使用 NextAuth）
- ⚠️ 旧的 localStorage session 不再有效，用户需要重新登录
- ⏳ Dashboard 等页面暂时仍使用 localStorage（需要逐步迁移）
