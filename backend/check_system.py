#!/usr/bin/env python3
"""
在线作品展示平台 - 后端服务启动脚本
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import subprocess

def check_dependencies():
    """检查依赖是否安装"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'psycopg2',
        'passlib',
        'python-jose',
        'bcrypt',
        'pydantic',
        'minio',
        'boto3',
        'qrcode',
        'pillow',
        'requests',
        'wechatpay',
        'alipay-sdk-python',
        'fastapi-mail'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"缺少依赖包: {', '.join(missing_packages)}")
        print("请运行: pip install -r requirements.txt")
        return False
    return True

def check_database_connection():
    """检查数据库连接"""
    try:
        from database import engine
        with engine.connect() as connection:
            print("✓ 数据库连接正常")
            return True
    except Exception as e:
        print(f"✗ 数据库连接失败: {e}")
        return False

def check_model_imports():
    """检查模型导入"""
    try:
        from models import User, File, AccessLog, Payment
        print("✓ 模型导入正常")
        return True
    except Exception as e:
        print(f"✗ 模型导入失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_route_imports():
    """检查路由导入"""
    try:
        import routes.auth
        import routes.files
        import routes.access
        import routes.payments
        import routes.stats
        import routes.admin
        print("✓ 路由导入正常")
        return True
    except Exception as e:
        print(f"✗ 路由导入失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("文件在线展示平台 - 服务检查工具")
    print("="*40)
    
    # 检查依赖
    if not check_dependencies():
        return False
    
    # 检查数据库连接
    if not check_database_connection():
        return False
    
    # 检查模型导入
    if not check_model_imports():
        return False
    
    # 检查路由导入
    if not check_route_imports():
        return False
    
    print("\n✓ 所有检查通过！服务可以正常启动。")
    print("\n启动后端服务命令: uvicorn main:app --reload")
    return True

if __name__ == "__main__":
    main()