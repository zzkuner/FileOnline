#!/usr/bin/env python3
"""
文件在线展示平台 - 完整功能测试脚本
"""

import os
import sys
import asyncio

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

def test_imports():
    """测试所有模块导入"""
    print("正在测试模块导入...")
    
    try:
        # 测试数据库模块
        from database import Base, engine, get_db
        print("✓ database模块导入成功")
        
        # 测试模型模块
        from models import User, File, AccessLog, Payment
        print("✓ models模块导入成功")
        
        # 测试认证模块
        from auth import get_password_hash, authenticate_user, create_access_token
        print("✓ auth模块导入成功")
        
        # 测试依赖模块
        from dependencies import get_current_user
        print("✓ dependencies模块导入成功")
        
        # 测试存储模块
        from storage import storage_service
        print("✓ storage模块导入成功")
        
        # 测试邮件模块
        from mail import send_email_async, EmailSchema
        print("✓ mail模块导入成功")
        
        # 测试路由模块
        from routes import auth, files, access, payments, stats, admin
        print("✓ routes模块导入成功")
        
        return True
    except Exception as e:
        print(f"✗ 模块导入失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database_connection():
    """测试数据库连接"""
    print("\n正在测试数据库连接...")
    
    try:
        from database import engine
        with engine.connect() as connection:
            print("✓ 数据库连接成功")
            return True
    except Exception as e:
        print(f"✗ 数据库连接失败: {e}")
        return False

def test_model_creation():
    """测试模型创建"""
    print("\n正在测试模型创建...")
    
    try:
        from models import User, File, AccessLog, Payment
        # 检查模型是否有正确的属性
        assert hasattr(User, 'username'), "User模型缺少username字段"
        assert hasattr(File, 'filename'), "File模型缺少filename字段"
        assert hasattr(AccessLog, 'ip_address'), "AccessLog模型缺少ip_address字段"
        assert hasattr(Payment, 'amount'), "Payment模型缺少amount字段"
        print("✓ 模型创建成功")
        return True
    except Exception as e:
        print(f"✗ 模型创建失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_storage_service():
    """测试存储服务初始化"""
    print("\n正在测试存储服务...")
    
    try:
        from storage import storage_service
        # 检查存储服务是否正确初始化
        assert hasattr(storage_service, 'client'), "存储服务缺少client属性"
        assert hasattr(storage_service, 'bucket_name'), "存储服务缺少bucket_name属性"
        print("✓ 存储服务初始化成功")
        return True
    except Exception as e:
        print(f"✗ 存储服务初始化失败: {e}")
        return False

def test_mail_service():
    """测试邮件服务初始化"""
    print("\n正在测试邮件服务...")
    
    try:
        from mail import mail_service, conf
        # 检查邮件服务是否正确初始化
        assert hasattr(mail_service, 'config'), "邮件服务缺少config属性"
        assert conf.MAIL_SERVER, "邮件配置缺少MAIL_SERVER"
        print("✓ 邮件服务初始化成功")
        return True
    except Exception as e:
        print(f"✗ 邮件服务初始化失败: {e}")
        return False

def main():
    """主函数"""
    print("文件在线展示平台 - 完整功能测试")
    print("=" * 40)
    
    # 测试导入
    if not test_imports():
        print("\n✗ 导入测试失败")
        return False
    
    # 测试数据库连接
    if not test_database_connection():
        print("\n✗ 数据库连接测试失败")
        return False
    
    # 测试模型创建
    if not test_model_creation():
        print("\n✗ 模型创建测试失败")
        return False
    
    # 测试存储服务
    if not test_storage_service():
        print("\n✗ 存储服务测试失败")
        return False
    
    # 测试邮件服务
    if not test_mail_service():
        print("\n✗ 邮件服务测试失败")
        return False
    
    print("\n✓ 所有测试通过！系统可以正常运行。")
    print("\n启动服务命令:")
    print("  uvicorn main:app --reload")
    print("\nDocker部署命令:")
    print("  docker-compose up -d")
    return True

if __name__ == "__main__":
    main()