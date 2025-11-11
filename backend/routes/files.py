from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import uuid
import tempfile
from database import get_db
from models import File as FileModel, User
from dependencies import get_current_user
from storage import storage_service

router = APIRouter()

# Pydantic模型
class FileUploadResponse(BaseModel):
    file_id: int
    filename: str
    original_filename: str
    unique_code: str
    access_url: str
    qr_code_url: str

class FileResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    file_type: str
    unique_code: str
    current_access_count: int = 0
    created_at: str

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    password: Optional[str] = None,
    max_access_count: Optional[int] = None,
    access_start_date: Optional[datetime] = None,
    access_end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """上传文件"""
    # 检查文件类型
    allowed_types = ["application/pdf", "video/mp4", "image/jpeg", "image/png", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的文件类型"
        )
    
    # 检查用户订阅状态和文件限制
    current_time = datetime.utcnow()
    is_paid_user = (current_user.subscription_type != 'free' and current_user.subscription_end_date and current_user.subscription_end_date > current_time)
    
    # 获取用户当前免费文件数量
    user_free_files_count = db.query(func.count(FileModel.id)).filter(
        FileModel.user_id == current_user.id
    ).scalar()
    
    # 如果是免费用户且已有免费文件，检查限制
    if not is_paid_user and user_free_files_count >= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="免费用户只能上传1个文件，如需更多功能请订阅服务"
        )
    
    # 检查文件大小限制（免费用户20MB限制）
    contents = await file.read()
    file_size_mb = len(contents) / (1024 * 1024)
    if not is_paid_user and file_size_mb > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="免费用户文件大小不能超过20MB，如需上传更大文件请订阅服务"
        )
    
    # 生成唯一文件名
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # 保存临时文件
    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file_path = temp_file.name
            temp_file.write(contents)
        
        # 上传到存储服务
        object_name = f"uploads/{current_user.id}/{unique_filename}"
        upload_result = storage_service.upload_file(temp_file_path, object_name)
        
        if not upload_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="文件上传失败"
            )
        
        # 生成访问URL
        access_url = storage_service.generate_presigned_url(object_name)
        
        # 生成唯一访问码
        unique_code = str(uuid.uuid4())[:12]  # 增加唯一码长度以提高安全性
        
        # 保存文件信息到数据库
        db_file = FileModel(
            user_id=current_user.id,
            filename=unique_filename,
            original_filename=file.filename,
            file_path=object_name,
            file_size=len(contents),
            file_type=file.content_type,
            unique_code=unique_code,
            access_password=password,
            max_access_count=max_access_count,
            access_start_date=access_start_date,
            access_end_date=access_end_date
        )
        
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return {
            "file_id": db_file.id,
            "filename": db_file.original_filename,
            "original_filename": db_file.original_filename,
            "unique_code": db_file.unique_code,
            "access_url": f"/file/{db_file.unique_code}",
            "qr_code_url": f"/qr/{db_file.unique_code}"
        }
    finally:
        # 确保临时文件被删除
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.get("/list", response_model=List[FileResponse])
def list_files(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户文件列表"""
    files = db.query(FileModel).filter(FileModel.user_id == current_user.id).offset(skip).limit(limit).all()
    # 为每个文件添加访问统计
    result = []
    for file in files:
        # 获取访问统计
        access_count = db.query(AccessLog).filter(AccessLog.file_id == file.id).count()
        # 创建一个新的响应对象，包含访问统计
        file_response = FileResponse(
            id=file.id,
            filename=file.filename,
            original_filename=file.original_filename,
            file_size=file.file_size,
            file_type=file.file_type,
            unique_code=file.unique_code,
            current_access_count=access_count,
            created_at=file.created_at.isoformat()
        )
        result.append(file_response)
    
    return result

@router.get("/{file_id}")
def get_file_info(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取文件详细信息"""
    file = db.query(FileModel).filter(FileModel.id == file_id, FileModel.user_id == current_user.id).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    return file

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除文件"""
    file = db.query(FileModel).filter(FileModel.id == file_id, FileModel.user_id == current_user.id).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    
    # 从存储服务删除文件
    storage_service.delete_file(file.file_path)
    
    # 从数据库删除记录
    db.delete(file)
    db.commit()
    
    return {"message": "文件删除成功"}