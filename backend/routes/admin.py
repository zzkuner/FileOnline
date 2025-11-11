from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
from database import get_db
from models import User, File as FileModel, Payment, AccessLog
from dependencies import get_current_user

router = APIRouter()

# Pydantic模型
class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: str
    subscription_type: str
    subscription_end_date: datetime
    is_admin: bool
    is_email_verified: bool
    created_at: datetime

class AdminFileResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    original_filename: str
    file_size: int
    file_type: str
    unique_code: str
    current_access_count: int
    created_at: datetime

class AdminPaymentResponse(BaseModel):
    id: int
    user_id: int
    order_id: str
    amount: float
    payment_method: str
    payment_status: str
    subscription_type: str
    created_at: datetime

class ToggleAdminRequest(BaseModel):
    is_admin: bool

class RefundPaymentRequest(BaseModel):
    pass

class AdminStatsResponse(BaseModel):
    total_users: int
    total_files: int
    total_revenue: float
    total_accesses: int

@router.get("/users", response_model=List[AdminUserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取所有用户信息（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅管理员可访问此功能"
        )
    
    users = db.query(User).all()
    return users

@router.patch("/users/{user_id}/admin")
def toggle_user_admin(
    user_id: int,
    request: ToggleAdminRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """切换用户管理员权限（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅管理员可访问此功能"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    user.is_admin = request.is_admin
    db.commit()
    return {"message": "用户权限更新成功"}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除用户（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅管理员可访问此功能"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 删除用户的所有文件
    files = db.query(FileModel).filter(FileModel.user_id == user_id).all()
    for file in files:
        db.delete(file)
    
    # 删除用户的支付记录
    payments = db.query(Payment).filter(Payment.user_id == user_id).all()
    for payment in payments:
        db.delete(payment)
    
    # 删除用户
    db.delete(user)
    db.commit()
    return {"message": "用户删除成功"}

@router.get("/files", response_model=List[AdminFileResponse])
def get_all_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取所有文件信息（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅管理员可访问此功能"
        )
    
    files = db.query(FileModel).all()
    # 为每个文件添加访问统计
    result = []
    for file in files:
        # 获取访问统计
        access_count = db.query(AccessLog).filter(AccessLog.file_id == file.id).count()
        # 创建一个新的响应对象，包含访问统计
        file_response = AdminFileResponse(
            id=file.id,
            user_id=file.user_id,
            filename=file.filename,
            original_filename=file.original_filename,
            file_size=file.file_size,
            file_type=file.file_type,
            unique_code=file.unique_code,
            current_access_count=access_count,
            created_at=file.created_at
        )
        result.append(file_response)
    
    return result

@router.delete("/files/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除文件（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅管理员可访问此功能"
        )
    
    file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    
    # 从存储服务删除文件
    from storage import storage_service
    storage_service.delete_file(file.file_path)
    
    # 删除数据库记录
    db.delete(file)
    db.commit()
    return {"message": "文件删除成功"}

@router.get("/payments", response_model=List[AdminPaymentResponse])
def get_all_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取所有支付信息（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅管理员可访问此功能"
        )
    
    payments = db.query(Payment).all()
    return payments

@router.post("/payments/{payment_id}/refund")
def refund_payment(
    payment_id: int,
    request: RefundPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """退款操作（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅管理员可访问此功能"
        )
    
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="支付记录不存在"
        )
    
    if payment.payment_status != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只有成功的支付订单才能退款"
        )
    
    # 这里应该集成实际的退款API调用
    # 为了演示，我们只更新数据库状态
    payment.payment_status = "refunded"
    db.commit()
    return {"message": "退款操作已记录"}

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取系统统计信息（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅管理员可访问此功能"
        )
    
    total_users = db.query(User).count()
    total_files = db.query(FileModel).count()
    total_accesses = db.query(AccessLog).count()
    
    # 计算总收入（只计算成功支付的订单）
    total_revenue_result = db.query(Payment.amount).filter(Payment.payment_status == "success").all()
    total_revenue = sum([p[0] for p in total_revenue_result]) if total_revenue_result else 0.0
    
    return {
        "total_users": total_users,
        "total_files": total_files,
        "total_revenue": float(total_revenue),
        "total_accesses": total_accesses
    }