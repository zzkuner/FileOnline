import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import User
from backend.database import Base
from passlib.context import CryptContext

# 创建密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:your_postgres_password@localhost/file_online")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_admin_user():
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:your_postgres_password@localhost/file_online")
    engine = create_engine(DATABASE_URL)
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 检查管理员用户是否已存在
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        existing_admin = db.query(User).filter(User.username == admin_username).first()
        
        if existing_admin:
            print(f"管理员用户 '{admin_username}' 已存在，跳过创建")
            return
        
        # 从环境变量获取管理员信息
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        
        # 创建密码哈希
        password_hash = pwd_context.hash(admin_password)
        
        # 创建管理员用户
        admin_user = User(
            username=admin_username,
            email=admin_email,
            password_hash=password_hash,
            is_admin=True,
            is_email_verified=True,
            subscription_type="yearly"  # 初始设置为年度订阅
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"管理员用户 '{admin_username}' 创建成功！")
        print(f"用户名: {admin_username}")
        print(f"邮箱: {admin_email}")
        print(f"密码: {admin_password}")
        print("请登录后立即修改默认密码！")
        
    except Exception as e:
        print(f"创建管理员用户时出错: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()