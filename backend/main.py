from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, files, access, payments, stats, admin
from mail import mail_service

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="文件在线展示平台 API", version="1.0.0")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/auth", tags=["认证"])
app.include_router(files.router, prefix="/files", tags=["文件"])
app.include_router(access.router, prefix="/file", tags=["访问"])
app.include_router(payments.router, prefix="/payments", tags=["支付"])
app.include_router(stats.router, prefix="/stats", tags=["统计"])
app.include_router(admin.router, prefix="/admin", tags=["管理员"])

@app.get("/")
def read_root():
    return {"message": "文件在线展示平台 API"}