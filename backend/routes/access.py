from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import qrcode
from io import BytesIO
import base64
from database import get_db
from models import File as FileModel, AccessLog, User
from dependencies import get_current_user
from storage import storage_service
from user_agents import parse

router = APIRouter()

# Pydantic模型
class AccessResponse(BaseModel):
    filename: str
    original_filename: str
    access_url: str
    file_type: str

@router.get("/{unique_code}")
def get_file_by_code(unique_code: str, request: Request, db: Session = Depends(get_db)):
    """通过唯一码获取文件信息"""
    # 查找文件
    file = db.query(FileModel).filter(FileModel.unique_code == unique_code).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在或已删除"
        )
    
    # 检查访问限制
    if file.access_password:  # 如果设置了访问密码
        # 检查请求中是否包含密码
        access_password = request.query_params.get("password")
        if access_password != file.access_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="需要访问密码"
            )
    
    # 检查访问次数限制
    if file.max_access_count and file.current_access_count >= file.max_access_count:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="已达到最大访问次数限制"
        )
    
    # 检查访问时间限制
    if file.access_start_date and datetime.utcnow() < file.access_start_date:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="尚未到允许访问时间"
        )
    if file.access_end_date and datetime.utcnow() > file.access_end_date:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="访问时间已过期"
        )
    
    # 记录访问日志
    user_agent_str = request.headers.get("User-Agent", "")
    user_agent = parse(user_agent_str)
    device_type = "desktop"
    if user_agent.is_mobile:
        device_type = "mobile"
    elif user_agent.is_tablet:
        device_type = "tablet"
    
    access_log = AccessLog(
        file_id=file.id,
        ip_address=request.client.host,
        user_agent=user_agent_str,
        device_type=device_type
    )
    db.add(access_log)
    db.commit()
    
    # 更新访问次数
    file.current_access_count += 1
    db.commit()
    
    # 生成预签名URL
    access_url = storage_service.generate_presigned_url(file.file_path)
    
    return {
        "filename": file.filename,
        "original_filename": file.original_filename,
        "access_url": access_url,
        "file_type": file.file_type
    }

@router.get("/qr/{unique_code}")
def get_qr_code(unique_code: str, request: Request, db: Session = Depends(get_db)):
    """生成文件访问二维码"""
    # 检查文件是否存在
    file = db.query(FileModel).filter(FileModel.unique_code == unique_code).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    
    # 获取当前服务器地址
    host = request.url.hostname
    port = request.url.port
    scheme = request.url.scheme
    if port:  # 如果不是默认端口，则包含端口
        base_url = f"{scheme}://{host}:{port}"
    else:  # 如果是默认端口，则不包含端口
        base_url = f"{scheme}://{host}"
    
    # 生成二维码
    qr_data = f"{base_url}/file/{unique_code}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')
    
    # 将图像转换为base64编码
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return {"qr_code": f"data:image/png;base64,{img_str}"}

@router.post("/log-duration/{file_id}")
def log_session_duration(file_id: int, duration: int, db: Session = Depends(get_db)):
    """记录用户在页面的停留时间"""
    # 更新最近的访问日志
    access_log = db.query(AccessLog).filter(AccessLog.file_id == file_id)\
        .order_by(AccessLog.access_time.desc()).first()
    if access_log:
        access_log.session_duration = duration
        db.commit()
        return {"message": "停留时间已记录"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="访问记录不存在"
        )