from sqlalchemy import Column, Integer, String, DateTime, BigInteger, Text, DECIMAL, Boolean
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    subscription_type = Column(String(20), default='free')  # free, monthly, yearly
    subscription_end_date = Column(DateTime)
    is_admin = Column(Boolean, default=False)  # 管理员权限
    is_email_verified = Column(Boolean, default=False)  # 邮箱验证状态
    email_verification_code = Column(String(6))  # 邮箱验证代码
    password_reset_token = Column(String(255))  # 密码重置令牌
    password_reset_token_expires = Column(DateTime)  # 密码重置令牌过期时间
    created_at = Column(DateTime, default=func.now())


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # 外键引用，实际会在数据库中设置
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger)
    file_type = Column(String(50))  # pdf, video, image, ppt
    unique_code = Column(String(12), unique=True, nullable=False)  # 唯一访问码
    access_password = Column(String(255))  # 访问密码
    max_access_count = Column(Integer)  # 最大访问次数
    current_access_count = Column(Integer, default=0)
    access_start_date = Column(DateTime)  # 访问开始时间
    access_end_date = Column(DateTime)  # 访问结束时间
    allowed_countries = Column(Text)  # 允许访问的国家/地区
    created_at = Column(DateTime, default=func.now())


class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, nullable=False)  # 外键引用
    ip_address = Column(String(45))  # 支持IPv4和IPv6
    user_agent = Column(Text)
    device_type = Column(String(50))  # mobile, desktop, tablet
    access_time = Column(DateTime, default=func.now())
    session_duration = Column(Integer)  # 停留时间（秒）


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # 外键引用
    order_id = Column(String(50), unique=True, nullable=False)
    amount = Column(DECIMAL(10, 2))
    payment_method = Column(String(20))  # wechat, alipay
    payment_status = Column(String(20), default='pending')  # pending, success, failed, refunded
    subscription_type = Column(String(20))  # monthly, yearly
    created_at = Column(DateTime, default=func.now())