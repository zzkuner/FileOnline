from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User
from auth import get_password_hash, authenticate_user, create_access_token, decode_token
from datetime import timedelta, datetime
import os
import uuid
from mail import send_email_async, EmailSchema, get_verification_email_body, get_password_reset_email_body

router = APIRouter()

# Pydantic模型
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class EmailVerificationRequest(BaseModel):
    email: str

class VerifyEmailRequest(BaseModel):
    email: str
    code: str

class PasswordResetRequest(BaseModel):
    email: str

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 检查用户是否已存在
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 检查邮箱是否已存在
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )
    
    # 生成邮箱验证代码
    verification_code = str(uuid.uuid4())[:6].upper()
    
    # 创建新用户
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        email_verification_code=verification_code
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # 发送验证邮件
    try:
        email_body = get_verification_email_body(verification_code)
        email = EmailSchema(
            recipients=[user.email],
            subject="文件在线展示平台 - 邮箱验证",
            body=email_body
        )
        import asyncio
        asyncio.create_task(send_email_async(email))
    except Exception as e:
        # 如果邮件发送失败，不阻止用户注册，但记录错误
        print(f"邮件发送失败: {e}")
    
    return {"message": "用户注册成功，请检查邮箱验证", "user_id": db_user.id}

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    authenticated_user = authenticate_user(db, user.username, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 检查邮箱是否已验证
    if not authenticated_user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="请先验证邮箱",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": authenticated_user.username}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/send-verification")
def send_verification_email(request: EmailVerificationRequest, db: Session = Depends(get_db)):
    """发送邮箱验证邮件"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 生成新的验证代码
    verification_code = str(uuid.uuid4())[:6].upper()
    user.email_verification_code = verification_code
    
    db.commit()
    
    # 发送验证邮件
    try:
        email_body = get_verification_email_body(verification_code)
        email = EmailSchema(
            recipients=[request.email],
            subject="文件在线展示平台 - 邮箱验证",
            body=email_body
        )
        import asyncio
        asyncio.create_task(send_email_async(email))
        return {"message": "验证邮件已发送"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"邮件发送失败: {str(e)}"
        )


@router.post("/verify-email")
def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    """验证邮箱"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    if user.email_verification_code != request.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证代码错误"
        )
    
    # 验证成功，更新用户状态
    user.is_email_verified = True
    user.email_verification_code = None  # 清除验证代码
    db.commit()
    
    return {"message": "邮箱验证成功"}


@router.post("/request-password-reset")
def request_password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """请求密码重置"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # 为了安全，即使用户不存在也返回成功消息
        return {"message": "如果该邮箱存在，重置链接已发送"}
    
    # 生成密码重置令牌
    reset_token = create_access_token(
        data={"sub": user.username, "type": "password_reset"},
        expires_delta=timedelta(hours=1)  # 1小时后过期
    )
    
    # 保存令牌到数据库
    user.password_reset_token = reset_token
    user.password_reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    
    # 生成重置链接
    reset_link = f"http://localhost:8080/reset-password?token={reset_token}"
    
    # 发送密码重置邮件
    try:
        email_body = get_password_reset_email_body(reset_link)
        email = EmailSchema(
            recipients=[request.email],
            subject="文件在线展示平台 - 密码重置",
            body=email_body
        )
        import asyncio
        asyncio.create_task(send_email_async(email))
        return {"message": "密码重置邮件已发送"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"邮件发送失败: {str(e)}"
        )


@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """重置密码"""
    # 验证令牌
    try:
        payload = decode_token(token)
        username = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无效的重置令牌"
            )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的重置令牌"
        )
    
    # 查找用户
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查令牌是否匹配且未过期
    if user.password_reset_token != token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="重置令牌不匹配"
        )
    
    if datetime.utcnow() > user.password_reset_token_expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="重置令牌已过期"
        )
    
    # 更新密码
    user.password_hash = get_password_hash(new_password)
    user.password_reset_token = None
    user.password_reset_token_expires = None
    db.commit()
    
    return {"message": "密码重置成功"}