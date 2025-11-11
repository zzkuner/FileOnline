from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime, timedelta
from database import get_db
from models import AccessLog, File as FileModel
from dependencies import get_current_user
from models import User

router = APIRouter()

# Pydantic模型
class AccessLogResponse(BaseModel):
    id: int
    file_id: int
    ip_address: str
    user_agent: str
    device_type: str
    access_time: datetime
    session_duration: int

class FileStatsResponse(BaseModel):
    file_id: int
    filename: str
    total_access_count: int
    unique_visitors: int
    average_session_duration: float

class OverallStatsResponse(BaseModel):
    total_files: int
    total_access_count: int
    unique_visitors: int
    device_stats: Dict[str, int]
    daily_access_trend: List[Dict[str, int]]

@router.get("/file/{file_id}", response_model=List[AccessLogResponse])
def get_file_access_logs(
    file_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取文件访问日志"""
    # 验证文件属于当前用户
    file = db.query(FileModel).filter(FileModel.id == file_id, FileModel.user_id == current_user.id).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    
    # 获取访问日志
    logs = db.query(AccessLog).filter(AccessLog.file_id == file_id).offset(skip).limit(limit).all()
    return logs

@router.get("/file/{file_id}/stats", response_model=FileStatsResponse)
def get_file_statistics(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取文件统计信息"""
    # 验证文件属于当前用户
    file = db.query(FileModel).filter(FileModel.id == file_id, FileModel.user_id == current_user.id).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    
    # 计算统计信息
    total_access_count = db.query(func.count(AccessLog.id)).filter(AccessLog.file_id == file_id).scalar()
    unique_visitors = db.query(func.count(func.distinct(AccessLog.ip_address))).filter(AccessLog.file_id == file_id).scalar()
    
    # 计算平均会话时长
    avg_session_duration = db.query(func.avg(AccessLog.session_duration)).filter(
        and_(AccessLog.file_id == file_id, AccessLog.session_duration > 0)
    ).scalar()
    
    if avg_session_duration is None:
        avg_session_duration = 0.0
    
    return {
        "file_id": file_id,
        "filename": file.original_filename,
        "total_access_count": total_access_count,
        "unique_visitors": unique_visitors,
        "average_session_duration": float(avg_session_duration)
    }

@router.get("/overall", response_model=OverallStatsResponse)
def get_overall_statistics(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取整体统计信息"""
    # 计算时间范围
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # 获取用户文件数量
    total_files = db.query(func.count(File.id)).filter(File.user_id == current_user.id).scalar()
    
    # 获取用户文件的总访问次数
    total_access_count = db.query(func.count(AccessLog.id)).join(FileModel).filter(
        and_(FileModel.user_id == current_user.id, AccessLog.access_time >= start_date)
    ).scalar()
    
    # 获取独立访客数量
    unique_visitors = db.query(func.count(func.distinct(AccessLog.ip_address))).join(FileModel).filter(
        and_(FileModel.user_id == current_user.id, AccessLog.access_time >= start_date)
    ).scalar()
    
    # 设备类型统计
    device_stats_result = db.query(
        AccessLog.device_type, func.count(AccessLog.id)
    ).join(FileModel).filter(
        and_(FileModel.user_id == current_user.id, AccessLog.access_time >= start_date)
    ).group_by(AccessLog.device_type).all()
    
    device_stats = {device: count for device, count in device_stats_result}
    
    # 每日访问趋势
    daily_access_trend = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        next_day = day + timedelta(days=1)
        count = db.query(func.count(AccessLog.id)).join(FileModel).filter(
            and_(
                FileModel.user_id == current_user.id,
                AccessLog.access_time >= day,
                AccessLog.access_time < next_day
            )
        ).scalar()
        daily_access_trend.append({
            "date": day.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return {
        "total_files": total_files,
        "total_access_count": total_access_count,
        "unique_visitors": unique_visitors,
        "device_stats": device_stats,
        "daily_access_trend": daily_access_trend
    }